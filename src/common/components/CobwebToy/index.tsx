"use client";

import { useEffect, useRef, useState } from "react";
import { onRipple } from "@/common/components/WaterBackground/ripples";
import Cobweb, { type CobwebPalette } from "./_components/Cobweb";

/**
 * A cobweb strung across the bottom-left corner of the footer, with a spider
 * living on it.
 *
 * `Cobweb` is the simulation. This component is the policy: whether it runs,
 * what colour it is, and — the part that matters here — when it is allowed to
 * be awake. Same split as `HoopToy`/`Hoop` and `WaterBackground`/`WaterSurface`.
 *
 * The hoop at the other end of the footer is silent until touched. This one
 * cannot be: a spider that only walks while you are dragging it is not a
 * spider. So the restraint is placed somewhere else — it runs only while it is
 * actually on screen and the tab is in front. The footer is the last thing on
 * every page, so for most of a visit there is no loop at all, and a visitor who
 * never scrolls to the bottom pays for one canvas and a few listeners.
 *
 * The rest of the guards are the ones the hoop already follows:
 *
 *   • It cannot steal a click. A pointerdown is only captured if it lands
 *     within reach of a strand; every other press falls through to the footer.
 *   • It is not there at all for anyone who asked for less motion, and not
 *     there on touch, where it has no cursor to react to and no gesture to
 *     take that the page scroll does not want more.
 *
 * It also feels the rest of the page, through the same `ripples.ts` broadcast
 * the water listens to. Subscribed here rather than in the simulation for the
 * same reason `WaterBackground` subscribes in its component: what the toy
 * listens to is policy, and the maths should not have opinions about it.
 */

const FALLBACK: CobwebPalette = { ink: "rgb(255, 255, 255)", body: "rgb(234, 192, 165)" };

/**
 * `--text-100` is the silk, because the web should read as line work belonging
 * to the page rather than as a picture placed on it. `--bg-300` is the spider,
 * which is also the basketball: the two toys in this footer are the same colour
 * on purpose, and both follow the theme picker.
 */
function readPalette(): CobwebPalette {
  const style = getComputedStyle(document.documentElement);
  const ink = style.getPropertyValue("--text-100").trim();
  const body = style.getPropertyValue("--bg-300").trim();

  return { ink: ink || FALLBACK.ink, body: body || FALLBACK.body };
}

const CobwebToy = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    let web: Cobweb;
    try {
      web = new Cobweb(canvas, readPalette());
    } catch {
      // No 2D context. Nothing to show and nothing to fall back to.
      setEnabled(false);
      return;
    }

    /**
     * Awake only when both are true. Kept as two flags rather than one because
     * they change independently — scrolling away and switching tabs are not
     * the same event — and waking on either alone would leave the loop running
     * in a background tab.
     */
    let onScreen = false;
    let visible = !document.hidden;

    const settle = () => {
      if (onScreen && visible) web.wake();
      else web.sleep();
    };

    const view = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        settle();
      },
      // A sliver is enough: the toy is 132px tall and the spider is worth
      // seeing from the moment any of it is on screen.
      { threshold: 0 }
    );
    view.observe(canvas);

    const onVisibility = () => {
      visible = !document.hidden;
      settle();
    };

    // Anything heavy enough landing in the water rocks the card this web is
    // strung across, and the web shivers. Today the only thing that does is
    // the basketball at the other end of the footer going over the edge of
    // its court — but nothing here knows that, and nothing has to.
    const unsubscribe = onRipple(({ x, y, strength }) => web.shake(x, y, strength));

    /** Pointer position in the canvas's own coordinates. */
    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      // Left button only, and only when the press lands near a strand. `grab`
      // reports whether it took the gesture; if it did not, the event is left
      // completely alone so the footer underneath behaves normally.
      if (event.button !== 0) return;

      const { x, y } = toLocal(event);
      if (!web.grab(event.pointerId, x, y)) return;

      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      web.moveCursor(x, y);

      // Written directly rather than through state: this fires on every pointer
      // move across the footer, and a React render per pixel is not worth a
      // cursor change.
      if (canvas.style.cursor !== "grabbing") {
        canvas.style.cursor = web.isOverWeb(x, y) ? "grab" : "default";
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      web.release(event.pointerId);
      canvas.style.cursor = "default";
    };

    const onPointerLeave = () => web.clearCursor();

    // The footer reflows with the page, and the web's geometry is derived from
    // the canvas box, so the toy has to be told.
    const observer = new ResizeObserver(() => web.resize());
    observer.observe(canvas);

    // The theme picker writes the palette as inline custom properties on the
    // documentElement, so watching that one attribute is the whole subscription.
    const themeObserver = new MutationObserver(() => web.setPalette(readPalette()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsubscribe();
      view.disconnect();
      observer.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      web.destroy();
    };
  }, [enabled]);

  if (!enabled) return null;

  /* aria-hidden, and not focusable: there is no keyboard path into pulling a
     thread and no information here to miss. Announcing an unreachable canvas
     to a screen reader would be worse than leaving it out. */
  return (
    <div className={`cobweb-toy`} aria-hidden="true">
      <canvas ref={canvasRef} className={`cobweb-toy-canvas`} />
    </div>
  );
};

export default CobwebToy;
