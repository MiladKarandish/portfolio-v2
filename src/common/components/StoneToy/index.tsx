"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isOpenWater } from "@/common/components/WaterBackground/openWater";
import WaterSurface from "@/common/components/WaterBackground/_components/WaterSurface";
import Stone, { MIN_SPEED, type StonePalette } from "./_components/Stone";

/**
 * Skipping stones on the water the page floats on.
 *
 * `Stone` is the simulation. This component is the policy: whether it runs,
 * what colour it is, what counts as a throw rather than a drag, and where the
 * best run is remembered. The same split as `HoopToy`/`Hoop`.
 *
 * There is nothing on the page until somebody throws something. No idle
 * animation, no frames drawn at all between stones, and no element to see —
 * which is the point, because this toy's playing field is the empty margin
 * either side of the card, and the whole appeal of that space is that it is
 * empty.
 *
 * How it avoids being in the way:
 *
 *   • It only takes a flick that starts on open water. `isOpenWater` is the
 *     same test the water itself uses to decide whether the cursor is playing
 *     or reading, so the boundary is drawn in exactly one place.
 *   • It never calls `preventDefault`. A press that turns out not to be a
 *     throw was a completely ordinary press, and the page has already handled
 *     it. Text selection is suppressed for the length of a flick with a class
 *     rather than by swallowing the event.
 *   • It is not there for anyone who asked for less motion, not there on
 *     touch — where the margin is a couple of dozen pixels wide and there is
 *     nothing to aim at — and not there when the water is not there, because a
 *     stone skipping across a static gradient dents nothing and reads as a bug.
 */

/** Where the best run is remembered. */
const STORAGE_KEY = "stone-best";

/**
 * How far back to look for the throwing velocity. A flick is the last moment
 * of a gesture, not its average: measuring the whole drag turns a slow drag
 * ending in a snap into a slow throw, which is the opposite of what the hand
 * just did.
 */
const FLICK_WINDOW = 90;

/** How long the count stays on screen once the stone is gone. */
const READOUT_TIME = 1900;

const FALLBACK: StonePalette = { ink: "rgb(255, 255, 255)" };

function readPalette(): StonePalette {
  const style = getComputedStyle(document.documentElement);
  const ink = style.getPropertyValue("--text-100").trim();

  return { ink: ink || FALLBACK.ink };
}

interface Readout {
  /** Where the throw started, which is on open water by definition. */
  x: number;
  y: number;
  skips: number;
  best: number;
  /** Distinguishes two throws that scored the same, so the fade restarts. */
  id: number;
}

