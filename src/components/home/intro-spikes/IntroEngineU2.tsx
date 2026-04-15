"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BRAND_DEEP = "#11317B";
const BALL_YELLOW = "#FFEB3B";

const DURATION = {
  cosmos: 900,
  travel: 1800,
  pull: 400,
  impact: 250,
  birth: 2200,
};

interface NebulaCloud {
  x: number;
  y: number;
  r: number;
  color: string;
  seed: number;
}

interface Galaxy {
  x: number;
  y: number;
  baseR: number;
  rotation: number;
  spin: number;
  armCount: number;
  color: string;
}

function drawBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot = 0) {
  if (r < 1) return;
  const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  grad.addColorStop(0, "#FFFAA0");
  grad.addColorStop(0.5, BALL_YELLOW);
  grad.addColorStop(1, "#CCAC00");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  const holes = [
    [0, -0.55], [0.38, -0.4], [0.55, -0.05], [0.45, 0.35],
    [0.1, 0.55], [-0.3, 0.48], [-0.55, 0.12], [-0.5, -0.25],
  ];
  holes.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx * r, dy * r, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.4, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

export function IntroEngineU2({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number }[]>([]);
  const nebulaeRef = useRef<NebulaCloud[]>([]);
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

    const W = window.innerWidth;
    const H = window.innerHeight;

    starsRef.current = Array.from({ length: 280 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
    }));

    nebulaeRef.current = Array.from({ length: 4 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 150 + Math.random() * 200,
      color: Math.random() < 0.5 ? BRAND_BLUE : BRAND_DEEP,
      seed: Math.random(),
    }));

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_COSMOS = DURATION.cosmos;
    const T_TRAVEL = T_COSMOS + DURATION.travel;
    const T_PULL = T_TRAVEL + DURATION.pull;
    const T_IMPACT = T_PULL + DURATION.impact;
    const T_BIRTH = T_IMPACT + DURATION.birth;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const Wp = window.innerWidth;
      const Hp = window.innerHeight;
      const cx = Wp / 2;
      const cy = Hp / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, Wp, Hp);

      // Nebula clouds (visible throughout intro)
      if (elapsed < T_IMPACT) {
        const visible = elapsed < T_TRAVEL ? 1 : Math.max(0, 1 - (elapsed - T_TRAVEL) / 800);
        nebulaeRef.current.forEach((n) => {
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
          grad.addColorStop(0, `${n.color}33`);
          grad.addColorStop(0.5, `${n.color}11`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.globalAlpha = visible;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Stars
      starsRef.current.forEach((s) => {
        ctx.globalAlpha = s.alpha * (0.6 + Math.sin(now * 0.002 + s.x * 0.01) * 0.3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      if (elapsed < T_COSMOS) {
        // Cosmos drift
      } else if (elapsed < T_TRAVEL) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Ball cosmic journey — curves through space
        const t = (elapsed - T_COSMOS) / DURATION.travel;
        const eased = Math.pow(t, 2);

        // Curved path — enters from top-right, curves down through nebula, arrives at center
        const startX = Wp + 150;
        const startY = -100;
        const ctrlX = Wp * 0.25;
        const ctrlY = Hp * 0.15;
        const endX = cx;
        const endY = cy;

        // Quadratic Bezier
        const bx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX;
        const by = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;

        const ballR = 10 + eased * Math.min(Wp, Hp) * 0.25;

        // Motion blur trail along bezier
        for (let i = 0; i < 10; i++) {
          const tr = i / 10;
          const tt = Math.max(0, t - tr * 0.1);
          const tx = (1 - tt) * (1 - tt) * startX + 2 * (1 - tt) * tt * ctrlX + tt * tt * endX;
          const ty = (1 - tt) * (1 - tt) * startY + 2 * (1 - tt) * tt * ctrlY + tt * tt * endY;
          const tR = ballR * (1 - tr * 0.35);
          ctx.globalAlpha = (1 - tr) * 0.35 * eased;
          drawBall(ctx, tx, ty, tR, now * 0.01);
        }
        ctx.globalAlpha = 1;
        drawBall(ctx, bx, by, ballR, now * 0.01);

        // Gravity streaks near ball
        if (t > 0.5) {
          const f = (t - 0.5) / 0.5;
          ctx.strokeStyle = `rgba(246, 255, 84, ${f * 0.3})`;
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + t * 2;
            const r1 = ballR * 1.2;
            const r2 = ballR * 2.5 * f;
            ctx.beginPath();
            ctx.moveTo(bx + Math.cos(a) * r1, by + Math.sin(a) * r1);
            ctx.lineTo(bx + Math.cos(a) * r2, by + Math.sin(a) * r2);
            ctx.stroke();
          }
        }
      } else if (elapsed < T_PULL) {
        // Gravitational pull moment — everything bends toward center
        const t = (elapsed - T_TRAVEL) / DURATION.pull;

        const ballR = Math.min(Wp, Hp) * (0.25 + t * 0.1);
        drawBall(ctx, cx, cy, ballR, now * 0.015);

        // Inward lensing effect (particles drawing in)
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.min(Wp, Hp) * (0.5 - t * 0.3) + Math.random() * 30;
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          ctx.fillStyle = BRAND_YELLOW;
          ctx.globalAlpha = t;
          ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;

        // Central brightening
        const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ballR * 1.5);
        cGrad.addColorStop(0, `rgba(255, 255, 255, ${t * 0.6})`);
        cGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, ballR * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_IMPACT) {
        // BIG BANG
        const t = (elapsed - T_PULL) / DURATION.impact;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, Wp, Hp);
        ctx.fillStyle = `rgba(246, 255, 84, ${1 - t})`;
        ctx.fillRect(0, 0, Wp, Hp);
      } else if (elapsed < T_BIRTH) {
        // Universe birth — galaxies form from the explosion
        if (phaseRef.current === "converge") {
          setPhase("explode");
          galaxiesRef.current = Array.from({ length: 6 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * Math.min(Wp, Hp) * 0.3;
            return {
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist,
              baseR: 20 + Math.random() * 40,
              rotation: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 0.04,
              armCount: 2 + Math.floor(Math.random() * 3),
              color: Math.random() < 0.5 ? BRAND_YELLOW : BRAND_BLUE,
            };
          });
        }

        const t = (elapsed - T_IMPACT) / DURATION.birth;

        // Fading explosion flash
        const flashAlpha = Math.max(0, 1 - t * 1.3);
        const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(Wp, Hp));
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        flashGrad.addColorStop(0.3, `rgba(246, 255, 84, ${flashAlpha * 0.7})`);
        flashGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, Wp, Hp);

        // Multi shockwave
        for (let i = 0; i < 4; i++) {
          const ringR = t * Math.max(Wp, Hp) * (0.5 + i * 0.2);
          const ringAlpha = Math.max(0, 1 - t * 1.1) * (1 - i * 0.22);
          if (ringAlpha > 0) {
            ctx.globalAlpha = ringAlpha;
            ctx.strokeStyle = [BRAND_YELLOW, "#ffffff", BRAND_BLUE, BRAND_DEEP][i];
            ctx.lineWidth = 4 - i * 0.6;
            ctx.shadowBlur = 22;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Galaxies forming (after initial flash)
        if (t > 0.35) {
          const gT = (t - 0.35) / 0.65;
          galaxiesRef.current.forEach((g) => {
            g.rotation += g.spin;
            const currentR = g.baseR * gT;
            for (let arm = 0; arm < g.armCount; arm++) {
              const armBase = (arm / g.armCount) * Math.PI * 2 + g.rotation;
              ctx.strokeStyle = `${g.color}bb`;
              ctx.lineWidth = 1.8;
              ctx.shadowBlur = 8;
              ctx.shadowColor = g.color;
              ctx.beginPath();
              for (let r = 2; r < currentR; r += 1.5) {
                const spiralAngle = armBase + (r / currentR) * Math.PI * 1.8;
                const x = g.x + Math.cos(spiralAngle) * r;
                const y = g.y + Math.sin(spiralAngle) * r;
                if (r === 2) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
            ctx.shadowBlur = 0;
            // Galactic core
            const gcGrad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, 12);
            gcGrad.addColorStop(0, `rgba(255, 255, 255, ${gT})`);
            gcGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = gcGrad;
            ctx.beginPath();
            ctx.arc(g.x, g.y, 12, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Scattering particles
        for (let i = 0; i < 120; i++) {
          const angle = (i / 120) * Math.PI * 2;
          const dist = t * Math.max(Wp, Hp) * (0.35 + Math.random() * 0.6);
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          ctx.globalAlpha = Math.max(0, 1 - t * 1.1) * Math.random();
          ctx.fillStyle = Math.random() < 0.5 ? BRAND_YELLOW : "#ffffff";
          ctx.fillRect(x, y, 1.5, 1.5);
        }
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
