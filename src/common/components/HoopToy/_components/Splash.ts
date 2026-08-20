import { ripple } from "@/common/components/WaterBackground/ripples";
import { AIR_DRAG, BALL_R, GRAVITY, MAX_FRAME, STEP, alpha, paintBall, type HoopPalette } from "./ball";

/**
 * The shot that left the court.
 *
 * A ball hit hard enough to clear the right wall of the arena stops being the
 * arena's problem and becomes this: the same ball, on the same arc, drawn on a
 * canvas the size of the viewport so it can carry on past the edge of the
 * footer. It flies until it is clear of the page card, and the page card is
 * the shore — everything outside it is the water background. So it lands in
 * the water, and the water is told about it.
 *
 * That last part is the whole point. The rings drawn here are decoration; the
 * real splash is the displacement handed to `WaterSurface`, which spreads
 * across the actual background of the actual page. Losing the ball costs you
 * the streak, and it is by some distance the best thing the toy does.
 *
 * Like `Hoop`, it sleeps when it is finished — it reports done exactly once and
 * cancels its own frame.
 */

/**
 * The page card, in viewport coordinates: the raft this whole site is laid out
 * on. Past its edge there is nothing under a falling ball but water.
 */
export interface Shore {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** The card's corner radius, so the clip follows its actual outline. */
  radius: number;
}

export interface Launch {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seam rotation as it left the court, so the hand-off is invisible. */
  spin: number;
}

/**
 * How far past the card the ball has to be before it is counted as in the
 * water — enough that the whole ball is in open water at the moment it lands,
 * rather than half of it clipped behind the page.
 *
 * The arc comes for free. The court ends level with the edge of the page, so a
 * ball doing the minimum escape speed has already fallen about thirty pixels by
 * the time it is clear, and a faster one is further out instead. An extra
 * scripted plunge was worse: there are only about sixty pixels of window below
 * the footer once the page is scrolled to the bottom, and anything more
 * elaborate put the splash underneath it.
 */
const CLEARANCE = 12;

/** Never land closer than this to the edge of the screen, however narrow the
    window is — a splash off the side of the viewport is no splash at all. */
const VIEWPORT_MARGIN = 26;

/* ── The impact ─────────────────────────────────────────────────────────────
   Three disturbances, in the order water actually makes them: the ball digs a
   cavity, the cavity collapses and throws a column back up, and the ball going
   under pulls a last small dent after it.

   Signs matter more than magnitudes here. An impact drawn as a positive bump
   reads as something surfacing rather than something sinking, which is exactly
   backwards, and no amount of tuning the number fixes it. */

const CAVITY = { at: 0, radius: 0.05, strength: -0.36 };
const REBOUND = { at: 0.16, radius: 0.034, strength: 0.2 };
const GULP = { at: 0.5, radius: 0.022, strength: -0.1 };

/** Seconds for the ball to disappear under the surface. */
const SINK_TIME = 0.6;

/**
 * How much of the ball's remaining speed carries it along under the surface.
 *
 * Nearly none, and that matters more than it sounds. Letting it keep even a
 * fifth of a 600px/s shot walks the ball fifty pixels sideways while it sinks —
 * it ends up well outside its own splash, and the picture stops being "ball
 * lands in water" and becomes "ball skims past some rings". Water stops things.
 */
const UNDERWATER_DRAG = 0.06;
/**
 * Seconds after entry before the toy is handed a fresh ball. Long enough to
 * watch the ball go under, short enough that the answer to "again?" is yes.
 */
const OVER = 0.95;

/** Longest the ball may stay airborne before we call it lost. A shot flat
    enough to never clear the shore should not keep a canvas alive forever. */
const MAX_AIR = 2.5;

/* ── Rings ──────────────────────────────────────────────────────────────────
   Three, staggered. They spread faster than the water sim does, on purpose:
   the sim's ripple is slow and soft by design, and the eye wants something
   sharp at the point of impact to tie the ball to it.

   Sized against the ball, not against the page. The first pass ran at 210px/s
   for 0.85s, which draws a 180px ring for an 18px ball — at that size it stops
   reading as a splash and starts reading as a shockwave with its own opinion
   about the layout.

   Round, not flattened. The page's water is a surface seen from directly above
   — that is the whole premise of the background — so a ring drawn as a squashed
   ellipse reads as a saucer lying on top of the page rather than as something
   spreading across it. */

const RING_SPEED = 95;
const RING_LIFE = 0.6;
const RING_DELAY = 0.11;
const RINGS = 3;