const StoneToy = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bestRef = useRef(0);

  const [enabled, setEnabled] = useState(false);
  const [readout, setReadout] = useState<Readout | null>(null);

  /**
   * Read here rather than in the simulation so that a storage that throws —
   * Safari in private mode, a locked-down profile — costs the toy its memory
   * and nothing else.
   */
  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(stored) && stored > 0) bestRef.current = stored;
    } catch {
      // No memory between visits. The toy still works.
    }
  }, []);

  // Decided on the client: the server knows none of these three things.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const decide = () =>
      setEnabled(!motion.matches && !coarse.matches && WaterSurface.isSupported());

    decide();
    motion.addEventListener("change", decide);
    coarse.addEventListener("change", decide);

    return () => {
      motion.removeEventListener("change", decide);
      coarse.removeEventListener("change", decide);
    };
  }, []);

  /** The count climbs while the stone is still going, which is half the fun. */
  const onSkip = useCallback((skips: number) => {
    setReadout((previous) => (previous ? { ...previous, skips } : previous));
  }, []);

  const onDone = useCallback((_x: number, _y: number, skips: number) => {
    if (skips < 1) {
      // A stone that never touched. Nothing to show, and nothing to leave
      // sitting in state until the next throw replaces it.
      setReadout(null);
      return;
    }

    if (skips > bestRef.current) {
      bestRef.current = skips;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(skips));
      } catch {
        // Unwritable storage. The count still shows for this visit.
      }
    }

    setReadout((previous) =>
      previous ? { ...previous, skips, best: bestRef.current } : previous
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    let stone: Stone;
    try {
      stone = new Stone(canvas, readPalette(), { onSkip, onDone });
    } catch {
      // No 2D context. Nothing to show and nothing to fall back to.
      setEnabled(false);
      return;
    }

    /** The last little while of the gesture, newest last. */
    let trail: { t: number; x: number; y: number }[] = [];
    let pointer: number | null = null;
    let origin = { x: 0, y: 0 };

    const onPointerDown = (event: PointerEvent) => {
      // Left button only, only on open water, and only when the last stone has
      // finished — two at once would be two counts and one readout.
      if (event.button !== 0 || pointer !== null) return;
      if (!isOpenWater(event.target) || stone.busy) return;

      pointer = event.pointerId;
      origin = { x: event.clientX, y: event.clientY };
      trail = [{ t: event.timeStamp, x: event.clientX, y: event.clientY }];
    };

    /** How fast the pointer is going right now, in pixels per second. */
    const flickSpeed = () => {
      if (trail.length < 2) return 0;

      const last = trail[trail.length - 1];
      const first = trail[0];
      const seconds = (last.t - first.t) / 1000;
      if (seconds <= 0) return 0;

      return Math.hypot(last.x - first.x, last.y - first.y) / seconds;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;

      trail.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
      while (trail.length > 2 && event.timeStamp - trail[0].t > FLICK_WINDOW) trail.shift();

      // Suppress the text selection only while the pointer is actually moving
      // fast enough to be a throw, and give it straight back when it is not.
      //
      // Dragging out of the margin and onto the text is how a paragraph gets
      // selected, and that is a slow, deliberate movement. Testing distance
      // instead of speed — which is the obvious version — breaks that
      // selection for everybody, in exchange for a gesture nobody made.
      document.documentElement.classList.toggle("stone-flick", flickSpeed() >= MIN_SPEED);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      pointer = null;

      // The gesture is over, so the selection comes back now — not when the
      // stone finally sinks two seconds later. Suppressing it for the length
      // of the flight would mean a throw quietly costing everyone the ability
      // to select text for as long as they can still see the stone.
      document.documentElement.classList.remove("stone-flick");

      const last = trail[trail.length - 1];
      const first = trail[0];
      const seconds = (last.t - first.t) / 1000;

      // A press with no travel, or one so slow the browser gave us two samples
      // at the same instant. Either way there is no throw in it.
      if (trail.length < 2 || seconds <= 0) return;

      const thrown = stone.throwFrom(
        last.x,
        last.y,
        (last.x - first.x) / seconds,
        (last.y - first.y) / seconds
      );

      if (!thrown) return;

      // Anchored where the hand started, not where the stone sank: the stone
      // may well have gone under the card, or off the window altogether.
      setReadout({ x: origin.x, y: origin.y, skips: 0, best: bestRef.current, id: Date.now() });
    };

    const onResize = () => stone.resize();

    // The theme picker writes the palette as inline custom properties on the
    // documentElement, so watching that one attribute is the whole subscription.
    const themeObserver = new MutationObserver(() => stone.setPalette(readPalette()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      themeObserver.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("stone-flick");
      stone.destroy();
    };
  }, [enabled, onSkip, onDone]);

  /**
   * The count clears itself. The timer restarts on every change, so it holds
   * while the stone is still skipping and only begins counting down once the
   * number has stopped moving.
   */
  useEffect(() => {
    if (!readout || readout.skips < 1) return;

    const timer = setTimeout(() => setReadout(null), READOUT_TIME);
    return () => clearTimeout(timer);
  }, [readout]);

  if (!enabled) return null;

  return (
    <>
      {/* Fixed, a sibling of the card, and behind it: the card is translucent,
          so a stone passing under it reads as something moving beneath frosted
          glass. Mounted after the water so it paints over it, and never a
          child of the card, which is a stacking context and would clip it to
          its own box. */}
      <div className={`stone-skip`} aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>

      {/* Only ever shown once a stone has actually skipped. */}
      {readout && readout.skips > 0 && (
        <p
          key={readout.id}
          className={`stone-skip-count`}
          style={{ left: readout.x, top: readout.y }}
          aria-hidden="true"
        >
          {readout.skips} {readout.skips === 1 ? "skip" : "skips"}
          {readout.best > readout.skips && <span> · best {readout.best}</span>}
          {readout.best === readout.skips && readout.skips > 1 && <span> · best</span>}
        </p>
      )}
    </>
  );
};

export default StoneToy;
