"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const TITLE = "THE PICKLE BANG THEORY";
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@%&$";

const DURATION = {
  noise: 900,
  scramble: 1700,
  lock: 900,
  flash: 900,
};

export function IntroEngineG({ onPhaseChange }: IntroEngineProps) {
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

    const T_NOISE = DURATION.noise;
    const T_SCRAMBLE = T_NOISE + DURATION.scramble;
    const T_LOCK = T_SCRAMBLE + DURATION.lock;
    const T_FLASH = T_LOCK + DURATION.flash;

    // Per-character lock timing (staggered)
    const lockTimes = TITLE.split("").map(
      (_, i) => T_SCRAMBLE + ((DURATION.lock / TITLE.length) * i)
    );

    const drawText = (text: string, style: string, offsetX = 0, offsetY = 0) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const fontSize = Math.min(w / 12, 64);
      ctx.font = `900 ${fontSize}px "Orbitron", "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = style;
      ctx.fillText(text, w / 2 + offsetX, h / 2 + offsetY);
    };

    const drawNoise = (density: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < density; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 2;
        const shade = Math.random() < 0.5 ? 180 : 255;
        ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${Math.random() * 0.3})`;
        ctx.fillRect(x, y, size, size);
      }
    };

    const drawScanLines = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = "rgba(246, 255, 84, 0.04)";
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_NOISE) {
        // Pure noise
        drawNoise(1200);
        drawScanLines();
      } else if (elapsed < T_SCRAMBLE) {
        if (phaseRef.current === "dark") setPhase("converge");
        // Scrambled characters resolving
        const t = (elapsed - T_NOISE) / DURATION.scramble;
        const lockedCount = Math.floor(t * TITLE.length);

        let displayed = "";
        for (let i = 0; i < TITLE.length; i++) {
          if (i < lockedCount) {
            displayed += TITLE[i];
          } else {
            const ch = TITLE[i];
            if (ch === " ") displayed += " ";
            else displayed += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
        }

        // RGB split glitch
        const shakeX = (Math.random() - 0.5) * 8;
        const shakeY = (Math.random() - 0.5) * 4;
        drawText(displayed, "rgba(255, 0, 80, 0.85)", -3 + shakeX, shakeY);
        drawText(displayed, "rgba(0, 200, 255, 0.85)", 3 + shakeX, shakeY);
        drawText(displayed, "#ffffff", shakeX, shakeY);

        drawNoise(600);
        drawScanLines();

        // Occasional horizontal tear
        if (Math.random() < 0.15) {
          const tearY = Math.random() * h;
          const tearH = Math.random() * 30 + 10;
          ctx.fillStyle = "#F6FF54";
          ctx.globalAlpha = 0.2;
          ctx.fillRect(0, tearY, w, tearH);
          ctx.globalAlpha = 1;
        }
      } else if (elapsed < T_LOCK) {
        // All locked, mild glitch
        const glitchChance = (T_LOCK - elapsed) / DURATION.lock;
        const shakeX = (Math.random() - 0.5) * 4 * glitchChance;
        drawText(TITLE, "rgba(255, 0, 80, 0.6)", -2, 0);
        drawText(TITLE, "rgba(0, 200, 255, 0.6)", 2, 0);
        drawText(TITLE, "#F6FF54", shakeX, 0);
        drawNoise(200);
        drawScanLines();
      } else if (elapsed < T_FLASH) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_LOCK) / DURATION.flash;

        // Flash and fade
        const flashAlpha = Math.max(0, 1 - t * 1.5);
        ctx.fillStyle = `rgba(246, 255, 84, ${flashAlpha})`;
        ctx.fillRect(0, 0, w, h);

        if (t < 0.6) {
          drawText(TITLE, `rgba(0, 0, 0, ${1 - t * 1.5})`, 0, 0);
        }
        drawScanLines();
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
