"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  dark: 500,
  unfold1: 900,
  unfold2: 900,
  unfold3: 900,
  bloom: 1300,
};

export function IntroEngineM({ onPhaseChange }: IntroEngineProps) {
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
    const T_U1 = T_DARK + DURATION.unfold1;
    const T_U2 = T_U1 + DURATION.unfold2;
    const T_U3 = T_U2 + DURATION.unfold3;
    const T_BLOOM = T_U3 + DURATION.bloom;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    // Draw a folded triangle panel with color and fold line
    const drawPanel = (
      ax: number,
      ay: number,
      bx: number,
      by: number,
      cx: number,
      cy: number,
      color: string,
      alpha: number,
      stroke = true
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fill();
      if (stroke) {
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }
      ctx.restore();
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const size = Math.min(w, h) * 0.2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_DARK) {
        // Small central folded shape
        const t = elapsed / T_DARK;
        const s = size * 0.15 * t;
        ctx.globalAlpha = t;
        ctx.fillStyle = BRAND_BLUE;
        ctx.shadowBlur = 10;
        ctx.shadowColor = BRAND_BLUE;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + s, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx - s, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_U1) {
        // First unfold — small diamond becomes square
        if (phaseRef.current === "dark") setPhase("converge");
        const t = easeOutCubic((elapsed - T_DARK) / DURATION.unfold1);
        const s = size * (0.15 + 0.5 * t);

        drawPanel(cx, cy - s, cx + s, cy, cx, cy, BRAND_BLUE, 0.9);
        drawPanel(cx + s, cy, cx, cy + s, cx, cy, BRAND_BLUE, 0.75);
        drawPanel(cx, cy + s, cx - s, cy, cx, cy, BRAND_BLUE, 0.85);
        drawPanel(cx - s, cy, cx, cy - s, cx, cy, BRAND_BLUE, 0.7);
      } else if (elapsed < T_U2) {
        // Second unfold — add yellow petals outside
        const t = easeOutCubic((elapsed - T_U1) / DURATION.unfold2);
        const s = size * 0.65;
        const expand = size * 0.6 * t;

        drawPanel(cx, cy - s, cx + s, cy, cx, cy, BRAND_BLUE, 0.9);
        drawPanel(cx + s, cy, cx, cy + s, cx, cy, BRAND_BLUE, 0.75);
        drawPanel(cx, cy + s, cx - s, cy, cx, cy, BRAND_BLUE, 0.85);
        drawPanel(cx - s, cy, cx, cy - s, cx, cy, BRAND_BLUE, 0.7);

        // Yellow panels unfold outward
        drawPanel(cx, cy - s, cx + s, cy, cx + expand / 2, cy - s / 2 - expand / 2, BRAND_YELLOW, 0.85 * t);
        drawPanel(cx + s, cy, cx, cy + s, cx + s / 2 + expand / 2, cy + s / 2 + expand / 2, BRAND_YELLOW, 0.75 * t);
        drawPanel(cx, cy + s, cx - s, cy, cx - expand / 2, cy + s / 2 + expand / 2, BRAND_YELLOW, 0.85 * t);
        drawPanel(cx - s, cy, cx, cy - s, cx - s / 2 - expand / 2, cy - s / 2 - expand / 2, BRAND_YELLOW, 0.75 * t);
      } else if (elapsed < T_U3) {
        // Third unfold — yellow panels extend further, inner rotates subtly
        const t = easeOutCubic((elapsed - T_U2) / DURATION.unfold3);
        const s = size * 0.65;
        const expand = size * 0.6 + size * 0.4 * t;

        // Inner blue rotates slightly
        const rot = t * 0.3;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        drawPanel(0, -s, s, 0, 0, 0, BRAND_BLUE, 0.9);
        drawPanel(s, 0, 0, s, 0, 0, BRAND_BLUE, 0.75);
        drawPanel(0, s, -s, 0, 0, 0, BRAND_BLUE, 0.85);
        drawPanel(-s, 0, 0, -s, 0, 0, BRAND_BLUE, 0.7);
        ctx.restore();

        // Yellow extending
        const yExt = expand / 2;
        drawPanel(cx, cy - s, cx + s, cy, cx + yExt, cy - s - yExt, BRAND_YELLOW, 0.9);
        drawPanel(cx + s, cy, cx, cy + s, cx + s + yExt, cy + yExt, BRAND_YELLOW, 0.8);
        drawPanel(cx, cy + s, cx - s, cy, cx - yExt, cy + s + yExt, BRAND_YELLOW, 0.9);
        drawPanel(cx - s, cy, cx, cy - s, cx - s - yExt, cy - yExt, BRAND_YELLOW, 0.8);

        // Accent stars (small sparkles)
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + t;
          const r = size * (1.2 + t * 0.5);
          const sx = cx + Math.cos(angle) * r;
          const sy = cy + Math.sin(angle) * r;
          ctx.globalAlpha = t;
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 10;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_BLOOM) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_U3) / DURATION.bloom;

        // All panels fade and bloom outward
        const scale = 1 + t * 2;
        const alpha = Math.max(0, 1 - t * 1.3);
        const s = size * 0.65 * scale;
        const yExt = size * 0.5 * scale;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.5);
        drawPanel(0, -s, s, 0, 0, 0, BRAND_BLUE, alpha * 0.8);
        drawPanel(s, 0, 0, s, 0, 0, BRAND_BLUE, alpha * 0.6);
        drawPanel(0, s, -s, 0, 0, 0, BRAND_BLUE, alpha * 0.75);
        drawPanel(-s, 0, 0, -s, 0, 0, BRAND_BLUE, alpha * 0.55);
        ctx.restore();

        drawPanel(cx, cy - s, cx + s, cy, cx + yExt, cy - s - yExt, BRAND_YELLOW, alpha);
        drawPanel(cx + s, cy, cx, cy + s, cx + s + yExt, cy + yExt, BRAND_YELLOW, alpha * 0.9);
        drawPanel(cx, cy + s, cx - s, cy, cx - yExt, cy + s + yExt, BRAND_YELLOW, alpha);
        drawPanel(cx - s, cy, cx, cy - s, cx - s - yExt, cy - yExt, BRAND_YELLOW, alpha * 0.9);

        // Bloom at center
        const bloomR = size * scale;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${alpha * 0.5})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
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
