"use client";

import { useEffect, useRef, useState } from "react";
import { isOpenWater } from "@/common/components/WaterBackground/openWater";
import { onRipple } from "@/common/components/WaterBackground/ripples";
import WaterSurface from "@/common/components/WaterBackground/_components/WaterSurface";
import { lighten } from "@/utils/colour";
import School, { type FishPalette } from "./_components/School";

/**
 * Something living under the water the page floats on.
 *
 * `School` is the simulation. This component is the policy: whether it runs,
 * what colour it is, and what it is listening to. The same split as every
 * other toy here.
 *
 * It has no element of its own to press. It listens to `ripples.ts`, which
 * means all three toys on the page summon fish without any of them referring
 * to this file, or to each other:
 *
 *   • the basketball going over the edge of its court and hitting the water
 *   • every touch of a skipping stone, and the sink at the end of it
 *   • a strand of the cobweb let go of hard
 *
 * Add a fourth thing that publishes a ripple and the fish will come to that
 * too, with no change here.
 *
 * And it takes a press on the open water directly, which is the only one of
 * those a visitor finds without being told: the margin already dents when you
 * click it, so clicking it is the thing people actually try. `isOpenWater` is
 * the same test the water and the stone use, so all three agree about where
 * the page stops and the water starts. Movement is not included — that is
 * continuous, and fish that followed the cursor would be a cursor effect.
 *
 * There is deliberately no `pointer: coarse` guard, unlike the three toys —
 * and since a press counts, this is the one thing on the page besides the
 * water itself that a phone gets. The margin is narrow there, so it is a
 * fiddly tap rather than a feature, but it works and it costs nothing to let
 * it. The day the hoop learns to be tapped, this starts paying off properly on
 * its own rather than needing to be remembered.
 */

const FALLBACK: FishPalette = { shadow: "rgb(20, 60, 120)" };

/**
 * How much of the way to white the fish are lifted from the water's own base
 * colour. See `readPalette`.
 */
const LIFT = 0.55;

/**
 * The fish are `--bg-950` lifted toward white, and that is not a taste choice —
 * it is the only way to be sure they can be seen in every theme.
 *
 * `WaterBackground` builds the whole surface out of `--bg-950` *darkened*, by
 * 0.44 for deep water and 0.68 for mid. Drawing the fish in the same variable
 * at full strength, which is what the first version did, leaves the gap between
 * fish and water entirely at the mercy of how bright that one variable happens
 * to be: in `earthy` it is rgb(30, 24, 8), so the water is about rgb(20, 16, 5)
 * and the fish about rgb(20, 16, 5) too. They vanished.
 *
 * Lifting instead of darkening puts the fish on the other side of the water
 * from where the water was made, so the contrast is fixed by construction and
 * survives a theme nobody has written yet. `dusk` is the proof it was needed:
 * its ramp is inverted — `--bg-950` is *lighter* than `--bg-700` — so anything
 * assuming 950 means dark is already wrong there.
 */
function readPalette(): FishPalette {
  const style = getComputedStyle(document.documentElement);
  const base = style.getPropertyValue("--bg-950").trim();

  return { shadow: lighten(base || FALLBACK.shadow, LIFT) };
}

const FishToy = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Decided on the client: the server knows neither whether this visitor asked
  // for less motion nor whether the GPU will give the water float render
  // targets. Without the water there is no surface to be under.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const decide = () => setEnabled(!motion.matches && WaterSurface.isSupported());

    decide();
    motion.addEventListener("change", decide);
    return () => motion.removeEventListener("change", decide);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    let school: School;
    try {
      school = new School(canvas, readPalette());
    } catch {
      // No 2D context. Nothing to show and nothing to fall back to.
      setEnabled(false);
      return;
    }

    const unsubscribe = onRipple(({ x, y, strength }) => school.notice(x, y, strength));

    // Left button, open water. Nothing is captured and nothing is prevented:
    // this rides along with a press the water has already handled, and a press
    // that turns out to be the start of a stone throw stays a stone throw.
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !isOpenWater(event.target)) return;
      school.visit(event.clientX, event.clientY);
    };

    const onResize = () => school.resize();

    // The theme picker writes the palette as inline custom properties on the
    // documentElement, so watching that one attribute is the whole subscription.
    const themeObserver = new MutationObserver(() => school.setPalette(readPalette()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      unsubscribe();
      window.removeEventListener("pointerdown", onPointerDown);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      school.destroy();
    };
  }, [enabled]);

  if (!enabled) return null;

  /* Between the water and the stone, and below the card: the fish are under
     the surface, the stone is on it, and the page is above both. */
  return (
    <div className={`fish-school`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default FishToy;
