/**
 * A stone skipping across the water the page floats on.
 *
 * Flick the open margin beside the card and a stone goes out across the
 * surface, touching down at intervals, each touch a real dent in the WebGL
 * water rather than a drawing of one. It passes behind the card — the card is
 * translucent, so it reads as something moving under frosted glass — comes out
 * the far side if it still has the pace, and sinks.
 *
 * Same split as everything else here: this file is the whole simulation and
 * the whole renderer, and the component next to it owns the policy.
 *
 * ── On the geometry, which is not what it looks like ────────────────────────
 *
 * The page is two things at once and always has been. The basketball *falls*
 * off the edge of the footer, so that screen is a vertical plane; the water
 * spreads its ripples in circles across the viewport, so that same screen is a
 * pond seen from above. The site already lives happily with the contradiction.
 *
 * This takes the pond reading, which is the one a skipping stone needs. There
 * is no gravity here and no arc: the stone travels in a straight line across
 * the surface and loses speed, and what makes it a skip rather than a slide is
 * that it only touches every so often. Trying to also make it fall would put
 * every stone in the bottom-left corner of the window.
 */

import { ripple } from "@/common/components/WaterBackground/ripples";
import { alpha } from "@/utils/colour";

export interface StonePalette {
  /** The stone itself — the page's own text colour. */
  ink: string;
}

/** Fixed step, so the skips land in the same places on any refresh rate. */
const STEP = 1 / 120;
/** Longest catch-up a single frame may simulate, after a dropped frame. */
const MAX_FRAME = 0.25;

/** Pixels per second. Below this the stone has nothing left and goes under. */
const SINK_SPEED = 190;
/** Fastest a flick can throw, however hard it is flicked. */
const MAX_SPEED = 2600;
/**
 * Slowest throw that is a throw at all, rather than a click with a wobble in
 * it. A press that does not clear this is refused and the caller leaves the
 * gesture completely alone.
 */
const MIN_SPEED = 620;

/** Speed lost to the water on every touch. */
const SKIP_LOSS = 0.82;
/** …and to the air in between, per second. */
const AIR_DRAG = 0.72;

/**
 * Seconds in the air between touches. Constant, so the gaps on screen shorten
 * as the stone slows — which is the whole rhythm of a skipping stone, and the
 * thing the eye is actually reading when it counts them.
 */
const HOP_TIME = 0.13;

/** How high a hop reads, as a fraction of the distance it covers. */
const HOP_LIFT = 0.16;

const STONE_R = 3.4;

/* ── What each touch does to the water ──────────────────────────────────────
   Radius is a fraction of viewport height and strength is the dent, the same
   units `ripples.ts` uses everywhere. Both scale with how much pace the stone
   still has, so the first skip is a slap and the last is a tap. */
const TOUCH_RADIUS = 0.012;
const TOUCH_STRENGTH = 0.13;
/** The stone giving up. Bigger than any single skip, and it is the last thing. */
const SINK_RADIUS = 0.03;
const SINK_STRENGTH = 0.26;

/** Seconds the stone takes to disappear once it stops skipping. */
const SINK_TIME = 0.45;

export interface StoneCallbacks {
  /** A touch landed. `skips` is the running count, so always >= 1. */
  onSkip(skips: number): void;
  /** The stone is gone, at this point on screen, having skipped this many times. */
  onDone(x: number, y: number, skips: number): void;
}

export default class Stone {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly callbacks: StoneCallbacks;
  private palette: StonePalette;

  private width = 0;
  private height = 0;
  private dpr = 1;

  /** Position, in viewport pixels. */
  private x = 0;
  private y = 0;
  private vx = 0;
  private vy = 0;

  private live = false;
  private skips = 0;
  /** Seconds until the next touch. */
  private toTouch = 0;
  /** 0 at a touch, 1 at the top of the hop. Only used for how it is drawn. */
  private hop = 0;
  private spin = 0;
  /** Counts up once it has stopped skipping; `SINK_TIME` is gone. */
  private sinking = -1;

  private frame: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  /** Whether the canvas has a backing store yet. See `allocate`. */
  private allocated = false;

  constructor(canvas: HTMLCanvasElement, palette: StonePalette, callbacks: StoneCallbacks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");

    this.canvas = canvas;
    this.ctx = ctx;
    this.palette = palette;
    this.callbacks = callbacks;

    // An unsized canvas element is 300x150 by default, which is a backing
    // store nobody asked for. `resize` reads the viewport but allocates
    // nothing until the first throw.
    canvas.width = 0;
    canvas.height = 0;
    this.resize();
  }

  /* ── Public surface ─────────────────────────────────────────────────── */

  resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Nothing to re-size until there has been something to draw.
    if (!this.allocated) return;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.draw();
  }

  /**
   * Give the canvas its backing store, once, on the first throw.
   *
   * This canvas covers the viewport, and a viewport-sized canvas at 2x is not
   * free: 2560x1440 is 5120x2880 pixels, which is about 59MB held for as long
   * as the page is open. Most visits never throw a stone, and paying 59MB up
   * front for a toy nobody used is the sort of thing that makes a portfolio
   * feel heavy for no reason anyone can see.
   *
   * Allocated once and then kept, rather than released between throws: getting
   * the memory back is worth less than a stutter at the start of every throw
   * after the first.
   */
  private allocate(): void {
    if (this.allocated) return;

    this.allocated = true;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
  }

  setPalette(palette: StonePalette): void {
    this.palette = palette;
  }

  /** Whether a stone is out there, so the caller knows not to throw another. */
  get busy(): boolean {
    return this.live;
  }

  /**
   * Throw, from a point in viewport pixels at a velocity in pixels per second.
   * Returns false if the flick was too gentle to be a throw — the caller must
   * then leave the gesture alone, because a slow drag on the background is
   * somebody selecting text, not somebody skipping a stone.
   */
  throwFrom(x: number, y: number, vx: number, vy: number): boolean {
    const speed = Math.hypot(vx, vy);
    if (speed < MIN_SPEED) return false;

    // Clamped rather than rejected: a flick of the wrist can carry ten times
    // what an arm can, and an unclamped one crosses the window in three frames
    // and skips twice.
    const scale = Math.min(speed, MAX_SPEED) / speed;

    this.x = x;
    this.y = y;
    this.vx = vx * scale;
    this.vy = vy * scale;

    this.live = true;
    this.skips = 0;
    this.sinking = -1;
    this.spin = 0;
    this.hop = 0;
    // Straight to a touch, so the throw starts with a dent under the hand
    // rather than a stone hanging in the air for a tenth of a second.
    this.toTouch = 0;

    this.allocate();
    this.wake();
    return true;
  }

  destroy(): void {
    this.sleep();
  }

  /* ── Loop ───────────────────────────────────────────────────────────── */

  private wake(): void {
    if (this.frame !== null) return;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Stop drawing entirely. This is the idle state, not a paused one. */
  private sleep(): void {
    if (this.frame === null) return;
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private readonly tick = (now: number): void => {
    const elapsed = Math.min((now - this.lastTime) / 1000, MAX_FRAME);
    this.lastTime = now;
    this.accumulator += elapsed;

    while (this.accumulator >= STEP) {
      this.step();
      this.accumulator -= STEP;
    }

    this.draw();

    // Checked after drawing so the frame the stone vanishes on is still shown,
    // and the canvas is left clear rather than holding the last stone.
    if (!this.live) {
      this.sleep();
      this.clear();
      return;
    }

    this.frame = requestAnimationFrame(this.tick);
  };

  private step(): void {
    if (this.sinking >= 0) {
      this.sinking += STEP;
      if (this.sinking >= SINK_TIME) {
        this.live = false;
        this.callbacks.onDone(this.x, this.y, this.skips);
      }
      return;
    }

    this.x += this.vx * STEP;
    this.y += this.vy * STEP;
    this.spin += STEP * 9;

    const drag = AIR_DRAG ** STEP;
    this.vx *= drag;
    this.vy *= drag;

    // Off the window entirely. No sink, no dent — there is no more water to
    // hit — but the throw still counts for what it managed on the way out.
    const margin = STONE_R * 4;
    if (
      this.x < -margin ||
      this.x > this.width + margin ||
      this.y < -margin ||
      this.y > this.height + margin
    ) {
      this.live = false;
      this.callbacks.onDone(this.x, this.y, this.skips);
      return;
    }

    this.toTouch -= STEP;
    this.hop = Math.max(0, Math.min(1, 1 - Math.abs(this.toTouch / HOP_TIME - 0.5) * 2));

    if (this.toTouch > 0) return;

    if (Math.hypot(this.vx, this.vy) < SINK_SPEED) {
      this.sink();
      return;
    }

    this.touch();
  }

  /** One skip: a dent in the water, and the pace it costs. */
  private touch(): void {
    this.skips += 1;
    this.toTouch = HOP_TIME;

    const speed = Math.hypot(this.vx, this.vy);
    // Against the fastest throw rather than this one, so a weak throw makes
    // small dents all the way along instead of starting as loud as a hard one.
    const pace = Math.min(speed / MAX_SPEED, 1);

    ripple({
      x: this.x,
      y: this.y,
      radius: TOUCH_RADIUS * (0.6 + pace),
      strength: -TOUCH_STRENGTH * (0.45 + pace * 0.55),
    });

    this.vx *= SKIP_LOSS;
    this.vy *= SKIP_LOSS;

    this.callbacks.onSkip(this.skips);
  }

  private sink(): void {
    this.sinking = 0;
    this.vx *= 0.35;
    this.vy *= 0.35;

    ripple({ x: this.x, y: this.y, radius: SINK_RADIUS, strength: -SINK_STRENGTH });
  }

  /* ── Drawing ────────────────────────────────────────────────────────── */

  private clear(): void {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private draw(): void {
    this.clear();
    if (!this.live) return;

    const { ctx } = this;

    // Shrinking away rather than fading, so it reads as going under rather
    // than as being switched off.
    const sunk = this.sinking >= 0 ? this.sinking / SINK_TIME : 0;
    const scale = 1 - sunk;
    const radius = STONE_R * scale;
    if (radius <= 0.2) return;

    // The stone lifts off its own reflection between touches. Two marks a few
    // pixels apart is all "in the air" needs at this size, and it is what
    // separates a skip from something sliding across the surface.
    const lift = this.hop * HOP_LIFT * Math.hypot(this.vx, this.vy) * HOP_TIME;

    if (this.hop > 0.02 && this.sinking < 0) {
      ctx.fillStyle = alpha(this.palette.ink, 0.14 * this.hop);
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, radius * 1.15, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(this.x, this.y - lift);
    ctx.rotate(this.spin);

    // Flat, and end-on to the way it is going: a skipping stone is chosen for
    // being flat, and a circle here reads as a ball.
    ctx.fillStyle = alpha(this.palette.ink, 0.72 * (1 - sunk * 0.4));
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.3, radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
