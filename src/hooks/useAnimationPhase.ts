"use client";

import { useState, useCallback } from "react";

import type { AnimationPhase, BigBangConfig } from "@/components/teaser/types";

interface UseAnimationPhaseReturn {
  phase: AnimationPhase;
  setPhase: (phase: AnimationPhase) => void;
  reset: () => void;
  isComplete: boolean;
  config: BigBangConfig;
}

export function useAnimationPhase(config: BigBangConfig): UseAnimationPhaseReturn {
  const [phase, setPhase] = useState<AnimationPhase>("dark");

  const reset = useCallback(() => {
    setPhase("dark");
  }, []);

  return {
    phase,
    setPhase,
    reset,
    isComplete: phase === "content",
    config,
  };
}
