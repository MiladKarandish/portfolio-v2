/**
 * Whatever lives under the water the page is floating on.
 *
 * There is nothing here until something disturbs the surface. Then a few
 * shapes rise out of the dark, swim over to have a look, follow the
 * disturbance for as long as it keeps happening, lose interest, and sink back
 * down. They are drawn below the page card, so they slide under it the way
 * anything below the surface would.
 *
 * ── What summons them, and what deliberately does not ───────────────────────
 *
 * Only `ripples.ts`. Everything the page throws into the water publishes there
 * — the basketball going over the edge of the court, every touch of a skipping
 * stone, a plucked strand of the cobweb — so all three toys summon fish
 * without one line of any of them knowing this file exists.
 *
 * The water's own cursor work does *not* go through that broadcast: it calls
 * the surface directly, for pointer movement and for a plain click. That is
 * left exactly as it is. Fish that came to every click would be on screen
 * constantly, which is the difference between something living down there and
 * a cursor effect.
 */

import { alpha } from "@/utils/colour";

export interface FishPalette {
  /** The fish. The darkest tone in the theme, because depth reads as dark. */
  shadow: string;
}

/** Fixed step, so they swim at the same speed on any refresh rate. */
const STEP = 1 / 60;
/** Longest catch-up a single frame may simulate, after a dropped frame. */
const MAX_FRAME = 0.25;

/**
 * The weakest disturbance worth surfacing for. Set below a single skip of a
 * stone (about 0.06 to 0.13) so a thrown stone is followed the whole way, and
 * above nothing much else.
 */
const NOTICE = 0.05;

/** Seconds before a fresh school may be summoned after the last one left. */
const COOLDOWN = 2.2;

/**
 * Seconds a school will keep swimming after the last disturbance before
 * deciding nothing is going to happen and sinking.
 *
 * It has to be longer than the slowest fish takes to cross the furthest spawn,
 * or a school can turn round and leave without ever arriving — which looks
 * like nothing happened at all. At the distances and speeds below that is
 * about three seconds, so this has a little over a second of slack in it.
 */
const LINGER = 4.5;

/** Seconds to fade up out of the dark, and back down into it. */
const RISE_TIME = 0.9;
const SINK_TIME = 1.4;

const MIN_FISH = 2;
const MAX_FISH = 4;

/**
 * How far out they start. Off in the dark, but close enough to arrive while
 * anybody is still looking: at these speeds this is one to three seconds of
 * swimming, and the ripples they came for take about that long to settle.
 */
const SPAWN_NEAR = 150;
const SPAWN_FAR = 290;

/**
 * A fish cannot chase a skipping stone — the stone crosses the water at about
 * 900px/s and nothing that looks like a fish moves at 900px/s. What actually
 * happens, and what these are tuned for, is that they set off toward the first
 * touch and arrive around where it finally sank.
 */
const MIN_SPEED = 95;
const MAX_SPEED = 175;
/** Radians per second a fish can turn. Low enough that they arc, not pivot. */
const TURN_RATE = 2.4;

/** Inside this, a fish stops aiming at the disturbance and starts circling it. */
const ORBIT_RADIUS = 76;

/**
 * Peak opacity of a fish at full depth. They are shapes under water, not
 * illustrations on top of it — but the first pass at this was faint enough
 * that at true size they read as commas rather than as anything alive.
 */
const FISH_ALPHA = 0.38;

interface Fish {
  x: number;
  y: number;
  /** Radians. */
  heading: number;
  speed: number;
  length: number;
  /** Tail phase, so eight fish are not one fish drawn eight times. */
  phase: number;
  /** Which way round this one circles, and how wide. */
  orbit: number;
  /** 0 in the dark, 1 fully risen. Drives both opacity and size. */
  depth: number;
  /** Counts up while sinking; -1 while it is still interested. */
  leaving: number;
}

export default class School {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private palette: FishPalette;

  private width = 0;
  private height = 0;
  private dpr = 1;
  private allocated = false;

  private fish: Fish[] = [];
  /** What they are all interested in, in viewport pixels. */
  private targetX = 0;
  private targetY = 0;
  /** Seconds since the last disturbance worth noticing. */
  private sinceNews = 0;
  /**
   * When the last fish left, on the `performance.now` clock.
   *
   * A timestamp rather than a seconds-since counter, because the counter would
   * have to be advanced by the loop and the loop is asleep during exactly the
   * period being measured. Counted that way it freezes the moment the school
   * empties and never reaches the cooldown, so the first school is the only
   * one the page ever gets.
   */
  private emptiedAt = -Infinity;

  private frame: number | null = null;
  private lastTime = 0;
  private accumulator = 0;

  constructor(canvas: HTMLCanvasElement, palette: FishPalette) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");

    this.canvas = canvas;
    this.ctx = ctx;
    this.palette = palette;

