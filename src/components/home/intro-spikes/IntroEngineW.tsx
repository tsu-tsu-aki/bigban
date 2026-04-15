"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BALL_YELLOW = "#FFEB3B";

const DURATION = {
  appear: 700,
  spin: 1500,
  grow: 1500,
  burst: 1800,
};

// 40-hole pattern approximated across two hemispheres (visible from one side ~15-20)
const HOLE_POSITIONS: [number, number][] = [
  [0, -0.75], [0.3, -0.65], [0.55, -0.5], [0.7, -0.25], [0.75, 0.05],
  [0.65, 0.35], [0.45, 0.6], [0.15, 0.72], [-0.15, 0.72], [-0.45, 0.6],
  [-0.65, 0.35], [-0.75, 0.05], [-0.7, -0.25], [-0.55, -0.5], [-0.3, -0.65],
  [0, -0.35], [0.3, -0.2], [0.35, 0.15], [0.1, 0.35],
  [-0.2, 0.35], [-0.35, 0.1], [-0.25, -0.2],
  [0, 0], [0, 0.1], [0.1, -0.1],
];

export function IntroEngineW({ onPhaseChange }: IntroEngineProps) {
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

    const W = window.innerWidth;
    const H = window.innerHeight;
    const stars = Array.from({ length: 260 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_APPEAR = DURATION.appear;
    const T_SPIN = T_APPEAR + DURATION.spin;
    const T_GROW = T_SPIN + DURATION.grow;
    const T_BURST = T_GROW + DURATION.burst;

    const drawOrb = (cx: number, cy: number, r: number, rotation: number, holeGlowT: number) => {
      if (r < 1) return; // guard against zero/negative radius (appear phase start)
      // Body with radial gradient
      const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
      grad.addColorStop(0, "#FFFAA0");
      grad.addColorStop(0.5, BALL_YELLOW);
      grad.addColorStop(1, "#CCAC00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.4, r * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Holes with glow
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      HOLE_POSITIONS.forEach(([dx, dy]) => {
        const hx = dx * r;
        const hy = dy * r;
        const hr = r * 0.07;

        // Hole dark
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();

        // Inner light (as holes start glowing)
        if (holeGlowT > 0) {
          const glowGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr * 2);
          glowGrad.addColorStop(0, `rgba(255, 255, 255, ${holeGlowT})`);
          glowGrad.addColorStop(0.5, `rgba(246, 255, 84, ${holeGlowT * 0.7})`);
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(hx, hy, hr * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const Wp = window.innerWidth;
      const Hp = window.innerHeight;
      const cx = Wp / 2;
      const cy = Hp / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, Wp, Hp);

      // Background stars
      stars.forEach((s) => {
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      if (elapsed < T_APPEAR) {
        // Ball appears from center
        const t = elapsed / T_APPEAR;
        const r = t * 100;
        ctx.globalAlpha = t;
        drawOrb(cx, cy, r, 0, 0);
        ctx.globalAlpha = 1;
      } else if (elapsed < T_SPIN) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Spinning — holes start glowing
        const t = (elapsed - T_APPEAR) / DURATION.spin;
        const rotation = t * Math.PI * 3;
        const r = 100 + t * 30;
        drawOrb(cx, cy, r, rotation, t);
      } else if (elapsed < T_GROW) {
        // Ball grows massively; holes become galaxy cores
        const t = (elapsed - T_SPIN) / DURATION.grow;
        const rotation = Math.PI * 3 + t * Math.PI * 2;
        const eased = Math.pow(t, 2);
        const r = 130 + eased * Math.min(Wp, Hp) * 0.7;

        // Ball becomes semi-transparent as it grows
        ctx.globalAlpha = Math.max(0, 1 - t * 0.8);
        drawOrb(cx, cy, r, rotation, 1);
        ctx.globalAlpha = 1;

        // Holes emit spiraling arms
        HOLE_POSITIONS.slice(0, 12).forEach(([dx, dy], idx) => {
          const holeRot = rotation;
          const rotatedX = dx * Math.cos(holeRot) - dy * Math.sin(holeRot);
          const rotatedY = dx * Math.sin(holeRot) + dy * Math.cos(holeRot);
          const hx = cx + rotatedX * r;
          const hy = cy + rotatedY * r;

          // Spiral arm
          const armLength = 80 * t;
          const baseAngle = Math.atan2(rotatedY, rotatedX) + Math.PI;
          ctx.strokeStyle = idx % 2 === 0 ? BRAND_YELLOW : BRAND_BLUE;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.beginPath();
          for (let r2 = 0; r2 < armLength; r2 += 2) {
            const spiralA = baseAngle + (r2 / armLength) * Math.PI * 0.6;
            const sx = hx + Math.cos(spiralA) * r2;
            const sy = hy + Math.sin(spiralA) * r2;
            if (r2 === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      } else if (elapsed < T_BURST) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_GROW) / DURATION.burst;

        // Big bang burst
        const flashAlpha = Math.max(0, 1 - t * 1.3);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(Wp, Hp));
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        grad.addColorStop(0.3, `rgba(246, 255, 84, ${flashAlpha * 0.7})`);
        grad.addColorStop(0.8, `rgba(48, 110, 195, ${flashAlpha * 0.3})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Wp, Hp);

        // Spiraling arms now disperse
        HOLE_POSITIONS.slice(0, 12).forEach(([dx, dy], idx) => {
          const baseAngle = Math.atan2(dy, dx);
          for (let k = 0; k < 20; k++) {
            const particleR = t * Math.max(Wp, Hp) * (0.5 + Math.random() * 0.5);
            const a = baseAngle + (k / 20) * 0.3 + Math.random() * 0.2;
            const px = cx + Math.cos(a) * particleR;
            const py = cy + Math.sin(a) * particleR;
            ctx.globalAlpha = Math.max(0, 1 - t * 1.1);
            ctx.fillStyle = idx % 2 === 0 ? BRAND_YELLOW : "#ffffff";
            ctx.fillRect(px, py, 1.5, 1.5);
          }
        });
        ctx.globalAlpha = 1;

        // Shockwave
        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.globalAlpha = Math.max(0, 1 - t);
        ctx.beginPath();
        ctx.arc(cx, cy, t * Math.max(Wp, Hp) * 0.6, 0, Math.PI * 2);
        ctx.stroke();
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
