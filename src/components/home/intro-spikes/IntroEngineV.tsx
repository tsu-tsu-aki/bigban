"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  nothing: 600,
  singularity: 900,
  inflation: 900,
  decoupling: 800,
  cooling: 1200,
  galaxies: 1300,
};

interface CosmicParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

interface Galaxy {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  spin: number;
  color: string;
  armCount: number;
}

export function IntroEngineV({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<CosmicParticle[]>([]);
  const galaxiesRef = useRef<Galaxy[]>([]);

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

    const T_NOTHING = DURATION.nothing;
    const T_SINGULARITY = T_NOTHING + DURATION.singularity;
    const T_INFLATION = T_SINGULARITY + DURATION.inflation;
    const T_DECOUPLING = T_INFLATION + DURATION.decoupling;
    const T_COOLING = T_DECOUPLING + DURATION.cooling;
    const T_GALAXIES = T_COOLING + DURATION.galaxies;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, W, H);

      if (elapsed < T_NOTHING) {
        // Nothingness
      } else if (elapsed < T_SINGULARITY) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Singularity — infinitesimal bright point pulsing
        const t = (elapsed - T_NOTHING) / DURATION.singularity;
        const pulse = 1 + Math.sin(t * Math.PI * 8) * 0.3;
        const r = 3 + t * 4;

        // Ultrawhite core with intense glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 10);
        grad.addColorStop(0, `rgba(255, 255, 255, ${pulse})`);
        grad.addColorStop(0.2, `rgba(255, 255, 255, ${0.6 * pulse})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_INFLATION) {
        // Inflation — exponential expansion
        const t = (elapsed - T_SINGULARITY) / DURATION.inflation;
        const exp = Math.pow(t, 0.3) * Math.max(W, H) * 0.8;

        if (particlesRef.current.length === 0) {
          particlesRef.current = Array.from({ length: 400 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 40 + 20;
            return {
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 2 + 1,
              color: Math.random() < 0.6 ? "#ffffff" : BRAND_YELLOW,
              life: 1,
            };
          });
        }

        // Primordial plasma
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, exp);
        grad.addColorStop(0, `rgba(255, 255, 255, ${1 - t * 0.3})`);
        grad.addColorStop(0.3, `rgba(246, 255, 84, ${0.8 - t * 0.3})`);
        grad.addColorStop(0.7, `rgba(48, 110, 195, ${0.5 - t * 0.3})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, exp, 0, Math.PI * 2);
        ctx.fill();

        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;
          ctx.globalAlpha = 1 - t * 0.3;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;
      } else if (elapsed < T_DECOUPLING) {
        // Matter-Radiation decoupling — flash of light
        const t = (elapsed - T_INFLATION) / DURATION.decoupling;

        // Fading fireball
        const alpha = Math.max(0, 1 - t * 1.5);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
        grad.addColorStop(0.3, `rgba(246, 255, 84, ${alpha * 0.6})`);
        grad.addColorStop(0.7, `rgba(48, 110, 195, ${alpha * 0.2})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        particlesRef.current.forEach((p) => {
          p.x += p.vx * 0.8;
          p.y += p.vy * 0.8;
          p.vx *= 0.98;
          p.vy *= 0.98;
          // Color shift from hot to cool
          const coolColor = t > 0.5 ? (Math.random() < 0.5 ? "#c8dcff" : "#ffffff") : "#ffffff";
          ctx.globalAlpha = 1 - t * 0.3;
          ctx.fillStyle = coolColor;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;
      } else if (elapsed < T_COOLING) {
        // Cooling — dark universe with remaining matter
        const t = (elapsed - T_DECOUPLING) / DURATION.cooling;

        particlesRef.current.forEach((p) => {
          p.x += p.vx * (0.5 - t * 0.3);
          p.y += p.vy * (0.5 - t * 0.3);
          const alpha = 0.4 + Math.random() * 0.4;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = Math.random() < 0.15 ? BRAND_BLUE : "#ffffff";
          ctx.fillRect(p.x, p.y, p.size * 0.8, p.size * 0.8);
        });
        ctx.globalAlpha = 1;

        // Cosmic web — faint interconnections
        if (t > 0.3) {
          ctx.strokeStyle = `rgba(48, 110, 195, ${(t - 0.3) * 0.1})`;
          ctx.lineWidth = 0.3;
          for (let i = 0; i < 30; i++) {
            const p1 = particlesRef.current[Math.floor(Math.random() * particlesRef.current.length)];
            const p2 = particlesRef.current[Math.floor(Math.random() * particlesRef.current.length)];
            const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (d < 150) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      } else if (elapsed < T_GALAXIES) {
        const t = (elapsed - T_COOLING) / DURATION.galaxies;

        if (galaxiesRef.current.length === 0) {
          galaxiesRef.current = Array.from({ length: 5 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * Math.min(W, H) * 0.35;
            return {
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist,
              radius: 30 + Math.random() * 40,
              rotation: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 0.04,
              color: Math.random() < 0.5 ? BRAND_YELLOW : BRAND_BLUE,
              armCount: 2 + Math.floor(Math.random() * 3),
            };
          });
        }

        // Particles as stars
        particlesRef.current.forEach((p) => {
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(p.x, p.y, 0.8, 0.8);
        });
        ctx.globalAlpha = 1;

        // Galaxies forming (spiral)
        galaxiesRef.current.forEach((g) => {
          g.rotation += g.spin;
          const currentR = g.radius * t;
          for (let arm = 0; arm < g.armCount; arm++) {
            const armBase = (arm / g.armCount) * Math.PI * 2 + g.rotation;
            ctx.strokeStyle = `${g.color}cc`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = g.color;
            ctx.beginPath();
            for (let r = 2; r < currentR; r += 1.5) {
              const spiralAngle = armBase + (r / currentR) * Math.PI * 2;
              const x = g.x + Math.cos(spiralAngle) * r;
              const y = g.y + Math.sin(spiralAngle) * r;
              if (r === 2) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          ctx.shadowBlur = 0;

          // Galactic core
          const gcGrad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, 15);
          gcGrad.addColorStop(0, `rgba(255, 255, 255, ${t})`);
          gcGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = gcGrad;
          ctx.beginPath();
          ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        if (phaseRef.current === "converge") setPhase("explode");
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
