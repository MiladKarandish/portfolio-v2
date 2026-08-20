/**
 * The cobweb in the bottom-left corner of the footer: a quarter of an orb web
 * strung across the corner of the page, and a spider living on it.
 *
 * Modelled on `codepen.io/Maxel88/pen/WNwVYjv`, rebuilt on the primitives in
 * `verlet.ts`. The pen strings a full circular web across the whole viewport
 * and lets the spider roam it; this is the same construction folded into a
 * quarter and sized to a corner, because a web that filled the page would be
 * the page.
 *
 * Same split as `Hoop`: this file is the entire simulation and the entire
 * renderer, and the React component next to it owns the policy — whether it
 * runs at all, what colour it is, and when it is allowed to be awake.
 *
 * Two rules it holds to:
 *
 *   • It never takes a gesture it was not offered. A pointerdown only counts
 *     if it lands within reach of a strand that can actually move; anything
 *     else passes straight through to the footer underneath, which on this
 *     side of the page is the copyright line.
 *
 *   • It only runs while it is on screen. Unlike the hoop, this toy is never
 *     truly idle — the spider walks whether or not anybody is watching, which
 *     is the point of it — so "asleep" here means the footer is scrolled out
 *     of view or the tab is in the background. The component drives that.
 */

import { ripple } from "@/common/components/WaterBackground/ripples";
import { alpha } from "@/utils/colour";
import { Angle, Distance, Particle, integrate, type Constraint } from "./verlet";

export interface CobwebPalette {
  /** The silk and the spider's legs — the page's own text colour. */
  ink: string;
  /** The spider's body. The same tone as the basketball at the other end. */
  body: string;
}

/* ── Simulation constants ───────────────────────────────────────────────────
   Units are CSS pixels and one fixed step, not seconds. Verlet integration
   folds the timestep into the constants, so these numbers only mean anything
   together with `STEP`; changing the rate without rescaling them changes the
   material the web is made of. */

/** Fixed step, so a 120Hz monitor and a 60Hz one agree about the wobble. */
const STEP = 1 / 60;
/** Longest catch-up a single frame may simulate, after a dropped frame or a
    backgrounded tab. Past this we throw the time away rather than spiral. */
const MAX_FRAME = 0.25;
/** Relaxation passes per step. More is stiffer, not different. */
const ITERATIONS = 10;

const GRAVITY = 0.09;
/**
 * The spider falls more slowly than the web sags. Eight grips hold it up either
 * way, so this is not about it dropping off — it is about how much of the web
 * it sees. At the web's own gravity the body hangs at the bottom of whatever
 * its feet allow and the walk stays in the lower third; at a quarter of it the
 * same walk covers most of the web. Four minutes of walking is the difference
 * between reaching a fifth of the way up and reaching half.
 */
const SPIDER_GRAVITY = 0.022;
const FRICTION = 0.985;

/**
 * Rest lengths are built at this fraction of the distance the web was drawn
 * at, which leaves every strand pulling inward from the moment it exists. It
 * is the whole reason a plucked web springs back taut instead of hanging
 * where you left it. Below about 0.85 the web visibly shrinks away from its
 * anchors on the first frame.
 */
const TENSION = 0.93;

const RADIAL_STIFFNESS = 0.9;
const RING_STIFFNESS = 0.7;

/**
 * Inverse mass of a free strand: the web is about seven times the spider's
 * weight, which is the difference between a spider walking on a web and a
 * spider dragging one around behind it.
 *
 * It costs nothing between strands. Every constraint splits a correction by the
 * inverse masses of its two ends, so a number shared by both ends cancels and
 * the web behaves exactly as it would at 1. It only starts to mean anything
 * where the two differ, which is the eight places a foot is stuck to a strand.
 */
const SILK_WEIGHT = 0.15;

/** Spokes fanning from the corner, and rings crossing them. */
const SPOKES = 11;
const RINGS = 8;

/** How close a press has to land to a strand to take hold of it. */
const GRAB_RADIUS = 15;
/**
 * The cursor's size as a solid thing, for a pointer that is only passing over
 * and has not pressed anything. About a fingertip: big enough that sweeping
 * across the corner visibly parts the silk, small enough that it is a poke
 * rather than a hole.
 */
