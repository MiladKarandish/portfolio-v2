"use client";

import { useEffect, useRef, useState } from "react";
import { onRipple } from "@/common/components/WaterBackground/ripples";
import WaterSurface from "@/common/components/WaterBackground/_components/WaterSurface";
import School, { type FishPalette } from "./_components/School";

/**
 * Something living under the water the page floats on.
 *
 * `School` is the simulation. This component is the policy: whether it runs,
 * what colour it is, and what it is listening to. The same split as every
 * other toy here.
 *
 * It has no gesture of its own and no element to press. It listens to
 * `ripples.ts` and nothing else, which means all three toys on the page summon
 * fish without any of them referring to this file, or to each other:
 *
 *   • the basketball going over the edge of its court and hitting the water
 *   • every touch of a skipping stone, and the sink at the end of it
 *   • a strand of the cobweb let go of hard
 *
 * Add a fourth thing that publishes a ripple and the fish will come to that
 * too, with no change here.
 *
 * There is deliberately no `pointer: coarse` guard, unlike the toys. Nothing
 * publishes ripples on touch today, so there is nothing to come up for and the
 * cost is one idle subscription — but the day the hoop learns to be tapped,
 * this should start working on its own rather than needing to be remembered.
 */

const FALLBACK: FishPalette = { shadow: "rgb(20, 60, 120)" };

/**
 * `--bg-950` is the darkest tone in every theme. Depth reads as dark, and the
 * fish have to look like they are under the surface rather than drawn on it —
 * the page's ink would make them pale shapes floating on top.
 */
function readPalette(): FishPalette {
  const style = getComputedStyle(document.documentElement);
  const shadow = style.getPropertyValue("--bg-950").trim();

  return { shadow: shadow || FALLBACK.shadow };
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

    const onResize = () => school.resize();

    // The theme picker writes the palette as inline custom properties on the
    // documentElement, so watching that one attribute is the whole subscription.
    const themeObserver = new MutationObserver(() => school.setPalette(readPalette()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    window.addEventListener("resize", onResize);

    return () => {
      unsubscribe();
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
