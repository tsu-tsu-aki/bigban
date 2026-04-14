"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BALL_YELLOW = "#FFEB3B";

const DURATION = {
  rally: 2800, // rallying back and forth
  smash: 400, // charge before final hit
  bang: 2300, // big bang explosion
};

interface HitFlash {
  x: number;
  y: number;
  bornAt: number;
  intensity: number;
}

export function IntroEngineY({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const flashesRef = useRef<HitFlash[]>([]);

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

    const T_RALLY = DURATION.rally;
    const T_SMASH = T_RALLY + DURATION.smash;
    const T_BANG = T_SMASH + DURATION.bang;

    // Rally path — 6 hits total (3 each side), accelerating
    const numHits = 6;
    const rallyPoints = Array.from({ length: numHits }, (_, i) => {
      const progress = i / (numHits - 1);
      const side = i % 2 === 0 ? -1 : 1; // alternate sides
      return {
        sideX: 0.2 + progress * 0.15, // distance from center increases
        hitTime: progress * T_RALLY,
        side,
      };
    });

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, W, H);

      if (elapsed < T_RALLY) {
        if (phaseRef.current === "dark") setPhase("converge");

        // Find current rally segment
        let ballX = 0;
        let ballY = cy;
        for (let i = 0; i < rallyPoints.length - 1; i++) {
          if (elapsed >= rallyPoints[i].hitTime && elapsed < rallyPoints[i + 1].hitTime) {
            const segT = (elapsed - rallyPoints[i].hitTime) /
              (rallyPoints[i + 1].hitTime - rallyPoints[i].hitTime);
            const fromX = cx + rallyPoints[i].sideX * W * rallyPoints[i].side;
            const toX = cx + rallyPoints[i + 1].sideX * W * rallyPoints[i + 1].side;
            ballX = fromX + (toX - fromX) * segT;
            // Parabolic arc
            ballY = cy - Math.sin(segT * Math.PI) * 150;
            break;
          }
        }

        // Spawn hit flash
        rallyPoints.forEach((p) => {
          if (
            Math.abs(elapsed - p.hitTime) < 30 &&
            !flashesRef.current.some((f) => Math.abs(f.bornAt - p.hitTime) < 50)
          ) {
            const idx = rallyPoints.indexOf(p);
            flashesRef.current.push({
              x: cx + p.sideX * W * p.side,
              y: cy,
              bornAt: now,
              intensity: 0.4 + (idx / numHits) * 0.6, // crescendo
            });
          }
        });

        // Draw flashes (fading)
        flashesRef.current = flashesRef.current.filter((f) => {
          const age = now - f.bornAt;
          if (age > 700) return false;
          const fadeT = age / 700;
          const r = 30 + fadeT * 80;
          const alpha = (1 - fadeT) * f.intensity;
          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(0.4, `rgba(246, 255, 84, ${alpha * 0.7})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
          ctx.fill();

          // Small shockwave rings
          ctx.strokeStyle = BRAND_YELLOW;
          ctx.lineWidth = 1;
          ctx.globalAlpha = (1 - fadeT) * 0.6;
          ctx.beginPath();
          ctx.arc(f.x, f.y, fadeT * 100, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          return true;
        });

        // Ball trail
        const ballR = 8 + (elapsed / T_RALLY) * 8;
        for (let i = 0; i < 5; i++) {
          const trailT = i / 5;
          ctx.globalAlpha = (1 - trailT) * 0.4;
          ctx.fillStyle = BALL_YELLOW;
          ctx.beginPath();
          ctx.arc(ballX - i * 3, ballY + i * 2, ballR * (1 - trailT * 0.2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Ball
        ctx.fillStyle = BALL_YELLOW;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Specular highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(ballX - ballR * 0.3, ballY - ballR * 0.35, ballR * 0.22, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_SMASH) {
        // Ball zooming toward viewer — charging up
        const t = (elapsed - T_RALLY) / DURATION.smash;
        const r = 30 + t * 120;

        // Intense white flash buildup
        ctx.fillStyle = `rgba(246, 255, 84, ${t * 0.5})`;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = BALL_YELLOW;
        ctx.shadowBlur = 40;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Speed lines converging to ball
        ctx.strokeStyle = `rgba(255, 255, 255, ${t * 0.6})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const x1 = cx + Math.cos(angle) * Math.max(W, H) * 0.8;
          const y1 = cy + Math.sin(angle) * Math.max(W, H) * 0.8;
          const x2 = cx + Math.cos(angle) * (r + 40);
          const y2 = cy + Math.sin(angle) * (r + 40);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (elapsed < T_BANG) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_SMASH) / DURATION.bang;

        // Massive explosion
        const flashAlpha = Math.max(0, 1 - t * 1.4);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        grad.addColorStop(0.2, `rgba(246, 255, 84, ${flashAlpha * 0.9})`);
        grad.addColorStop(0.6, `rgba(48, 110, 195, ${flashAlpha * 0.4})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Multi-ring shockwaves
        for (let i = 0; i < 4; i++) {
          const ringR = t * Math.max(W, H) * (0.5 + i * 0.2);
          const alpha = Math.max(0, 1 - t) * (1 - i * 0.2);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = [BRAND_YELLOW, "#ffffff", BRAND_BLUE, BRAND_YELLOW][i];
          ctx.lineWidth = 3 - i * 0.4;
          ctx.shadowBlur = 25;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Particles
        for (let i = 0; i < 200; i++) {
          const angle = (i / 200) * Math.PI * 2 + Math.random();
          const dist = t * Math.max(W, H) * (0.3 + Math.random() * 0.7);
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          ctx.globalAlpha = Math.max(0, 1 - t) * Math.random();
          ctx.fillStyle = Math.random() < 0.5 ? BRAND_YELLOW : "#ffffff";
          ctx.fillRect(x, y, 2, 2);
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
