"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  boot: 700,
  scan: 1500,
  materialize: 1400,
  lock: 1000,
};

const TITLE = "THE PICKLE BANG THEORY";

export function IntroEngineN({ onPhaseChange }: IntroEngineProps) {
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
    const T_SCAN = T_BOOT + DURATION.scan;
    const T_MAT = T_SCAN + DURATION.materialize;
    const T_LOCK = T_MAT + DURATION.lock;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Horizontal scan grid (always present)
      const gridAlpha = elapsed < T_BOOT ? (elapsed / T_BOOT) * 0.1 : 0.1;
      ctx.globalAlpha = gridAlpha;
      ctx.strokeStyle = BRAND_BLUE;
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (elapsed < T_BOOT) {
        // Boot — floor base ellipse
        const t = elapsed / T_BOOT;
        const baseRadiusX = 200 * t;
        const baseRadiusY = 30 * t;

        ctx.globalAlpha = t;
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_BLUE;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 150, baseRadiusX, baseRadiusY, 0, 0, Math.PI * 2);
        ctx.stroke();

        const grad = ctx.createRadialGradient(cx, cy + 150, 0, cx, cy + 150, baseRadiusX);
        grad.addColorStop(0, `rgba(48, 110, 195, ${t * 0.3})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.shadowBlur = 0;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 150, baseRadiusX, baseRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_SCAN) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_BOOT) / DURATION.scan;

        // Base ellipse persistent
        ctx.globalAlpha = 1;
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_BLUE;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 150, 200, 30, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vertical scan line rising from base
        const scanY = cy + 150 - t * 250;

        // Beam glow
        const beamGrad = ctx.createLinearGradient(0, scanY, 0, scanY + 50);
        beamGrad.addColorStop(0, BRAND_YELLOW);
        beamGrad.addColorStop(0.5, `${BRAND_YELLOW}88`);
        beamGrad.addColorStop(1, "rgba(246, 255, 84, 0)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(cx - 180, scanY, 360, 60);

        // Scan line
        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 25;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.moveTo(cx - 200, scanY);
        ctx.lineTo(cx + 200, scanY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Progressively drawn hologram wireframe from bottom up to current scan line
        const holoBottom = cy + 150;
        const holoHeight = 250;
        const currentHeight = t * holoHeight;

        ctx.strokeStyle = `rgba(48, 110, 195, 0.7)`;
        ctx.lineWidth = 1;

        // Side silhouette wireframe
        const lineCount = Math.floor(currentHeight / 12);
        for (let i = 0; i < lineCount; i++) {
          const y = holoBottom - i * 12;
          const widthFactor = 1 - (i / (holoHeight / 12)) * 0.7;
          const width = 180 * widthFactor;
          ctx.globalAlpha = 0.5 + Math.sin(now * 0.01 + i) * 0.2;
          ctx.beginPath();
          ctx.moveTo(cx - width, y);
          ctx.lineTo(cx + width, y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (elapsed < T_MAT) {
        // Materializing — solid holo shape with scan artifacts
        const t = (elapsed - T_SCAN) / DURATION.materialize;

        // Base
        ctx.strokeStyle = BRAND_BLUE;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = BRAND_BLUE;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 150, 200, 30, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Hologram title text with scan glitches
        const fontSize = Math.min(w / 18, 48);
        ctx.font = `900 ${fontSize}px "Orbitron", "Inter", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Cyan split
        ctx.globalAlpha = 0.5 + t * 0.4;
        ctx.fillStyle = BRAND_BLUE;
        ctx.fillText(TITLE, cx - 3, cy);
        // Yellow split
        ctx.fillStyle = BRAND_YELLOW;
        ctx.fillText(TITLE, cx + 3, cy);
        // Main
        ctx.globalAlpha = t;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(TITLE, cx, cy);

        // Scan lines across text
        for (let y = cy - fontSize; y < cy + fontSize; y += 4) {
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = "#000000";
          ctx.fillRect(cx - 400, y, 800, 2);
        }

        // Moving scan line
        const scanY = cy - fontSize + ((elapsed * 0.2) % (fontSize * 2));
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = BRAND_YELLOW;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.beginPath();
        ctx.moveTo(cx - 400, scanY);
        ctx.lineTo(cx + 400, scanY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Light pillars from base
        for (let i = -2; i <= 2; i++) {
          const px = cx + i * 60;
          const pillarGrad = ctx.createLinearGradient(0, cy + 150, 0, cy - 100);
          pillarGrad.addColorStop(0, `rgba(48, 110, 195, ${0.4 * t})`);
          pillarGrad.addColorStop(1, "rgba(48, 110, 195, 0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = pillarGrad;
          ctx.fillRect(px - 1, cy - 100, 2, 250);
        }
        ctx.globalAlpha = 1;
      } else if (elapsed < T_LOCK) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_MAT) / DURATION.lock;

        // Full lock + energy surge
        const fontSize = Math.min(w / 18, 48);
        ctx.font = `900 ${fontSize}px "Orbitron", "Inter", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.globalAlpha = Math.max(0, 1 - t);
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 20 + t * 30;
        ctx.shadowColor = BRAND_YELLOW;
        ctx.fillText(TITLE, cx, cy);
        ctx.shadowBlur = 0;

        // Energy surge upward
        const surgeAlpha = Math.max(0, 1 - t * 1.3);
        const surgeGrad = ctx.createLinearGradient(0, cy + 150, 0, cy - 200);
        surgeGrad.addColorStop(0, `rgba(48, 110, 195, ${surgeAlpha * 0.8})`);
        surgeGrad.addColorStop(0.5, `rgba(246, 255, 84, ${surgeAlpha * 0.5})`);
        surgeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = surgeGrad;
        ctx.fillRect(cx - 400, cy - 200, 800, 400);

        // Flash
        if (t > 0.5) {
          const f = (t - 0.5) * 2;
          ctx.fillStyle = `rgba(246, 255, 84, ${f * 0.5 * (1 - f)})`;
          ctx.fillRect(0, 0, w, h);
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
