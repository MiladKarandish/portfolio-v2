/**
 * A way for the rest of the page to disturb the water without knowing whether
 * there is any water to disturb.
 *
 * `WaterBackground` decides not to exist for a reduced-motion visitor, and it
 * gives up entirely on a machine whose GPU will not hand back float render
 * targets. Anything that wants to make a ripple therefore cannot hold a
 * reference to the surface — it would be holding a reference to nothing most of
 * the time, and the code that owns the ripple would grow a branch for a case it
 * has no business knowing about.
 *
 * So ripples are announced, not delivered. With no water mounted this is a loop
 * over an empty set, which is exactly the right amount of work for a splash
 * nobody can see.
 */

export interface Ripple {
  /** CSS pixels from the left of the viewport. */
  x: number;
  /** CSS pixels from the top of the viewport. */
  y: number;
  /** Radius as a fraction of viewport height. */
  radius: number;
  /**
   * Height added at the centre. Negative dents the surface, which is what a
   * thing falling *into* water does first.
   */
  strength: number;
}

type Listener = (ripple: Ripple) => void;

const listeners = new Set<Listener>();

/** Subscribe. Returns the unsubscribe, for the effect that set it up. */
export function onRipple(listener: Listener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Disturb the water, if there is any. */
export function ripple(disturbance: Ripple): void {
  for (const listener of listeners) listener(disturbance);
}
