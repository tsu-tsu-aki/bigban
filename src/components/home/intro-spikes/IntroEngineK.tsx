"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

const DURATION = {
  build: 1200,
  connect: 1400,
  pulse: 1200,
  burst: 1200,
};

interface Node {
  x: number;
  y: number;
  size: number;
  bornAt: number;
  activation: number;
}

interface Edge {
  a: number;
  b: number;
  progress: number;
  bornAt: number;
  pulsePos: number;
  pulseActive: boolean;
}

export function IntroEngineK({ onPhaseChange }: IntroEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

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

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Create nodes in a loose clustered grid
    const nodeCount = 44;
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const ring = Math.floor(i / 10);
      const ringRadius = 80 + ring * 120;
      const angle = (i % 10) * ((Math.PI * 2) / 10) + ring * 0.3;
      nodes.push({
        x: w / 2 + Math.cos(angle) * ringRadius + (Math.random() - 0.5) * 40,
        y: h / 2 + Math.sin(angle) * ringRadius + (Math.random() - 0.5) * 40,
        size: 2 + Math.random() * 3,
        bornAt: i * 25,
        activation: 0,
      });
    }
    nodesRef.current = nodes;

    // Create edges between nearest nodes
    const edges: Edge[] = [];
    nodes.forEach((n, i) => {
      const distances = nodes
        .map((m, j) => ({ j, d: i === j ? Infinity : Math.hypot(m.x - n.x, m.y - n.y) }))
        .sort((x, y) => x.d - y.d);
      for (let k = 0; k < 3; k++) {
        const target = distances[k];
        if (!target || target.d > 250) continue;
        if (!edges.some((e) => (e.a === i && e.b === target.j) || (e.a === target.j && e.b === i))) {
          edges.push({
            a: i,
            b: target.j,
            progress: 0,
            bornAt: 600 + i * 15,
            pulsePos: 0,
            pulseActive: false,
          });
        }
      }
    });
    edgesRef.current = edges;

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_BUILD = DURATION.build;
    const T_CONNECT = T_BUILD + DURATION.connect;
    const T_PULSE = T_CONNECT + DURATION.pulse;
    const T_BURST = T_PULSE + DURATION.burst;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < T_BUILD) {
        // Nodes appear
        nodes.forEach((n) => {
          const age = elapsed - n.bornAt;
          if (age < 0) return;
          const t = Math.min(1, age / 400);
          ctx.globalAlpha = t;
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 10;
          ctx.shadowColor = BRAND_BLUE;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * t, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_CONNECT) {
        if (phaseRef.current === "dark") setPhase("converge");
        const localElapsed = elapsed - T_BUILD;

        // Nodes
        nodes.forEach((n) => {
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 8;
          ctx.shadowColor = BRAND_BLUE;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Edges drawing
        edges.forEach((e) => {
          const age = localElapsed - (e.bornAt - T_BUILD);
          if (age < 0) return;
          e.progress = Math.min(1, age / 400);
          const na = nodes[e.a];
          const nb = nodes[e.b];
          const ex = na.x + (nb.x - na.x) * e.progress;
          const ey = na.y + (nb.y - na.y) * e.progress;
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = BRAND_BLUE;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 6;
          ctx.shadowColor = BRAND_BLUE;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_PULSE) {
        // Pulses travel through edges
        const t = (elapsed - T_CONNECT) / DURATION.pulse;

        // Static edges
        edges.forEach((e) => {
          const na = nodes[e.a];
          const nb = nodes[e.b];
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = BRAND_BLUE;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        });

        // Nodes pulsing
        nodes.forEach((n, i) => {
          const dist = Math.hypot(n.x - cx, n.y - cy);
          const delay = dist * 0.003;
          const localT = Math.max(0, t - delay);
          n.activation = Math.max(0, 1 - localT);

          ctx.globalAlpha = 1;
          ctx.fillStyle = n.activation > 0.3 ? BRAND_YELLOW : "#ffffff";
          ctx.shadowBlur = 10 + n.activation * 20;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size + n.activation * 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Pulse travelers on edges
        edges.forEach((e) => {
          const na = nodes[e.a];
          const nb = nodes[e.b];
          const edgeT = (t * 2 + (e.a * 0.02)) % 1;
          if (edgeT < 0.95) {
            const px = na.x + (nb.x - na.x) * edgeT;
            const py = na.y + (nb.y - na.y) * edgeT;
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = BRAND_YELLOW;
            ctx.shadowBlur = 15;
            ctx.shadowColor = BRAND_YELLOW;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (elapsed < T_BURST) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_PULSE) / DURATION.burst;

        // Massive activation — everything glows
        nodes.forEach((n) => {
          const scale = 1 + t * 3;
          ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
          ctx.fillStyle = BRAND_YELLOW;
          ctx.shadowBlur = 40;
          ctx.shadowColor = BRAND_YELLOW;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * scale, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Central flash
        const flashAlpha = Math.max(0, 1 - t * 1.5);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        grad.addColorStop(0.4, `rgba(246, 255, 84, ${flashAlpha * 0.7})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
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
