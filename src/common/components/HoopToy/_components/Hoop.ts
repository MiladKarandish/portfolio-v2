/**
 * The footer basketball toy: a slingshot, a ball, a rim, and nothing else.
 *
 * This file is the whole simulation and the whole renderer. The React component
 * next to it owns the policy — whether to run at all, what colour things are,
 * and where the best streak is stored — for the same reason `WaterSurface` and
 * `WaterBackground` are split that way: the decisions that keep an idle toy from
 * becoming an irritation are worth keeping out of the maths.
 *
 * Two rules it holds to:
 *
 *   • It sleeps. When the ball is parked and nobody is dragging it, the
 *     animation frame is cancelled outright — not throttled, not drawing a
 *     still frame over and over. A visitor who never touches it pays for one
 *     canvas and a couple of idle event listeners.
 *
 *   • It never takes a gesture it was not offered. A pointerdown only counts
 *     if it lands on the ball; anything else passes straight through to the
 *     footer links underneath.
 */

export interface HoopPalette {
  /** Line work — the page's own text colour. */
  ink: string;
  /** The ball, and the rim it is aimed at. */
  ball: string;
}

export interface HoopCallbacks {
  /** A make. `streak` is the new run of consecutive makes, so always >= 1. */
  onScore(streak: number): void;
  /** The ball came to rest without going in. */
  onMiss(): void;
}

/* ── Physics ────────────────────────────────────────────────────────────────
   Units are CSS pixels and seconds, integrated at a fixed step so that a
   120Hz monitor and a browser that just dropped four frames agree about where
   the ball went. */

const GRAVITY = 1100;
const STEP = 1 / 120;
/** Longest catch-up a single frame may simulate. Past this we drop the time
    rather than spiral, which is what happens after a tab has been backgrounded. */
const MAX_FRAME = 0.25;

const BOUNCE_FLOOR = 0.5;
const BOUNCE_WALL = 0.5;
const BOUNCE_RIM = 0.45;
const BOUNCE_BOARD = 0.4;

/** Per-step drag, and the harder scrub applied while the ball is rolling. */
const AIR_DRAG = 0.999;
const ROLL_DRAG = 0.86;

/** Below both of these, on the floor, the ball counts as parked. */
const REST_SPEED_X = 8;
const REST_SPEED_Y = 20;
/** How long it has to stay parked before the toy resets and sleeps. */
const REST_DELAY = 0.45;

/* ── Slingshot ──────────────────────────────────────────────────────────── */

/** Furthest the ball can be pulled from its parking spot, in pixels. */
const MAX_PULL = 48;
/**
 * Pull distance to launch speed.
 *
 * Worth deriving rather than guessing. On the default 240px arena the cheapest
 * shot that reaches the rim centre is 526px/s, at 55°. `MAX_PULL * LAUNCH_K` is
 * the fastest shot available, so at K=11 the *only* make is a pixel-perfect
 * maximum pull at exactly the optimal angle — a toy that cannot be won.
 *
 * At 15 the top of the range is 720px/s, 1.37x the minimum. The make sits near
 * three-quarters pull, there is room either side of it to be wrong, and a full
 * pull is a deliberate overshoot. Re-derive this if the arena size changes.
 */
const LAUNCH_K = 15;
/** How close a pointerdown has to be to the ball's centre to count as a grab.
    Larger than the ball so the toy is not a test of precision. */
const GRAB_RADIUS = 20;

/**
 * How far the ball itself follows the pull, as a fraction of it.
 *
 * The ball is parked on the floor, so the natural aiming gesture — pull down
 * and back to shoot up and forward — points straight out of the arena. Letting
 * the ball follow the pointer all the way would draw it clipped through the
 * bottom of the canvas, and, worse, would launch it from under the floor: the
 * floor collision then fires on the first step and inverts the shot, which is
 * exactly what it did before this number existed.
 *
 * So the pull is read in full but the ball only leans into it, clamped to the
 * arena, and always launches from its parking spot. The rubber band and the
 * trajectory preview carry the rest of the information.
 */
const PULL_VISUAL = 0.35;

