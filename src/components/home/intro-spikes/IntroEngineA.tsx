"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

interface Shockwave {
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  width: number;
}

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  dark: 1000,
  converge: 1300,
  explode: 2000,
};

export function IntroEngineA({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const starsRef = useRef<Particle[]>([]);
  const explosionRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);

  const [isReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (isReducedMotion) {
      onPhaseChange("content");
    }
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

    starsRef.current = Array.from({ length: 280 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
      life: Math.random() * 1000,
      maxLife: 1000,
      size: Math.random() * 2 + 0.5,
      color: "#ffffff",
      alpha: Math.random() * 0.7 + 0.15,
    }));

    setPhase("dark");
    startTimeRef.current = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < DURATION.dark) {
        // Phase: dark — 微かな星
        starsRef.current.forEach((p) => {
          p.alpha = 0.1 + Math.sin(now * 0.001 + p.life) * 0.1;
          ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;
      } else if (elapsed < DURATION.dark + DURATION.converge) {
        // Phase: converge
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - DURATION.dark) / DURATION.converge;

        // Stars converging to center
        starsRef.current.forEach((p) => {
          const dx = cx - p.x;
          const dy = cy - p.y;
          p.x += dx * 0.035;
          p.y += dy * 0.035;
          p.alpha = Math.min(1, p.alpha + 0.01);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        // Center glow (pre-explosion charge)
        const chargeRadius = Math.pow(t, 2) * 80;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, chargeRadius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.4, `${BRAND_YELLOW}cc`);
        gradient.addColorStop(1, `${BRAND_BLUE}00`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, chargeRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < DURATION.dark + DURATION.converge + DURATION.explode) {
        // Phase: explode
        if (phaseRef.current === "converge") {
          setPhase("explode");
          // Create explosion particles
          explosionRef.current = Array.from({ length: 260 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 6 + 2) * 3;
            const colorChoice = Math.random();
            const color =
              colorChoice < 0.5 ? BRAND_YELLOW : colorChoice < 0.85 ? BRAND_BLUE : "#ffffff";
            return {
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              maxLife: 1,
              size: Math.random() * 3 + 1.2,
              color,
              alpha: 1,
            };
          });
          // 3 shockwave rings (yellow, blue, white)
          shockwavesRef.current = [
            { radius: 0, maxRadius: Math.max(w, h) * 0.9, alpha: 1, color: BRAND_YELLOW, width: 6 },
            { radius: 0, maxRadius: Math.max(w, h) * 1.1, alpha: 0.8, color: BRAND_BLUE, width: 4 },
            { radius: 0, maxRadius: Math.max(w, h) * 1.3, alpha: 0.5, color: "#ffffff", width: 2 },
          ];
        }

        const t = (elapsed - DURATION.dark - DURATION.converge) / DURATION.explode;

        // Central bright flash (decay)
        const flashAlpha = Math.max(0, 1 - t * 2.5);
        if (flashAlpha > 0) {
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
          gradient.addColorStop(0.5, `${BRAND_YELLOW}${Math.floor(flashAlpha * 200).toString(16).padStart(2, "0")}`);
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);
        }

        // Shockwave rings
        shockwavesRef.current.forEach((sw, i) => {
          sw.radius += (sw.maxRadius - sw.radius) * (0.04 + i * 0.01);
          sw.alpha = Math.max(0, sw.alpha - 0.012);
          if (sw.alpha > 0) {
            ctx.globalAlpha = sw.alpha;
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.width;
            ctx.shadowBlur = 20;
            ctx.shadowColor = sw.color;
            ctx.beginPath();
            ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
        ctx.globalAlpha = 1;

        // Explosion particles
        explosionRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.life -= 0.012;
          p.alpha = Math.max(0, p.life);
          if (p.alpha > 0) {
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else {
        // Phase: content
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
