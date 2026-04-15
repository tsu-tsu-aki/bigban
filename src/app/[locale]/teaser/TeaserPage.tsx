"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StarfieldWarpIntro } from "@/components/intro/StarfieldWarpIntro";
import { TeaserContent } from "@/components/teaser/TeaserContent";
import { useAnimationPhase } from "@/hooks/useAnimationPhase";

const LOGO_SRC = "/logos/tate-neon-hybrid.svg";

export default function TeaserPage() {
  const { phase, setPhase } = useAnimationPhase();

  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handler = (e: MouseEvent) =>
      setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      data-testid="teaser-page"
      className="relative min-h-screen bg-[#000000] overflow-x-hidden custom-cursor-area"
    >
      {/* Custom cursor */}
      <motion.div
        data-testid="custom-cursor"
        className="custom-cursor fixed pointer-events-none z-[100] mix-blend-difference"
        animate={{ x: cursorPos.x - 16, y: cursorPos.y - 16 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      >
        <div className="w-8 h-8 rounded-full border border-[#E6E6E6]/50" />
      </motion.div>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Starfield warp intro animation — fixed overlay でスクロールを抑止 */}
      {phase !== "content" && (
        <div className="fixed inset-0 z-50">
          <StarfieldWarpIntro onPhaseChange={setPhase} />
        </div>
      )}

      {/* Teaser Content — fades in after animation completes */}
      {phase === "content" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Ambient lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#306EC3]/[0.06] rounded-full blur-[200px]" />
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#11317B]/[0.05] rounded-full blur-[150px]" />
          </div>

          <TeaserContent logoSrc={LOGO_SRC} />
        </motion.div>
      )}
    </div>
  );
}
