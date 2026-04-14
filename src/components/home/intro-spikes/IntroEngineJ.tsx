"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  calm: 700,
  drops: 2200,
  spread: 1500,
  settle: 900,
};

interface InkBlob {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  color: string;
  seed: number;
  alpha: number;
  born: number;
}

export function IntroEngineJ({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const blobsRef = useRef<InkBlob[]>([]);
  const dropsSpawnedRef = useRef(false);

  const [isReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (isReducedMotion) onPhaseChange("content");
  }, [isReducedMotion, onPhaseChange]);

  const setPhase = useCallback(
    (phase: AnimationPhase) => {
      if (phaseRef.current !== phase) {
        phaseRef.current = phase;
        onPhaseChange(phase);
      }
    },
    [onPhaseChange]
  );

  useEffect(() => {
    if (isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_CALM = DURATION.calm;
    const T_DROPS = T_CALM + DURATION.drops;
    const T_SPREAD = T_DROPS + DURATION.spread;
    const T_SETTLE = T_SPREAD + DURATION.settle;

    const drawInkBlob = (blob: InkBlob, now: number) => {
      const age = now - blob.born;
      const t = Math.min(1, age / 1200);
      const currentRadius = blob.targetRadius * (1 - Math.pow(1 - t, 3));
      blob.radius = currentRadius;

      // Organic shape via multiple overlapping circles with noise
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + blob.seed;
        const offset = currentRadius * 0.3 * Math.sin(now * 0.001 + blob.seed + i);
        const r = currentRadius * (0.5 + Math.sin(blob.seed + i) * 0.15);
        const x = blob.x + Math.cos(angle) * offset;
        const y = blob.y + Math.sin(angle) * offset;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `${blob.color}${Math.floor(blob.alpha * 200).toString(16).padStart(2, "0")}`);
        grad.addColorStop(0.6, `${blob.color}${Math.floor(blob.alpha * 80).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawRipple = (cx: number, cy: number, radius: number, alpha: number, color: string) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      // Soft fog overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_CALM) {
        // calm water with faint gradient
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
        grad.addColorStop(0, "rgba(48, 110, 195, 0.06)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (elapsed < T_DROPS) {
        if (phaseRef.current === "dark") setPhase("converge");
        if (!dropsSpawnedRef.current) {
          dropsSpawnedRef.current = true;
          // Spawn drops at staggered times
          const dropCount = 6;
          for (let i = 0; i < dropCount; i++) {
            const angle = (i / dropCount) * Math.PI * 2;
            const dist = Math.min(w, h) * (0.12 + Math.random() * 0.12);
            const color = i % 3 === 0 ? BRAND_YELLOW : i % 3 === 1 ? BRAND_BLUE : "#ffffff";
            blobsRef.current.push({
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist,
              radius: 0,
              targetRadius: Math.min(w, h) * (0.15 + Math.random() * 0.1),
              color,
              seed: Math.random() * Math.PI * 2,
              alpha: 0.8,
              born: startTimeRef.current + T_CALM + i * 300,
            });
          }
        }

        // Draw blobs that have been born
        blobsRef.current.forEach((blob) => {
          if (now >= blob.born) {
            drawInkBlob(blob, now);
            // Ripple ring from each blob
            const age = now - blob.born;
            const rippleT = Math.min(1, age / 1500);
            const rippleR = rippleT * blob.targetRadius * 2;
            drawRipple(blob.x, blob.y, rippleR, (1 - rippleT) * 0.4, blob.color);
          }
        });
      } else if (elapsed < T_SPREAD) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_DROPS) / DURATION.spread;

        // Blobs merge toward center
        blobsRef.current.forEach((blob) => {
          blob.x += (cx - blob.x) * 0.02;
          blob.y += (cy - blob.y) * 0.02;
          blob.targetRadius *= 0.99;
          drawInkBlob(blob, now);
        });

        // Central bloom
        const bloomR = Math.min(w, h) * 0.3 * (1 + t * 0.5);
        const bloomAlpha = Math.max(0, 1 - t * 0.6);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${bloomAlpha * 0.8})`);
        grad.addColorStop(0.4, `rgba(246, 255, 84, ${bloomAlpha * 0.5})`);
        grad.addColorStop(0.8, `rgba(48, 110, 195, ${bloomAlpha * 0.3})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      } else if (elapsed < T_SETTLE) {
        const t = (elapsed - T_SPREAD) / DURATION.settle;

        // Fade blobs
        blobsRef.current.forEach((blob) => {
          blob.alpha = Math.max(0, blob.alpha - 0.015);
          drawInkBlob(blob, now);
        });

        // Soft bokeh sparkle drift
        for (let i = 0; i < 25; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * Math.min(w, h) * 0.4;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.globalAlpha = (1 - t) * Math.random() * 0.4;
          ctx.fillStyle = BRAND_YELLOW;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        if (phaseRef.current === "explode") setPhase("content");
        return;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isReducedMotion, setPhase]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
