"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BALL_YELLOW = "#FFEB3B";

const DURATION = {
  dualApproach: 1600,
  clash: 300,
  shatter: 2000,
  after: 800,
};

interface Crack {
  x: number;
  y: number;
  angle: number;
  length: number;
  branches: Crack[];
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  life: number;
  color: string;
  colorShift: number;
}

function createCrack(x: number, y: number, angle: number, length: number, depth = 0): Crack {
  const branches: Crack[] = [];
  if (depth < 3 && Math.random() < 0.65) {
    const branchCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < branchCount; i++) {
      const branchAngle = angle + (Math.random() - 0.5) * Math.PI * 0.7;
      const branchLen = length * (0.35 + Math.random() * 0.35);
      branches.push(createCrack(x, y, branchAngle, branchLen, depth + 1));
    }
  }
  return { x, y, angle, length, branches };
}

function drawCrack(ctx: CanvasRenderingContext2D, crack: Crack, progress: number) {
  const currentLen = crack.length * progress;
  const endX = crack.x + Math.cos(crack.angle) * currentLen;
  const endY = crack.y + Math.sin(crack.angle) * currentLen;
  ctx.beginPath();
  ctx.moveTo(crack.x, crack.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  crack.branches.forEach((b) => {
    b.x = crack.x + Math.cos(crack.angle) * currentLen * 0.55;
    b.y = crack.y + Math.sin(crack.angle) * currentLen * 0.55;
    if (progress > 0.4) drawCrack(ctx, b, (progress - 0.4) / 0.6);
  });
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
    [-0.15, -0.25], [0.2, -0.1], [0.1, 0.2], [-0.25, 0.1],
  ];
  holes.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx * r, dy * r, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.4, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

export function IntroEngineH2({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const cracksRef = useRef<Crack[]>([]);
  const shardsRef = useRef<Shard[]>([]);

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

    const T_APPROACH = DURATION.dualApproach;
    const T_CLASH = T_APPROACH + DURATION.clash;
    const T_SHATTER = T_CLASH + DURATION.shatter;
    const T_AFTER = T_SHATTER + DURATION.after;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;

      if (elapsed < T_APPROACH) {
        // Two balls approaching from opposite sides
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, W, H);

        if (phaseRef.current === "dark") setPhase("converge");
        const t = elapsed / T_APPROACH;
        const eased = Math.pow(t, 2.5);
        const ballR = 6 + eased * Math.min(W, H) * 0.3;
        const maxR = Math.min(W, H) * 0.3;

        // Ball 1 from top-left
        const ball1StartX = -100;
        const ball1StartY = -80;
        const b1x = ball1StartX + (cx - ball1StartX) * eased;
        const b1y = ball1StartY + (cy - ball1StartY) * eased;
        // Motion blur trail
        for (let i = 0; i < 6; i++) {
          const tr = i / 6;
          ctx.globalAlpha = (1 - tr) * 0.25 * eased;
          const bx = ball1StartX + (cx - ball1StartX) * (eased - tr * 0.12);
          const by = ball1StartY + (cy - ball1StartY) * (eased - tr * 0.12);
          drawBall(ctx, bx, by, ballR * (1 - tr * 0.3), now * 0.015);
        }
        ctx.globalAlpha = 1;
        drawBall(ctx, b1x, b1y, Math.min(ballR, maxR), now * 0.015);

        // Ball 2 from bottom-right
        const ball2StartX = W + 100;
        const ball2StartY = H + 80;
        const b2x = ball2StartX + (cx - ball2StartX) * eased;
        const b2y = ball2StartY + (cy - ball2StartY) * eased;
        for (let i = 0; i < 6; i++) {
          const tr = i / 6;
          ctx.globalAlpha = (1 - tr) * 0.25 * eased;
          const bx = ball2StartX + (cx - ball2StartX) * (eased - tr * 0.12);
          const by = ball2StartY + (cy - ball2StartY) * (eased - tr * 0.12);
          drawBall(ctx, bx, by, ballR * (1 - tr * 0.3), -now * 0.015);
        }
        ctx.globalAlpha = 1;
        drawBall(ctx, b2x, b2y, Math.min(ballR, maxR), -now * 0.015);

        // Buildup glow in anticipation
        if (t > 0.82) {
          const f = (t - 0.82) / 0.18;
          ctx.fillStyle = `rgba(246, 255, 84, ${f * 0.45})`;
          ctx.fillRect(0, 0, W, H);
        }
      } else if (elapsed < T_CLASH) {
        // The mega clash
        const t = (elapsed - T_APPROACH) / DURATION.clash;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = `rgba(246, 255, 84, ${1 - t})`;
        ctx.fillRect(0, 0, W, H);

        if (cracksRef.current.length === 0) {
          // More complex crack pattern: 12 primary + web
          const crackCount = 12;
          for (let i = 0; i < crackCount; i++) {
            const angle = (i / crackCount) * Math.PI * 2 + Math.random() * 0.25;
            const length = Math.max(W, H) * (0.55 + Math.random() * 0.4);
            cracksRef.current.push(createCrack(cx, cy, angle, length));
          }
        }
      } else if (elapsed < T_SHATTER) {
        if (phaseRef.current === "converge") {
          setPhase("explode");
          shardsRef.current = Array.from({ length: 180 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 22 + 6;
            const cc = Math.random();
            const color = cc < 0.55 ? BRAND_YELLOW : cc < 0.85 ? "#ffffff" : BRAND_BLUE;
            return {
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.35,
              size: Math.random() * 14 + 3,
              life: 1,
              color,
              colorShift: Math.random(),
            };
          });
        }

        const t = (elapsed - T_CLASH) / DURATION.shatter;

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, W, H);

        // Cracks with progress
        const crackProgress = Math.min(1, t * 1.8);
        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = BRAND_YELLOW;
        cracksRef.current.forEach((c) => drawCrack(ctx, c, crackProgress));
        ctx.shadowBlur = 0;

        // Secondary thin web cracks (after primary)
        if (t > 0.25) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 - t * 0.3})`;
          ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++) {
            const r1 = Math.max(W, H) * 0.1 * i + 50;
            const r2 = Math.max(W, H) * 0.1 * i + 80;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 24) {
              const x = cx + Math.cos(a) * r1 + Math.sin(a * 3) * 8;
              const y = cy + Math.sin(a) * r1 + Math.cos(a * 3) * 8;
              if (a === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }

        // Central burst glow
        const burstAlpha = Math.max(0, 1 - t * 1.5);
        if (burstAlpha > 0) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
          grad.addColorStop(0, `rgba(255, 255, 255, ${burstAlpha})`);
          grad.addColorStop(0.4, `rgba(246, 255, 84, ${burstAlpha * 0.8})`);
          grad.addColorStop(0.8, `rgba(48, 110, 195, ${burstAlpha * 0.3})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }

        // Color-shifting shards
        shardsRef.current.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.97;
          s.vy *= 0.97;
          s.rotation += s.rotationSpeed;
          s.life -= 0.012;
          if (s.life > 0) {
            // Color shift from yellow → white → blue
            const phase = t + s.colorShift;
            let color = s.color;
            if (phase > 0.3 && phase < 0.7) color = "#ffffff";
            else if (phase >= 0.7) color = BRAND_BLUE;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.globalAlpha = s.life;
            ctx.fillStyle = color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = color;
            ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
            ctx.restore();
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // 3 shockwave rings
        for (let i = 0; i < 3; i++) {
          const ringR = t * Math.max(W, H) * (0.55 + i * 0.25);
          const ringAlpha = Math.max(0, 1 - t * 1.1) * (1 - i * 0.25);
          if (ringAlpha > 0) {
            ctx.globalAlpha = ringAlpha;
            ctx.strokeStyle = [BRAND_YELLOW, "#ffffff", BRAND_BLUE][i];
            ctx.lineWidth = 3.5 - i;
            ctx.shadowBlur = 22;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_AFTER) {
        const t = (elapsed - T_SHATTER) / DURATION.after;
        // Soft transition
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + t * 0.3})`;
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
