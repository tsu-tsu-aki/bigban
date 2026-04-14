"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BALL_YELLOW = "#FFEB3B";

const DURATION = {
  space: 1000,
  serve: 1400,
  impact: 200,
  cosmos: 2100,
};

function drawBall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation = 0
) {
  const grad = ctx.createRadialGradient(
    cx - radius * 0.35,
    cy - radius * 0.35,
    radius * 0.1,
    cx,
    cy,
    radius
  );
  grad.addColorStop(0, "#FFFAA0");
  grad.addColorStop(0.5, BALL_YELLOW);
  grad.addColorStop(1, "#CCAC00");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Classic 40-hole pattern (approximated with 8-12 visible from one side)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  const holes = [
    [0, -0.55], [0.35, -0.4], [0.55, -0.05], [0.45, 0.35],
    [0.1, 0.55], [-0.3, 0.45], [-0.55, 0.15], [-0.5, -0.25],
    [-0.15, -0.25], [0.2, -0.1], [0.1, 0.2], [-0.25, 0.1],
  ];
  holes.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx * radius, dy * radius, radius * 0.07, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Specular highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.35, cy - radius * 0.4, radius * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

export function IntroEngineU({ onPhaseChange }: IntroEngineProps) {
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
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.3 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_SPACE = DURATION.space;
    const T_SERVE = T_SPACE + DURATION.serve;
    const T_IMPACT = T_SERVE + DURATION.impact;
    const T_COSMOS = T_IMPACT + DURATION.cosmos;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const Wp = window.innerWidth;
      const Hp = window.innerHeight;
      const cx = Wp / 2;
      const cy = Hp / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, Wp, Hp);

      // Background stars always
      stars.forEach((s) => {
        const a = s.alpha * (0.5 + Math.sin(now * 0.002 + s.twinkle) * 0.5);
        ctx.globalAlpha = a;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      if (elapsed < T_SPACE) {
        // Deep space drift only
      } else if (elapsed < T_SERVE) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Ball approaches from top-right toward center
        const t = (elapsed - T_SPACE) / DURATION.serve;
        const eased = Math.pow(t, 2.5);

        const startX = Wp + 100;
        const startY = -80;
        const endX = cx;
        const endY = cy;

        const bx = startX + (endX - startX) * eased;
        const by = startY + (endY - startY) * eased;

        // Trail
        for (let i = 0; i < 12; i++) {
          const trailT = i / 12;
          const tx = startX + (endX - startX) * (eased - trailT * 0.1);
          const ty = startY + (endY - startY) * (eased - trailT * 0.1);
          const tr = 10 + eased * 60 * (1 - trailT * 0.4);
          ctx.globalAlpha = (1 - trailT) * eased * 0.6;
          drawBall(ctx, tx, ty, tr, now * 0.01);
        }
        ctx.globalAlpha = 1;
        drawBall(ctx, bx, by, 10 + eased * 60, now * 0.01);

        // Charge glow as ball nears
        if (t > 0.7) {
          const f = (t - 0.7) / 0.3;
          ctx.fillStyle = `rgba(246, 255, 84, ${f * 0.4})`;
          ctx.fillRect(0, 0, Wp, Hp);
        }
      } else if (elapsed < T_IMPACT) {
        // Massive flash
        const t = (elapsed - T_SERVE) / DURATION.impact;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, Wp, Hp);
        ctx.fillStyle = `rgba(246, 255, 84, ${1 - t})`;
        ctx.fillRect(0, 0, Wp, Hp);
      } else if (elapsed < T_COSMOS) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_IMPACT) / DURATION.cosmos;

        // Expanding cosmos — rings of galaxies
        const maxR = Math.max(Wp, Hp);
        for (let i = 0; i < 3; i++) {
          const ringR = t * maxR * (0.6 + i * 0.25);
          const ringAlpha = Math.max(0, 1 - t * 1.1) * (1 - i * 0.25);
          if (ringAlpha > 0) {
            ctx.globalAlpha = ringAlpha;
            ctx.strokeStyle = i === 0 ? BRAND_YELLOW : i === 1 ? BRAND_BLUE : "#ffffff";
            ctx.lineWidth = 3 - i * 0.6;
            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Particles scattering — galaxy dust
        for (let i = 0; i < 150; i++) {
          const angle = (i / 150) * Math.PI * 2 + t;
          const dist = t * maxR * (0.3 + Math.random() * 0.5);
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          ctx.globalAlpha = (1 - t) * Math.random();
          ctx.fillStyle = Math.random() < 0.4 ? BRAND_YELLOW : "#ffffff";
          ctx.fillRect(x, y, 1.5, 1.5);
        }
        ctx.globalAlpha = 1;

        // Central bright core (the new universe)
        const coreR = 20 + t * 80;
        const coreAlpha = Math.max(0, 1 - t);
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha * 0.9})`);
        coreGrad.addColorStop(0.4, `rgba(246, 255, 84, ${coreAlpha * 0.7})`);
        coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
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
