/**
 * The smallest verlet solver that will hold a spider's web up.
 *
 * Verlet integration stores a particle's previous position instead of its
 * velocity, which is why a web built out of it behaves the way a web does: you
 * displace a point, the constraints pull it back over the next few frames, and
 * the overshoot you get for free is the wobble. There is no spring force to
 * tune and nothing to blow up.
 *
 * This is a rewrite of the primitives from `verlet-js`, which is what the
 * CodePen this toy is modelled on used. Two deliberate differences:
 *
 *   • Positions are plain numbers on the particle rather than a `Vec2` object
 *     per component. The original allocates several vectors per constraint per
 *     relaxation pass; at sixteen passes a frame that is thousands of throwaway
 *     objects a second, in a footer, for a decoration.
 *
 *   • Pinning is an inverse mass (`w`) rather than a constraint that slams the
 *     position back after everything else has run. A pinned particle simply
 *     absorbs none of a correction, so its neighbours take all of it. The
 *     original's order-dependent fight between pins and distances is what makes
 *     a taut web there jitter; here a pinned anchor is just immovable.
 */

/**
 * A point with a memory. `px`/`py` are where it was last step — the difference
 * is its velocity, and writing to `px` is how you apply an impulse.
 */
export class Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  /** Inverse mass. `0` is pinned: it takes no share of any correction. */
  w = 1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
  }

  pin(): this {
    this.w = 0;
    return this;
  }
}

export interface Constraint {
  /** `coef` is 1/iterations: one relaxation pass's share of the correction. */
  relax(coef: number): void;
}

/** Holds two particles a fixed distance apart. The web is nothing but these. */
export class Distance implements Constraint {
  readonly a: Particle;
  readonly b: Particle;
  distance: number;
  stiffness: number;

  constructor(a: Particle, b: Particle, stiffness: number, distance?: number) {
    this.a = a;
    this.b = b;
    this.stiffness = stiffness;
    this.distance = distance ?? Math.hypot(a.x - b.x, a.y - b.y);
  }

  relax(coef: number): void {
    const { a, b } = this;
    const sum = a.w + b.w;
    if (sum === 0) return;

    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const m = dx * dx + dy * dy;
    // Two particles exactly on top of each other have no direction to be
    // pushed apart along. Leaving them is correct: the next step's gravity
    // separates them and this constraint picks up again.
    if (m === 0) return;

    // Solved against the squared length, as verlet-js does: it is the same
    // correction as normalising and comparing lengths, without the square root.
    const k = ((this.distance * this.distance - m) / m) * this.stiffness * coef;

    // Split by inverse mass, so an anchor takes none of it and its neighbour
    // takes the lot.
    const shareA = (k * 2 * a.w) / sum;
    const shareB = (k * 2 * b.w) / sum;

    a.x += dx * shareA;
    a.y += dy * shareA;
    b.x -= dx * shareB;
    b.y -= dy * shareB;
  }
}

/**
 * Holds the angle a–b–c, by rotating the ends about the middle and the middle
 * about the ends. This is the only thing that stops the spider's legs from
 * folding flat: a leg is a chain of distances, and distances alone have no
 * opinion about which way a knee bends.
 */
export class Angle implements Constraint {
  readonly a: Particle;
  readonly b: Particle;
  readonly c: Particle;
  readonly angle: number;
  stiffness: number;

  constructor(a: Particle, b: Particle, c: Particle, stiffness: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.stiffness = stiffness;
    this.angle = angleAt(b, a, c);
  }

  relax(coef: number): void {
    let diff = angleAt(this.b, this.a, this.c) - this.angle;

    // The shortest way round. Without this a joint that crosses the ±π seam
    // snaps the long way and the leg cartwheels.
    if (diff <= -Math.PI) diff += Math.PI * 2;
    else if (diff >= Math.PI) diff -= Math.PI * 2;

    diff *= coef * this.stiffness;

    rotate(this.a, this.b, diff);
    rotate(this.c, this.b, -diff);
    rotate(this.b, this.a, diff);
    rotate(this.b, this.c, -diff);
  }
}

/**
 * The signed angle ∠(a → origin → b).
 *
 * From the cross and dot products rather than the difference of two `atan2`
 * calls, which looks equivalent and is not. The difference form is unbounded —
 * it lands anywhere in (-2π, 2π), so a stored angle and a measured one can
 * disagree by a full turn — and it carries the opposite sign, which turns
 * `Angle` from a constraint that restores a joint into one that drives it away.
 * A spider built on that version pulls itself apart within a second.
 */
function angleAt(origin: Particle, a: Particle, b: Particle): number {
  const ax = a.x - origin.x;
  const ay = a.y - origin.y;
  const bx = b.x - origin.x;
  const by = b.y - origin.y;

  return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
}

/** Turn `point` about `pivot`. A pinned point does not turn. */
function rotate(point: Particle, pivot: Particle, radians: number): void {
  if (point.w === 0) return;

  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - pivot.x;
  const dy = point.y - pivot.y;

  point.x = dx * cos - dy * sin + pivot.x;
  point.y = dx * sin + dy * cos + pivot.y;
}

/**
 * One integration step. Gravity is per-step rather than per-second because
 * every other number in this file is tuned against it; the caller's job is to
 * run this a fixed number of times a second, which `Cobweb` does.
 */
export function integrate(
  particles: readonly Particle[],
  gravityY: number,
  friction: number
): void {
  for (const p of particles) {
    if (p.w === 0) continue;

    const vx = (p.x - p.px) * friction;
    const vy = (p.y - p.py) * friction;

    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + gravityY;
  }
}
