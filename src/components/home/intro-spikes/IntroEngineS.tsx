"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  still: 700,
  crease: 800,
  tear: 1400,
  open: 1400,
};

interface TearPoint {
  t: number;
  jitter: number;
}

export function IntroEngineS({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const tearPointsRef = useRef<TearPoint[]>([]);

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

    // Precompute jagged tear shape points (vertical path down the middle)
    tearPointsRef.current = Array.from({ length: 60 }, (_, i) => ({
      t: i / 59,
      jitter: (Math.random() - 0.5) * 40 + Math.sin(i * 0.8) * 20,
    }));

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_STILL = DURATION.still;
    const T_CREASE = T_STILL + DURATION.crease;
    const T_TEAR = T_CREASE + DURATION.tear;
    const T_OPEN = T_TEAR + DURATION.open;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // Paper texture subtle noise
      ctx.save();
      ctx.globalAlpha = 0.02;
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgb(${50 + Math.random() * 40}, ${50 + Math.random() * 40}, ${55 + Math.random() * 40})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
      ctx.restore();

      if (elapsed < T_STILL) {
        // Perfect black silence
        return (animFrameRef.current = requestAnimationFrame(render));
      } else if (elapsed < T_CREASE) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Thin light line appears vertically (the crease before tear)
        const t = (elapsed - T_STILL) / DURATION.crease;
        const lineHeight = t * H;

        const grad = ctx.createLinearGradient(cx - 1, cy - lineHeight / 2, cx + 1, cy - lineHeight / 2);
        grad.addColorStop(0, "rgba(246, 255, 84, 0)");
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${t})`);
        grad.addColorStop(1, "rgba(246, 255, 84, 0)");

        ctx.shadowBlur = 15;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.strokeStyle = `rgba(246, 255, 84, ${t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - lineHeight / 2);
        ctx.lineTo(cx, cy + lineHeight / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (elapsed < T_TEAR) {
        const t = (elapsed - T_CREASE) / DURATION.tear;

        // Tear opens from center outward (like tearing paper)
        const tearWidth = t * Math.min(W * 0.4, 300);

        // Draw light bleeding out from tear
        ctx.save();
        ctx.beginPath();
        // Jagged tear edge on left
        ctx.moveTo(cx - tearWidth * 0.1, 0);
        tearPointsRef.current.forEach((p) => {
          const y = p.t * H;
          const x = cx - tearWidth + p.jitter * t;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(cx - tearWidth * 0.1, H);
        // Jagged tear edge on right
        ctx.lineTo(cx + tearWidth * 0.1, H);
        tearPointsRef.current.slice().reverse().forEach((p) => {
          const y = p.t * H;
          const x = cx + tearWidth - p.jitter * t;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(cx + tearWidth * 0.1, 0);
        ctx.closePath();

        // Light gradient inside the tear
        const lightGrad = ctx.createLinearGradient(cx - tearWidth, 0, cx + tearWidth, 0);
        lightGrad.addColorStop(0, "rgba(48, 110, 195, 0.3)");
        lightGrad.addColorStop(0.5, "rgba(246, 255, 84, 1)");
        lightGrad.addColorStop(1, "rgba(48, 110, 195, 0.3)");
        ctx.fillStyle = lightGrad;
        ctx.fill();

        // Bright core line
        ctx.globalCompositeOperation = "screen";
        ctx.shadowBlur = 30;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, H);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Light rays streaming out from the tear
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = t * 0.5;
        const rayGrad = ctx.createLinearGradient(cx, 0, cx, 0);
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI + Math.PI * 1.5; // horizontal spread
          const rayLen = tearWidth * 3 * t;
          const rx = cx + Math.cos(angle) * rayLen;
          const ry = cy + Math.sin(angle) * rayLen;
          const g = ctx.createLinearGradient(cx, cy, rx, ry);
          g.addColorStop(0, "rgba(246, 255, 84, 0.8)");
          g.addColorStop(1, "rgba(246, 255, 84, 0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1 + Math.random();
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }
        ctx.restore();

        // Particles escaping
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * tearWidth * 2;
          const x = cx + Math.cos(angle) * r * 0.3;
          const y = cy + Math.sin(angle) * r;
          ctx.globalAlpha = (1 - r / (tearWidth * 2)) * t;
          ctx.fillStyle = BRAND_YELLOW;
          ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;
      } else if (elapsed < T_OPEN) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_TEAR) / DURATION.open;

        // Light floods the whole screen, the "paper" dissolves
        const floodAlpha = Math.min(1, t * 1.2);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
        grad.addColorStop(0, `rgba(255, 255, 255, ${floodAlpha * 0.9})`);
        grad.addColorStop(0.3, `rgba(246, 255, 84, ${floodAlpha * 0.7})`);
        grad.addColorStop(0.7, `rgba(48, 110, 195, ${floodAlpha * 0.4})`);
        grad.addColorStop(1, `rgba(0, 0, 0, ${Math.max(0, 1 - floodAlpha * 2)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Sparkles
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * Math.min(W, H) * 0.5;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.globalAlpha = (1 - t) * 0.8;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, 1.5, 1.5);
        }
        ctx.globalAlpha = 1;

        // Fade to black for content handoff
        if (t > 0.7) {
          const fadeT = (t - 0.7) / 0.3;
          ctx.fillStyle = `rgba(0, 0, 0, ${fadeT * 0.5})`;
          ctx.fillRect(0, 0, W, H);
        }
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
