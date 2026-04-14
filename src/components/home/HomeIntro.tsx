"use client";

import { useState, useCallback, useSyncExternalStore, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BigBangCanvas } from "@/components/teaser/BigBangCanvas";
import { IntroEngineA } from "./intro-spikes/IntroEngineA";
import { IntroEngineB } from "./intro-spikes/IntroEngineB";
import { IntroEngineC } from "./intro-spikes/IntroEngineC";
import { IntroEngineD } from "./intro-spikes/IntroEngineD";
import { IntroEngineE } from "./intro-spikes/IntroEngineE";
import { IntroEngineF } from "./intro-spikes/IntroEngineF";
import { IntroEngineG } from "./intro-spikes/IntroEngineG";
import { IntroEngineH } from "./intro-spikes/IntroEngineH";
import { IntroEngineI } from "./intro-spikes/IntroEngineI";
import { IntroEngineJ } from "./intro-spikes/IntroEngineJ";
import { PATTERN_LABEL, type IntroPattern } from "./intro-spikes/types";

import type { AnimationPhase } from "@/components/teaser/types";
import type { ReactNode } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const SESSION_KEY = "bigban-intro-played";
const VALID_PATTERNS: IntroPattern[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

interface HomeIntroProps {
  children: ReactNode;
}

/* istanbul ignore next -- SSR-only snapshot */
const noop = () => () => {};

function readPatternFromUrl(): IntroPattern | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("intro");
  if (raw && (VALID_PATTERNS as string[]).includes(raw)) {
    return raw as IntroPattern;
  }
  return null;
}

export default function HomeIntro({ children }: HomeIntroProps) {
  const isMounted = useSyncExternalStore(
    noop,
    () => true,
    /* istanbul ignore next -- SSR-only snapshot */
    () => false
  );
  const previewPattern = useMemo(() => readPatternFromUrl(), []);
  const [shouldShowIntro] = useState(() => {
    // When previewing specific pattern, always show intro
    if (previewPattern) return true;
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "true";
    } catch {
      return false;
    }
  });
  const [phase, setPhase] = useState<AnimationPhase>("dark");
  const [isIntroComplete, setIsIntroComplete] = useState(!shouldShowIntro);

  const handlePhaseChange = useCallback(
    (newPhase: AnimationPhase) => {
      setPhase(newPhase);
      if (newPhase === "content") {
        if (!previewPattern) {
          try {
            sessionStorage.setItem(SESSION_KEY, "true");
          } catch {
            // sessionStorage unavailable
          }
        }
        setTimeout(() => {
          setIsIntroComplete(true);
        }, 2000);
      }
    },
    [previewPattern]
  );

  if (!isMounted || !shouldShowIntro) {
    return <>{children}</>;
  }

  const Engine = (() => {
    switch (previewPattern) {
      case "A": return IntroEngineA;
      case "B": return IntroEngineB;
      case "C": return IntroEngineC;
      case "D": return IntroEngineD;
      case "E": return IntroEngineE;
      case "F": return IntroEngineF;
      case "G": return IntroEngineG;
      case "H": return IntroEngineH;
      case "I": return IntroEngineI;
      case "J": return IntroEngineJ;
      default:
        return BigBangCanvas;
    }
  })();

  return (
    <>
      <AnimatePresence>
        {!isIntroComplete && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <Engine onPhaseChange={handlePhaseChange} />

            {previewPattern && (
              <div className="absolute top-4 left-4 z-[110] px-3 py-1.5 bg-black/80 border border-accent/40 rounded-sm pointer-events-none">
                <span className="text-accent text-xs tracking-[0.2em] font-bold">
                  PREVIEW: {previewPattern} — {PATTERN_LABEL[previewPattern]}
                </span>
              </div>
            )}

            {/* Logo after explosion */}
            <AnimatePresence>
              {phase === "content" && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <Image
                    src="/logos/yoko-neon.png"
                    alt="THE PICKLE BANG THEORY"
                    width={360}
                    height={80}
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}
