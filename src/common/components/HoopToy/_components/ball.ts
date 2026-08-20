/**
 * What the court and the water both have to agree about: how big the ball is,
 * how it falls, and how it is drawn.
 *
 * The ball can leave the arena. Once it does, it is still the same ball on the
 * same trajectory, just being integrated and painted by `Splash` on a
 * viewport-sized canvas instead of by `Hoop` on a 240px one. Sharing the
 * constants is what makes the hand-off invisible — a ball that changed size or
 * fell at a different rate the moment it crossed the edge of the court would
 * read as two different objects.
 */

import { alpha } from "@/utils/colour";

export interface HoopPalette {
  /** Line work — the page's own text colour. */
  ink: string;
  /** The ball, and the rim it is aimed at. */
  ball: string;
}

export const BALL_R = 9;

/* ── Physics ────────────────────────────────────────────────────────────────
   Units are CSS pixels and seconds, integrated at a fixed step so that a
   120Hz monitor and a browser that just dropped four frames agree about where
   the ball went. */

export const GRAVITY = 1100;
export const STEP = 1 / 120;
/** Longest catch-up a single frame may simulate. Past this we drop the time
    rather than spiral, which is what happens after a tab has been backgrounded. */
export const MAX_FRAME = 0.25;
/** Per-step drag. */
export const AIR_DRAG = 0.999;

/**
 * Re-exported so that everything the court and the water share still arrives
 * from this one module. The helper itself lives in `utils/colour` because the
 * cobweb at the other end of the footer wants it too.
 */
export { alpha };

/**
 * The ball itself: a disc and two seams, which is all that reads at 18 pixels
 * across.
 *
 * The seams are the only thing that can show rotation at this size, and
 * rotation is most of what sells it as a thrown object rather than a moving
 * dot. `scale` and `fade` exist for the sink, where it shrinks away rather than
 * simply vanishing.
 */
export function paintBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  palette: HoopPalette,
  spin = 0,
  scale = 1,
  fade = 1
): void {
  const radius = BALL_R * scale;
  if (radius <= 0.2 || fade <= 0) return;

  ctx.fillStyle = alpha(palette.ball, 0.95 * fade);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);

  ctx.strokeStyle = alpha(palette.ink, 0.35 * fade);
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.45, radius, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
