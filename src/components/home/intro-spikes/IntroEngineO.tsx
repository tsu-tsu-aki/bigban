"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  build: 800,
  spin: 2400,
  converge: 1000,
  burst: 1100,
};

const SYMMETRY = 8;

interface KaleidoShape {
  radius: number;
  baseRadius: number;
  angle: number;
  angularVel: number;
  size: number;
  color: string;
  hue: number;
}

export function IntroEngineO({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const shapesRef = useRef<KaleidoShape[]>([]);

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

    const maxR = Math.min(window.innerWidth, window.innerHeight) * 0.5;

    // Create shapes in one slice, to be mirrored by symmetry
    shapesRef.current = Array.from({ length: 16 }, () => {
      const baseRadius = 30 + Math.random() * (maxR - 30);
      const palette = [BRAND_YELLOW, BRAND_BLUE, "#ffffff", "#E8D67C"];
      return {
        radius: baseRadius,
        baseRadius,
        angle: Math.random() * (Math.PI * 2) / SYMMETRY,
        angularVel: (Math.random() - 0.5) * 0.01,
        size: 6 + Math.random() * 14,
        color: palette[Math.floor(Math.random() * palette.length)],
        hue: Math.random(),
      };
    });

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_BUILD = DURATION.build;
    const T_SPIN = T_BUILD + DURATION.spin;
    const T_CONVERGE = T_SPIN + DURATION.converge;
    const T_BURST = T_CONVERGE + DURATION.burst;

    const drawShape = (
      x: number,
      y: number,
      size: number,
      color: string,
      rotation: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      // diamond shape
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_BUILD) {
        // Shapes fade in
        const t = elapsed / T_BUILD;
        shapesRef.current.forEach((s, idx) => {
          const shapeT = Math.min(1, t * 2 - (idx / shapesRef.current.length));
          if (shapeT <= 0) return;
          for (let sym = 0; sym < SYMMETRY; sym++) {
            const angle = s.angle + (sym * Math.PI * 2) / SYMMETRY;
            const x = cx + Math.cos(angle) * s.radius;
            const y = cy + Math.sin(angle) * s.radius;
            drawShape(x, y, s.size * shapeT, s.color, angle, shapeT * 0.8);
          }
        });
      } else if (elapsed < T_SPIN) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_BUILD) / DURATION.spin;
        const globalRot = t * Math.PI * 2;

        shapesRef.current.forEach((s) => {
          s.angle += s.angularVel + t * 0.02;
          s.radius = s.baseRadius + Math.sin(now * 0.001 + s.hue * 10) * 20;

          for (let sym = 0; sym < SYMMETRY; sym++) {
            const angle = s.angle + (sym * Math.PI * 2) / SYMMETRY + globalRot * 0.1;
            const x = cx + Math.cos(angle) * s.radius;
            const y = cy + Math.sin(angle) * s.radius;
            drawShape(x, y, s.size, s.color, angle * 2, 0.85);
          }
        });

        // Center glow pulsing
        const pulseR = 40 + Math.sin(t * Math.PI * 6) * 15;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.5)");
        grad.addColorStop(0.5, `rgba(246, 255, 84, 0.3)`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_CONVERGE) {
        // Shapes spiral in toward center
        const t = (elapsed - T_SPIN) / DURATION.converge;
        const eased = t * t;

        shapesRef.current.forEach((s) => {
          s.angle += 0.06;
          s.radius = s.baseRadius * (1 - eased);

          for (let sym = 0; sym < SYMMETRY; sym++) {
            const angle = s.angle + (sym * Math.PI * 2) / SYMMETRY;
            const x = cx + Math.cos(angle) * s.radius;
            const y = cy + Math.sin(angle) * s.radius;
            drawShape(x, y, s.size * (1 + eased), s.color, angle * 2, 0.9);
          }
        });

        // Building center light
        const coreR = 30 + eased * 100;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${0.8 + eased * 0.2})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_BURST) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_CONVERGE) / DURATION.burst;

        // Shapes fly outward
        shapesRef.current.forEach((s) => {
          s.angle += 0.04;
          s.radius = t * Math.max(w, h) * 0.8;

          for (let sym = 0; sym < SYMMETRY; sym++) {
            const angle = s.angle + (sym * Math.PI * 2) / SYMMETRY;
            const x = cx + Math.cos(angle) * s.radius;
            const y = cy + Math.sin(angle) * s.radius;
            const alpha = Math.max(0, 1 - t * 1.2);
            drawShape(x, y, s.size * (1 - t * 0.5), s.color, angle * 2, alpha);
          }
        });

        // Central flash
        const flashAlpha = Math.max(0, 1 - t * 1.5);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5);
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${flashAlpha * 0.6})`);
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
