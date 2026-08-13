"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hoop, { type HoopPalette } from "./_components/Hoop";

/**
 * A basketball hoop in the corner of the footer.
 *
 * `Hoop` is the simulation. This component is the policy: whether it runs, what
 * colour it is, and where the best streak lives. The same split as
 * `WaterBackground`/`WaterSurface`, for the same reason.
 *
 * What keeps it from being annoying, which is the only requirement that matters
 * for a thing nobody asked to see:
 *
 *   • It is silent until touched. No idle animation, no bouncing to attract
 *     attention, no frames drawn at all while the ball is parked.
 *   • It cannot steal a click. A pointerdown is only captured if it lands on
 *     the ball; every other press falls through to the footer links.
 *   • It is not there at all for anyone who asked for less motion, and not
 *     there on touch, where the only way to give it a drag gesture would be to
 *     take one away from the page scroll.
 */

/** Where the best streak is remembered. */
const STORAGE_KEY = "hoop-best";

const FALLBACK: HoopPalette = { ink: "rgb(255, 255, 255)", ball: "rgb(234, 192, 165)" };

/**
 * The theme variables hold bare `rgba(234, 192, 165)` triples, which the browser
 * normalises to `rgb(...)`. Either form is handed straight to the canvas, which
 * parses both.
 *
 * `--bg-300` is the ball because it is the lightest tone in every theme that is
 * still a theme colour — it reads as a ball against the page rather than as a
 * white dot, and it moves when the visitor changes the palette.
 */
function readPalette(): HoopPalette {
  const style = getComputedStyle(document.documentElement);
  const ink = style.getPropertyValue("--text-100").trim();
  const ball = style.getPropertyValue("--bg-300").trim();

  return { ink: ink || FALLBACK.ink, ball: ball || FALLBACK.ball };
}

const HoopToy = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  /**
   * `best` is read here rather than in the game so that a storage that throws —
   * Safari in private mode, a locked-down profile — costs the toy its memory
   * and nothing else.
   */
  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(stored) && stored > 0) setBest(stored);
    } catch {
      // No memory between visits. The toy still works.
    }
  }, []);

  // Decided on the client: the server knows neither whether this visitor asked
  // for less motion nor what kind of pointer they have.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const decide = () => setEnabled(!motion.matches && !coarse.matches);

    decide();
    motion.addEventListener("change", decide);
    coarse.addEventListener("change", decide);

    return () => {
      motion.removeEventListener("change", decide);
      coarse.removeEventListener("change", decide);
    };
  }, []);

  const onScore = useCallback((next: number) => {
    setStreak(next);
    setBest((previous) => {
      if (next <= previous) return previous;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Unwritable storage. The streak still shows for this visit.
      }
      return next;
    });
  }, []);

  const onMiss = useCallback(() => setStreak(0), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    let hoop: Hoop;
    try {
      hoop = new Hoop(canvas, readPalette(), { onScore, onMiss });
    } catch {
      // No 2D context. Nothing to show and nothing to fall back to.
      setEnabled(false);
      return;
    }

    /** Pointer position in the canvas's own coordinates. */
    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      // Left button only, and only when the press lands on the ball. `grab`
      // reports whether it took the gesture; if it did not, the event is left
      // completely alone so the footer underneath behaves normally.
      if (event.button !== 0) return;

      const { x, y } = toLocal(event);
      if (!hoop.grab(event.pointerId, x, y)) return;

      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      hoop.moveDrag(event.pointerId, x, y);

      const over = hoop.isOverBall(x, y);
      hoop.setHovering(over);
      // Written directly rather than through state: this fires on every pointer
      // move across the footer, and a React render per pixel is not worth a
      // cursor change.
      if (canvas.style.cursor !== "grabbing") canvas.style.cursor = over ? "grab" : "default";
    };

    const onPointerUp = (event: PointerEvent) => {
      hoop.release(event.pointerId);
      canvas.style.cursor = "default";
    };

    const onPointerCancel = (event: PointerEvent) => {
      hoop.cancelDrag(event.pointerId);
      canvas.style.cursor = "default";
    };

    const onPointerLeave = () => hoop.setHovering(false);

    // A tab that goes away mid-shot should not come back to a ball that has
    // been "falling" the whole time; the loop already caps a single frame, and
    // parking it here means it returns ready to throw.
    const onVisibility = () => {
      if (document.hidden) hoop.sleep();
    };

    // The footer reflows with the page, and the arena's layout is derived from
    // the canvas box, so the toy has to be told.
    const observer = new ResizeObserver(() => hoop.resize());
    observer.observe(canvas);

    // The theme picker writes the palette as inline custom properties on the
    // documentElement, so watching that one attribute is the whole subscription.
    const themeObserver = new MutationObserver(() => hoop.setPalette(readPalette()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    canvas.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      hoop.destroy();
    };
  }, [enabled, onScore, onMiss]);

  if (!enabled) return null;

  /* aria-hidden, and not focusable: there is no keyboard path into a slingshot
     and no information here to miss. Announcing an unreachable canvas to a
     screen reader would be worse than leaving it out. */
  return (
    <div className={`hoop-toy`} aria-hidden="true">
      <canvas ref={canvasRef} className={`hoop-toy-canvas`} />

      {/* Only ever shown once something has gone in — an empty scoreboard on a
          toy nobody has played is just clutter in a footer. */}
      {best > 0 && (
        <p className={`hoop-toy-score`}>
          {streak > 1 && <span className={`hoop-toy-streak`}>{streak} in a row</span>}
          <span>best {best}</span>
        </p>
      )}
    </div>
  );
};

export default HoopToy;
