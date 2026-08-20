/**
 * Whether a pointer event landed on the water rather than on the page.
 *
 * The page card floats on the water; the water shows around it and, faintly,
 * through it. Everything the water reacts to has to agree about that boundary,
 * because the whole point of it is that the effect stops the moment someone is
 * using the page. Anyone who finds the motion distracting is, by definition,
 * trying to read, and keeping their cursor over the thing they are reading is
 * not a setting they have to find — it is where the cursor already is.
 *
 * Hit-testing by element rather than by rectangle so the card's rounded corners
 * are handled exactly, and with no layout read on every pointer event. The
 * canvases over the water are all `pointer-events: none`, so they are never the
 * target here.
 */

const CONTENT_SELECTOR = ".page-card";

/** True when the event landed on the page card, and so is not for the water. */
export function isOverContent(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(CONTENT_SELECTOR) !== null;
}

/** True when the event landed on open water. The one both readings agree on. */
export function isOpenWater(target: EventTarget | null): boolean {
  return !isOverContent(target);
}
