/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import Effect from "./_components/Effect";

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const changeTime: number = 5;
  const effect = useRef<any>(null!);
  const ctx = useRef<any>(null!);
  const animation = useRef<any>(null!);

  useEffect(() => {
    if (canvasRef.current) {
      const text: string[] = ["Milad Karandish", "FrontEnd"];

      // The canvas context
      ctx.current = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;

      // Effect
      effect.current = new Effect({
        canvas: canvasRef.current,
        context: ctx.current,
        width: canvasRef.current.width,
        height: canvasRef.current.height,
      });

      // Animation and change the text every {changeTime} seconds
      let lastIntervalTimestamp: number = 0;
      let counter: number = 0;
      const render = (now: number) => {
        animation.current = requestAnimationFrame(render);
        if (counter >= text.length) {
          counter = 0;
        }

        ctx.current?.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
        effect.current.render();

        if (!lastIntervalTimestamp || now - lastIntervalTimestamp >= changeTime * 1000) {
          lastIntervalTimestamp = now;
          if (text[counter]) {
            ctx.current?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            effect.current.wrapText(text[counter]);
          } else {
            // callback && callback();
          }

          counter++;
        }
      };

      const onResize = () => {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        effect.current = new Effect({
          canvas: canvasRef.current,
          context: ctx.current,
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        });
      };

      addEventListener("resize", onResize);

      if (canvasRef.current && effect) animation.current = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animation.current);
        removeEventListener("resize", onResize);
      };
    }
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none`}>
      <canvas ref={canvasRef} className={`w-full h-full block`}></canvas>
    </div>
  );
};

export default Particles;
