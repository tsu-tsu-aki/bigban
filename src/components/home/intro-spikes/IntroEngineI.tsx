"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const OFF_WHITE = "#E6E6E6";

const DURATION = {
  scatter: 1200,
  assemble: 1800,
  flash: 500,
  settle: 800,
};

type ShapeType = "square" | "circle" | "triangle" | "bar";

interface Shape {
  type: ShapeType;
  color: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  rotation: number;
  targetRotation: number;
  delay: number;
}

export function IntroEngineI({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const shapesRef = useRef<Shape[]>([]);

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

    // Build shapes: arrange in grid pattern for final logo-ish layout
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const gridSize = Math.min(w, h) * 0.4;
    const cellSize = gridSize / 5;

    const shapes: Shape[] = [];
    const types: ShapeType[] = ["square", "circle", "triangle", "bar"];
    const colors = [BRAND_YELLOW, BRAND_BLUE, OFF_WHITE, OFF_WHITE, BRAND_YELLOW];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (Math.random() < 0.5) continue;
        const targetX = cx - gridSize / 2 + col * cellSize + cellSize / 2;
        const targetY = cy - gridSize / 2 + row * cellSize + cellSize / 2;
        shapes.push({
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          startX: Math.random() * w,
          startY: Math.random() * h,
          targetX,
          targetY,
          size: cellSize * 0.7,
          rotation: Math.random() * Math.PI * 2,
          targetRotation: 0,
          delay: Math.random() * 0.5,
        });
      }
    }
    shapesRef.current = shapes;

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_SCATTER = DURATION.scatter;
    const T_ASSEMBLE = T_SCATTER + DURATION.assemble;
    const T_FLASH = T_ASSEMBLE + DURATION.flash;
    const T_SETTLE = T_FLASH + DURATION.settle;

    const drawShape = (shape: Shape, x: number, y: number, rotation: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = shape.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = shape.color;

      switch (shape.type) {
        case "square":
          ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(0, -shape.size / 2);
          ctx.lineTo(shape.size / 2, shape.size / 2);
          ctx.lineTo(-shape.size / 2, shape.size / 2);
          ctx.closePath();
          ctx.fill();
          break;
        case "bar":
          ctx.fillRect(-shape.size / 2, -shape.size / 8, shape.size, shape.size / 4);
          break;
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_SCATTER) {
        // Shapes drift into view randomly
        const t = elapsed / T_SCATTER;
        shapesRef.current.forEach((s) => {
          const alpha = Math.min(1, t * 2);
          const drift = Math.sin(t * Math.PI * 2 + s.delay) * 4;
          drawShape(s, s.startX + drift, s.startY + drift, s.rotation + t, alpha * 0.6);
        });
      } else if (elapsed < T_ASSEMBLE) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_SCATTER) / DURATION.assemble;

        shapesRef.current.forEach((s) => {
          const shapeT = Math.max(0, Math.min(1, (t - s.delay * 0.3) * 1.3));
          const eased = 1 - Math.pow(1 - shapeT, 3);

          const x = s.startX + (s.targetX - s.startX) * eased;
          const y = s.startY + (s.targetY - s.startY) * eased;
          const rot = s.rotation + (s.targetRotation - s.rotation) * eased;
          drawShape(s, x, y, rot, 1);
        });
      } else if (elapsed < T_FLASH) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_ASSEMBLE) / DURATION.flash;

        // All shapes locked, flash of light
        shapesRef.current.forEach((s) => {
          drawShape(s, s.targetX, s.targetY, 0, 1 - t * 0.5);
        });

        const flashAlpha = Math.sin(t * Math.PI);
        ctx.fillStyle = `rgba(246, 255, 84, ${flashAlpha * 0.7})`;
        ctx.fillRect(0, 0, w, h);
      } else if (elapsed < T_SETTLE) {
        const t = (elapsed - T_FLASH) / DURATION.settle;

        // Shapes fade
        shapesRef.current.forEach((s) => {
          drawShape(s, s.targetX, s.targetY, 0, 1 - t);
        });
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
