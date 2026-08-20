"use client";

import { useEffect, useRef, useState } from "react";
import WaterSurface, { type WaterPalette } from "./_components/WaterSurface";
import { isOverContent } from "./openWater";
import { onRipple } from "./ripples";

/**
 * The page background: a real water surface that the cursor disturbs.
 *
 * `WaterSurface` is the renderer. This component is the policy — when a drop
 * happens, how hard, whether to run at all, and what colour the water is. Those
 * are the decisions that make the difference between "interactive background"
 * and "thing I had to close the tab to escape", so they are kept together and
 * out of the WebGL.
 *
 * Rules it follows:
 *   • Never intercepts input. The canvas is `pointer-events: none` and every
 *     listener is passive, so nothing here can swallow a click or fight a
 *     scroll gesture.
 *   • Never runs when it cannot be seen — hidden tab, or a `prefers-reduced-
 *     motion` visitor, who gets the CSS gradient underneath instead.
 *   • Goes quiet on its own. Once the water settles the simulation stops and
 *     the loop drops to a slow drift.
 */

/**
 * Amplitudes are the whole character of this thing, so they are gathered here
 * rather than scattered through the handlers.
 *
 * They are much smaller than they look like they should be. Every downstream
 * term — how far light bends, how tight the specular lobe is, how bright the
 * caustics are — scales off the *slope* of the surface, so raising a strength
 * by 3x does considerably more than 3x to the picture. The first pass at these
 * numbers was about 3.5x hotter and it read as neon, not water.
 */

/**
 * The pointer carves one continuous furrow, as a capsule from where it was to
 * where it is. Radius is a fraction of viewport height; depth is negative
 * because something moving through water pushes it down.
 */
const TRAIL_RADIUS = 0.032;
const TRAIL_DEPTH = -0.1;
/** Below this the pointer is effectively still and the water should settle. */
const TRAIL_MIN_TRAVEL = 1.2;
/**
 * Longest single stroke, as a fraction of viewport height. A pointer that jumps
 * the width of the screen — alt-tab, a jump between monitors — should not carve
 * one furrow the whole way across as though something had been dragged through.
 */
const TRAIL_MAX_TRAVEL = 0.4;

const CLICK_RADIUS = 0.05;
const CLICK_STRENGTH = 0.22;

/** Ambient drops, seconds. Rare and weak: this is a pulse, not weather. */
const AMBIENT_INTERVAL = [9, 19] as const;
const AMBIENT_RADIUS = 0.032;
const AMBIENT_STRENGTH = 0.045;

/**
 * How the page palette becomes a water palette, as multipliers in linear light.
 *
 * The darkening is not decoration. The card on top of this is `--bg-700`; if the
 * water sat at `--bg-950` — the flat colour it replaces — the two would be close
 * enough that the card's edge would go soft, and the page would lose the frame
 * it is currently laid out inside. Deep water is darker than the shore, which is
 * both true and exactly what the layout needs.
 */
const DEEP_SCALE = 0.44;
const MID_SCALE = 0.68;
const SHALLOW_SCALE = 0.85;

type Rgb = [number, number, number];

const FALLBACK: WaterPalette = {
  deep: [0.05, 0.02, 0.01],
  mid: [0.14, 0.05, 0.01],
  shallow: [0.35, 0.14, 0.05],
  light: [1, 1, 1],
};

/** sRGB 0..255 to linear 0..1. Lighting maths in sRGB is what makes highlights
 *  look like paint instead of light. */
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * The theme variables hold bare `rgba(193, 88, 23)` triples, which the browser
 * normalises to `rgb(...)`. Pulling the first three numbers out handles both,
 * and any alpha is ignored — the water is opaque.
 */
function readColour(style: CSSStyleDeclaration, name: string, scale: number): Rgb | null {
  const matches = style.getPropertyValue(name).match(/[\d.]+/g);
  if (!matches || matches.length < 3) return null;

  return [
    toLinear(Number(matches[0])) * scale,
    toLinear(Number(matches[1])) * scale,
    toLinear(Number(matches[2])) * scale,
  ];
}