/* ── Droplets ───────────────────────────────────────────────────────────────
   Thrown out of the crown, each one making its own small plip where it lands.
   These are what turn a single event into something that reads as liquid, and
   they only do that if they are big enough to see: at a pixel across they
   disappear against the water and the splash is just a ring. */

const DROPLETS = 10;
/** Seconds a landed droplet's own ring lasts. */
const DROPLET_RING_LIFE = 0.42;

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Where it fell from, and so where it will land. */
  surface: number;
  landed: boolean;
  /** `wetTime` at which it landed, so its own ring can age. */
  landedAt: number;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export default class Splash {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly shore: Shore;
  private readonly onDone: () => void;

  private palette: HoopPalette;

  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private spin: number;

  /** Null while airborne; the point of impact once it is in the water. */
  private entry: { x: number; y: number } | null = null;
  private airTime = 0;
  private wetTime = 0;
  /** Highest disturbance index already handed to the water. */
  private poured = 0;

  private droplets: Droplet[] = [];

  private frame: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private dpr = 1;
  private finished = false;

  constructor(
    canvas: HTMLCanvasElement,
    palette: HoopPalette,
    launch: Launch,
    shore: Shore,
    onDone: () => void
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");

    this.canvas = canvas;
    this.ctx = ctx;
    this.palette = palette;
    this.shore = shore;
    this.onDone = onDone;

    this.x = launch.x;
    this.y = launch.y;
    this.vx = launch.vx;
    this.vy = launch.vy;
    this.spin = launch.spin;

    this.resize();

    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Match the backing store to the viewport. Cheap enough to call on resize. */
  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
  }

  setPalette(palette: HoopPalette): void {
    this.palette = palette;
  }

  destroy(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  /* ── Loop ───────────────────────────────────────────────────────────────── */

  private readonly tick = (now: number): void => {
    this.frame = requestAnimationFrame(this.tick);

    const elapsed = Math.min((now - this.lastTime) / 1000, MAX_FRAME);
    this.lastTime = now;
    this.accumulator += elapsed;

    while (this.accumulator >= STEP) {
      this.accumulator -= STEP;
      this.step();
    }

    this.draw();

    if (this.entry && this.wetTime >= OVER) this.finish();
  };

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    this.destroy();
    this.onDone();
  }

  /* ── Simulation ─────────────────────────────────────────────────────────── */

  private step(): void {
    if (this.entry) {
      this.wetTime += STEP;
      this.pour();
      this.stepDroplets();
      return;
    }

    this.airTime += STEP;

    this.vy += GRAVITY * STEP;
    this.vx *= AIR_DRAG;
    this.vy *= AIR_DRAG;
    this.x += this.vx * STEP;
    this.y += this.vy * STEP;
    this.spin += (this.vx / (BALL_R * 3)) * STEP;

    // Clear of the card on either edge means clear of the page: there is
    // nothing under the ball from here but the water background.
    const clear =
      this.x - BALL_R > this.shore.right + CLEARANCE || this.y - BALL_R > this.shore.bottom + CLEARANCE;

    // And whatever happens, it lands somewhere the visitor can see it.
    const leaving =
      this.x > window.innerWidth - VIEWPORT_MARGIN || this.y > window.innerHeight - VIEWPORT_MARGIN;

    if (clear || leaving || this.airTime >= MAX_AIR) this.land();
  }

  private land(): void {
    this.entry = { x: this.x, y: this.y };
    this.wetTime = 0;

    // Water is not air. Almost all of the horizontal run is gone on contact,
    // and what is left only carries the ball a few pixels as it goes under.
    this.vx *= UNDERWATER_DRAG;
    this.vy = 0;

    for (let i = 0; i < DROPLETS; i += 1) {
      // Up and out of the crown, then carried along by whatever the ball had
      // left, because that is where the water it just pushed has to go.
      const angle = randomBetween(-2.4, -0.45);
      const speed = randomBetween(95, 275);

      this.droplets.push({
        x: this.x + randomBetween(-4, 4),
        y: this.y + randomBetween(-2, 2),
        // Only a little forward carry: a crown that leans is water being
        // thrown, a crown that streaks is a comet.
        vx: Math.cos(angle) * speed + this.vx * 1.5,
        vy: Math.sin(angle) * speed,
        r: randomBetween(1.6, 3.4),
        surface: this.y + randomBetween(-1, 4),
        landed: false,
        landedAt: 0,
      });
    }
  }

  /** Hand the water each disturbance as its moment arrives. */
  private pour(): void {
    if (!this.entry) return;

    const schedule = [CAVITY, REBOUND, GULP];

    while (this.poured < schedule.length && this.wetTime >= schedule[this.poured].at) {
      const { radius, strength } = schedule[this.poured];
      ripple({ x: this.entry.x, y: this.entry.y, radius, strength });
      this.poured += 1;
    }
  }

  private stepDroplets(): void {
    for (const droplet of this.droplets) {
      if (droplet.landed) continue;

      droplet.vy += GRAVITY * STEP;
      droplet.x += droplet.vx * STEP;
      droplet.y += droplet.vy * STEP;

      // Only once it is on the way back down, or one thrown flat would be
      // counted as landed on the frame it was born.
      if (droplet.vy <= 0 || droplet.y < droplet.surface) continue;

      droplet.landed = true;
      droplet.landedAt = this.wetTime;
      ripple({ x: droplet.x, y: droplet.y, radius: 0.012, strength: -0.06 });
    }
  }

  /* ── Drawing ────────────────────────────────────────────────────────────── */

  private draw(): void {
    const { ctx } = this;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // In the air the ball is above the page, so it is drawn over everything —
    // it is a thrown object crossing the room, and the page is what it is
    // crossing in front of.
    if (!this.entry) {
      paintBall(ctx, this.x, this.y, this.palette, this.spin);
      return;
    }

    // In the water it is behind the page, so everything from here is clipped to
    // the water itself. Without this the rings spread out across the footer,
    // which reads as the ball having hit the page rather than the lake — and
    // half of every splash lands on top of the text.
    ctx.save();
    this.clipToWater();

    this.drawRings();
    this.drawDroplets();

    // The ball going under: shrinking and fading rather than switching off, and
    // carrying out the last of its momentum.
    const sink = Math.min(this.wetTime / SINK_TIME, 1);
    if (sink < 1) {
      paintBall(
        ctx,
        this.entry.x + this.vx * this.wetTime,
        this.entry.y + sink * 3,
        this.palette,
        this.spin,
        1 - sink * 0.75,
        (1 - sink) ** 1.4
      );
    }

    ctx.restore();
  }

  /**
   * Everything except the page card, whose rounded corner the splash lands
   * close enough to for the difference to show.
   */
  private clipToWater(): void {
    const { ctx } = this;
    const { left, top, right, bottom, radius } = this.shore;

    ctx.beginPath();
    ctx.rect(0, 0, window.innerWidth, window.innerHeight);

    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(left, top, right - left, bottom - top, radius);
    } else {
      ctx.rect(left, top, right - left, bottom - top);
    }

    ctx.clip("evenodd");
  }

  private drawRings(): void {
    if (!this.entry) return;

    const { ctx } = this;
    ctx.lineCap = "round";

    for (let i = 0; i < RINGS; i += 1) {
      const age = this.wetTime - i * RING_DELAY;
      if (age < 0 || age > RING_LIFE) continue;

      const life = age / RING_LIFE;
      // Each one behind the last is a little weaker, so the impact reads as the
      // first thing that happened rather than as three equal events.
      const weight = 1 - i * 0.28;
      const radius = BALL_R * 0.7 + age * RING_SPEED;

      ctx.strokeStyle = alpha(this.palette.ink, 0.55 * weight * (1 - life) ** 1.5);
      ctx.lineWidth = 2.2 * weight * (1 - life * 0.55);
      ctx.beginPath();
      ctx.arc(this.entry.x, this.entry.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawDroplets(): void {
    const { ctx } = this;
    ctx.fillStyle = alpha(this.palette.ball, 0.85);

    for (const droplet of this.droplets) {
      if (droplet.landed) continue;

      ctx.beginPath();
      ctx.arc(droplet.x, droplet.y, droplet.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Each landed droplet leaves a small ring of its own for a moment — the
    // scatter of little plips around the main impact is most of what makes the
    // surface read as water rather than as a target.
    ctx.lineWidth = 1;

    for (const droplet of this.droplets) {
      if (!droplet.landed) continue;

      const age = this.wetTime - droplet.landedAt;
      if (age > DROPLET_RING_LIFE) continue;

      const life = age / DROPLET_RING_LIFE;
      ctx.strokeStyle = alpha(this.palette.ink, 0.42 * (1 - life) ** 1.4);
      ctx.beginPath();
      ctx.arc(droplet.x, droplet.y, droplet.r + age * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
