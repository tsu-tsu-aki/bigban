"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  draw: 1200,
  ball: 800,
  explode: 1800,
  cosmos: 1500,
};

// Court is drawn in local coords (-1..1), then scaled to fit screen
// Pickleball court lines in standard layout (top-down view)
const COURT_LINES: [[number, number], [number, number]][] = [
  // Outer boundary
  [[-0.9, -0.9], [0.9, -0.9]],
  [[0.9, -0.9], [0.9, 0.9]],
  [[0.9, 0.9], [-0.9, 0.9]],
  [[-0.9, 0.9], [-0.9, -0.9]],
  // Net line (horizontal center)
  [[-0.9, 0], [0.9, 0]],
  // Kitchen lines (non-volley zone)
  [[-0.9, -0.25], [0.9, -0.25]],
  [[-0.9, 0.25], [0.9, 0.25]],
  // Center service line (top half)
  [[0, -0.9], [0, -0.25]],
  // Center service line (bottom half)
  [[0, 0.25], [0, 0.9]],
];

export function IntroEngineX({ onPhaseChange }: IntroEngineProps) {
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

    const T_DRAW = DURATION.draw;
    const T_BALL = T_DRAW + DURATION.ball;
    const T_EXPLODE = T_BALL + DURATION.explode;
    const T_COSMOS = T_EXPLODE + DURATION.cosmos;

    const scaleX = () => Math.min(window.innerWidth, window.innerHeight * 1.5) * 0.35;
    const scaleY = () => Math.min(window.innerHeight, window.innerWidth / 1.5) * 0.35;

    const toScreen = (
      lx: number,
      ly: number,
      cx: number,
      cy: number,
      sx: number,
      sy: number
    ) => ({
      x: cx + lx * sx,
      y: cy + ly * sy,
    });

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;
      const sx = scaleX();
      const sy = scaleY();

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      if (elapsed < T_DRAW) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Draw court lines progressively
        const t = elapsed / T_DRAW;
        const linesDone = Math.floor(t * COURT_LINES.length);
        const currentLineT = (t * COURT_LINES.length) - linesDone;

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = BRAND_BLUE;

        COURT_LINES.forEach((line, i) => {
          if (i > linesDone) return;
          const [a, b] = line;
          const start = toScreen(a[0], a[1], cx, cy, sx, sy);
          const end = toScreen(b[0], b[1], cx, cy, sx, sy);
          const progress = i < linesDone ? 1 : currentLineT;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(
            start.x + (end.x - start.x) * progress,
            start.y + (end.y - start.y) * progress
          );
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      } else if (elapsed < T_BALL) {
        // Court fully drawn; ball appears at center of kitchen
        const t = (elapsed - T_DRAW) / DURATION.ball;

        // Full court
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = BRAND_BLUE;
        COURT_LINES.forEach(([a, b]) => {
          const start = toScreen(a[0], a[1], cx, cy, sx, sy);
          const end = toScreen(b[0], b[1], cx, cy, sx, sy);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;

        // Ball at center with charging glow
        const r = 12 + t * 25;
        const chargeR = r * (2 + t * 4);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, chargeR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.8 + t * 0.2})`);
        grad.addColorStop(0.4, `rgba(246, 255, 84, ${0.6 + t * 0.3})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, chargeR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFEB3B";
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (elapsed < T_EXPLODE) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_BALL) / DURATION.explode;

        // Big bang explosion at court center
        const flashAlpha = Math.max(0, 1 - t * 1.5);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        grad.addColorStop(0.3, `rgba(246, 255, 84, ${flashAlpha * 0.7})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Court lines stretch outward in all directions (end points push to screen edge)
        const stretchFactor = 1 + t * 8;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = BRAND_BLUE;
        COURT_LINES.forEach(([a, b]) => {
          const start = toScreen(a[0] * stretchFactor, a[1] * stretchFactor, cx, cy, sx, sy);
          const end = toScreen(b[0] * stretchFactor, b[1] * stretchFactor, cx, cy, sx, sy);
          ctx.globalAlpha = Math.max(0, 1 - t);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Particle explosion
        for (let i = 0; i < 80; i++) {
          const angle = (i / 80) * Math.PI * 2;
          const dist = t * Math.max(W, H) * (0.5 + Math.random() * 0.3);
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          ctx.globalAlpha = Math.max(0, 1 - t);
          ctx.fillStyle = Math.random() < 0.5 ? BRAND_YELLOW : "#ffffff";
          ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;

        // Shockwave rings
        for (let i = 0; i < 3; i++) {
          const ringR = t * Math.max(W, H) * (0.6 + i * 0.15);
          const alpha = Math.max(0, 1 - t) * (1 - i * 0.25);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = i === 0 ? BRAND_YELLOW : i === 1 ? BRAND_BLUE : "#ffffff";
          ctx.lineWidth = 3 - i * 0.5;
          ctx.shadowBlur = 20;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_COSMOS) {
        const t = (elapsed - T_EXPLODE) / DURATION.cosmos;

        // Court line endpoints remain as "star map" constellation
        COURT_LINES.forEach(([a, b]) => {
          const stretched = 9;
          const start = toScreen(a[0] * stretched, a[1] * stretched, cx, cy, sx, sy);
          const end = toScreen(b[0] * stretched, b[1] * stretched, cx, cy, sx, sy);
          ctx.globalAlpha = Math.max(0, 1 - t) * 0.5;
          ctx.strokeStyle = BRAND_BLUE;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();

          ctx.globalAlpha = Math.max(0, 1 - t);
          ctx.fillStyle = BRAND_YELLOW;
          ctx.shadowBlur = 10;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.fillRect(start.x - 2, start.y - 2, 4, 4);
          ctx.fillRect(end.x - 2, end.y - 2, 4, 4);
        });
        ctx.shadowBlur = 0;
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
