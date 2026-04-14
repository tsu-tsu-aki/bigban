import type { AnimationPhase } from "@/components/teaser/types";

export type IntroPattern =
  | "A" | "B" | "C" | "D" | "E"
  | "F" | "G" | "H" | "I" | "J"
  | "K" | "L" | "M" | "N" | "O";

export interface IntroEngineProps {
  onPhaseChange: (phase: AnimationPhase) => void;
}

export const PATTERN_LABEL: Record<IntroPattern, string> = {
  A: "NEON SHOCKWAVE",
  B: "TYPE IGNITION",
  C: "PORTAL OPENING",
  D: "STARFIELD WARP",
  E: "PARTICLE VORTEX",
  F: "SUPERNOVA BLOOM",
  G: "GLITCH REVEAL",
  H: "PICKLEBALL IMPACT",
  I: "KINETIC GRID",
  J: "LIQUID INK",
  K: "NEURAL PULSE",
  L: "CONSTELLATION",
  M: "ORIGAMI UNFOLD",
  N: "HOLOGRAM SCAN",
  O: "KALEIDOSCOPE",
};
