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
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    life: Math.random() * 1000,
    maxLife: 1000,
    size: Math.random() * 3 + 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.7 + 0.1,
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
      const isConverging = elapsed >= dark && elapsed < dark + converge;

      ctx.globalCompositeOperation = "source-over";

      if (isConverging) {
        const convergeProgress = (elapsed - dark) / converge;
        const trailAlpha = 0.15 - convergeProgress * 0.1;
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.05, trailAlpha)})`;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);
      }

      if (elapsed < dark) {
        setPhase("dark");
        ctx.globalCompositeOperation = "lighter";
        for (const star of starsRef.current) {
          star.life += 16;
          star.x += star.vx;
          star.y += star.vy;
          const twinkle = Math.sin(star.life * 0.003) * 0.5 + 0.5;
          ctx.globalAlpha = star.alpha * twinkle;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      } else if (elapsed < dark + converge) {
        setPhase("converge");
        const progress = (elapsed - dark) / converge;
        const eased = progress * progress * progress;

        ctx.globalCompositeOperation = "lighter";

        for (const star of starsRef.current) {
          const dx = cx - star.x;
          const dy = cy - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = 0.3 + (star.size / 3) * 0.7;
          const particleEased = Math.min(1, eased * speed * 1.5);

          const drawX = star.x + dx * particleEased;
          const drawY = star.y + dy * particleEased;

          star.life += 16;

          // #7: Color temperature shift — blue → white → yellow
          let coreColor: string;
          let glowColor: string;
          if (progress < 0.4) {
            coreColor = star.color;
            glowColor = `rgba(160, 184, 224, ${star.alpha * 0.5})`;
          } else if (progress < 0.7) {
            const t = (progress - 0.4) / 0.3;
            const r = Math.round(200 + t * 55);
            const g = Math.round(220 + t * 35);
            coreColor = `rgb(${r}, ${g}, 255)`;
            glowColor = `rgba(${r}, ${g}, 255, ${star.alpha * 0.6})`;
          } else {
            const t = (progress - 0.7) / 0.3;
            const r = 255;
            const g = Math.round(255 - t * 10);
            const b = Math.round(255 - t * 170);
            coreColor = `rgb(${r}, ${g}, ${b})`;
            glowColor = `rgba(${r}, ${g}, ${b}, ${star.alpha * 0.7})`;
          }

          const glowRadius = star.size * (1.5 + progress * 2.5);
          const alpha = star.alpha * (0.8 + progress * 1.5);

          const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowRadius);
          grad.addColorStop(0, coreColor);
          grad.addColorStop(0.4, glowColor);
          grad.addColorStop(1, "transparent");

          ctx.globalAlpha = Math.min(1, alpha);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(drawX, drawY, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = Math.min(1, alpha * 1.5);
          ctx.fillStyle = coreColor;
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
        const glowSize = 20 + progress * 80;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        const centerR = Math.round(48 + progress * 207);
        const centerG = Math.round(110 + progress * 145);
        const centerB = Math.round(195 + progress * 60);
        gradient.addColorStop(0, `rgba(${centerR}, ${centerG}, ${centerB}, ${0.3 + progress * 0.7})`);
        gradient.addColorStop(0.4, `rgba(255, 255, 200, ${progress * 0.4})`);
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

        // #4: Multiple shockwave rings
        const maxRadius = Math.max(w, h) * 0.6;
        for (let ring = 0; ring < 3; ring++) {
          const ringDelay = ring * 0.15;
          const ringProgress = Math.max(0, progress - ringDelay) / (1 - ringDelay);
          if (ringProgress <= 0 || ringProgress >= 1) continue;
          const shockwaveRadius = ringProgress * maxRadius;
          const ringAlpha = (1 - ringProgress) * (1 - ring * 0.3);
          ctx.globalAlpha = Math.max(0, ringAlpha);
          ctx.strokeStyle = ring === 0 ? "#ffffff" : COLORS[1];
          ctx.lineWidth = 3 - ring;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalCompositeOperation = "lighter";
        for (const p of explosionParticlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.vy += 0.02;
          p.life -= 0.012;

          if (p.life > 0) {
            const glowRadius = p.size * p.life * 2.5;
            const alpha = p.life * p.alpha;

            // Color shift: white → blue as particles cool
            const coolT = 1 - p.life;
            const r = Math.round(255 - coolT * 95);
            const g = Math.round(255 - coolT * 35);
            const b = 255;
            const coreColor = `rgb(${r}, ${g}, ${b})`;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
            grad.addColorStop(0, coreColor);
            grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
            grad.addColorStop(1, "transparent");

            ctx.globalAlpha = Math.min(1, alpha);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = Math.min(1, alpha * 1.5);
            ctx.fillStyle = coreColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalCompositeOperation = "source-over";
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