/* ── Layout ─────────────────────────────────────────────────────────────────
   Derived from the canvas box on every resize. The arena is small enough that
   the ball is kept inside it by bouncing off all four walls — there is nowhere
   for it to escape to, and chasing a lost ball is not the game. */

const BALL_R = 9;

interface Layout {
  w: number;
  h: number;
  floorY: number;
  restX: number;
  restY: number;
  boardX: number;
  boardTop: number;
  boardBottom: number;
  rimY: number;
  rimLeftX: number;
  rimRightX: number;
}

function computeLayout(w: number, h: number): Layout {
  const floorY = h - 10;
  const boardX = w - 16;

  return {
    w,
    h,
    floorY,
    restX: 30,
    restY: floorY - BALL_R,
    boardX,
    boardTop: 10,
    boardBottom: 48,
    rimY: 48,
    /* A 34px hoop for an 18px ball. Tight enough that the rim is worth
       avoiding, wide enough that a good shot is not luck. */
    rimLeftX: boardX - 36,
    rimRightX: boardX - 2,
  };
}

/**
 * Turn `rgb(255, 255, 255)` — what `getComputedStyle` hands back for the theme
 * variables — into the same colour at a given alpha. Anything unparseable falls
 * through as-is, which degrades to a fully opaque line rather than nothing.
 */
