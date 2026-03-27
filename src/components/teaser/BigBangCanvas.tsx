"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { BigBangEngineProps, AnimationPhase } from "./types";
import { DURATION_MS } from "./types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

const COLORS = ["#ffffff", "#c8dcff", "#a0b8e0", "#8090c0"];

function createStars(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
    life: Math.random() * 1000,
    maxLife: 1000,
    size: Math.random() * 2 + 0.5,
    color: "#ffffff",
    alpha: Math.random() * 0.6 + 0.1,
  }));
}

function createExplosionParticles(
  count: number,
  cx: number,
  cy: number
): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 4 + 1) * 3;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: Math.random() * 3 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
    };
  });
}

export function BigBangCanvas({ onPhaseChange }: BigBangEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const starsRef = useRef<Particle[]>([]);
  const explosionParticlesRef = useRef<Particle[]>([]);

  const [isReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (isReducedMotion) {
      onPhaseChange("content");
    }
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

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (typeof ctx.scale === "function") {
        ctx.scale(dpr, dpr);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const isMobile = w < 768;
    const starCount = isMobile ? 80 : 200;
    const explosionCount = isMobile ? 300 : 800;

    starsRef.current = createStars(starCount, w, h);

    startTimeRef.current = performance.now();
    onPhaseChange("dark");
    setPhase("dark");

    let flashAlpha = 0;

    const { dark, converge, explode } = DURATION_MS;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < dark) {
        setPhase("dark");
        for (const star of starsRef.current) {
          star.life += 16;
          const twinkle = Math.sin(star.life * 0.003) * 0.5 + 0.5;
          ctx.globalAlpha = star.alpha * twinkle;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (elapsed < dark + converge) {
        setPhase("converge");
        const progress = (elapsed - dark) / converge;
        const eased = progress * progress;

        for (const star of starsRef.current) {
          const dx = cx - star.x;
          const dy = cy - star.y;
          const drawX = star.x + dx * eased;
          const drawY = star.y + dy * eased;

          ctx.globalAlpha = star.alpha * (1 + progress);
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * (1 - eased * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }

        const glowSize = 20 + progress * 40;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        gradient.addColorStop(0, `rgba(48, 110, 195, ${0.3 + progress * 0.5})`);
        gradient.addColorStop(1, "transparent");
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < dark + converge + explode) {
        setPhase("explode");
        const progress = (elapsed - dark - converge) / explode;

        if (explosionParticlesRef.current.length === 0) {
          explosionParticlesRef.current = createExplosionParticles(explosionCount, cx, cy);
          flashAlpha = 1;
        }

        if (flashAlpha > 0) {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = flashAlpha;
          ctx.fillStyle = COLORS[0];
          ctx.fillRect(0, 0, w, h);
          flashAlpha *= 0.85;
          ctx.globalCompositeOperation = "source-over";
        }

        const shockwaveRadius = progress * Math.max(w, h) * 0.6;
        ctx.globalAlpha = 1 - progress;
        ctx.strokeStyle = COLORS[0];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
        ctx.stroke();

        for (const p of explosionParticlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.vy += 0.02;
          p.life -= 0.012;

          if (p.life > 0) {
            ctx.globalAlpha = p.life * p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        setPhase("content");
        return;
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = window.requestAnimationFrame(animate);
    };

    animFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isReducedMotion, onPhaseChange, setPhase]);

  if (isReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="ビッグバン シネマティック演出"
      className="fixed inset-0 z-0"
    />
  );
}
