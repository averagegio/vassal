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

      // Horizontal ripple bands — these warp visibly under X displacement
      for (let i = 0; i < 10; i++) {
        const y = ((i + 0.35) / 10) * height;
        const band = clothCtx.createLinearGradient(0, y - height * 0.06, 0, y + height * 0.06);
        band.addColorStop(0, "rgba(0,0,0,0)");
        band.addColorStop(0.4, "rgba(0,0,0,0.16)");
        band.addColorStop(0.5, "rgba(255,220,200,0.12)");
        band.addColorStop(0.6, "rgba(0,0,0,0.2)");
        band.addColorStop(1, "rgba(0,0,0,0)");
        clothCtx.fillStyle = band;
        clothCtx.fillRect(0, y - height * 0.06, width, height * 0.12);
      }

      // Soft diagonal light for depth
      const sheen = clothCtx.createLinearGradient(0, 0, width, height * 0.7);
      sheen.addColorStop(0, "rgba(255,230,210,0.1)");
      sheen.addColorStop(0.45, "rgba(255,230,210,0)");
      sheen.addColorStop(1, "rgba(0,0,0,0.18)");
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
      const amp = Math.max(18, width * 0.045);

      for (let y = 0; y < height; y += step) {
        const ny = y / height;
        const wave =
          Math.sin(ny * 6.5 + t * 2.4) * amp +
          Math.sin(ny * 13.2 + t * 3.6) * (amp * 0.38) +
          Math.sin(ny * 3.1 - t * 1.5) * (amp * 0.55);
        // Stronger motion toward the free (right) edge
        const xOffset = wave;

        ctx.drawImage(
          cloth,
          0,
          y,
          width,
          step,
          xOffset,
          y,
          width,
          step + 1,
        );
      }

      // Secondary vertical billow on the right half for depth
      const slice = Math.max(2, Math.floor(3 * dpr));
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = "soft-light";
      for (let x = Math.floor(width * 0.35); x < width; x += slice) {
        const nx = x / width;
        const yWave =
          Math.sin(nx * 7.2 + t * 2.8) * (12 * dpr) +
          Math.sin(nx * 4.1 - t * 1.9) * (8 * dpr);
        ctx.drawImage(cloth, x, 0, slice, height, x, yWave, slice + 1, height);
      }
      ctx.restore();

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
