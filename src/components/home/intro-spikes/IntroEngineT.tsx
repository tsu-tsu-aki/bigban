"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";
const BRAND_GOLD = "#E8D67C";

const DURATION = {
  enter: 900,
  dance: 2400,
  gather: 1200,
  release: 1100,
};

interface RibbonNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Ribbon {
  nodes: RibbonNode[];
  color: string;
  phase: number;
  freq: number;
  amp: number;
}

function smoothCurve(ctx: CanvasRenderingContext2D, nodes: RibbonNode[]) {
  if (nodes.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length - 1; i++) {
    const xc = (nodes[i].x + nodes[i + 1].x) / 2;
    const yc = (nodes[i].y + nodes[i + 1].y) / 2;
    ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
  }
  ctx.lineTo(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
  ctx.stroke();
}

export function IntroEngineT({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const ribbonsRef = useRef<Ribbon[]>([]);

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

    const colors = [BRAND_YELLOW, BRAND_BLUE, BRAND_GOLD, "#ffffff"];
    const nodeCount = 50;

    ribbonsRef.current = colors.map((color, idx) => {
      const startSide = idx % 2 === 0 ? -100 : W + 100;
      const nodes: RibbonNode[] = Array.from({ length: nodeCount }, (_, i) => ({
        x: startSide - i * 20 * (idx % 2 === 0 ? 1 : -1),
        y: H / 2 + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
      }));
      return {
        nodes,
        color,
        phase: idx * 1.2,
        freq: 0.7 + idx * 0.15,
        amp: 120 + idx * 30,
      };
    });

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_ENTER = DURATION.enter;
    const T_DANCE = T_ENTER + DURATION.dance;
    const T_GATHER = T_DANCE + DURATION.gather;
    const T_RELEASE = T_GATHER + DURATION.release;

    const drawRibbon = (r: Ribbon, alpha: number, lineWidth: number) => {
      // Multiple strokes with blur for glow effect
      for (let pass = 0; pass < 3; pass++) {
        const passAlpha = alpha * (pass === 0 ? 0.15 : pass === 1 ? 0.35 : 1);
        const passWidth = lineWidth * (pass === 0 ? 8 : pass === 1 ? 3 : 1);
        ctx.globalAlpha = passAlpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = passWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = pass === 0 ? 15 : 0;
        ctx.shadowColor = r.color;
        smoothCurve(ctx, r.nodes);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const Wp = window.innerWidth;
      const Hp = window.innerHeight;
      const cx = Wp / 2;
      const cy = Hp / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
      ctx.fillRect(0, 0, Wp, Hp);

      if (elapsed < T_ENTER) {
        const t = elapsed / T_ENTER;

        ribbonsRef.current.forEach((r, idx) => {
          // Entry from side, sinusoidal path
          r.nodes.forEach((n, i) => {
            const targetX = (idx % 2 === 0 ? -100 : Wp + 100) +
              t * (Wp / 2 - (idx % 2 === 0 ? -100 : Wp + 100)) +
              i * 25 * (idx % 2 === 0 ? 1 : -1);
            const targetY = cy + Math.sin(t * r.freq * Math.PI * 2 + r.phase + i * 0.15) * r.amp;
            n.x = targetX;
            n.y = targetY;
          });
          drawRibbon(r, t, 2);
        });
      } else if (elapsed < T_DANCE) {
        if (phaseRef.current === "dark") setPhase("converge");
        const t = (elapsed - T_ENTER) / DURATION.dance;

        ribbonsRef.current.forEach((r, idx) => {
          // Full choreography — figure-8 / lissajous paths
          r.nodes.forEach((n, i) => {
            const time = now * 0.0008 + i * 0.08 + r.phase;
            const sidePref = idx % 2 === 0 ? 1 : -1;
            const ampX = Wp * 0.3;
            const ampY = Hp * 0.25;

            // Combined lissajous + spatial offset by node index for ribbon curl
            const baseX = cx + Math.sin(time * r.freq) * ampX * sidePref;
            const baseY = cy + Math.sin(time * r.freq * 2 + r.phase) * ampY;

            // Ribbon tail offset
            const tailOffset = i * 18;
            const tailAngle = time * r.freq + i * 0.08;
            n.x = baseX - Math.cos(tailAngle) * tailOffset * sidePref;
            n.y = baseY - Math.sin(tailAngle * 2) * tailOffset * 0.6;
          });
          drawRibbon(r, 1, 2.5);
        });

        // Occasional sparkles along ribbon paths
        ribbonsRef.current.forEach((r) => {
          if (Math.random() < 0.3) {
            const idx = Math.floor(Math.random() * r.nodes.length);
            const n = r.nodes[idx];
            ctx.fillStyle = r.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = r.color;
            ctx.fillRect(n.x - 1, n.y - 1, 2, 2);
            ctx.shadowBlur = 0;
          }
        });
      } else if (elapsed < T_GATHER) {
        const t = (elapsed - T_DANCE) / DURATION.gather;
        const eased = t * t;

        // Ribbons wrap around center
        ribbonsRef.current.forEach((r, idx) => {
          r.nodes.forEach((n, i) => {
            const angle = (i / r.nodes.length) * Math.PI * 2 + (idx * Math.PI) / 2 + t * Math.PI * 2;
            const radius = Math.min(Wp, Hp) * (0.3 - eased * 0.18) + Math.sin(t * Math.PI + i * 0.2) * 20;
            const prevX = n.x;
            const prevY = n.y;
            const targetX = cx + Math.cos(angle) * radius;
            const targetY = cy + Math.sin(angle) * radius;
            n.x = prevX + (targetX - prevX) * (0.1 + eased * 0.2);
            n.y = prevY + (targetY - prevY) * (0.1 + eased * 0.2);
          });
          drawRibbon(r, 1, 2.5 - eased);
        });

        // Center light grows
        const coreR = eased * 100;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${eased * 0.8})`);
        grad.addColorStop(0.5, `rgba(246, 255, 84, ${eased * 0.5})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < T_RELEASE) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_GATHER) / DURATION.release;

        // Ribbons scatter outward and fade
        ribbonsRef.current.forEach((r, idx) => {
          r.nodes.forEach((n, i) => {
            const angle = (i / r.nodes.length) * Math.PI * 2 + (idx * Math.PI) / 2;
            const radius = Math.min(Wp, Hp) * 0.12 + t * Math.max(Wp, Hp) * 0.6;
            n.x = cx + Math.cos(angle) * radius;
            n.y = cy + Math.sin(angle) * radius;
          });
          drawRibbon(r, 1 - t, 2 - t);
        });

        // Central bloom
        const bloomAlpha = Math.max(0, 1 - t * 1.3);
        const bloomR = 100 + t * 300;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${bloomAlpha * 0.8})`);
        grad.addColorStop(0.3, `rgba(246, 255, 84, ${bloomAlpha * 0.5})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Wp, Hp);
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
