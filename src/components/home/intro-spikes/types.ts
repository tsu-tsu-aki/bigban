import type { AnimationPhase } from "@/components/teaser/types";

export type IntroPattern = "A" | "B" | "C" | "D" | "E";

export interface IntroEngineProps {
  onPhaseChange: (phase: AnimationPhase) => void;
}

export const PATTERN_LABEL: Record<IntroPattern, string> = {
  A: "NEON SHOCKWAVE",
  B: "TYPE IGNITION",
  C: "PORTAL OPENING",
  D: "STARFIELD WARP",
  E: "PARTICLE VORTEX",
};
