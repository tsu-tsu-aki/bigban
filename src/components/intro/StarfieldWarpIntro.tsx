"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { AnimationPhase } from "@/components/teaser/types";

/**
 * サイト訪問時の最初に再生されるイントロアニメーション。
 *
 * ハイパースペース・ワープ風のスターフィールド演出:
 *  1. drift  — 星がゆっくり手前へ流れる (静けさ)
 *  2. accel  — 加速し光条になる (色が青→白→黄へ推移)
 *  3. hyper  — 中央の放射フレアで突入を表現
 *  4. burst  — 画面フラッシュ + 3層衝撃波リング
 *  5. content (完了)
 *
 * `onPhaseChange` で外側の DOM 遷移 (ロゴ表示など) を同期する。
 * `prefers-reduced-motion` 時は即 `content` を呼び canvas を描画しない。
 */

interface WarpStar {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  colorT: number;
}

const DURATION = {
  drift: 900,
  accel: 1800,
  hyperspace: 700,
  burst: 1300,
};

const STAR_COUNT = 420;
const STAR_Z_MAX = 1400;

const BRAND_YELLOW = "#F6FF54";
const BRAND_BLUE = "#306EC3";

export interface StarfieldWarpIntroProps {
  onPhaseChange: (phase: AnimationPhase) => void;
}

export function StarfieldWarpIntro({ onPhaseChange }: StarfieldWarpIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase | null>(null);
  const startTimeRef = useRef<number>(0);
  const starsRef = useRef<WarpStar[]>([]);

  const [isReducedMotion] = useState(() => {
    /* istanbul ignore next -- SSR guard, test env always has window */
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
      /* istanbul ignore else -- defensive guard: 呼出元が phaseRef を確認してから呼ぶため else 分岐は通常通らない */
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
    /* istanbul ignore if -- React ref always set after first render */
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      // マルチモニター移動で DPR が変わる可能性があるため毎回取得
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    starsRef.current = Array.from({ length: STAR_COUNT }, () => {
      const z = Math.random() * STAR_Z_MAX;
      return {
        x: (Math.random() - 0.5) * window.innerWidth * 2,
        y: (Math.random() - 0.5) * window.innerHeight * 2,
        z,
        prevZ: z,
        colorT: Math.random(),
      };
    });

    setPhase("dark");
    startTimeRef.current = performance.now();

    const T_DRIFT = DURATION.drift;
    const T_ACCEL = T_DRIFT + DURATION.accel;
    const T_HYPER = T_ACCEL + DURATION.hyperspace;
    const T_BURST = T_HYPER + DURATION.burst;

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;

      // Motion trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(0, 0, W, H);

      if (elapsed < T_HYPER) {
        let speed = 1.5;
        let phaseProgress = 0;
        if (elapsed < T_DRIFT) {
          speed = 2;
        } else if (elapsed < T_ACCEL) {
          phaseProgress = (elapsed - T_DRIFT) / DURATION.accel;
          speed = 2 + Math.pow(phaseProgress, 2.5) * 60;
          if (phaseRef.current === "dark") setPhase("converge");
        } else {
          phaseProgress = 1;
          speed = 80;
        }

        starsRef.current.forEach((s) => {
          s.prevZ = s.z;
          s.z -= speed;
          if (s.z <= 0) {
            s.x = (Math.random() - 0.5) * W * 2;
            s.y = (Math.random() - 0.5) * H * 2;
            s.z = STAR_Z_MAX;
            s.prevZ = STAR_Z_MAX;
            s.colorT = Math.random();
          }

          const scale = 220 / s.z;
          const prevScale = 220 / s.prevZ;
          const sx = cx + s.x * scale;
          const sy = cy + s.y * scale;
          const psx = cx + s.x * prevScale;
          const psy = cy + s.y * prevScale;

          const alpha = Math.min(1, (STAR_Z_MAX - s.z) / STAR_Z_MAX + 0.25);
          let color: string;
          if (phaseProgress < 0.4) color = `rgba(200, 220, 255, ${alpha})`;
          else if (phaseProgress < 0.75) color = `rgba(255, 255, 255, ${alpha})`;
          else
            color =
              s.colorT < 0.6
                ? `rgba(246, 255, 84, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`;

          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(0.6, 3 - s.z / 400);
          ctx.beginPath();
          ctx.moveTo(psx, psy);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        });

        // Central radial flare at hyperspace peak (no cross streaks)
        if (phaseProgress > 0.75) {
          const f = (phaseProgress - 0.75) / 0.25;
          const flareGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
          flareGrad.addColorStop(0, `rgba(255, 255, 255, ${f * 0.9})`);
          flareGrad.addColorStop(0.4, `rgba(246, 255, 84, ${f * 0.5})`);
          flareGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = flareGrad;
          ctx.fillRect(0, 0, W, H);
        }
      } else if (elapsed < T_BURST) {
        if (phaseRef.current === "converge") setPhase("explode");
        const t = (elapsed - T_HYPER) / DURATION.burst;

        // Mega flash
        const flashAlpha = Math.max(0, 1 - t * 1.8);
        if (flashAlpha > 0) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
          grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
          grad.addColorStop(0.25, `rgba(246, 255, 84, ${flashAlpha * 0.85})`);
          grad.addColorStop(0.6, `rgba(48, 110, 195, ${flashAlpha * 0.35})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }

        // Triple shockwave rings
        for (let i = 0; i < 3; i++) {
          const ringR = t * Math.max(W, H) * (0.6 + i * 0.3);
          const ringAlpha = Math.max(0, 1 - t * 1.1) * (1 - i * 0.2);
          if (ringAlpha > 0) {
            ctx.globalAlpha = ringAlpha;
            ctx.strokeStyle = i === 0 ? BRAND_YELLOW : i === 1 ? "#ffffff" : BRAND_BLUE;
            ctx.lineWidth = 4 - i;
            ctx.shadowBlur = 25;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Stars continue (slowly) in background
        starsRef.current.forEach((s) => {
          s.z -= 2;
          const scale = 220 / Math.max(1, s.z);
          const sx = cx + s.x * scale;
          const sy = cy + s.y * scale;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - t) * 0.6})`;
          ctx.fillRect(sx, sy, 2, 2);
        });
      } else {
        // タブ非アクティブからの復帰などで elapsed が T_BURST を一気に超えた場合でも
        // 必ず content に遷移するよう、phaseRef のガードは付けない
        setPhase("content");
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

  if (isReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="ハイパースペース・ワープ シネマティック演出"
      className="w-full h-full"
    />
  );
}