const BRUSH_RADIUS = 11;

/* ── Feeling the rest of the page ───────────────────────────────────────────
   The web is tied to a card that is floating on water, so anything heavy
   enough hitting that water rocks the card and the web hanging in its corner
   shivers. In practice the only thing that does is the basketball at the far
   end of the footer going over the edge of the court.

   Nothing here knows that. Disturbances arrive on the same `ripples.ts`
   broadcast the water itself listens to, so neither toy has ever heard of the
   other and either can be deleted without touching the other. */

/**
 * How far a disturbance carries. It has to cover the width of the page — the
 * splash lands off the right-hand edge and the web is on the left, which is
 * about 1150px apart on a full-width card — so this is deliberately larger
 * than the distance it needs to survive, and the falloff below is gentle. A
 * vibration travelling through a rigid card is not sound travelling through
 * air; the card moves more or less as one thing.
 */
const SHAKE_REACH = 2400;

/**
 * Ignore anything weaker than this. The splash pours three disturbances into
 * the water and then a dozen more as its droplets land; at this threshold only
 * the first two arrive, which reads as a thud and its echo rather than as a
 * rattle.
 */
const SHAKE_FLOOR = 0.15;

/**
 * Peak kick, in pixels per step, for a disturbance of strength 1 alongside.
 *
 * The first version of this was half as strong and, fairly, went unnoticed:
 * the splash is at the far end of the footer and the web is in the corner of
 * your eye while you are watching the ball. A disturbance you have to be told
 * about is not worth the code, so it either reads or it goes.
 */
const SHAKE_KICK = 26;

/** How long the spider holds still after feeling something, in seconds. */
const STARTLE_TIME = 1.1;

/**
 * How hard a strand has to be let go of to send anything back the other way,
 * in pixels per step, and how big a dent it makes at full force. Releasing
 * mid-sweep is a deliberate act; simply crossing the web is not, and the water
 * would be permanently choppy if it were.
 */
const PLUCK_FLOOR = 2.5;
const PLUCK_FULL = 14;
const PLUCK_RADIUS = 0.018;
const PLUCK_STRENGTH = 0.22;

/* ── The spider ─────────────────────────────────────────────────────────── */

/**
 * The pen's spider is drawn for a web three times this size. Every offset in
 * `buildSpider` is multiplied by this, which keeps the proportions — the thing
 * that makes it read as a spider rather than eight sticks — and lets the web
 * decide how big it gets.
 *
 * The number is the smallest one at which the legs are still individually
 * legible at footer scale. Larger and the spider spans half the web and reads
 * as a knot in it rather than as something sitting on it; much smaller and
 * there is no spider, only a dot with fur.
 */
const SPIDER_SCALE = 0.34;

/**
 * How often a leg is offered a new foothold, and how often it takes one.
 *
 * One leg is offered at a time, so eight of these is one full cycle: at these
 * numbers a given leg gets a turn roughly every two thirds of a second, which
 * is about as slow as it can go before the legs behind the body have folded
 * flat by the time their turn comes round. The chance below 1 is what keeps the
 * gait from being a metronome.
 */
const CRAWL_INTERVAL = 0.06;
const CRAWL_CHANCE = 0.7;

/**
 * How far a foothold may be from the body, as a multiple of that leg's natural
 * reach. Both ends earn their keep:
 *
 *   • Below the minimum the foot has not really moved, and a leg that keeps
 *     re-gripping strands it could already touch folds up under the body.
 *   • Above the maximum the leg cannot stretch that far, so the grip pulls the
 *     body along instead of the foot. That is the entire locomotion: the
 *     spider walks because its feet keep committing to places it has to lean
 *     towards to reach.
 *
 * Which is why the reach these scale is the leg's *design* length, measured
 * once when it is built, and never its current length. Measuring the leg as it
 * stands makes the two feed each other: a folded leg reaches short, which folds
 * it further, and within a second or so the spider is a knot.
 */
const MIN_STEP = 0.75;
const MAX_STEP = 1.9;

interface Leg {
  /** hip, knee, ankle, foot — drawn as one polyline. */
  chain: Particle[];
  foot: Particle;
  /** Thorax to foot with the leg held straight. Fixed at build time. */
  reach: number;
  /** Zero-length constraint gluing the foot to a strand. Null while airborne. */
  grip: Distance | null;
}

