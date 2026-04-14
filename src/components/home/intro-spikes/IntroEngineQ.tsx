"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const DURATION = {
  calm: 600,
  split: 1800,
  marble: 1600,
  merge: 1400,
};

interface MetaBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  seed: number;
}

export function IntroEngineQ({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const ballsRef = useRef<MetaBall[]>([]);

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

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const palette = ["#F6FF54", "#306EC3", "#E8D67C", "#11317B"];
    ballsRef.current = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const r = Math.min(w, h) * 0.1;
      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: Math.cos(angle) * 1.5,
        vy: Math.sin(angle) * 1.5,
        radius: Math.min(w, h) * (0.18 + Math.random() * 0.05),
        color: palette[i % palette.length],
        seed: Math.random() * 100,
      };
    });

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_CALM = DURATION.calm;
    const T_SPLIT = T_CALM + DURATION.split;
    const T_MARBLE = T_SPLIT + DURATION.marble;
    const T_MERGE = T_MARBLE + DURATION.merge;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cXc = W / 2;
      const cYc = H / 2;

      // Fade previous frame for organic flow
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, W, H);

      if (elapsed < T_CALM) {
        // Small central pool
        const t = elapsed / T_CALM;
        const r = 30 + t * 20;
        const grad = ctx.createRadialGradient(cXc, cYc, 0, cXc, cYc, r);
        grad.addColorStop(0, `rgba(246, 255, 84, ${t * 0.8})`);
        grad.addColorStop(0.5, `rgba(48, 110, 195, ${t * 0.5})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cXc, cYc, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_SPLIT) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_CALM) / DURATION.split;

        // Blobs drift outward and wobble
        ballsRef.current.forEach((b, i) => {
          b.x += b.vx * (1 + t * 0.5);
          b.y += b.vy * (1 + t * 0.5);
          // Curve paths for liquid feel
          b.vx += Math.sin(now * 0.001 + b.seed) * 0.05;
          b.vy += Math.cos(now * 0.001 + b.seed) * 0.05;

          // Soft bounds (bounce off)
          const margin = 50;
          if (b.x < margin || b.x > W - margin) b.vx *= -0.9;
          if (b.y < margin || b.y > H - margin) b.vy *= -0.9;

          const wobbleR = b.radius * (0.9 + Math.sin(now * 0.002 + b.seed + i) * 0.1);

          // Metaball-like rendering with multiple overlapping gradients
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          for (let j = 0; j < 3; j++) {
            const offset = j * 10;
            const alpha = 0.7 - j * 0.2;
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, wobbleR + offset);
            grad.addColorStop(0, `${b.color}${Math.floor(alpha * 180).toString(16).padStart(2, "0")}`);
            grad.addColorStop(0.5, `${b.color}${Math.floor(alpha * 80).toString(16).padStart(2, "0")}`);
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, wobbleR + offset, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      } else if (elapsed < T_MARBLE) {
        // Marble swirl — blobs rotate around center slowly
        const t = (elapsed - T_SPLIT) / DURATION.marble;
        const swirlCenter = cXc;
        const swirlCenterY = cYc;
        const globalRot = t * Math.PI;

        ballsRef.current.forEach((b, i) => {
          const dx = b.x - swirlCenter;
          const dy = b.y - swirlCenterY;
          const dist = Math.hypot(dx, dy);
          const baseAngle = Math.atan2(dy, dx);
          const newAngle = baseAngle + 0.008 + t * 0.002;
          const newDist = dist * (1 - t * 0.003);
          b.x = swirlCenter + Math.cos(newAngle) * newDist;
          b.y = swirlCenterY + Math.sin(newAngle) * newDist;

          const wobbleR = b.radius * (0.85 + Math.sin(now * 0.002 + b.seed + i) * 0.15);

          ctx.save();
          ctx.globalCompositeOperation = "screen";
          for (let j = 0; j < 3; j++) {
            const offset = j * 8;
            const alpha = 0.65 - j * 0.18;
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, wobbleR + offset);
            grad.addColorStop(0, `${b.color}${Math.floor(alpha * 200).toString(16).padStart(2, "0")}`);
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, wobbleR + offset, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });

        // Darker center forms as ink gathers
        const darkR = t * Math.min(W, H) * 0.15;
        const dg = ctx.createRadialGradient(cXc, cYc, 0, cXc, cYc, darkR);
        dg.addColorStop(0, "rgba(255, 255, 255, 0.4)");
        dg.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(cXc, cYc, darkR, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_MERGE) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_MARBLE) / DURATION.merge;

        // Blobs collapse toward center
        ballsRef.current.forEach((b, i) => {
          b.x += (cXc - b.x) * 0.07;
          b.y += (cYc - b.y) * 0.07;
          b.radius *= 0.98;

          ctx.save();
          ctx.globalCompositeOperation = "screen";
          const wobbleR = b.radius;
          const alpha = Math.max(0, 1 - t * 0.7);
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, wobbleR);
          grad.addColorStop(0, `${b.color}${Math.floor(alpha * 200).toString(16).padStart(2, "0")}`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, wobbleR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Central bright bloom
        const bloomR = Math.min(W, H) * 0.3 * (1 + t * 0.4);
        const bloomAlpha = Math.max(0, 1 - t * 1.2);
        const bg = ctx.createRadialGradient(cXc, cYc, 0, cXc, cYc, bloomR);
        bg.addColorStop(0, `rgba(255, 255, 255, ${bloomAlpha})`);
        bg.addColorStop(0.4, `rgba(246, 255, 84, ${bloomAlpha * 0.6})`);
        bg.addColorStop(0.8, `rgba(48, 110, 195, ${bloomAlpha * 0.3})`);
        bg.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
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
