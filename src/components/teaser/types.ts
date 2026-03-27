export type AnimationPhase = "dark" | "converge" | "explode" | "content";

export interface BigBangEngineProps {
  onPhaseChange: (phase: AnimationPhase) => void;
}

export const DURATION_MS = {
  dark: 1500,
  converge: 1500,
  explode: 1000,
};
