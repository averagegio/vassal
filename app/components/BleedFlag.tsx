"use client";

import { useEffect, useRef } from "react";

type BleedFlagProps = {
  className?: string;
};

/** Full-bleed cloth that billows in the wind via canvas wave displacement. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const cloth = document.createElement("canvas");
    const clothCtx = cloth.getContext("2d", { alpha: false });
    if (!clothCtx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let t = 0;

    const paintCloth = () => {
      const g = clothCtx.createLinearGradient(0, 0, width * 0.85, height);
      g.addColorStop(0, "#e11d2e");
      g.addColorStop(0.2, "#c81626");
      g.addColorStop(0.45, "#8f121e");
      g.addColorStop(0.7, "#4e0b14");
      g.addColorStop(1, "#160308");
      clothCtx.fillStyle = g;
      clothCtx.fillRect(0, 0, width, height);

      // Soft horizontal fold shading — warps into billows under X displacement
      for (let i = 0; i < 6; i++) {
        const y = ((i + 0.4) / 6) * height;
        const band = clothCtx.createLinearGradient(0, y - height * 0.1, 0, y + height * 0.1);
        band.addColorStop(0, "rgba(0,0,0,0)");
        band.addColorStop(0.42, "rgba(0,0,0,0.1)");
        band.addColorStop(0.5, "rgba(255,220,200,0.08)");
        band.addColorStop(0.58, "rgba(0,0,0,0.12)");
        band.addColorStop(1, "rgba(0,0,0,0)");
        clothCtx.fillStyle = band;
        clothCtx.fillRect(0, y - height * 0.1, width, height * 0.2);
      }

      // Soft diagonal light for depth
      const sheen = clothCtx.createLinearGradient(0, 0, width, height * 0.7);
      sheen.addColorStop(0, "rgba(255,230,210,0.12)");
      sheen.addColorStop(0.45, "rgba(255,230,210,0)");
      sheen.addColorStop(1, "rgba(0,0,0,0.22)");
      clothCtx.fillStyle = sheen;
      clothCtx.fillRect(0, 0, width, height);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const nextH = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (nextW === width && nextH === height) return;
      width = nextW;
      height = nextH;
      canvas.width = width;
      canvas.height = height;
      cloth.width = width;
      cloth.height = height;
      paintCloth();
      if (reduceMotion) {
        ctx.drawImage(cloth, 0, 0);
      }
    };

    const draw = () => {
      t += 0.022;
      ctx.fillStyle = "#120306";
      ctx.fillRect(0, 0, width, height);

      // Horizontal scanlines with traveling sine offset = visible cloth billow
      const step = Math.max(1, Math.floor(dpr));
      const amp = Math.max(28, width * 0.07);

      for (let y = 0; y < height; y += step) {
        const ny = y / height;
        const wave =
          Math.sin(ny * 5.4 + t * 2.2) * amp +
          Math.sin(ny * 11.5 + t * 3.3) * (amp * 0.42) +
          Math.sin(ny * 2.6 - t * 1.4) * (amp * 0.6);
        ctx.drawImage(cloth, 0, y, width, step, wave, y, width, step + 1);
      }

      raf = window.requestAnimationFrame(draw);
    };

    // Layout may not be ready on first paint
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    if (!reduceMotion) {
      // Ensure we have real dimensions before looping
      requestAnimationFrame(() => {
        resize();
        raf = window.requestAnimationFrame(draw);
      });
    }

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="flag-cloth-canvas absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.04)_0%,rgba(7,4,5,0.36)_68%,rgba(7,4,5,0.84)_100%)]" />
    </div>
  );
}
