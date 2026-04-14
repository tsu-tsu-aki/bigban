"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

interface WarpStar {
  x: number;
  y: number;
  z: number;
  prevZ: number;
}

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  slow: 700,
  accel: 2100,
  burst: 1700,
};

const STAR_COUNT = 360;
const STAR_Z_MAX = 1000;

export function IntroEngineD({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const starsRef = useRef<WarpStar[]>([]);
  const ringRef = useRef<{ radius: number; alpha: number } | null>(null);

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

    starsRef.current = Array.from({ length: STAR_COUNT }, () => {
      const z = Math.random() * STAR_Z_MAX;
      return {
        x: (Math.random() - 0.5) * window.innerWidth * 2,
        y: (Math.random() - 0.5) * window.innerHeight * 2,
        z,
        prevZ: z,
      };
    });

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_SLOW = DURATION.slow;
    const T_ACCEL = T_SLOW + DURATION.accel;
    const T_BURST = T_ACCEL + DURATION.burst;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      // Fading trail for speed effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_ACCEL) {
        if (elapsed >= T_SLOW && phaseRef.current === "dark") setPhase("converge");

        const phaseProgress =
          elapsed < T_SLOW ? 0 : (elapsed - T_SLOW) / DURATION.accel;
        const speed = 2 + Math.pow(phaseProgress, 2) * 40;

        starsRef.current.forEach((s) => {
          s.prevZ = s.z;
          s.z -= speed;
          if (s.z <= 0) {
            s.x = (Math.random() - 0.5) * w * 2;
            s.y = (Math.random() - 0.5) * h * 2;
            s.z = STAR_Z_MAX;
            s.prevZ = STAR_Z_MAX;
          }

          const scale = 200 / s.z;
          const prevScale = 200 / s.prevZ;
          const sx = cx + s.x * scale;
          const sy = cy + s.y * scale;
          const psx = cx + s.x * prevScale;
          const psy = cy + s.y * prevScale;

          const lineLen = Math.hypot(sx - psx, sy - psy);
          const alpha = Math.min(1, (STAR_Z_MAX - s.z) / STAR_Z_MAX + 0.2);

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = Math.max(0.5, 2 - s.z / 500);
          ctx.beginPath();
          ctx.moveTo(psx, psy);
          ctx.lineTo(sx, sy);
          ctx.stroke();

          if (lineLen > 3 && phaseProgress > 0.5) {
            ctx.fillStyle = `rgba(246, 255, 84, ${alpha * 0.3})`;
            ctx.fillRect(sx - 1, sy - 1, 2, 2);
          }
        });

        // Convergence flash as we hit light speed
        if (phaseProgress > 0.85) {
          const f = (phaseProgress - 0.85) / 0.15;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
          grad.addColorStop(0, `rgba(255, 255, 255, ${f * 0.8})`);
          grad.addColorStop(0.5, `rgba(246, 255, 84, ${f * 0.4})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      } else if (elapsed < T_BURST) {
        if (phaseRef.current === "converge") {
          setPhase("explode");
          ringRef.current = { radius: 0, alpha: 1 };
        }

        const t = (elapsed - T_ACCEL) / DURATION.burst;

        // Massive flash
        const flashAlpha = Math.max(0, 1 - t * 2);
        if (flashAlpha > 0) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
          grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
          grad.addColorStop(0.3, `rgba(246, 255, 84, ${flashAlpha * 0.7})`);
          grad.addColorStop(0.6, `rgba(48, 110, 195, ${flashAlpha * 0.3})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }

        // Shockwave ring
        if (ringRef.current) {
          ringRef.current.radius += 18;
          ringRef.current.alpha = Math.max(0, 1 - t * 1.1);
          if (ringRef.current.alpha > 0) {
            ctx.globalAlpha = ringRef.current.alpha;
            ctx.strokeStyle = BRAND_YELLOW;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 25;
            ctx.shadowColor = BRAND_YELLOW;
            ctx.beginPath();
            ctx.arc(cx, cy, ringRef.current.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = BRAND_BLUE;
            ctx.lineWidth = 2;
            ctx.shadowColor = BRAND_BLUE;
            ctx.beginPath();
            ctx.arc(cx, cy, ringRef.current.radius * 1.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
        }

        // Stars slowing down (residual)
        starsRef.current.forEach((s) => {
          s.z -= 1;
          const scale = 200 / Math.max(1, s.z);
          const sx = cx + s.x * scale;
          const sy = cy + s.y * scale;
          ctx.fillStyle = `rgba(255, 255, 255, ${1 - t})`;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        });
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
