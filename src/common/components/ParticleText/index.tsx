"use client";

import { useEffect, useRef, useState } from "react";
import Effect from "./_components/Effect";

interface Props {
  texts: string[];
  /** Seconds each phrase stays on screen. */
  changeTime?: number;
  /**
   * Pixels between sampled particles. 1 samples every pixel of the rendered
   * text, which on a wide screen is tens of thousands of particles animating
   * every frame — fine on a desktop, not on a phone.
   */
  gap?: number;
  className?: string;
}

const ParticleText = ({ texts, changeTime = 5, gap = 2, className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effect = useRef<Effect | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const animation = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Decided on the client: the server has no idea whether this visitor asked
  // for less motion or is on a phone that would rather not run a particle sim.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!reduced && !coarse);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    ctx.current = context;

    const build = () => {
      effect.current?.destroy();
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      effect.current = new Effect({
        canvas,
        context,
        width: canvas.width,
        height: canvas.height,
        gap,
      });
    };

    build();

    let lastIntervalTimestamp = 0;
    let counter = 0;

    const render = (now: number) => {
      animation.current = requestAnimationFrame(render);
      if (counter >= texts.length) counter = 0;

      context.clearRect(0, 0, canvas.width, canvas.height);
      effect.current?.render();

      if (!lastIntervalTimestamp || now - lastIntervalTimestamp >= changeTime * 1000) {
        lastIntervalTimestamp = now;
        if (texts[counter]) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          effect.current?.wrapText(texts[counter]);
        }
        counter++;
      }
    };

    // Rebuilding on every resize event would re-sample the text hundreds of
    // times during a window drag; one rebuild after the drag settles is enough.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };

    window.addEventListener("resize", onResize);
    animation.current = requestAnimationFrame(render);

    return () => {
      if (animation.current) cancelAnimationFrame(animation.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      effect.current?.destroy();
      effect.current = null;
    };
  }, [enabled, texts, changeTime, gap]);

  if (!enabled) return null;

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className={`w-full h-full block`} />
    </div>
  );
};

export default ParticleText;
