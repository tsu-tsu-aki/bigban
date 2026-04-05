"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BigBangCanvas } from "@/components/teaser/BigBangCanvas";

import type { AnimationPhase } from "@/components/teaser/types";
import type { ReactNode } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const SESSION_KEY = "bigban-intro-played";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function checkShouldShowIntro(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "true";
  } catch {
    return false;
  }
}

interface HomeIntroProps {
  children: ReactNode;
}

export default function HomeIntro({ children }: HomeIntroProps) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [shouldShowIntro] = useState(checkShouldShowIntro);
  const [phase, setPhase] = useState<AnimationPhase>("dark");
  const [isIntroComplete, setIsIntroComplete] = useState(!shouldShowIntro);

  const handlePhaseChange = useCallback((newPhase: AnimationPhase) => {
    setPhase(newPhase);
    if (newPhase === "content") {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // sessionStorage unavailable
      }
      setTimeout(() => {
        setIsIntroComplete(true);
      }, 2000);
    }
  }, []);

  if (!isMounted || !shouldShowIntro) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence>
        {!isIntroComplete && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <BigBangCanvas onPhaseChange={handlePhaseChange} />

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