    // See `allocate`. An unsized canvas is 300x150 by default, and this one
    // covers the viewport once it is real.
    canvas.width = 0;
    canvas.height = 0;
    this.resize();
  }

  /* ── Public surface ─────────────────────────────────────────────────── */

  resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (!this.allocated) return;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
  }

  setPalette(palette: FishPalette): void {
    this.palette = palette;
  }

  /**
   * Something happened at this point on the page. `strength` is the number the
   * water is handed, negative for a thing falling in.
   *
   * A disturbance while they are already up re-aims them rather than summoning
   * more, so a stone throwing off eleven touches gets one school heading for
   * wherever it ended, rather than eleven schools strung out behind it.
   */
  notice(x: number, y: number, strength: number): void {
    if (Math.abs(strength) < NOTICE) return;

    this.targetX = x;
    this.targetY = y;
    this.sinceNews = 0;

    if (this.fish.length > 0) {
      // Already curious. Anything that had given up changes its mind.
      for (const f of this.fish) f.leaving = -1;
      return;
    }

    if (performance.now() - this.emptiedAt < COOLDOWN * 1000) return;

    this.summon();
    this.allocate();
    this.wake();
  }

  destroy(): void {
    this.sleep();
  }

  /* ── Setting up ─────────────────────────────────────────────────────── */

  /**
   * Give the canvas its backing store, on the first summon rather than at
   * mount. This covers the viewport, which at 2x is 32MB at 1080p and 127MB at
   * 4K held for the life of the page — not a thing to pay for on the many
   * visits where nobody ever disturbs the water.
   */
  private allocate(): void {
    if (this.allocated) return;

    this.allocated = true;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
  }

  private summon(): void {
    const count = MIN_FISH + Math.floor(Math.random() * (MAX_FISH - MIN_FISH + 1));

    for (let i = 0; i < count; i++) {
      // Out in the dark somewhere around the disturbance, rather than in from
      // the edge of the window: a fish that has to cross the whole page first
      // arrives after everybody has stopped looking.
      const angle = Math.random() * Math.PI * 2;
      const distance = SPAWN_NEAR + Math.random() * (SPAWN_FAR - SPAWN_NEAR);

      const x = this.targetX + Math.cos(angle) * distance;
      const y = this.targetY + Math.sin(angle) * distance;

      this.fish.push({
        x,
        y,
        heading: Math.atan2(this.targetY - y, this.targetX - x),
        speed: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
        length: 23 + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
        orbit: (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.5),
        depth: 0,
        leaving: -1,
      });
    }
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

    // Checked after drawing, so the frame the last fish fades on is still
    // shown and the canvas is left clear rather than holding a stale school.
    if (this.fish.length === 0) {
      this.sleep();
      this.clear();
      this.emptiedAt = now;
      return;
    }

    this.frame = requestAnimationFrame(this.tick);
  };

  private step(): void {
    this.sinceNews += STEP;
    const boring = this.sinceNews > LINGER;

    for (const f of this.fish) {
      if (boring && f.leaving < 0) f.leaving = 0;

      if (f.leaving >= 0) {
        f.leaving += STEP;
        f.depth = Math.max(0, 1 - f.leaving / SINK_TIME);
      } else {
        f.depth = Math.min(1, f.depth + STEP / RISE_TIME);
      }

      this.steer(f);

      f.x += Math.cos(f.heading) * f.speed * STEP;
      f.y += Math.sin(f.heading) * f.speed * STEP;
      f.phase += STEP * (5 + f.speed * 0.05);
    }

    this.fish = this.fish.filter((f) => f.depth > 0 || f.leaving < 0);
  }

  /**
   * Turn toward whatever the fish currently wants, at a limited rate.
   *
   * A fish that has arrived aims at a point beside the disturbance rather than
   * at the disturbance itself, which is what turns "swim at it and stop" into
   * circling it. One that has given up aims away and keeps going.
   */
  private steer(f: Fish): void {
    const dx = this.targetX - f.x;
    const dy = this.targetY - f.y;
    const distance = Math.hypot(dx, dy) || 1;

    let wantX = dx;
    let wantY = dy;

    if (f.leaving >= 0) {
      wantX = -dx;
      wantY = -dy;
    } else if (distance < ORBIT_RADIUS) {
      // Rotate the direction it would have taken, so it slides past instead of
      // arriving. The sign is per fish, so they do not all wheel the same way.
      const turn = f.orbit * (Math.PI / 2);
      wantX = dx * Math.cos(turn) - dy * Math.sin(turn);
      wantY = dx * Math.sin(turn) + dy * Math.cos(turn);
    }

    const wanted = Math.atan2(wantY, wantX);
    let diff = wanted - f.heading;

    // The short way round, or a fish crossing the seam spins on the spot.
    while (diff <= -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const limit = TURN_RATE * STEP;
    f.heading += Math.max(-limit, Math.min(limit, diff));
  }

  /* ── Drawing ────────────────────────────────────────────────────────── */

  private clear(): void {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private draw(): void {
    this.clear();

    const { ctx } = this;

    for (const f of this.fish) {
      if (f.depth <= 0.01) continue;

      // Deeper is smaller as well as fainter. Two cues rather than one is what
      // makes it read as distance rather than as an element fading in.
      const scale = 0.6 + f.depth * 0.4;
      const length = f.length * scale;
      const half = length * 0.5;
      const width = length * 0.3;

      // The tail leads the body by half a beat, which is the whole of the
      // swimming: a rigid shape sliding along reads as a leaf.
      const sway = Math.sin(f.phase) * width * 0.9;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.heading);
      ctx.fillStyle = alpha(this.palette.shadow, FISH_ALPHA * f.depth);

      ctx.beginPath();
      ctx.moveTo(half, 0);
      // Body: two curves from nose to the base of the tail.
      ctx.quadraticCurveTo(0, -width, -half * 0.55, sway * 0.35);
      ctx.quadraticCurveTo(0, width, half, 0);
      ctx.fill();

      // Tail: a small triangle hinged where the body ends, swinging further
      // than the body does.
      ctx.beginPath();
      ctx.moveTo(-half * 0.5, sway * 0.35);
      ctx.lineTo(-half, sway - width * 0.5);
      ctx.lineTo(-half, sway + width * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
}
