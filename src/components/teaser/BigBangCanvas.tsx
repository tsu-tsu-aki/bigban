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

function createStars(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
    life: Math.random() * 1000,
    maxLife: 1000,
    size: Math.random() * 2 + 0.5,
    color: "#ffffff",
    alpha: Math.random() * 0.6 + 0.1,
  }));
}

function getExplosionColors(style: BigBangEngineProps["config"]["explosionStyle"]): string[] {
  switch (style) {
    case "physics":
      return ["#ffffff", "#c8dcff", "#a0b8e0", "#8090c0"];
    case "neon":
      return ["#F6FF54", "#306EC3", "#F6FF54", "#11317B"];
    case "minimal":
      return ["#E6E6E6", "#cccccc", "#aaaaaa", "#888888"];
  }
}

function createExplosionParticles(
  count: number,
  cx: number,
  cy: number,
  colors: string[],
  speedMultiplier: number
): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 4 + 1) * speedMultiplier;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
    };
  });
}

export function BigBangCanvas({ config, onPhaseChange, logoSrc }: BigBangEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number>(0);
  const starsRef = useRef<Particle[]>([]);
  const explosionParticlesRef = useRef<Particle[]>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // prefers-reduced-motion チェック（同期的に初期化してレンダリングに反映）
  const [isReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const durations = DURATION_MS[config.duration];

  // prefers-reduced-motion 時はすぐに content フェーズへ
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

    // ロゴ画像を読み込み
    const logoImg = new Image();
    logoImg.src = logoSrc;
    logoImgRef.current = logoImg;

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

    // パーティクル数をデバイスに応じて調整
    const isMobile = w < 768;
    const starCount = isMobile ? 80 : 200;
    const explosionCount = isMobile ? 300 : 800;

    starsRef.current = createStars(starCount, w, h);

    startTimeRef.current = performance.now();
    // マウント時に dark フェーズを通知
    onPhaseChange("dark");
    setPhase("dark");

    const colors = getExplosionColors(config.explosionStyle);
    let shockwaveRadius = 0;
    let flashAlpha = 0;
    let logoAlpha = 0;
    let logoScale = 0;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const { dark, converge, explode, logo } = durations;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      // 背景: 黒
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Phase transitions
      if (elapsed < dark) {
        // Phase 1: Dark — 星の瞬き
        setPhase("dark");
        for (const star of starsRef.current) {
          star.life += 16;
          const twinkle = Math.sin(star.life * 0.003) * 0.5 + 0.5;
          ctx.globalAlpha = star.alpha * twinkle;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (elapsed < dark + converge) {
        // Phase 2: Converge — 星が中心に吸い寄せられる
        setPhase("converge");
        const progress = (elapsed - dark) / converge;
        const eased = progress * progress; // ease-in

        for (const star of starsRef.current) {
          const dx = cx - star.x;
          const dy = cy - star.y;
          const drawX = star.x + dx * eased;
          const drawY = star.y + dy * eased;

          ctx.globalAlpha = star.alpha * (1 + progress);
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * (1 - eased * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }

        // 中心の光点
        const glowSize = 20 + progress * 40;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        gradient.addColorStop(0, `rgba(48, 110, 195, ${0.3 + progress * 0.5})`);
        gradient.addColorStop(1, "transparent");
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (elapsed < dark + converge + explode) {
        // Phase 3: Explode — 爆発
        setPhase("explode");
        const progress = (elapsed - dark - converge) / explode;

        // 最初のフレームで爆発パーティクルを生成
        if (explosionParticlesRef.current.length === 0) {
          const speedMult = config.explosionStyle === "minimal" ? 1.5 : 3;
          const count = config.explosionStyle === "minimal" ? Math.floor(explosionCount * 0.4) : explosionCount;
          explosionParticlesRef.current = createExplosionParticles(count, cx, cy, colors, speedMult);
          flashAlpha = 1;
        }

        // フラッシュ
        if (flashAlpha > 0) {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = flashAlpha;
          ctx.fillStyle = colors[0];
          ctx.fillRect(0, 0, w, h);
          flashAlpha *= 0.85;
          ctx.globalCompositeOperation = "source-over";
        }

        // 衝撃波リング
        if (config.explosionStyle !== "minimal") {
          shockwaveRadius = progress * Math.max(w, h) * 0.6;
          ctx.globalAlpha = 1 - progress;
          ctx.strokeStyle = colors[0];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // パーティクル更新・描画
        ctx.globalCompositeOperation = config.explosionStyle === "neon" ? "lighter" : "source-over";
        for (const p of explosionParticlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.98;
          p.vy *= 0.98;
          if (config.explosionStyle === "physics") {
            p.vy += 0.02; // 微かな重力
          }
          p.life -= 0.012;

          if (p.life > 0) {
            ctx.globalAlpha = p.life * p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (elapsed < dark + converge + explode + logo) {
        // Phase 4: Logo — ロゴ惑星登場
        setPhase("logo");
        const progress = (elapsed - dark - converge - explode) / logo;
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out

        logoAlpha = eased;
        logoScale = eased;

        // 残留パーティクル
        ctx.globalCompositeOperation = config.explosionStyle === "neon" ? "lighter" : "source-over";
        for (const p of explosionParticlesRef.current) {
          p.x += p.vx * 0.3;
          p.y += p.vy * 0.3;
          p.life -= 0.005;
          if (p.life > 0) {
            ctx.globalAlpha = p.life * 0.3;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ブルーグロウオーラ
        ctx.globalCompositeOperation = "source-over";
        const auraSize = 250 * logoScale;
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraSize);
        aura.addColorStop(0, `rgba(48, 110, 195, ${0.15 * logoAlpha})`);
        aura.addColorStop(0.4, `rgba(17, 49, 123, ${0.06 * logoAlpha})`);
        aura.addColorStop(1, "transparent");
        ctx.globalAlpha = 1;
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, auraSize, 0, Math.PI * 2);
        ctx.fill();

        // ロゴ描画
        if (logoImgRef.current?.complete) {
          const img = logoImgRef.current;
          const logoH = Math.min(h * 0.35, 400) * logoScale;
          const logoW = (img.naturalWidth / img.naturalHeight) * logoH;
          ctx.globalAlpha = logoAlpha;
          ctx.drawImage(img, cx - logoW / 2, cy - logoH / 2, logoW, logoH);
        }
      } else {
        // Phase 5: Content
        setPhase("content");
        // アニメーションループ停止（content フェーズは React に委譲）
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
  }, [config, durations, isReducedMotion, logoSrc, setPhase]);

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
