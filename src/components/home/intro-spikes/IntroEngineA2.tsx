"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BRAND_DEEP = "#11317B";

const DURATION = {
  dark: 700,
  charge: 1700,
  bang: 1000,
  after: 1800,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface Shockwave {
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  width: number;
  speed: number;
}

export function IntroEngineA2({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const chargeParticlesRef = useRef<Particle[]>([]);
  const explosionRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number }[]>([]);

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

    starsRef.current = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_DARK = DURATION.dark;
    const T_CHARGE = T_DARK + DURATION.charge;
    const T_BANG = T_CHARGE + DURATION.bang;
    const T_AFTER = T_BANG + DURATION.after;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, W, H);

      // Background stars (visible whole animation)
      starsRef.current.forEach((s) => {
        ctx.globalAlpha = s.alpha * (0.5 + Math.sin(now * 0.002 + s.x) * 0.2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      if (elapsed < T_DARK) {
        // silent darkness
      } else if (elapsed < T_CHARGE) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_DARK) / DURATION.charge;
        const eased = t * t;

        // Swirling charge particles spiraling into center
        if (chargeParticlesRef.current.length < 80 && Math.random() < 0.7) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.max(W, H) * (0.4 + Math.random() * 0.3);
          chargeParticlesRef.current.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            vx: 0,
            vy: 0,
            life: 1,
            size: 1.5 + Math.random() * 2,
            color: Math.random() < 0.3 ? BRAND_YELLOW : Math.random() < 0.5 ? BRAND_BLUE : "#ffffff",
          });
        }

        chargeParticlesRef.current = chargeParticlesRef.current.filter((p) => {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 20) return false;

          // Spiral inward
          const inwardPull = 0.06 + eased * 0.15;
          const angle = Math.atan2(dy, dx);
          const tangent = angle + Math.PI / 2;
          const tangentStrength = 2 * (1 - eased);

          p.vx += (dx / dist) * inwardPull * dist * 0.05 + Math.cos(tangent) * tangentStrength * 0.01;
          p.vy += (dy / dist) * inwardPull * dist * 0.05 + Math.sin(tangent) * tangentStrength * 0.01;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.x += p.vx;
          p.y += p.vy;
          p.life *= 0.98;

          ctx.globalAlpha = p.life;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          return true;
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Growing central orb (the eventual bang)
        const orbR = 8 + eased * 70;
        const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 1.8);
        orbGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
        orbGrad.addColorStop(0.3, `rgba(246, 255, 84, ${0.7 + eased * 0.3})`);
        orbGrad.addColorStop(0.7, `rgba(48, 110, 195, ${0.3 + eased * 0.3})`);
        orbGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, orbR * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Core flicker
        ctx.fillStyle = "#ffffff";
        const flicker = 1 + Math.sin(now * 0.02) * 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, orbR * 0.3 * flicker, 0, Math.PI * 2);
        ctx.fill();

        // Pre-bang screen flash (last 15% of charge)
        if (t > 0.85) {
          const f = (t - 0.85) / 0.15;
          ctx.fillStyle = `rgba(246, 255, 84, ${f * 0.25})`;
          ctx.fillRect(0, 0, W, H);
        }
      } else if (elapsed < T_BANG) {
        // THE BANG
        if (phaseRef.current === "converge") {
          setPhase("explode");
          // 5-layer shockwave (more than A)
          shockwavesRef.current = [
            { radius: 0, maxRadius: Math.max(W, H) * 0.8, alpha: 1, color: "#ffffff", width: 8, speed: 1.3 },
            { radius: 0, maxRadius: Math.max(W, H) * 1.0, alpha: 1, color: BRAND_YELLOW, width: 6, speed: 1.2 },
            { radius: 0, maxRadius: Math.max(W, H) * 1.2, alpha: 0.9, color: BRAND_BLUE, width: 5, speed: 1.1 },
            { radius: 0, maxRadius: Math.max(W, H) * 1.4, alpha: 0.7, color: BRAND_DEEP, width: 3, speed: 1.0 },
            { radius: 0, maxRadius: Math.max(W, H) * 1.6, alpha: 0.4, color: "#ffffff", width: 1.5, speed: 0.9 },
          ];
          // Dense explosion particles
          explosionRef.current = Array.from({ length: 320 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 8 + 3) * 3;
            const cc = Math.random();
            const color =
              cc < 0.45 ? BRAND_YELLOW : cc < 0.75 ? BRAND_BLUE : cc < 0.9 ? "#ffffff" : BRAND_DEEP;
            return {
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              size: Math.random() * 3 + 1.2,
              color,
            };
          });
        }

        const t = (elapsed - T_CHARGE) / DURATION.bang;

        // Ultra bright flash
        const flashAlpha = Math.max(0, 1 - t * 2);
        if (flashAlpha > 0) {
          const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
          fg.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
          fg.addColorStop(0.3, `rgba(246, 255, 84, ${flashAlpha * 0.7})`);
          fg.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = fg;
          ctx.fillRect(0, 0, W, H);
        }

        // Shockwaves
        shockwavesRef.current.forEach((sw) => {
          sw.radius += (sw.maxRadius - sw.radius) * 0.06 * sw.speed;
          sw.alpha = Math.max(0, sw.alpha - 0.014);
          if (sw.alpha > 0) {
            ctx.globalAlpha = sw.alpha;
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.width;
            ctx.shadowBlur = 22;
            ctx.shadowColor = sw.color;
            ctx.beginPath();
            ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Particles
        explosionRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.life -= 0.011;
          if (p.life > 0) {
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_AFTER) {
        const t = (elapsed - T_BANG) / DURATION.after;

        // Residual rings continue outward
        shockwavesRef.current.forEach((sw) => {
          sw.radius += (sw.maxRadius - sw.radius) * 0.03;
          if (sw.alpha > 0) sw.alpha = Math.max(0, sw.alpha - 0.008);
          if (sw.alpha > 0) {
            ctx.globalAlpha = sw.alpha * 0.6;
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.width * 0.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = sw.color;
            ctx.beginPath();
            ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Aurora-like remnant (gradient swirls around center)
        const auroraAlpha = Math.max(0, 0.7 - t);
        if (auroraAlpha > 0) {
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + now * 0.0005;
            const rx = cx + Math.cos(angle) * 40;
            const ry = cy + Math.sin(angle) * 40;
            const aGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, 200);
            aGrad.addColorStop(0, `rgba(246, 255, 84, ${auroraAlpha * 0.3})`);
            aGrad.addColorStop(0.5, `rgba(48, 110, 195, ${auroraAlpha * 0.2})`);
            aGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = aGrad;
            ctx.beginPath();
            ctx.arc(rx, ry, 200, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Remaining particles fade gently
        explosionRef.current.forEach((p) => {
          p.x += p.vx * 0.3;
          p.y += p.vy * 0.3;
          p.life -= 0.008;
          if (p.life > 0) {
            ctx.globalAlpha = p.life * 0.5;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size * 0.7, p.size * 0.7);
          }
        });
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
