"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BALL_YELLOW = "#FFEB3B";

const DURATION = {
  boot: 700,
  scanV: 900,
  scanH: 700,
  materialize: 1000,
  rotate: 900,
  burst: 1100,
};

export function IntroEngineN2({ onPhaseChange }: IntroEngineProps) {
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

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_BOOT = DURATION.boot;
    const T_SCAN_V = T_BOOT + DURATION.scanV;
    const T_SCAN_H = T_SCAN_V + DURATION.scanH;
    const T_MAT = T_SCAN_H + DURATION.materialize;
    const T_ROT = T_MAT + DURATION.rotate;
    const T_BURST = T_ROT + DURATION.burst;

    const drawHoloBall = (cx: number, cy: number, r: number, rot: number, materializeT: number) => {
      if (r < 1) return;

      // Wireframe (always visible)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const wireAlpha = 1 - materializeT * 0.4;
      ctx.strokeStyle = `rgba(48, 110, 195, ${wireAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = BRAND_BLUE;
      // Longitude lines
      for (let lon = 0; lon < 8; lon++) {
        const a = (lon / 8) * Math.PI;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * Math.abs(Math.cos(a)), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Latitude circles
      for (let lat = 1; lat < 5; lat++) {
        const y = (lat - 2.5) * r * 0.4;
        const rAtY = r * Math.sqrt(Math.max(0, 1 - (y / r) * (y / r)));
        ctx.beginPath();
        ctx.ellipse(0, y, rAtY, rAtY * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // Solid ball fades in
      if (materializeT > 0) {
        ctx.save();
        ctx.globalAlpha = materializeT;
        const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
        grad.addColorStop(0, "#FFFAA0");
        grad.addColorStop(0.5, BALL_YELLOW);
        grad.addColorStop(1, "#CCAC00");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

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

        ctx.globalAlpha = materializeT;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.4, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;
      const ballR = Math.min(W, H) * 0.16;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // Persistent grid
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = BRAND_BLUE;
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let x = 0; x < W; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (elapsed < T_BOOT) {
        // Boot — floor platform appears
        const t = elapsed / T_BOOT;
        ctx.globalAlpha = t;
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_BLUE;
        ctx.beginPath();
        ctx.ellipse(cx, cy + ballR * 1.3, ballR * 1.5 * t, ballR * 0.3 * t, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_SCAN_V) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Vertical scan line rises from platform
        const t = (elapsed - T_BOOT) / DURATION.scanV;

        // Platform
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_BLUE;
        ctx.beginPath();
        ctx.ellipse(cx, cy + ballR * 1.3, ballR * 1.5, ballR * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Scan line rising
        const scanY = cy + ballR * 1.3 - t * ballR * 2.6;

        const beamGrad = ctx.createLinearGradient(0, scanY, 0, scanY + 50);
        beamGrad.addColorStop(0, BRAND_YELLOW);
        beamGrad.addColorStop(0.5, `${BRAND_YELLOW}88`);
        beamGrad.addColorStop(1, "rgba(246, 255, 84, 0)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(cx - ballR * 1.5, scanY, ballR * 3, 50);

        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 25;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.moveTo(cx - ballR * 1.7, scanY);
        ctx.lineTo(cx + ballR * 1.7, scanY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Wireframe revealing
        drawHoloBall(cx, cy, ballR * t, 0, 0);
      } else if (elapsed < T_SCAN_H) {
        // Horizontal scan now
        const t = (elapsed - T_SCAN_V) / DURATION.scanH;

        // Wireframe ball
        drawHoloBall(cx, cy, ballR, t * Math.PI, 0);

        // Horizontal scan line
        const scanX = cx - ballR * 1.7 + t * ballR * 3.4;

        const beamGrad = ctx.createLinearGradient(scanX, 0, scanX + 50, 0);
        beamGrad.addColorStop(0, BRAND_YELLOW);
        beamGrad.addColorStop(0.5, `${BRAND_YELLOW}88`);
        beamGrad.addColorStop(1, "rgba(246, 255, 84, 0)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(scanX, cy - ballR * 1.3, 50, ballR * 2.6);

        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 25;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.moveTo(scanX, cy - ballR * 1.5);
        ctx.lineTo(scanX, cy + ballR * 1.5);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (elapsed < T_MAT) {
        // Materialize — solid ball fades in with glitch
        const t = (elapsed - T_SCAN_H) / DURATION.materialize;
        const rot = Math.PI + t * Math.PI * 0.5;

        // Glitch split
        if (Math.random() < 0.3 && t > 0.3) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.translate(-3, 0);
          drawHoloBall(cx, cy, ballR, rot, t);
          ctx.restore();
        }

        drawHoloBall(cx, cy, ballR, rot, t);

        // RGB split on edges
        ctx.save();
        ctx.globalAlpha = 0.3 * (1 - t);
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = BRAND_BLUE;
        ctx.beginPath();
        ctx.arc(cx - 3, cy, ballR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = BRAND_YELLOW;
        ctx.beginPath();
        ctx.arc(cx + 3, cy, ballR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (elapsed < T_ROT) {
        // Rotating fully materialized ball with holes glowing
        const t = (elapsed - T_MAT) / DURATION.rotate;
        const rot = 1.5 * Math.PI + t * Math.PI * 2;
        drawHoloBall(cx, cy, ballR, rot, 1);

        // Holes glow intensifying
        const glowR = ballR * (1.1 + t * 0.2);
        const grad = ctx.createRadialGradient(cx, cy, ballR * 0.9, cx, cy, glowR);
        grad.addColorStop(0, "rgba(0, 0, 0, 0)");
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${t * 0.4})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_BURST) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_ROT) / DURATION.burst;

        // Ball bursts into hologram particles
        const flashAlpha = Math.max(0, 1 - t * 1.4);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        grad.addColorStop(0.4, `rgba(246, 255, 84, ${flashAlpha * 0.8})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Hologram fragments flying out
        for (let i = 0; i < 80; i++) {
          const angle = (i / 80) * Math.PI * 2 + Math.random();
          const dist = t * Math.max(W, H) * (0.4 + Math.random() * 0.5);
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
          ctx.fillStyle = Math.random() < 0.5 ? BRAND_YELLOW : BRAND_BLUE;
          ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;

        // Scan lines across
        ctx.strokeStyle = `rgba(246, 255, 84, ${Math.max(0, 1 - t)})`;
        ctx.lineWidth = 1;
        for (let y = 0; y < H; y += 6) {
          ctx.beginPath();
          ctx.moveTo(0, y + (now * 0.3) % 6);
          ctx.lineTo(W, y + (now * 0.3) % 6);
          ctx.stroke();
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
