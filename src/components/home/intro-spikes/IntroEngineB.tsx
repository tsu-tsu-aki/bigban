"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IntroEngineProps } from "./types";
import type { AnimationPhase } from "@/components/teaser/types";

const TITLE = "THE PICKLE BANG THEORY";
const TAGLINE = "GRAND OPENING 2026.4.17";
const CHAR_DELAY = 80;
const FLASH_DURATION = 600;
const TAGLINE_DURATION = 1400;

export function IntroEngineB({ onPhaseChange }: IntroEngineProps) {
  const [typedLength, setTypedLength] = useState(0);
  const [stage, setStage] = useState<"typing" | "flash" | "tagline" | "done">(
    "typing"
  );

  const [isReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const signalPhase = useCallback(
    (phase: AnimationPhase) => {
      onPhaseChange(phase);
    },
    [onPhaseChange]
  );

  useEffect(() => {
    if (isReducedMotion) {
      signalPhase("content");
      return;
    }

    signalPhase("dark");
    let i = 0;
    const typeInterval = setInterval(() => {
      i++;
      setTypedLength(i);
      if (i >= TITLE.length) {
        clearInterval(typeInterval);
        signalPhase("converge");
        setTimeout(() => {
          setStage("flash");
          signalPhase("explode");
          setTimeout(() => {
            setStage("tagline");
            setTimeout(() => {
              setStage("done");
              signalPhase("content");
            }, TAGLINE_DURATION);
          }, FLASH_DURATION);
        }, 300);
      }
    }, CHAR_DELAY);

    return () => clearInterval(typeInterval);
  }, [isReducedMotion, signalPhase]);

  const visibleText = TITLE.slice(0, typedLength);
  const caretVisible = stage === "typing";

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Background flash during ignition */}
      <AnimatePresence>
        {stage === "flash" && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: FLASH_DURATION / 1000, times: [0, 0.15, 0.5, 1] }}
            style={{
              background:
                "radial-gradient(circle at center, #F6FF54 0%, #F6FF54 20%, #306EC3 50%, transparent 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Scan lines for tech feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(246, 255, 84, 0.03) 0px, rgba(246, 255, 84, 0.03) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Typed title */}
      <AnimatePresence>
        {stage !== "done" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center px-6"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <h1
                className="font-serif text-4xl sm:text-6xl lg:text-8xl font-black tracking-[0.1em] text-text-light"
                aria-label={TITLE}
              >
                <span>{visibleText}</span>
                <span
                  className={`inline-block w-[0.5em] ${
                    caretVisible ? "animate-pulse" : ""
                  }`}
                  style={{
                    color: "#F6FF54",
                    opacity: caretVisible ? 1 : 0,
                  }}
                >
                  _
                </span>
              </h1>

              <AnimatePresence>
                {stage === "tagline" && (
                  <motion.p
                    className="mt-8 text-accent text-sm sm:text-base tracking-[0.3em] font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {TAGLINE}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
