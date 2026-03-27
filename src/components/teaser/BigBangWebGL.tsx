"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import type { BigBangEngineProps, AnimationPhase } from "./types";
import { DURATION_MS } from "./types";

// ----- 爆発カラー設定 -----
function getExplosionColors(style: BigBangEngineProps["config"]["explosionStyle"]): number[] {
  switch (style) {
    case "physics":
      return [0xffffff, 0xc8dcff, 0xa0b8e0, 0x8090c0];
    case "neon":
      return [0xf6ff54, 0x306ec3, 0xf6ff54, 0x11317b];
    case "minimal":
      return [0xe6e6e6, 0xcccccc, 0xaaaaaa, 0x888888];
  }
}

// ----- BigBangScene: R3F シーン本体 -----
interface BigBangSceneProps {
  config: BigBangEngineProps["config"];
  onPhaseChange: (phase: AnimationPhase) => void;
  logoSrc: string;
}

function BigBangScene({ config, onPhaseChange, logoSrc }: BigBangSceneProps) {
  const { size } = useThree();
  const durations = DURATION_MS[config.duration];
  const phaseRef = useRef<AnimationPhase>("dark");
  const startTimeRef = useRef<number | null>(null);

  // ---- Stars ----
  const STAR_COUNT = size.width < 768 ? 80 : 200;
  const starPositions = useRef<Float32Array>(new Float32Array(STAR_COUNT * 3));
  const starAlphas = useRef<Float32Array>(new Float32Array(STAR_COUNT));
  const starLife = useRef<Float32Array>(new Float32Array(STAR_COUNT));

  // ---- Explosion particles ----
  const PARTICLE_COUNT = size.width < 768 ? 300 : 800;
  const particlePositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const particleVelocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const particleLife = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT));
  const particleColors = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const particleSizes = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT));
  const explosionInitialized = useRef(false);

  // ---- Three.js refs ----
  const starsRef = useRef<THREE.Points>(null);
  const starsGeoRef = useRef<THREE.BufferGeometry>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const particlesGeoRef = useRef<THREE.BufferGeometry>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const logoRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);

  const flashAlphaRef = useRef(0);
  const logoAlphaRef = useRef(0);
  const logoScaleRef = useRef(0);

  // シーン座標系: カメラ fov=60, z=8 → 画面半分の高さ ≈ 8 * tan(30°) ≈ 4.62
  const halfH = 8 * Math.tan((60 / 2) * (Math.PI / 180));
  const halfW = halfH * (size.width / size.height);

  // Star 初期化
  const starsInitialized = useRef(false);
  if (!starsInitialized.current) {
    const pos = starPositions.current;
    const al = starAlphas.current;
    const li = starLife.current;
    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * halfW * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * halfH * 2;
      pos[i * 3 + 2] = 0;
      al[i] = Math.random() * 0.6 + 0.1;
      li[i] = Math.random() * 1000;
    }
    starsInitialized.current = true;
  }

  // ロゴテクスチャ
  const logoTextureRef = useRef<THREE.Texture | null>(null);
  const logoTextureMounted = useRef(false);
  if (!logoTextureMounted.current) {
    const loader = new THREE.TextureLoader();
    loader.load(logoSrc, (texture) => {
      logoTextureRef.current = texture;
      if (logoRef.current) {
        const mat = logoRef.current.material as THREE.MeshBasicMaterial;
        mat.map = texture;
        mat.needsUpdate = true;
        // アスペクト比調整
        const img = texture.image as HTMLImageElement;
        if (img.width && img.height) {
          const aspect = img.width / img.height;
          logoRef.current.scale.x = aspect;
        }
      }
    });
    logoTextureMounted.current = true;
  }

  const setPhase = (phase: AnimationPhase) => {
    if (phaseRef.current !== phase) {
      phaseRef.current = phase;
      onPhaseChange(phase);
    }
  };

  useFrame(({ clock }) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = clock.getElapsedTime();
    }
    const elapsed = (clock.getElapsedTime() - startTimeRef.current) * 1000; // ms
    const { dark, converge, explode, logo } = durations;

    const stars = starsRef.current;
    const starsGeo = starsGeoRef.current;
    const particles = particlesRef.current;
    const particlesGeo = particlesGeoRef.current;
    const shockwave = shockwaveRef.current;
    const logoMesh = logoRef.current;
    const flash = flashRef.current;

    if (elapsed < dark) {
      // Phase 1: Dark — 星の瞬き
      setPhase("dark");
      if (stars) stars.visible = true;
      if (particles) particles.visible = false;
      if (shockwave) shockwave.visible = false;
      if (logoMesh) logoMesh.visible = false;
      if (flash) flash.visible = false;

      if (starsGeo) {
        const pos = starPositions.current;
        const li = starLife.current;
        const al = starAlphas.current;
        const sizes = starsGeo.attributes.size as THREE.BufferAttribute;
        const alphasAttr = starsGeo.attributes.alpha as THREE.BufferAttribute;

        for (let i = 0; i < STAR_COUNT; i++) {
          li[i] += 16;
          const twinkle = Math.sin(li[i] * 0.003) * 0.5 + 0.5;
          if (alphasAttr) alphasAttr.setX(i, al[i] * twinkle);
          if (sizes) sizes.setX(i, (Math.random() * 0.02 + 0.005));
          void pos;
        }
        if (alphasAttr) alphasAttr.needsUpdate = true;
        if (sizes) sizes.needsUpdate = true;
      }
    } else if (elapsed < dark + converge) {
      // Phase 2: Converge — 星が中心へ
      setPhase("converge");
      if (stars) stars.visible = true;
      if (particles) particles.visible = false;
      if (shockwave) shockwave.visible = false;
      if (logoMesh) logoMesh.visible = false;
      if (flash) flash.visible = false;

      const progress = (elapsed - dark) / converge;
      const eased = progress * progress;

      if (starsGeo) {
        const origPos = starPositions.current;
        const li = starLife.current;
        const al = starAlphas.current;
        const posAttr = starsGeo.attributes.position as THREE.BufferAttribute;
        const alphasAttr = starsGeo.attributes.alpha as THREE.BufferAttribute;

        for (let i = 0; i < STAR_COUNT; i++) {
          const ox = origPos[i * 3];
          const oy = origPos[i * 3 + 1];
          posAttr.setXYZ(i, ox + (0 - ox) * eased, oy + (0 - oy) * eased, 0);
          li[i] += 16;
          if (alphasAttr) alphasAttr.setX(i, al[i] * (1 + progress));
        }
        posAttr.needsUpdate = true;
        if (alphasAttr) alphasAttr.needsUpdate = true;
      }
    } else if (elapsed < dark + converge + explode) {
      // Phase 3: Explode
      setPhase("explode");
      if (stars) stars.visible = false;
      if (shockwave) shockwave.visible = true;
      if (logoMesh) logoMesh.visible = false;

      const progress = (elapsed - dark - converge) / explode;

      // 最初のフレームで爆発パーティクルを生成
      if (!explosionInitialized.current) {
        const colors = getExplosionColors(config.explosionStyle);
        const speedMult = config.explosionStyle === "minimal" ? 1.5 : 3;
        const count =
          config.explosionStyle === "minimal"
            ? Math.floor(PARTICLE_COUNT * 0.4)
            : PARTICLE_COUNT;

        const pos = particlePositions.current;
        const vel = particleVelocities.current;
        const life = particleLife.current;
        const col = particleColors.current;
        const sz = particleSizes.current;

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 4 + 1) * speedMult * 0.005;
          pos[i * 3] = 0;
          pos[i * 3 + 1] = 0;
          pos[i * 3 + 2] = 0;
          vel[i * 3] = Math.cos(angle) * speed;
          vel[i * 3 + 1] = Math.sin(angle) * speed;
          vel[i * 3 + 2] = 0;
          life[i] = 1;
          const c = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
          col[i * 3] = c.r;
          col[i * 3 + 1] = c.g;
          col[i * 3 + 2] = c.b;
          sz[i] = Math.random() * 0.03 + 0.01;
        }
        flashAlphaRef.current = 1;
        explosionInitialized.current = true;

        if (particles) particles.visible = true;
      }

      // フラッシュ
      if (flash) {
        if (flashAlphaRef.current > 0) {
          flash.visible = true;
          const mat = flash.material as THREE.MeshBasicMaterial;
          mat.opacity = flashAlphaRef.current;
          flashAlphaRef.current *= 0.85;
        } else {
          flash.visible = false;
        }
      }

      // 衝撃波スケール
      if (shockwave && config.explosionStyle !== "minimal") {
        const maxScale = Math.max(halfW, halfH) * 1.2;
        const s = progress * maxScale;
        shockwave.scale.set(s, s, 1);
        const mat = shockwave.material as THREE.MeshBasicMaterial;
        mat.opacity = 1 - progress;
        shockwave.visible = true;
      } else if (shockwave) {
        shockwave.visible = false;
      }

      // パーティクル更新
      if (particlesGeo) {
        const pos = particlePositions.current;
        const vel = particleVelocities.current;
        const life = particleLife.current;

        const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          if (life[i] <= 0) continue;
          pos[i * 3] += vel[i * 3];
          pos[i * 3 + 1] += vel[i * 3 + 1];
          vel[i * 3] *= 0.98;
          vel[i * 3 + 1] *= 0.98;
          if (config.explosionStyle === "physics") {
            vel[i * 3 + 1] -= 0.0001; // 微かな重力
          }
          life[i] -= 0.012;
          posAttr.setXYZ(i, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
        }
        posAttr.needsUpdate = true;

        const alphasAttr = particlesGeo.attributes.alpha as THREE.BufferAttribute;
        if (alphasAttr) {
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            alphasAttr.setX(i, Math.max(0, life[i]));
          }
          alphasAttr.needsUpdate = true;
        }
      }
    } else if (elapsed < dark + converge + explode + logo) {
      // Phase 4: Logo
      setPhase("logo");
      if (stars) stars.visible = false;
      if (shockwave) shockwave.visible = false;
      if (flash) flash.visible = false;

      const progress = (elapsed - dark - converge - explode) / logo;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out

      logoAlphaRef.current = eased;
      logoScaleRef.current = eased;

      // 残留パーティクル
      if (particlesGeo) {
        const pos = particlePositions.current;
        const vel = particleVelocities.current;
        const life = particleLife.current;
        const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;
        const alphasAttr = particlesGeo.attributes.alpha as THREE.BufferAttribute;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          if (life[i] <= 0) continue;
          pos[i * 3] += vel[i * 3] * 0.3;
          pos[i * 3 + 1] += vel[i * 3 + 1] * 0.3;
          life[i] -= 0.005;
          posAttr.setXYZ(i, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          if (alphasAttr) alphasAttr.setX(i, Math.max(0, life[i] * 0.3));
        }
        posAttr.needsUpdate = true;
        if (alphasAttr) alphasAttr.needsUpdate = true;
      }

      // ロゴ表示
      if (logoMesh) {
        logoMesh.visible = true;
        const mat = logoMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = logoAlphaRef.current;
        const s = logoScaleRef.current * 2;
        logoMesh.scale.set(s, s, 1);
      }
    } else {
      // Phase 5: Content
      setPhase("content");
    }
  });

  // Stars geometry の初期化
  const starsPositionArray = new Float32Array(STAR_COUNT * 3);
  const starsAlphaArray = new Float32Array(STAR_COUNT);
  const starsSizeArray = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) {
    starsPositionArray[i * 3] = starPositions.current[i * 3];
    starsPositionArray[i * 3 + 1] = starPositions.current[i * 3 + 1];
    starsPositionArray[i * 3 + 2] = 0;
    starsAlphaArray[i] = starAlphas.current[i];
    starsSizeArray[i] = Math.random() * 0.02 + 0.005;
  }

  // Particles geometry の初期化
  const particleInitPos = new Float32Array(PARTICLE_COUNT * 3);
  const particleInitAlpha = new Float32Array(PARTICLE_COUNT);
  const particleInitColor = new Float32Array(PARTICLE_COUNT * 3);
  const particleInitSize = new Float32Array(PARTICLE_COUNT);

  return (
    <>
      {/* 星 */}
      <points ref={starsRef}>
        <bufferGeometry ref={starsGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[starsPositionArray, 3]}
          />
          <bufferAttribute
            attach="attributes-alpha"
            args={[starsAlphaArray, 1]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[starsSizeArray, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={0xffffff}
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* 爆発パーティクル */}
      <points ref={particlesRef} visible={false}>
        <bufferGeometry ref={particlesGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[particleInitPos, 3]}
          />
          <bufferAttribute
            attach="attributes-alpha"
            args={[particleInitAlpha, 1]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleInitColor, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[particleInitSize, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 衝撃波リング */}
      <mesh ref={shockwaveRef} visible={false}>
        <ringGeometry args={[0.99, 1, 64]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* フラッシュ（全面ホワイト） */}
      <mesh ref={flashRef} visible={false} position={[0, 0, 0.1]}>
        <planeGeometry args={[halfW * 2 + 2, halfH * 2 + 2]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* ロゴ */}
      <mesh ref={logoRef} visible={false} position={[0, 0, 0.2]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ----- BigBangWebGL: 外側ラッパー -----
export function BigBangWebGL({ config, onPhaseChange, logoSrc }: BigBangEngineProps) {
  // prefers-reduced-motion チェック（同期的に初期化してレンダリングに反映）
  const [isReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // マウント時に dark フェーズを通知
  useEffect(() => {
    if (isReducedMotion) {
      onPhaseChange("content");
    } else {
      onPhaseChange("dark");
    }
  }, [isReducedMotion, onPhaseChange]);

  if (isReducedMotion) {
    return null;
  }

  return (
    <div
      role="img"
      aria-label="ビッグバン シネマティック演出"
      className="fixed inset-0 z-0"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        style={{ background: "#000000" }}
      >
        <BigBangScene
          config={config}
          onPhaseChange={onPhaseChange}
          logoSrc={logoSrc}
        />
      </Canvas>
    </div>
  );
}
