"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  approach: 1400,
  impact: 300,
  shatter: 1700,
};

interface Crack {
  x: number;
  y: number;
  angle: number;
  length: number;
  currentLength: number;
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
}

function createCrack(x: number, y: number, angle: number, length: number, depth = 0): Crack {
  const branches: Crack[] = [];
  if (depth < 2 && Math.random() < 0.6) {
    const branchCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < branchCount; i++) {
      const branchAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
      const branchLen = length * (0.4 + Math.random() * 0.3);
      branches.push(createCrack(x, y, branchAngle, branchLen, depth + 1));
    }
  }
  return { x, y, angle, length, currentLength: 0, branches };
}

function drawCrack(ctx: CanvasRenderingContext2D, crack: Crack, progress: number) {
  const currentLen = crack.length * progress;
  crack.currentLength = currentLen;
  const endX = crack.x + Math.cos(crack.angle) * currentLen;
  const endY = crack.y + Math.sin(crack.angle) * currentLen;
  ctx.beginPath();
  ctx.moveTo(crack.x, crack.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  crack.branches.forEach((b) => {
    b.x = crack.x + Math.cos(crack.angle) * currentLen * 0.6;
    b.y = crack.y + Math.sin(crack.angle) * currentLen * 0.6;
    if (progress > 0.5) {
      drawCrack(ctx, b, (progress - 0.5) * 2);
    }
  });
}

function drawBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
  grad.addColorStop(0, "#FFFF8E");
  grad.addColorStop(0.6, BRAND_YELLOW);
  grad.addColorStop(1, "#C4CE2F");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  const holes = [
    [0, -0.5], [0.45, -0.2], [0.5, 0.3], [0.2, 0.5],
    [-0.3, 0.45], [-0.5, 0.1], [-0.4, -0.35], [0, 0],
  ];
  holes.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(cx + dx * radius, cy + dy * radius, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.35, cy - radius * 0.35, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

export function IntroEngineH({ onPhaseChange }: IntroEngineProps) {
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

    const T_APPROACH = DURATION.approach;
    const T_IMPACT = T_APPROACH + DURATION.impact;
    const T_SHATTER = T_IMPACT + DURATION.shatter;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      if (elapsed < T_APPROACH) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        const t = elapsed / T_APPROACH;
        const eased = Math.pow(t, 3);
        const radius = 8 + eased * Math.min(w, h) * 0.3;
        const maxR = Math.min(w, h) * 0.3;

        const offsetX = Math.cos(t * Math.PI * 0.5) * w * 0.2 * (1 - t);
        const offsetY = Math.sin(t * Math.PI * 0.5) * h * 0.15 * (1 - t);

        for (let i = 0; i < 5; i++) {
          const trailT = i / 5;
          const trailR = radius * (1 - trailT * 0.3);
          const trailAlpha = (1 - trailT) * 0.3 * eased;
          ctx.globalAlpha = trailAlpha;
          drawBall(
            ctx,
            cx + offsetX * (1 + trailT * 0.3),
            cy + offsetY * (1 + trailT * 0.3),
            trailR
          );
        }
        ctx.globalAlpha = 1;
        drawBall(ctx, cx + offsetX, cy + offsetY, Math.min(radius, maxR));

        if (t > 0.85) {
          const f = (t - 0.85) / 0.15;
          ctx.fillStyle = `rgba(246, 255, 84, ${f * 0.3})`;
          ctx.fillRect(0, 0, w, h);
        }
      } else if (elapsed < T_IMPACT) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_APPROACH) / DURATION.impact;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = `rgba(246, 255, 84, ${1 - t})`;
        ctx.fillRect(0, 0, w, h);

        if (cracksRef.current.length === 0) {
          const crackCount = 9;
          for (let i = 0; i < crackCount; i++) {
            const angle = (i / crackCount) * Math.PI * 2 + Math.random() * 0.3;
            const length = Math.max(w, h) * (0.5 + Math.random() * 0.3);
            cracksRef.current.push(createCrack(cx, cy, angle, length));
          }
        }
      } else if (elapsed < T_SHATTER) {
        if (phaseRef.current === "converge") {
          setPhase("explode");
          shardsRef.current = Array.from({ length: 120 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 18 + 5;
            return {
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.3,
              size: Math.random() * 12 + 3,
              life: 1,
            };
          });
        }

        const t = (elapsed - T_IMPACT) / DURATION.shatter;

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        const crackProgress = Math.min(1, t * 2);
        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = BRAND_YELLOW;
        cracksRef.current.forEach((c) => drawCrack(ctx, c, crackProgress));
        ctx.shadowBlur = 0;

        const burstAlpha = Math.max(0, 1 - t * 1.5);
        if (burstAlpha > 0) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
          grad.addColorStop(0, `rgba(255, 255, 255, ${burstAlpha})`);
          grad.addColorStop(0.5, `rgba(246, 255, 84, ${burstAlpha * 0.7})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }

        shardsRef.current.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.97;
          s.vy *= 0.97;
          s.rotation += s.rotationSpeed;
          s.life -= 0.012;
          if (s.life > 0) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.globalAlpha = s.life;
            ctx.fillStyle = BRAND_YELLOW;
            ctx.shadowBlur = 6;
            ctx.shadowColor = BRAND_YELLOW;
            ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
            ctx.restore();
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        const ringR = t * Math.max(w, h);
        const ringAlpha = Math.max(0, 1 - t * 1.2);
        if (ringAlpha > 0) {
          ctx.globalAlpha = ringAlpha;
          ctx.strokeStyle = BRAND_BLUE;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = BRAND_BLUE;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
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
