/**
 * Turn `rgb(255, 255, 255)` — what `getComputedStyle` hands back for the theme
 * variables — into the same colour at a given alpha. Anything unparseable falls
 * through as-is, which degrades to a fully opaque line rather than nothing.
 *
 * Lives here rather than beside one toy because both canvas toys in the footer
 * read their colours the same way, out of the same custom properties.
 */
export function alpha(colour: string, a: number): string {
  const parts = colour.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return colour;

  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${a})`;
}

/**
 * Mix a colour toward white. `amount` is 0 for unchanged and 1 for white.
 *
 * Used to derive something that is guaranteed to be lighter than a background
 * built from the same colour, whatever the theme has done with its ramp.
 */
export function lighten(colour: string, amount: number): string {
  const parts = colour.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return colour;

  const lift = (v: string) => Math.round(Number(v) + (255 - Number(v)) * amount);

  return `rgb(${lift(parts[0])}, ${lift(parts[1])}, ${lift(parts[2])})`;
}
