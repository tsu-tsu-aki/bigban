"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

interface VortexParticle {
  angle: number;
  radius: number;
  targetRadius: number;
  angularVel: number;
  size: number;
  color: string;
  alpha: number;
  trailX: number;
  trailY: number;
}

const BRAND_YELLOW = "#F6FF54";
const BRAND_GOLD = "#E8D67C";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  scatter: 800,
  gather: 1800,
  spin: 900,
  burst: 1600,
};

const PARTICLE_COUNT = 240;

export function IntroEngineE({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<VortexParticle[]>([]);

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

    const maxR = Math.hypot(window.innerWidth, window.innerHeight) * 0.5;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const cc = Math.random();
      const color = cc < 0.55 ? BRAND_GOLD : cc < 0.85 ? BRAND_YELLOW : BRAND_BLUE;
      return {
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * maxR,
        targetRadius: Math.random() * maxR,
        angularVel: (Math.random() - 0.5) * 0.002,
        size: Math.random() * 2 + 0.8,
        color,
        alpha: Math.random() * 0.5 + 0.4,
        trailX: 0,
        trailY: 0,
      };
    });

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_SCATTER = DURATION.scatter;
    const T_GATHER = T_SCATTER + DURATION.gather;
    const T_SPIN = T_GATHER + DURATION.spin;
    const T_BURST = T_SPIN + DURATION.burst;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      // Soft trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_SCATTER) {
        // Particles drift, barely visible
        particlesRef.current.forEach((p) => {
          p.angle += p.angularVel;
          const x = cx + Math.cos(p.angle) * p.radius;
          const y = cy + Math.sin(p.angle) * p.radius;
          ctx.globalAlpha = p.alpha * 0.5;
          ctx.fillStyle = p.color;
          ctx.fillRect(x, y, p.size, p.size);
        });
      } else if (elapsed < T_GATHER) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_SCATTER) / DURATION.gather;
        const easedT = t * t * (3 - 2 * t); // smoothstep

        particlesRef.current.forEach((p) => {
          // Spiral inward
          p.radius += (20 - p.radius) * 0.01 + (-0.5 * easedT);
          p.radius = Math.max(20, p.radius - easedT * 4);
          p.angle += 0.02 + easedT * 0.08;

          const x = cx + Math.cos(p.angle) * p.radius;
          const y = cy + Math.sin(p.angle) * p.radius;

          const alpha = Math.min(1, p.alpha + easedT * 0.5);
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.fillRect(x, y, p.size, p.size);
        });
        ctx.shadowBlur = 0;

        // Center glow builds up
        const glowRadius = 30 + easedT * 60;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${easedT * 0.9})`);
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${easedT * 0.6})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_SPIN) {
        // High-speed spin + charge
        const t = (elapsed - T_GATHER) / DURATION.spin;

        particlesRef.current.forEach((p) => {
          p.angle += 0.15 + t * 0.2;
          p.radius = Math.max(10, p.radius - 0.3);

          const x = cx + Math.cos(p.angle) * p.radius;
          const y = cy + Math.sin(p.angle) * p.radius;

          ctx.globalAlpha = 1;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.fillRect(x, y, p.size * (1 + t), p.size * (1 + t));
        });
        ctx.shadowBlur = 0;

        // Core bright charge
        const coreR = 100 + t * 80;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.4, `rgba(246, 255, 84, ${0.8 + t * 0.2})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_BURST) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_SPIN) / DURATION.burst;

        // Particles burst outward + continuing spin (elegant ribbon)
        particlesRef.current.forEach((p) => {
          p.angle += 0.05 * (1 - t);
          p.radius += 10 + t * 12;
          const x = cx + Math.cos(p.angle) * p.radius;
          const y = cy + Math.sin(p.angle) * p.radius;

          const alpha = Math.max(0, 1 - t * 1.1);
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.fillRect(x, y, p.size, p.size);
        });
        ctx.shadowBlur = 0;

        // Bloom burst
        const bloomAlpha = Math.max(0, 1 - t * 1.5);
        if (bloomAlpha > 0) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
          grad.addColorStop(0, `rgba(255, 255, 255, ${bloomAlpha})`);
          grad.addColorStop(0.35, `rgba(246, 255, 84, ${bloomAlpha * 0.8})`);
          grad.addColorStop(0.7, `rgba(48, 110, 195, ${bloomAlpha * 0.3})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }

        // Thin expanding ring
        ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.arc(cx, cy, 100 + t * 500, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
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
