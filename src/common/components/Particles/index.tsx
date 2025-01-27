/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import Effect from "./_components/Effect";

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const text: string[] = ["Milad Karandish"];
  const changeTime: number = 2;
  const effect = useRef<any>(null!);
  const ctx = useRef<any>(null!);
  const animation = useRef<any>(null!);

  useEffect(() => {
    // The canvas context
    ctx.current = canvasRef.current.getContext("2d", {
      willReadFrequently: true,
    });
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    // Effect
    effect.current = new Effect(ctx.current, canvasRef.current.width, canvasRef.current.height);

    // Animation and change the text every {changeTime} seconds
    let lastIntervalTimestamp: number = 0;
    let counter: number = 0;
    const render = (now: number) => {
      // if (counter <= text.length) {
      animation.current = requestAnimationFrame(render);
      // }

      ctx.current?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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

    if (canvasRef.current && effect) animation.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animation.current);
    };
  }, [text]);

  return (
    <div className={`w-full h-full`}>
      <canvas ref={canvasRef} className={`w-full h-full block`}></canvas>
    </div>
  );
};

export default Particles;