/** A silk thread: the constraint that holds it, plus how brightly to draw it. */
interface Strand {
  constraint: Distance;
  radial: boolean;
}

export default class Cobweb {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private palette: CobwebPalette;

  private width = 0;
  private height = 0;
  private dpr = 1;

  private webParticles: Particle[] = [];
  /** Every strand, for drawing. */
  private strands: Strand[] = [];
  /** Only the strands with an end that can actually move, for solving. */
  private live: Constraint[] = [];

  private spiderParticles: Particle[] = [];
  private spiderConstraints: Constraint[] = [];
  private legs: Leg[] = [];
  private head!: Particle;
  private thorax!: Particle;
  private abdomen!: Particle;

  /** Cycles the legs 0,3,6,1,4,7,2,5 — opposite corners, like the real gait. */
  private legCursor = 0;
  private crawlClock = 0;
  /** Seconds left of holding still after feeling something. */
  private startled = 0;

  private pointerId: number | null = null;
  private dragged: Particle | null = null;
  /** The dragged particle's own weight, held while it is pinned to the cursor. */
  private draggedWeight = 1;
  /** Cursor in canvas coordinates, or null when it is not over the box. */
  private cursorX: number | null = null;
  private cursorY: number | null = null;

  private frame: number | null = null;
  private lastTime = 0;
  private accumulator = 0;

  constructor(canvas: HTMLCanvasElement, palette: CobwebPalette) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");

    this.canvas = canvas;
    this.ctx = ctx;
    this.palette = palette;

