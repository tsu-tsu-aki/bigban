"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  silence: 900,
  wipe1: 700,
  wipe2: 900,
  settle: 1400,
};

export function IntroEngineP({ onPhaseChange }: IntroEngineProps) {
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

    const T_SILENCE = DURATION.silence;
    const T_WIPE1 = T_SILENCE + DURATION.wipe1;
    const T_WIPE2 = T_WIPE1 + DURATION.wipe2;
    const T_SETTLE = T_WIPE2 + DURATION.settle;

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_SILENCE) {
        // Pure black silence with subtle vignette to build anticipation
        const t = elapsed / T_SILENCE;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
        grad.addColorStop(0, "rgba(20, 20, 30, 0.3)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = t;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      } else if (elapsed < T_WIPE1) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = easeInOut((elapsed - T_SILENCE) / DURATION.wipe1);

        // Vertical light bar sweeping from left to right
        const barX = t * w;
        const barWidth = 6;

        // Trailing glow
        const trailGrad = ctx.createLinearGradient(0, 0, barX, 0);
        trailGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        trailGrad.addColorStop(0.9, "rgba(48, 110, 195, 0.15)");
        trailGrad.addColorStop(1, "rgba(246, 255, 84, 0.3)");
        ctx.fillStyle = trailGrad;
        ctx.fillRect(0, 0, barX, h);

        // The bar itself — intense light
        const barGrad = ctx.createLinearGradient(barX - 30, 0, barX + 30, 0);
        barGrad.addColorStop(0, "rgba(246, 255, 84, 0)");
        barGrad.addColorStop(0.4, "rgba(246, 255, 84, 0.9)");
        barGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
        barGrad.addColorStop(0.6, "rgba(246, 255, 84, 0.9)");
        barGrad.addColorStop(1, "rgba(246, 255, 84, 0)");
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX - 30, 0, 60, h);

        // Sharp core line
        ctx.shadowBlur = 25;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(barX - barWidth / 2, 0, barWidth, h);
        ctx.shadowBlur = 0;
      } else if (elapsed < T_WIPE2) {
        const t = easeInOut((elapsed - T_WIPE1) / DURATION.wipe2);

        // Horizontal bar sweeping from right to left (second wipe, perpendicular)
        const barY = (1 - t) * h;
        const barHeight = 6;

        // Remaining trail from wipe1
        const w1Grad = ctx.createLinearGradient(0, 0, w, 0);
        w1Grad.addColorStop(0, "rgba(48, 110, 195, 0.05)");
        w1Grad.addColorStop(1, "rgba(246, 255, 84, 0.05)");
        ctx.fillStyle = w1Grad;
        ctx.fillRect(0, 0, w, h);

        // Trailing glow
        const trailGrad = ctx.createLinearGradient(0, h, 0, barY);
        trailGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        trailGrad.addColorStop(0.9, "rgba(48, 110, 195, 0.12)");
        trailGrad.addColorStop(1, "rgba(246, 255, 84, 0.2)");
        ctx.fillStyle = trailGrad;
        ctx.fillRect(0, barY, w, h - barY);

        // The bar itself
        const barGrad = ctx.createLinearGradient(0, barY - 30, 0, barY + 30);
        barGrad.addColorStop(0, "rgba(48, 110, 195, 0)");
        barGrad.addColorStop(0.4, "rgba(48, 110, 195, 0.9)");
        barGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
        barGrad.addColorStop(0.6, "rgba(48, 110, 195, 0.9)");
        barGrad.addColorStop(1, "rgba(48, 110, 195, 0)");
        ctx.fillStyle = barGrad;
        ctx.fillRect(0, barY - 30, w, 60);

        ctx.shadowBlur = 25;
        ctx.shadowColor = BRAND_BLUE;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, barY - barHeight / 2, w, barHeight);
        ctx.shadowBlur = 0;

        // Anticipation glow at center
        const centerGlow = Math.max(0, t * 0.6 - 0.3);
        if (centerGlow > 0) {
          const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
          cg.addColorStop(0, `rgba(255, 255, 255, ${centerGlow})`);
          cg.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = cg;
          ctx.fillRect(0, 0, w, h);
        }
      } else if (elapsed < T_SETTLE) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_WIPE2) / DURATION.settle;

        // Soft residual glow at crossroads
        const crossAlpha = Math.max(0, 1 - t * 1.2);

        // Horizontal remnant line
        const hLineGrad = ctx.createLinearGradient(0, cy - 2, 0, cy + 2);
        hLineGrad.addColorStop(0, "rgba(48, 110, 195, 0)");
        hLineGrad.addColorStop(0.5, `rgba(48, 110, 195, ${crossAlpha * 0.5})`);
        hLineGrad.addColorStop(1, "rgba(48, 110, 195, 0)");
        ctx.fillStyle = hLineGrad;
        ctx.fillRect(0, cy - 2, w, 4);

        // Vertical remnant line
        const vLineGrad = ctx.createLinearGradient(cx - 2, 0, cx + 2, 0);
        vLineGrad.addColorStop(0, "rgba(246, 255, 84, 0)");
        vLineGrad.addColorStop(0.5, `rgba(246, 255, 84, ${crossAlpha * 0.5})`);
        vLineGrad.addColorStop(1, "rgba(246, 255, 84, 0)");
        ctx.fillStyle = vLineGrad;
        ctx.fillRect(cx - 2, 0, 4, h);

        // Central breath glow
        const breathR = 120 + t * 60;
        const breathAlpha = Math.max(0, 0.6 - t);
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, breathR);
        bg.addColorStop(0, `rgba(255, 255, 255, ${breathAlpha})`);
        bg.addColorStop(0.4, `rgba(246, 255, 84, ${breathAlpha * 0.5})`);
        bg.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(cx, cy, breathR, 0, Math.PI * 2);
        ctx.fill();

        // Fine sparkle dust
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 200;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.globalAlpha = (1 - t) * Math.random() * 0.6;
          ctx.fillStyle = BRAND_YELLOW;
          ctx.fillRect(x, y, 1, 1);
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