function readPalette(): WaterPalette {
  const style = getComputedStyle(document.documentElement);

  const deep = readColour(style, "--bg-950", DEEP_SCALE);
  const mid = readColour(style, "--bg-950", MID_SCALE);
  const shallow = readColour(style, "--bg-800", SHALLOW_SCALE);
  const light = readColour(style, "--text-100", 1);

  if (!deep || !mid || !shallow || !light) return FALLBACK;

  return { deep, mid, shallow, light };
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * The pointer only disturbs the water outside the page card — the margins are
 * live, the content is still.
 *
 * This is deliberately instead of a "disable effects" button. It also means
 * the effect never competes with text for attention while someone is actually
 * using the page.
 *
 * The test itself is in `openWater.ts`, because the stone skipping across the
 * margin has to draw the boundary in exactly the same place.
 */

const WaterBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Decided on the client. The server knows neither whether this visitor asked
  // for less motion nor whether the GPU will give us float render targets.
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

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let surface: WaterSurface;
    try {
      surface = new WaterSurface(canvas, readPalette(), {
        // A phone is running this on battery, with a screen small enough that
        // the detail it is being asked to resolve would not fit on it anyway.
        resolution: coarse ? 192 : 256,
        sceneResolution: coarse ? 512 : 768,
        maxDpr: coarse ? 1.25 : 1.5,
      });
    } catch {
      // Support was probed on a throwaway context; a real one can still fail
      // (a blocklisted driver, a machine already out of GPU memory). The CSS
      // gradient underneath is the whole fallback and it is already there.
      setEnabled(false);
      return;
    }

    surface.start();

    // ── Arrival ──────────────────────────────────────────────────────────────
    // Two soft drops, off-centre and apart, so the first frame anyone sees is
    // water rather than a gradient that only reveals itself if you move a mouse.
    const arrival = setTimeout(() => {
      surface.drop(window.innerWidth * 0.28, window.innerHeight * 0.34, 0.075, 0.16);
      surface.drop(window.innerWidth * 0.71, window.innerHeight * 0.62, 0.055, 0.12);
    }, 180);

    // ── Pointer ──────────────────────────────────────────────────────────────
    let last: { x: number; y: number; time: number } | null = null;

    const onPointerMove = (event: PointerEvent) => {
      if (isOverContent(event.target)) {
        // Drop the anchor as well as the stroke. Otherwise crossing the card
        // would join the point of entry to the point of exit and carve one long
        // furrow straight through the area that is supposed to be still.
        last = null;
        return;
      }

      const previous = last;
      last = { x: event.clientX, y: event.clientY, time: event.timeStamp };

      if (!previous) return;

      const distance = Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
      if (distance < TRAIL_MIN_TRAVEL) {
        // Hold the anchor rather than advancing it, so a slow drift still
        // accumulates into a real segment instead of being discarded forever.
        last = previous;
        return;
      }

      const diameter = TRAIL_RADIUS * 2 * window.innerHeight;
      const maxTravel = TRAIL_MAX_TRAVEL * window.innerHeight;

      let { x: fromX, y: fromY } = previous;
      if (distance > maxTravel) {
        // Keep the near end and drop the rest of the jump.
        const keep = maxTravel / distance;
        fromX = event.clientX - (event.clientX - fromX) * keep;
        fromY = event.clientY - (event.clientY - fromY) * keep;
      }

      /**
       * Depth scaled by how far the pointer moved, so the furrow is about as
       * deep however fast you cross a given path.
       *
       * Consecutive strokes overlap — at 60Hz a slow drag lays down many
       * capsules within one radius of each other, and they add — so without any
       * scaling the furrow would deepen the *slower* you moved, which is
       * backwards. Straight `distance / width` is the algebraically exact
       * correction for that overlap, and it is wrong in practice: the simulation
       * drains a shallow trough about as fast as a slow drag can dig it, so a
       * crawl came out 13x weaker than a flick and read as nothing happening.
       * The square root splits the difference. Measured across 4–90 px/frame it
       * holds the surface slope inside 0.021–0.035, against 0.022 for the drop
       * trail this replaced.
       */
      const travel = Math.min(distance, maxTravel);
      const depth = TRAIL_DEPTH * Math.sqrt(Math.min(travel / diameter, 1));

      surface.stroke(fromX, fromY, event.clientX, event.clientY, TRAIL_RADIUS, depth);
    };

    const onPointerDown = (event: PointerEvent) => {
      // Same rule as movement: clicking a button or a link is using the page,
      // not playing with the water.
      if (isOverContent(event.target)) return;
      surface.drop(event.clientX, event.clientY, CLICK_RADIUS, CLICK_STRENGTH);
    };

    // A finger lifted and put down elsewhere should not draw a wake across the
    // screen between the two places.
    const onPointerLeave = () => {
      last = null;
    };

    // ── Ambient ──────────────────────────────────────────────────────────────
    let ambient: ReturnType<typeof setTimeout>;

    const scheduleAmbient = () => {
      ambient = setTimeout(() => {
        if (!document.hidden) {
          surface.drop(
            randomBetween(0.1, 0.9) * window.innerWidth,
            randomBetween(0.1, 0.9) * window.innerHeight,
            AMBIENT_RADIUS,
            AMBIENT_STRENGTH
          );
        }
        scheduleAmbient();
      }, randomBetween(AMBIENT_INTERVAL[0], AMBIENT_INTERVAL[1]) * 1000);
    };

    scheduleAmbient();

    // ── Anything else on the page ────────────────────────────────────────────
    // The footer basketball drops its ball in here. Announced rather than
    // called so the toy never has to ask whether the water exists.
    const unsubscribe = onRipple(({ x, y, radius, strength }) => surface.drop(x, y, radius, strength));

    // ── Page state ───────────────────────────────────────────────────────────
    const onScroll = () => surface.setScroll(window.scrollY);

    const onVisibility = () => {
      if (document.hidden) surface.stop();
      else surface.start();
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      // Every resize reallocates three float textures. During a window drag
      // that is hundreds of allocations for one final size.
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => surface.resize(), 150);
    };

    // The theme picker writes the palette as inline custom properties on the
    // documentElement, so watching that one attribute is the whole subscription.
    const themeObserver = new MutationObserver(() => surface.setPalette(readPalette()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointercancel", onPointerLeave, { passive: true });
    window.addEventListener("pointerup", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(arrival);
      clearTimeout(ambient);
      clearTimeout(resizeTimer);
      unsubscribe();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointercancel", onPointerLeave);
      window.removeEventListener("pointerup", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      surface.destroy();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={`water-background`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WaterBackground;
