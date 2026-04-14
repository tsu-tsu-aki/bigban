"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  scatter: 900,
  drift: 1800,
  align: 1400,
  lock: 900,
};

const PARTICLE_COUNT = 650;

interface DustParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  delay: number;
}

export function IntroEngineR({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<DustParticle[]>([]);

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
    const cx = W / 2;
    const cy = H / 2;

    const targets: { x: number; y: number }[] = [];
    const radius = Math.min(W, H) * 0.22;

    for (let i = 0; i < 260; i++) {
      const angle = (i / 260) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 4;
      targets.push({
        x: cx + Math.cos(angle) * (radius + jitter),
        y: cy + Math.sin(angle) * (radius + jitter),
      });
    }
    for (let i = 0; i < 140; i++) {
      const angle = (i / 140) * Math.PI * 2;
      const r = radius * 0.35 + (Math.random() - 0.5) * 3;
      targets.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      for (let j = 0; j < 20; j++) {
        const r = radius * 0.65 + (Math.random() - 0.5) * 8;
        targets.push({
          x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 15,
          y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 15,
        });
      }
    }
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.12;
      targets.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
      });
    }

    particlesRef.current = Array.from({ length: Math.min(PARTICLE_COUNT, targets.length) }, (_, i) => {
      const t = targets[i];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        targetX: t.x,
        targetY: t.y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.3,
        delay: Math.random() * 0.3,
      };
    });

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_SCATTER = DURATION.scatter;
    const T_DRIFT = T_SCATTER + DURATION.drift;
    const T_ALIGN = T_DRIFT + DURATION.align;
    const T_LOCK = T_ALIGN + DURATION.lock;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const Wp = window.innerWidth;
      const Hp = window.innerHeight;

      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(0, 0, Wp, Hp);

      if (elapsed < T_SCATTER) {
        const t = elapsed / T_SCATTER;
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          ctx.globalAlpha = p.alpha * t;
          ctx.fillStyle = "#E6E6E6";
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;
      } else if (elapsed < T_DRIFT) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_SCATTER) / DURATION.drift;

        particlesRef.current.forEach((p, i) => {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          const pullStrength = 0.005 + t * 0.015;
          const px = -dy / (dist || 1);
          const py = dx / (dist || 1);
          const swirl = 0.3 * (1 - t);

          p.vx += dx * pullStrength + px * swirl;
          p.vy += dy * pullStrength + py * swirl;
          p.vx *= 0.92;
          p.vy *= 0.92;
          p.x += p.vx;
          p.y += p.vy;

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = i % 15 === 0 ? BRAND_YELLOW : "#E6E6E6";
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;

        ctx.strokeStyle = `rgba(48, 110, 195, ${t * 0.08})`;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const startX = Wp / 2 + Math.cos(angle) * Math.max(Wp, Hp) * 0.7;
          const startY = Hp / 2 + Math.sin(angle) * Math.max(Wp, Hp) * 0.7;
          const midX = Wp / 2 + Math.cos(angle + 0.3) * Math.max(Wp, Hp) * 0.3;
          const midY = Hp / 2 + Math.sin(angle + 0.3) * Math.max(Wp, Hp) * 0.3;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(midX, midY, Wp / 2, Hp / 2);
          ctx.stroke();
        }
      } else if (elapsed < T_ALIGN) {
        const t = (elapsed - T_DRIFT) / DURATION.align;

        particlesRef.current.forEach((p, i) => {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.05;
          p.vy += dy * 0.05;
          p.vx *= 0.85;
          p.vy *= 0.85;
          p.x += p.vx;
          p.y += p.vy;

          const alpha = Math.min(1, p.alpha + t * 0.3);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = i % 10 === 0 ? BRAND_YELLOW : "#ffffff";
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;
      } else if (elapsed < T_LOCK) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_ALIGN) / DURATION.lock;

        particlesRef.current.forEach((p, i) => {
          p.x = p.targetX;
          p.y = p.targetY;
          const pulse = Math.sin(t * Math.PI * 4 + i * 0.05) * 0.3 + 0.7;
          ctx.globalAlpha = 1;
          ctx.fillStyle = i % 8 === 0 ? BRAND_YELLOW : "#ffffff";
          ctx.shadowBlur = 8 * pulse;
          ctx.shadowColor = i % 8 === 0 ? BRAND_YELLOW : BRAND_BLUE;
          ctx.fillRect(p.x, p.y, p.size * (1 + t), p.size * (1 + t));
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        const coreR = 40 + t * 80;
        const cx2 = Wp / 2;
        const cy2 = Hp / 2;
        const grad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, coreR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${t * 0.7})`);
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${t * 0.4})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx2, cy2, coreR, 0, Math.PI * 2);
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
