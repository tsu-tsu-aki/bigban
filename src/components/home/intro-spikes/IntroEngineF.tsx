"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_GOLD = "#E8D67C";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  dark: 800,
  bloom: 2600,
  settle: 1400,
};

const PETAL_COUNT = 18;

export function IntroEngineF({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);

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

    const T_DARK = DURATION.dark;
    const T_BLOOM = T_DARK + DURATION.bloom;
    const T_SETTLE = T_BLOOM + DURATION.settle;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.max(w, h) * 0.7;

      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_DARK) {
        // darkness with a central point pulsing
        const t = elapsed / T_DARK;
        const r = 3 + Math.sin(t * Math.PI * 4) * 2;
        ctx.globalAlpha = t;
        ctx.shadowBlur = 24;
        ctx.shadowColor = BRAND_GOLD;
        ctx.fillStyle = BRAND_GOLD;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (elapsed < T_BLOOM) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_DARK) / DURATION.bloom;
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic

        // Flower-like radial rays (petals)
        for (let i = 0; i < PETAL_COUNT; i++) {
          const angle = (i / PETAL_COUNT) * Math.PI * 2;
          const petalLen = eased * maxRadius;
          const width = 18 + Math.sin(t * Math.PI * 2 + i) * 6;
          const alpha = Math.max(0, 1 - t * 0.7);

          const gradient = ctx.createLinearGradient(
            cx,
            cy,
            cx + Math.cos(angle) * petalLen,
            cy + Math.sin(angle) * petalLen
          );
          gradient.addColorStop(0, `${BRAND_YELLOW}${Math.floor(alpha * 230).toString(16).padStart(2, "0")}`);
          gradient.addColorStop(0.4, `${BRAND_GOLD}${Math.floor(alpha * 180).toString(16).padStart(2, "0")}`);
          gradient.addColorStop(1, "rgba(48, 110, 195, 0)");

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(0, -width / 2);
          ctx.quadraticCurveTo(petalLen * 0.5, -width / 4, petalLen, 0);
          ctx.quadraticCurveTo(petalLen * 0.5, width / 4, 0, width / 2);
          ctx.fill();
          ctx.restore();
        }

        // Central bright core
        const coreR = 20 + eased * 90;
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${1 - t * 0.4})`);
        coreGrad.addColorStop(0.5, `rgba(246, 255, 84, ${1 - t * 0.5})`);
        coreGrad.addColorStop(1, "rgba(232, 214, 124, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();

        // Rotating secondary ring
        const ringR = maxRadius * eased * 0.6;
        ctx.globalAlpha = Math.max(0, 0.5 - t * 0.5);
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_BLUE;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_SETTLE) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_BLOOM) / DURATION.settle;

        // Soft residual glow fading to center
        const glowR = maxRadius * (1 - t * 0.6);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${Math.max(0, 0.5 - t) * 0.7})`);
        grad.addColorStop(0.3, `rgba(246, 255, 84, ${Math.max(0, 0.5 - t)})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Soft sparkles fading
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * maxRadius;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.globalAlpha = (1 - t) * Math.random() * 0.6;
          ctx.fillStyle = BRAND_GOLD;
          ctx.fillRect(x, y, 1.2, 1.2);
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