    this.resize();
  }

  /* ── Public surface ─────────────────────────────────────────────────── */

  /**
   * Re-read the box and rebuild. The web's geometry is derived from the canvas
   * size, so there is nothing to preserve across a resize — the spider is put
   * back on a fresh web rather than dragged onto one it does not fit.
   */
  resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    if (w === this.width && h === this.height) return;

    this.width = w;
    this.height = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);

    this.dragged = null;
    this.pointerId = null;

    this.buildWeb();
    this.buildSpider();
    this.draw();
  }

  setPalette(palette: CobwebPalette): void {
    this.palette = palette;
    this.draw();
  }

  /**
   * Try to take hold of a strand. Returns false if the press was not near one,
   * in which case the caller must leave the event completely alone — the
   * footer's copyright line sits under this canvas, and a swallowed press
   * there is exactly the sort of annoyance this toy is meant not to be.
   */
  grab(id: number, x: number, y: number): boolean {
    if (this.dragged) return false;

    const particle = this.nearestFree(x, y, GRAB_RADIUS);
    if (!particle) return false;

    this.pointerId = id;
    this.dragged = particle;
    // Pinned for the duration, so the strands pulling on it cannot drag it
    // back out of the cursor. Without this the web wins — it is deliberately
    // taut — and a strand you are holding creeps a few pixels and stops.
    this.draggedWeight = particle.w;
    particle.w = 0;
    return true;
  }

  /**
   * Where the cursor is, in canvas coordinates. Both the brush and the drag
   * read it, so there is one call for both — a pointermove is a pointermove
   * whether or not a button is down.
   */
  moveCursor(x: number, y: number): void {
    this.cursorX = x;
    this.cursorY = y;
  }

  release(id: number): void {
    if (this.pointerId !== id) return;

    const released = this.dragged;
    if (released) {
      this.pluck(released);
      released.w = this.draggedWeight;
    }

    this.pointerId = null;
    this.dragged = null;
  }

  /** The cursor left the box: stop brushing the web with a stale position. */
  clearCursor(): void {
    this.cursorX = null;
    this.cursorY = null;
  }

  /** Whether a press here would be taken, for the cursor style. */
  isOverWeb(x: number, y: number): boolean {
    return this.nearestFree(x, y, GRAB_RADIUS) !== null;
  }

  /**
   * Something landed somewhere on the page. `x`/`y` are viewport pixels and
   * `strength` is the same number the water is handed — negative for a thing
   * falling in, positive for what the surface does next.
   *
   * The web shivers, and the spider stops dead. A spider that feels its web
   * move and carries on strolling is the one thing a real one never does; the
   * pause is short, and it is most of what sells the web as something the
   * spider is actually standing on.
   */
  shake(x: number, y: number, strength: number): void {
    const force = Math.abs(strength);
    if (force < SHAKE_FLOOR) return;

    const rect = this.canvas.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    // Our own pluck, come back round. `ripples.ts` is a broadcast and does not
    // tell a listener who published, so the one disturbance that can start
    // inside this box is the one this file sent. Nothing else on the page
    // drops anything into the corner of the footer.
    if (localX >= 0 && localX <= this.width && localY >= 0 && localY <= this.height) return;

    // Measured from the hub, which is where the web is tied to the page and so
    // where a disturbance travelling through the page arrives.
    const dx = localX - 0;
    const dy = localY - this.height;
    const distance = Math.hypot(dx, dy);
    if (distance >= SHAKE_REACH || distance === 0) return;

    const kick = SHAKE_KICK * force * (1 - distance / SHAKE_REACH);
    // Away from whatever it was. The anchors are pinned and cannot move, so
    // this lands entirely in the free strands and the web swings on them.
    const awayX = -dx / distance;
    const awayY = -dy / distance;

    for (const p of this.webParticles) {
      if (p.w === 0) continue;

      // The near side of the web is hit before the far side, which turns a
      // uniform shove into something crossing the web. That is the whole
      // difference between "the web moved" and "something arrived": the eye
      // reads a travelling wave and does not read a translation at all.
      const lead = (p.x * awayX + p.y * awayY) / this.width;
      const phase = 0.55 + 0.9 * Math.abs(Math.sin(lead * 5.5));

      // Written to the previous position, not the current one: in verlet that
      // is what an impulse is. Moving `x` instead would teleport the web and
      // leave it with no memory of having been hit.
      p.px -= awayX * kick * phase;
      p.py -= awayY * kick * phase;
    }

    this.startled = STARTLE_TIME;
  }

  wake(): void {
    if (this.frame !== null) return;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Stop drawing entirely. The web keeps its shape; it is simply not running. */
  sleep(): void {
    if (this.frame === null) return;
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  destroy(): void {
    this.sleep();
  }

  /* ── Construction ───────────────────────────────────────────────────── */

  /**
   * A quarter orb web hung in the bottom-left corner.
   *
   * The hub sits in the corner itself and the spokes fan through ninety
   * degrees, so the first spoke lies along the left edge of the box and the
   * last along the bottom. Those two are the threads glued to the walls: every
   * particle on them is pinned, as is the outermost ring, which stands in for
   * the frame threads a real web is slung from. Everything in between is free,
   * which is the part that moves when you touch it.
   */
  private buildWeb(): void {
    const { width: w, height: h } = this;

    const hubX = 0;
    const hubY = h;
    // Divided by the wobble's ceiling below, so the widest strand still lands
    // inside the box. Anchors are pinned, and `bound` deliberately leaves
    // pinned particles alone, so anything that starts outside stays outside.
    const outer = (Math.min(w, h) - 1) / 1.035;
    // Where the innermost ring sits. A real hub is denser than this; at 132px
    // a truer one is a bright smudge in the corner, and it puts eleven
    // particles within three pixels of each other for the spider to trip over.
    const inner = outer * 0.3;

    const grid: Particle[][] = [];
    const particles: Particle[] = [];

    const hub = new Particle(hubX, hubY).pin();
    particles.push(hub);

    for (let r = 0; r < RINGS; r++) {
      const row: Particle[] = [];
      const t = r / (RINGS - 1);
      const radius = inner + (outer - inner) * t;

      for (let s = 0; s < SPOKES; s++) {
        const u = s / (SPOKES - 1);
        // Straight up at u = 0, straight right at u = 1.
        const base = -Math.PI / 2 + u * (Math.PI / 2);

        // A web spun by an animal is not a diagram. The wobble is deterministic
        // rather than random so the shape is the same every visit, and it is
        // damped to nothing at both ends so the two wall threads stay flat
        // against the edges they are glued to.
        const taper = Math.sin(Math.PI * u);
        const theta = base + Math.cos(r * 1.7 + s * 0.9) * 0.045 * taper;
        const wobble = 1 + Math.cos(s * 2.3 + r * 0.6) * 0.035;

        const p = new Particle(
          hubX + Math.cos(theta) * radius * wobble,
          hubY + Math.sin(theta) * radius * wobble
        );

        if (s === 0 || s === SPOKES - 1 || r === RINGS - 1) p.pin();
        else p.w = SILK_WEIGHT;

        row.push(p);
        particles.push(p);
      }

      grid.push(row);
    }

    const strands: Strand[] = [];
    const add = (a: Particle, b: Particle, stiffness: number, radial: boolean) => {
      const constraint = new Distance(a, b, stiffness);
      constraint.distance *= TENSION;
      strands.push({ constraint, radial });
    };

    for (let s = 0; s < SPOKES; s++) {
      add(hub, grid[0][s], RADIAL_STIFFNESS, true);
      for (let r = 0; r < RINGS - 1; r++) add(grid[r][s], grid[r + 1][s], RADIAL_STIFFNESS, true);
    }

    for (let r = 0; r < RINGS; r++) {
      for (let s = 0; s < SPOKES - 1; s++) add(grid[r][s], grid[r][s + 1], RING_STIFFNESS, false);
    }

    this.webParticles = particles;
    this.strands = strands;
    // A strand with both ends pinned can never move, so solving it is wasted
    // work — but it is still silk, so it stays in `strands` to be drawn.
    this.live = strands
      .filter(({ constraint }) => constraint.a.w + constraint.b.w > 0)
      .map(({ constraint }) => constraint);
  }

  /**
   * The pen's spider, scaled down: three body segments and eight four-jointed
   * legs, held together by distances for the bones and angles for the joints.
   *
   * The angle constraints are what make it an animal. Distances alone give you
   * a bag of sticks that folds flat the moment it is pulled on; the angles
   * remember the pose it was built in and spring the legs back towards it.
   */
  private buildSpider(): void {
    const k = SPIDER_SCALE;
    const particles: Particle[] = [];
    const constraints: Constraint[] = [];
    const legs: Leg[] = [];

    // Built out on open ground at the web's midpoint, then walked onto it by
    // the first eight crawls below.
    const originX = this.width * 0.42;
    const originY = this.height * 0.55;

    const thorax = new Particle(originX, originY);
    const head = new Particle(originX, originY - 5 * k);
    const abdomen = new Particle(originX, originY + 10 * k);

    particles.push(thorax, head, abdomen);
    constraints.push(new Distance(head, thorax, 1));
    constraints.push(new Distance(abdomen, thorax, 1));
    constraints.push(new Angle(abdomen, thorax, head, 0.4));

    for (let i = 0; i < 4; i++) {
      // Front pairs reach furthest, the middle two are stubbier. Straight from
      // the pen, and it is most of what stops the gait looking mechanical.
      const reach = i === 1 || i === 2 ? 0.7 : i === 3 ? 0.9 : 1;

      for (const side of [1, -1] as const) {
        const hip = new Particle(thorax.x + 3 * k * side, thorax.y + (i - 1.5) * 3 * k);

        const knee = offset(hip, 20 * side, (i - 1.5) * 30, 20 * reach * k);
        const ankle = offset(knee, 20 * side, (i - 1.5) * 50, 20 * reach * k);
        const foot = offset(ankle, 20 * side, (i - 1.5) * 100, 12 * reach * k);

        particles.push(hip, knee, ankle, foot);

        constraints.push(new Distance(hip, thorax, 0.99));
        constraints.push(new Distance(knee, hip, 0.99));
        constraints.push(new Distance(ankle, knee, 0.99));
        constraints.push(new Distance(foot, ankle, 0.99));

        // Ankle and knee bend freely-ish; the hip is rigid against the body,
        // which is what keeps the legs radiating instead of collapsing.
        constraints.push(new Angle(knee, ankle, foot, 0.9));
        constraints.push(new Angle(hip, knee, ankle, 0.4));
        constraints.push(new Angle(thorax, hip, knee, 1));
        constraints.push(new Angle(head, thorax, hip, 1));

        const reachOut =
          Math.hypot(hip.x - thorax.x, hip.y - thorax.y) + (20 + 20 + 12) * reach * k;

        legs.push({ chain: [hip, knee, ankle, foot], foot, reach: reachOut, grip: null });
      }
    }

    this.spiderParticles = particles;
    this.spiderConstraints = constraints;
    this.legs = legs;
    this.head = head;
    this.thorax = thorax;
    this.abdomen = abdomen;
    this.legCursor = 0;
    this.crawlClock = 0;

    for (let leg = 0; leg < legs.length; leg++) this.crawl(leg);
  }

  /* ── Loop ───────────────────────────────────────────────────────────── */

  private readonly tick = (now: number): void => {
    this.frame = requestAnimationFrame(this.tick);

    const elapsed = Math.min((now - this.lastTime) / 1000, MAX_FRAME);
    this.lastTime = now;
    this.accumulator += elapsed;

    while (this.accumulator >= STEP) {
      this.step();
      this.accumulator -= STEP;
    }

    this.draw();
  };

  private step(): void {
    // A startled spider does not re-grip. Its feet stay where they are and the
    // body rides whatever the web is doing, which is what makes holding still
    // visible at all — a spider that simply stopped walking would be hard to
    // tell from one walking slowly.
    //
    // The clock is held at zero rather than left to run, so the pause ends
    // with a first step like any other. Letting it accumulate would bank a
    // second of offers and spend them all on the frame the spider recovers.
    if (this.startled > 0) {
      this.startled -= STEP;
      this.crawlClock = 0;
    } else {
      this.crawlClock += STEP;

      if (this.crawlClock >= CRAWL_INTERVAL) {
        this.crawlClock -= CRAWL_INTERVAL;
        if (Math.random() < CRAWL_CHANCE) {
          // Three at a time round eight legs visits every leg once per cycle
          // and never two neighbours in a row.
          this.crawl((this.legCursor++ * 3) % 8);
        }
      }
    }

    integrate(this.webParticles, GRAVITY, FRICTION);
    integrate(this.spiderParticles, SPIDER_GRAVITY, FRICTION);

    // The dragged particle is moved after integration — which skips it, being
    // pinned — and before relaxation, so the constraints see it where the
    // cursor actually is.
    //
    // `px`/`py` are wound forward by hand as well, because integration is what
    // normally does that. It leaves the particle holding one step's worth of
    // cursor movement as velocity, which is what makes letting go mid-sweep
    // flick the strand rather than drop it.
    if (this.dragged && this.cursorX !== null && this.cursorY !== null) {
      const d = this.dragged;
      d.px = d.x;
      d.py = d.y;
      // Clamped to the box here rather than in `bound`, which skips pinned
      // particles and this one is pinned for as long as it is held. Without it
      // a drag that leaves the canvas takes the strand with it, and since the
      // canvas clips, the strand simply vanishes off the edge while you are
      // still holding it.
      d.x = clamp(this.cursorX, 0, this.width - 1);
      d.y = clamp(this.cursorY, 0, this.height - 1);
    }

    const coef = 1 / ITERATIONS;
    for (let i = 0; i < ITERATIONS; i++) {
      for (const c of this.live) c.relax(coef);
      for (const c of this.spiderConstraints) c.relax(coef);
      for (const leg of this.legs) leg.grip?.relax(coef);
    }

    this.part();

    this.bound(this.webParticles);
    this.bound(this.spiderParticles);
  }

  /**
   * The cursor parts the web as it passes, without anything being pressed.
   *
   * This is the discoverability of the whole thing: nobody presses a decoration
   * to see what happens, but everybody moves a cursor across a footer.
   *
   * It is a solid disc rather than a force — no strand may be inside it, and
   * any that is gets pushed to its edge. A force has to be strong enough to
   * beat a web this taut before it shows at all, and by then it is strong
   * enough to fling it; a disc simply cannot be argued with, and stays a poke
   * however fast the pointer moves.
   *
   * Called after relaxation for that reason: this is the last word on where a
   * strand may be. Nothing touches `px`/`py`, so the displacement is left in
   * the web as velocity, and it springs back and wobbles once the cursor is
   * past — which is the half of it that reads as silk.
   */
  private part(): void {
    if (this.dragged || this.cursorX === null || this.cursorY === null) return;

    for (const p of this.webParticles) {
      if (p.w === 0) continue;

      const dx = p.x - this.cursorX;
      const dy = p.y - this.cursorY;
      const d = Math.hypot(dx, dy);
      if (d >= BRUSH_RADIUS) continue;

      // Dead centre has no direction to be pushed in. Straight up is as good
      // as any and happens for at most a frame.
      if (d === 0) {
        p.y -= BRUSH_RADIUS;
        continue;
      }

      p.x = this.cursorX + (dx / d) * BRUSH_RADIUS;
      p.y = this.cursorY + (dy / d) * BRUSH_RADIUS;
    }
  }

  /**
   * A strand let go of hard enough sends a dent into the water under this
   * corner of the page, and startles the spider standing on it.
   *
   * The same broadcast, in the other direction. It is the reason the drag has
   * a payoff beyond the web springing back: the page itself answers.
   */
  private pluck(p: Particle): void {
    const speed = Math.hypot(p.x - p.px, p.y - p.py);
    if (speed < PLUCK_FLOOR) return;

    const force = Math.min((speed - PLUCK_FLOOR) / (PLUCK_FULL - PLUCK_FLOOR), 1);
    const rect = this.canvas.getBoundingClientRect();

    ripple({
      x: rect.left + p.x,
      y: rect.top + p.y,
      radius: PLUCK_RADIUS,
      strength: -PLUCK_STRENGTH * force,
    });

    this.startled = STARTLE_TIME;
  }

  /** Nothing leaves the box — least of all the spider. */
  private bound(particles: readonly Particle[]): void {
    const maxX = this.width - 1;
    const maxY = this.height - 1;

    for (const p of particles) {
      if (p.w === 0) continue;
      if (p.x < 0) p.x = 0;
      else if (p.x > maxX) p.x = maxX;
      if (p.y < 0) p.y = 0;
      else if (p.y > maxY) p.y = maxY;
    }
  }

  /**
   * Offer one leg a new foothold.
   *
   * The spider has no destination and no path: each leg independently reaches
   * for a strand that is in front of it (or behind it, depending which leg it
   * is), far enough away to be a step and near enough to reach, and not already
   * being stood on. The body follows because it is tied to the feet. That is
   * the entire brain, and it is enough to produce something that looks like it
   * is going somewhere.
   *
   * One departure from the pen: the old grip is only let go once a replacement
   * has been found. In the pen a leg with nowhere to go simply lets go, and a
   * spider that walks into the rim can shed all eight and drop off the web.
   */
  private crawl(index: number): void {
    const leg = this.legs[index];
    if (!leg) return;

    const min = leg.reach * MIN_STEP;
    const max = leg.reach * MAX_STEP;

    const facing = Math.atan2(this.head.y - this.thorax.y, this.head.x - this.thorax.x);
    const forwardX = Math.cos(facing);
    const forwardY = Math.sin(facing);
    // Rotated a quarter turn: positive is the spider's right-hand side.
    const sideX = -forwardY;
    const sideY = forwardX;

    // Legs 0–3 are the front two pairs, and the even ones are the right-hand
    // side of each pair. A leg only reaches into its own quadrant, which is
    // what keeps the eight of them from tangling into one heap.
    const ahead = index < 4 ? 1 : -1;
    const right = index % 2 === 0 ? 1 : -1;

    const taken = new Set<Particle>();
    for (const other of this.legs) {
      if (other !== leg && other.grip) taken.add(other.grip.b);
    }

    const options: Particle[] = [];
    for (const p of this.webParticles) {
      if (taken.has(p)) continue;

      const dx = p.x - this.thorax.x;
      const dy = p.y - this.thorax.y;

      if ((dx * forwardX + dy * forwardY) * ahead < 0) continue;
      if ((dx * sideX + dy * sideY) * right < 0) continue;

      const d = Math.hypot(dx, dy);
      if (d < min || d > max) continue;

      options.push(p);
    }

    if (options.length === 0) return;

    /* The leg reaches for a place, and takes whatever strand is nearest it.
       Not for a strand directly, which is the obvious version and is wrong:
       picking evenly among the candidates is not picking evenly over the web,
       because eleven spokes converging on one corner put most of the web's
       particles in a small area around the hub. A spider choosing strands
       uniformly is therefore always being offered the corner, and walks into
       it within a few seconds and stays there for good.

       So: a point at a random angle across the leg's quadrant and a random
       distance within its reach — `sqrt` because uniform in radius would crowd
       the near end of an annulus — and then the nearest real strand to it. The
       density of the web stops mattering, and the spider covers all of it. */
    const across = Math.random() * (Math.PI / 2);
    const out = min + (max - min) * Math.sqrt(Math.random());
    const dirX = forwardX * ahead * Math.cos(across) + sideX * right * Math.sin(across);
    const dirY = forwardY * ahead * Math.cos(across) + sideY * right * Math.sin(across);
    const idealX = this.thorax.x + dirX * out;
    const idealY = this.thorax.y + dirY * out;

    let target = options[0];
    let bestD = Infinity;
    for (const p of options) {
      const d = (p.x - idealX) ** 2 + (p.y - idealY) ** 2;
      if (d < bestD) {
        bestD = d;
        target = p;
      }
    }
    // Zero rest length: the foot is stuck to the strand, not hovering near it.
    leg.grip = new Distance(leg.foot, target, 1, 0);
  }

  private nearestFree(x: number, y: number, radius: number): Particle | null {
    let best: Particle | null = null;
    let bestD = radius * radius;

    for (const p of this.webParticles) {
      if (p.w === 0) continue;

      const dx = p.x - x;
      const dy = p.y - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }

    return best;
  }

  /* ── Drawing ────────────────────────────────────────────────────────── */

  private draw(): void {
    const { ctx } = this;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawSilk();
    this.drawSpider();
  }

  /**
   * Radials brighter than rings, in two passes rather than per-strand, because
   * setting `strokeStyle` between every line is what makes a canvas this size
   * cost anything at all.
   */
  private drawSilk(): void {
    const { ctx } = this;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    for (const radial of [false, true]) {
      ctx.strokeStyle = alpha(this.palette.ink, radial ? 0.22 : 0.15);
      ctx.beginPath();

      for (const strand of this.strands) {
        if (strand.radial !== radial) continue;
        const { a, b } = strand.constraint;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }

      ctx.stroke();
    }

    // The beads of glue on the capture spiral. At this size they are what
    // stops the web reading as a bare wireframe.
    //
    // One path for all of them, and one fill. Ninety separate `fill()` calls
    // is ninety rasterisations of a one-pixel dot; the `moveTo` before each
    // `arc` is what keeps them from being strung together into a scribble.
    ctx.fillStyle = alpha(this.palette.ink, 0.3);
    ctx.beginPath();
    for (const p of this.webParticles) {
      if (p.w === 0) continue;
      ctx.moveTo(p.x + 0.85, p.y);
      ctx.arc(p.x, p.y, 0.85, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  private drawSpider(): void {
    const { ctx } = this;
    const k = SPIDER_SCALE;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = alpha(this.palette.ink, 0.62);

    // Tapering along the leg: thigh, shin, then a hair to the foot. Drawing
    // each leg as one polyline instead would be the difference between a
    // spider and a bent paperclip — but a stroke can only have one width, so
    // it is three passes over all eight legs rather than three strokes per
    // leg. The same picture, an eighth of the stroke calls.
    const segments = [
      { from: 0, to: 1, width: 2.1 * k },
      { from: 1, to: 2, width: 1.6 * k },
      { from: 2, to: 3, width: 1.1 * k },
    ];

    for (const segment of segments) {
      ctx.lineWidth = segment.width;
      ctx.beginPath();

      for (const leg of this.legs) {
        const a = leg.chain[segment.from];
        const b = leg.chain[segment.to];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }

      ctx.stroke();
    }

    // The body, in one path for the same reason as the beads.
    ctx.fillStyle = alpha(this.palette.body, 0.92);
    ctx.beginPath();
    for (const [part, radius] of [
      [this.abdomen, 8 * k],
      [this.thorax, 4.4 * k],
      [this.head, 3.4 * k],
    ] as const) {
      ctx.moveTo(part.x + radius, part.y);
      ctx.arc(part.x, part.y, radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

function clamp(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

/** A point `distance` from `from`, in the direction `(dx, dy)`. */
function offset(from: Particle, dx: number, dy: number, distance: number): Particle {
  const length = Math.hypot(dx, dy) || 1;
  return new Particle(from.x + (dx / length) * distance, from.y + (dy / length) * distance);
}
