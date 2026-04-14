"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  stars: 900,
  trace: 1900,
  shine: 1300,
  dissolve: 1200,
};

// A simple constellation shape (roughly like a "bang" burst)
const CONSTELLATION_POINTS: [number, number][] = [
  [-1.0, 0.0],
  [-0.5, -0.45],
  [0.0, -0.6],
  [0.5, -0.45],
  [1.0, 0.0],
  [0.5, 0.45],
  [0.0, 0.6],
  [-0.5, 0.45],
  [0.0, 0.0], // center
  [-0.35, 0.0],
  [0.35, 0.0],
  [0.0, -0.3],
  [0.0, 0.3],
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  [8, 9], [8, 10], [8, 11], [8, 12],
  [0, 9], [4, 10], [2, 11], [6, 12],
];

interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  twinkle: number;
}

export function IntroEngineL({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const bgStarsRef = useRef<BackgroundStar[]>([]);

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

    bgStarsRef.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
    }));

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_STARS = DURATION.stars;
    const T_TRACE = T_STARS + DURATION.trace;
    const T_SHINE = T_TRACE + DURATION.shine;
    const T_DISSOLVE = T_SHINE + DURATION.dissolve;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.25;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Background stars with twinkle
      bgStarsRef.current.forEach((s) => {
        const alpha = 0.3 + Math.sin(now * 0.002 + s.twinkle) * 0.2;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      const constellationPoints = CONSTELLATION_POINTS.map(([px, py]) => ({
        x: cx + px * scale,
        y: cy + py * scale,
      }));

      if (elapsed < T_STARS) {
        // Constellation stars appear one by one
        const t = elapsed / T_STARS;
        const visibleCount = Math.ceil(t * CONSTELLATION_POINTS.length);

        constellationPoints.forEach((p, i) => {
          if (i >= visibleCount) return;
          const localT = Math.min(1, (t * CONSTELLATION_POINTS.length - i));
          ctx.globalAlpha = localT;
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 15;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3 * localT, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_TRACE) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_STARS) / DURATION.trace;

        // Draw constellation stars
        constellationPoints.forEach((p) => {
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 12;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Trace connections progressively
        const edgeProgress = t * CONNECTIONS.length;
        CONNECTIONS.forEach((conn, i) => {
          const localT = Math.max(0, Math.min(1, edgeProgress - i));
          if (localT === 0) return;
          const a = constellationPoints[conn[0]];
          const b = constellationPoints[conn[1]];
          const ex = a.x + (b.x - a.x) * localT;
          const ey = a.y + (b.y - a.y) * localT;

          ctx.globalAlpha = 0.8;
          ctx.strokeStyle = BRAND_BLUE;
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 6;
          ctx.shadowColor = BRAND_BLUE;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_SHINE) {
        // All connections complete, constellation shines bright
        const t = (elapsed - T_TRACE) / DURATION.shine;

        // All lines glowing
        CONNECTIONS.forEach((conn) => {
          const a = constellationPoints[conn[0]];
          const b = constellationPoints[conn[1]];
          ctx.globalAlpha = 0.8 + Math.sin(t * Math.PI * 4) * 0.2;
          ctx.strokeStyle = BRAND_YELLOW;
          ctx.lineWidth = 1.5 + t * 0.5;
          ctx.shadowBlur = 15 + t * 15;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });

        // Stars pulse bigger
        constellationPoints.forEach((p) => {
          const pulse = 3 + Math.sin(t * Math.PI * 4) * 1.5 + t * 2;
          ctx.globalAlpha = 1;
          ctx.fillStyle = BRAND_YELLOW;
          ctx.shadowBlur = 20;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_DISSOLVE) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_SHINE) / DURATION.dissolve;

        // Constellation dissolves into particles
        constellationPoints.forEach((p) => {
          // Scatter particles
          for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = t * 100 + Math.random() * 50;
            const px = p.x + Math.cos(angle) * dist;
            const py = p.y + Math.sin(angle) * dist;
            ctx.globalAlpha = Math.max(0, 1 - t * 1.2) * Math.random();
            ctx.fillStyle = Math.random() < 0.5 ? BRAND_YELLOW : "#ffffff";
            ctx.shadowBlur = 5;
            ctx.shadowColor = BRAND_YELLOW;
            ctx.fillRect(px, py, 2, 2);
          }
        });
        ctx.shadowBlur = 0;

        // Gentle bloom
        const bloomAlpha = Math.max(0, 1 - t * 1.5);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 2);
        grad.addColorStop(0, `rgba(246, 255, 84, ${bloomAlpha * 0.6})`);
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