function alpha(colour: string, a: number): string {
  const parts = colour.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return colour;

  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${a})`;
}

export default class Hoop {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly callbacks: HoopCallbacks;

  private palette: HoopPalette;
  private layout: Layout;

  /** Ball state. */
  private x = 0;
  private y = 0;
  private vx = 0;
  private vy = 0;
  /** Previous centre, kept for the swept crossing test through the rim. */
  private prevY = 0;

  /** Pointer state. Non-null only between a grab and its release. */
  private drag: { id: number; x: number; y: number } | null = null;
  private hovering = false;

  private streak = 0;
  /** Whether the ball has been through the rim since it was last launched. */
  private scoredThisShot = false;
  /** Whether the ball is in flight, i.e. a miss is still possible. */
  private live = false;

  private restTimer = 0;
  /** Net swish, 1 immediately after a make and decaying to 0. */
  private swish = 0;
  /** Rim flash on contact, same shape as `swish`. */
  private rimFlash = 0;

  private frame: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, palette: HoopPalette, callbacks: HoopCallbacks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");

    this.canvas = canvas;
    this.ctx = ctx;
    this.palette = palette;
    this.callbacks = callbacks;
    this.layout = computeLayout(canvas.clientWidth || 240, canvas.clientHeight || 132);

    this.park();
    this.resize();
  }

  /* ── Public surface ─────────────────────────────────────────────────── */

  /** Re-read the backing store size and redraw once. Safe to call while asleep. */
  resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);

    this.layout = computeLayout(w, h);

    // A resize while the ball is parked should move it to the new parking
    // spot; one mid-flight should leave the shot alone.
    if (!this.live && !this.drag) this.park();

    this.draw();
  }

  /** Swap in new theme colours and repaint. */
  setPalette(palette: HoopPalette): void {
    this.palette = palette;
    this.draw();
  }

  /**
   * Try to start a drag. Returns false if the pointer was not on the ball, in
   * which case the caller must leave the event alone — the footer links sit
   * under this canvas and a swallowed click there is exactly the kind of
   * annoyance the toy is supposed to avoid.
   */
  grab(id: number, x: number, y: number): boolean {
    if (this.live || this.drag) return false;
    if (Math.hypot(x - this.x, y - this.y) > GRAB_RADIUS) return false;

    this.drag = { id, x, y };
    this.wake();
    return true;
  }

  moveDrag(id: number, x: number, y: number): void {
    if (this.drag?.id !== id) return;
    this.drag.x = x;
    this.drag.y = y;
  }

  /** Release the slingshot. A pull shorter than a couple of pixels is a click,
      not a shot, so the ball just drops back into place. */
  release(id: number): void {
    if (this.drag?.id !== id) return;

    const { restX, restY } = this.layout;
    const pull = this.clampedPull(this.drag.x, this.drag.y);
    const distance = Math.hypot(pull.x, pull.y);

    this.drag = null;

    if (distance < 3) {
      this.park();
      return;
    }

    // From the anchor, never from where the ball was held. Releasing at the
    // pulled-back position puts it under the floor on the very first step.
    this.x = restX;
    this.y = restY;
    this.vx = -pull.x * LAUNCH_K;
    this.vy = -pull.y * LAUNCH_K;
    this.prevY = this.y;
    this.live = true;
    this.scoredThisShot = false;
    this.restTimer = 0;
  }

  cancelDrag(id: number): void {
    if (this.drag?.id !== id) return;
    this.drag = null;
    this.park();
  }

  /** Whether a pointer at this position is over the ball — drives the cursor. */
  isOverBall(x: number, y: number): boolean {
    return !this.live && Math.hypot(x - this.x, y - this.y) <= GRAB_RADIUS;
  }

  setHovering(hovering: boolean): void {
    if (this.hovering === hovering) return;
    this.hovering = hovering;
    // Only a repaint, never a wake: the hover ring is a static highlight and
    // there is nothing to animate while the ball is parked.
    if (!this.frame) this.draw();
  }

  /** Cancel everything. The instance is not reusable afterwards. */
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
  sleep(): void {
    if (this.frame === null) return;
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private readonly tick = (now: number): void => {
    this.frame = requestAnimationFrame(this.tick);

    const elapsed = Math.min((now - this.lastTime) / 1000, MAX_FRAME);
    this.lastTime = now;
    this.accumulator += elapsed;

    while (this.accumulator >= STEP) {
      this.accumulator -= STEP;
      this.step();
    }

    this.swish = Math.max(0, this.swish - elapsed * 1.7);
    this.rimFlash = Math.max(0, this.rimFlash - elapsed * 3);

    this.draw();

    // Nothing moving, nothing decaying, nobody holding it: stop.
    if (!this.live && !this.drag && this.swish === 0 && this.rimFlash === 0) {
      this.sleep();
    }
  };

  /* ── Simulation ─────────────────────────────────────────────────────── */

  private clampedPull(px: number, py: number): { x: number; y: number } {
    const dx = px - this.layout.restX;
    const dy = py - this.layout.restY;
    const distance = Math.hypot(dx, dy);
    if (distance <= MAX_PULL) return { x: dx, y: dy };

    const scale = MAX_PULL / distance;
    return { x: dx * scale, y: dy * scale };
  }

  /** Where the ball is drawn mid-drag: leaning into the pull, never outside. */
  private dragPosition(pull: { x: number; y: number }): { x: number; y: number } {
    const { w, floorY, restX, restY } = this.layout;

    return {
      x: Math.min(Math.max(restX + pull.x * PULL_VISUAL, BALL_R), w - BALL_R),
      y: Math.min(Math.max(restY + pull.y * PULL_VISUAL, BALL_R), floorY - BALL_R),
    };
  }

  private park(): void {
    this.x = this.layout.restX;
    this.y = this.layout.restY;
    this.prevY = this.y;
    this.vx = 0;
    this.vy = 0;
    this.live = false;
    this.restTimer = 0;
  }

  private step(): void {
    if (this.drag) {
      const held = this.dragPosition(this.clampedPull(this.drag.x, this.drag.y));
      this.x = held.x;
      this.y = held.y;
      this.prevY = this.y;
      return;
    }

    if (!this.live) return;

    this.prevY = this.y;

    this.vy += GRAVITY * STEP;
    this.vx *= AIR_DRAG;
    this.vy *= AIR_DRAG;
    this.x += this.vx * STEP;
    this.y += this.vy * STEP;

    this.collideBoard();
    this.collideRim();
    this.checkScore();
    this.collideWalls();
    this.settle();
  }

  /** The backboard is a vertical wall the ball can only hit from the left. */
  private collideBoard(): void {
    const { boardX, boardTop, boardBottom } = this.layout;
    const limit = boardX - BALL_R;

    if (this.x <= limit || this.vx <= 0) return;
    if (this.y < boardTop - BALL_R || this.y > boardBottom + BALL_R) return;

    this.x = limit;
    this.vx = -this.vx * BOUNCE_BOARD;
  }

  /**
   * Both ends of the rim are solid posts. Treating them as circles is what
   * gives the toy its best moments — a shot that clips the near post and drops
   * in anyway is worth more than a clean one.
   */
  private collideRim(): void {
    const { rimY, rimLeftX, rimRightX } = this.layout;

    for (const postX of [rimLeftX, rimRightX]) {
      const dx = this.x - postX;
      const dy = this.y - rimY;
      const distance = Math.hypot(dx, dy);
      const minimum = BALL_R + 1.5;

      if (distance === 0 || distance >= minimum) continue;

      const nx = dx / distance;
      const ny = dy / distance;

      // Push out of the post, then reflect whatever velocity was heading into it.
      this.x = postX + nx * minimum;
      this.y = rimY + ny * minimum;

      const into = this.vx * nx + this.vy * ny;
      if (into < 0) {
        this.vx -= (1 + BOUNCE_RIM) * into * nx;
        this.vy -= (1 + BOUNCE_RIM) * into * ny;
      }

      this.rimFlash = 1;
    }
  }

  /** A make is the centre crossing the rim line downward, between the posts. */
  private checkScore(): void {
    if (this.scoredThisShot || this.vy <= 0) return;

    const { rimY, rimLeftX, rimRightX } = this.layout;
    if (this.prevY >= rimY || this.y < rimY) return;
    if (this.x <= rimLeftX + 2 || this.x >= rimRightX - 2) return;

    this.scoredThisShot = true;
    this.streak += 1;
    this.swish = 1;
    this.callbacks.onScore(this.streak);
  }

  private collideWalls(): void {
    const { w, floorY } = this.layout;

    if (this.x < BALL_R) {
      this.x = BALL_R;
      this.vx = -this.vx * BOUNCE_WALL;
    } else if (this.x > w - BALL_R) {
      this.x = w - BALL_R;
      this.vx = -this.vx * BOUNCE_WALL;
    }

    if (this.y < BALL_R) {
      this.y = BALL_R;
      this.vy = -this.vy * BOUNCE_WALL;
    }

    if (this.y > floorY - BALL_R) {
      this.y = floorY - BALL_R;
      this.vy = -this.vy * BOUNCE_FLOOR;
      this.vx *= ROLL_DRAG;
    }
  }

  /** Park the ball once it has been quiet on the floor for long enough. */
  private settle(): void {
    const onFloor = this.y >= this.layout.floorY - BALL_R - 0.5;
    const slow = Math.abs(this.vx) < REST_SPEED_X && Math.abs(this.vy) < REST_SPEED_Y;

    if (!onFloor || !slow) {
      this.restTimer = 0;
      return;
    }

    this.restTimer += STEP;
    if (this.restTimer < REST_DELAY) return;

    if (!this.scoredThisShot) {
      this.streak = 0;
      this.callbacks.onMiss();
    }

    this.park();
  }

  /* ── Drawing ────────────────────────────────────────────────────────── */

  private draw(): void {
    const { ctx } = this;
    const { w, h, floorY, boardX, boardTop, boardBottom, rimY, rimLeftX, rimRightX } = this.layout;
    const { ink, ball } = this.palette;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";

    // Floor.
    ctx.strokeStyle = alpha(ink, 0.14);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, floorY + 0.5);
    ctx.lineTo(w - 6, floorY + 0.5);
    ctx.stroke();

    // Backboard.
    ctx.strokeStyle = alpha(ink, 0.22);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boardX + 1, boardTop - 4);
    ctx.lineTo(boardX + 1, boardBottom + 10);
    ctx.stroke();

    ctx.strokeStyle = alpha(ink, 0.16);
    ctx.lineWidth = 1;
    ctx.strokeRect(boardX - 13.5, boardTop + 3.5, 13, 22);

    this.drawNet();

    // Rim, in front of the net, brightening for a moment when the ball hits it.
    ctx.strokeStyle = alpha(ball, 0.75 + this.rimFlash * 0.25);
    ctx.lineWidth = 2.5 + this.rimFlash;
    ctx.beginPath();
    ctx.moveTo(rimLeftX, rimY);
    ctx.lineTo(rimRightX, rimY);
    ctx.stroke();

    if (this.drag) this.drawAim();
    this.drawBall();
  }

  /**
   * Five strands hanging from the rim, pinched toward the middle. A make sets
   * `swish` to 1 and the strands kick outward and downward as it decays, which
   * is the entire reward animation.
   */
  private drawNet(): void {
    const { ctx } = this;
    const { rimY, rimLeftX, rimRightX } = this.layout;
    const strands = 5;
    const depth = 16 + this.swish * 5;
    const kick = this.swish * this.swish;

    ctx.strokeStyle = alpha(this.palette.ink, 0.2 + this.swish * 0.25);
    ctx.lineWidth = 1;

    for (let i = 0; i < strands; i += 1) {
      const t = i / (strands - 1);
      const topX = rimLeftX + (rimRightX - rimLeftX) * t;
      // Strands converge as they fall; the swish briefly un-pinches them.
      const pinch = 0.42 - kick * 0.3;
      const bottomX = topX + ((rimLeftX + rimRightX) / 2 - topX) * pinch;

      ctx.beginPath();
      ctx.moveTo(topX, rimY);
      ctx.quadraticCurveTo(topX + (bottomX - topX) * 0.4, rimY + depth * 0.55, bottomX, rimY + depth);
      ctx.stroke();
    }
  }

  /**
   * The pull line plus a dotted preview of where the shot goes.
   *
   * The preview is the same integrator the ball uses, run forward on a copy —
   * so it cannot drift out of agreement with the real shot the way a closed-form
   * parabola would once drag is in the mix. It stops at the floor, and it
   * ignores the rim, so it shows the shot rather than the result.
   */
  private drawAim(): void {
    if (!this.drag) return;

    const { ctx } = this;
    const { restX, restY, floorY } = this.layout;
    const pull = this.clampedPull(this.drag.x, this.drag.y);
    const held = this.dragPosition(pull);

    // The rubber band, from the held ball out to the full pull. It is allowed
    // to run past the bottom of the canvas and clip; that reads as stretch.
    ctx.strokeStyle = alpha(this.palette.ink, 0.35);
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(held.x, held.y);
    ctx.lineTo(restX + pull.x, restY + pull.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // The preview starts where the shot will, which is the anchor.
    let px = restX;
    let py = restY;
    let pvx = -pull.x * LAUNCH_K;
    let pvy = -pull.y * LAUNCH_K;

    // Same STEP as the simulation, not a coarser one — Euler integration at a
    // different dt lands somewhere else, and a preview that disagrees with the
    // shot is worse than no preview. Every eighth point is drawn.
    const steps = 120;
    for (let i = 0; i < steps; i += 1) {
      pvy += GRAVITY * STEP;
      pvx *= AIR_DRAG;
      pvy *= AIR_DRAG;
      px += pvx * STEP;
      py += pvy * STEP;

      if (py > floorY - BALL_R) break;

      if (i % 6 === 0) {
        // Only a mild taper. Fading proportionally to the step index put the
        // end of the arc — the part that says whether this shot drops through
        // the rim or clatters off the board, which is the entire question the
        // preview exists to answer — at 5% alpha, i.e. invisible.
        ctx.fillStyle = alpha(this.palette.ink, 0.3 - 0.15 * (i / steps));
        ctx.beginPath();
        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawBall(): void {
    const { ctx } = this;
    const { ball, ink } = this.palette;

    // Hover ring: the only hint that the ball is grabbable at all.
    if (this.hovering && !this.live) {
      ctx.strokeStyle = alpha(ball, 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, BALL_R + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = alpha(ball, 0.95);
    ctx.beginPath();
    ctx.arc(this.x, this.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    // Two seams, enough to read as a basketball at 18 pixels across.
    ctx.strokeStyle = alpha(ink, 0.35);
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(this.x - BALL_R, this.y);
    ctx.lineTo(this.x + BALL_R, this.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(this.x, this.y, BALL_R * 0.45, BALL_R, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
