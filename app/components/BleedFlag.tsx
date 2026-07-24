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
      const g = clothCtx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#e11d2e");
      g.addColorStop(0.22, "#c81626");
      g.addColorStop(0.48, "#8f121e");
      g.addColorStop(0.72, "#4e0b14");
      g.addColorStop(1, "#160308");
      clothCtx.fillStyle = g;
      clothCtx.fillRect(0, 0, width, height);

      // Soft fold shading baked into the cloth source
      for (let i = 0; i < 7; i++) {
        const x = ((i + 0.5) / 7) * width;
        const band = clothCtx.createLinearGradient(x - width * 0.08, 0, x + width * 0.08, 0);
        band.addColorStop(0, "rgba(0,0,0,0)");
        band.addColorStop(0.45, "rgba(0,0,0,0.18)");
        band.addColorStop(0.5, "rgba(255,220,200,0.1)");
        band.addColorStop(0.55, "rgba(0,0,0,0.2)");
        band.addColorStop(1, "rgba(0,0,0,0)");
        clothCtx.fillStyle = band;
        clothCtx.fillRect(x - width * 0.08, 0, width * 0.16, height);
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
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
      t += 0.018;
      ctx.fillStyle = "#120306";
      ctx.fillRect(0, 0, width, height);

      // Vertical slices with traveling sine waves — classic flag billow
      const slice = Math.max(2, Math.floor(dpr * 3));
      for (let x = 0; x < width; x += slice) {
        const nx = x / width;
        const wave =
          Math.sin(nx * 5.2 + t * 2.1) * (14 * dpr) +
          Math.sin(nx * 9.4 + t * 3.4) * (7 * dpr) +
          Math.sin(nx * 2.1 - t * 1.3) * (10 * dpr);
        const stretch =
          1 +
          Math.sin(nx * 4.6 + t * 2.4) * 0.028 +
          Math.sin(nx * 8.1 - t * 1.7) * 0.016;
        const yOffset = wave * (0.35 + nx * 0.9);
        const h = height * stretch;

        ctx.drawImage(
          cloth,
          x,
          0,
          slice,
          height,
          x,
          yOffset - (h - height) * 0.35,
          slice + 1,
          h,
        );
      }

      // Moving highlight sheen
      const sheenX = ((t * 0.12) % 1.6) - 0.3;
      const sheen = ctx.createLinearGradient(
        width * sheenX,
        0,
        width * (sheenX + 0.35),
        height,
      );
      sheen.addColorStop(0, "rgba(255,230,210,0)");
      sheen.addColorStop(0.45, "rgba(255,230,210,0.14)");
      sheen.addColorStop(0.55, "rgba(255,240,220,0.2)");
      sheen.addColorStop(0.65, "rgba(255,230,210,0.08)");
      sheen.addColorStop(1, "rgba(255,230,210,0)");
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    if (!reduceMotion) {
      raf = window.requestAnimationFrame(draw);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="flag-cloth-canvas absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.04)_0%,rgba(7,4,5,0.36)_68%,rgba(7,4,5,0.84)_100%)]" />
    </div>
  );
}
