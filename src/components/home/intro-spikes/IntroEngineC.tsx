"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  dot: 500,
  cross: 900,
  expand: 900,
  vortex: 1000,
  burst: 1300,
};

export function IntroEngineC({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const burstParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }>>([]);

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

    const T_DOT = DURATION.dot;
    const T_CROSS = T_DOT + DURATION.cross;
    const T_EXPAND = T_CROSS + DURATION.expand;
    const T_VORTEX = T_EXPAND + DURATION.vortex;
    const T_BURST = T_VORTEX + DURATION.burst;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(w, h) * 0.25;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_DOT) {
        // Point appears (pulsing)
        const t = elapsed / T_DOT;
        const pulseSize = 4 + Math.sin(t * Math.PI * 6) * 2;
        ctx.globalAlpha = t;
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_CROSS) {
        // Cross beams grow
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_DOT) / DURATION.cross;
        const len = maxRadius * 2 * Math.min(1, t);

        ctx.shadowBlur = 12;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 1;

        // Horizontal beam
        ctx.beginPath();
        ctx.moveTo(cx - len, cy);
        ctx.lineTo(cx + len, cy);
        ctx.stroke();
        // Vertical beam
        ctx.beginPath();
        ctx.moveTo(cx, cy - len);
        ctx.lineTo(cx, cy + len);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = BRAND_YELLOW;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_EXPAND) {
        // Cross morphs to circle outline
        const t = (elapsed - T_CROSS) / DURATION.expand;
        const crossLen = maxRadius * 2 * (1 - t * 0.3);
        const circleRadius = maxRadius * 2 * t;

        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_BLUE;
        ctx.globalAlpha = 1 - t * 0.5;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - crossLen, cy);
        ctx.lineTo(cx + crossLen, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - crossLen);
        ctx.lineTo(cx, cy + crossLen);
        ctx.stroke();

        // Portal circle
        ctx.globalAlpha = t;
        ctx.shadowBlur = 30;
        ctx.shadowColor = BRAND_BLUE;
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fill
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, circleRadius);
        gradient.addColorStop(0, `rgba(246, 255, 84, ${t * 0.4})`);
        gradient.addColorStop(0.6, `rgba(48, 110, 195, ${t * 0.3})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.shadowBlur = 0;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_VORTEX) {
        // Rotating vortex inside portal
        const t = (elapsed - T_EXPAND) / DURATION.vortex;
        const circleRadius = maxRadius * 2;

        // Portal outline
        ctx.shadowBlur = 30;
        ctx.shadowColor = BRAND_BLUE;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Vortex arms
        ctx.shadowBlur = 15;
        ctx.shadowColor = BRAND_YELLOW;
        const rotation = t * Math.PI * 4;
        for (let i = 0; i < 3; i++) {
          const baseAngle = rotation + (i * Math.PI * 2) / 3;
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = i === 0 ? BRAND_YELLOW : "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let r = 2; r < circleRadius; r += 2) {
            const angle = baseAngle + (r / circleRadius) * Math.PI * 3;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (r === 2) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Center charge buildup
        const chargeRadius = 5 + t * 40;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, chargeRadius);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${t})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, chargeRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_BURST) {
        // Burst particles out of portal
        if (phaseRef.current === "converge") {
          setPhase("explode");
          burstParticlesRef.current = Array.from({ length: 200 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 5 + 3) * 3;
            const cc = Math.random();
            const color = cc < 0.4 ? BRAND_YELLOW : cc < 0.75 ? BRAND_BLUE : "#ffffff";
            return {
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              size: Math.random() * 3 + 1,
              color,
            };
          });
        }

        const t = (elapsed - T_VORTEX) / DURATION.burst;
        const portalOpacity = Math.max(0, 1 - t * 1.5);
        const portalRadius = maxRadius * 2 * (1 - t * 0.3);

        // Fading portal
        if (portalOpacity > 0) {
          ctx.globalAlpha = portalOpacity;
          ctx.shadowBlur = 25;
          ctx.shadowColor = BRAND_BLUE;
          ctx.strokeStyle = BRAND_BLUE;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, portalRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Central flash
        const flashAlpha = Math.max(0, 1 - t * 2);
        if (flashAlpha > 0) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 280);
          grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
          grad.addColorStop(0.5, `rgba(246, 255, 84, ${flashAlpha * 0.8})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }

        // Particles
        burstParticlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.life -= 0.012;
          if (p.life > 0) {
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }
        });
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
