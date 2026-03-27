export type AnimationPhase = "dark" | "converge" | "explode" | "logo" | "content";

export type ExplosionStyle = "physics" | "neon" | "minimal";

export type Duration = "short" | "medium" | "long";

export interface BigBangConfig {
  explosionStyle: ExplosionStyle;
  duration: Duration;
}

export interface BigBangEngineProps {
  config: BigBangConfig;
  onPhaseChange: (phase: AnimationPhase) => void;
  logoSrc: string;
}

export const DURATION_MS: Record<Duration, { dark: number; converge: number; explode: number; logo: number }> = {
  short: { dark: 800, converge: 800, explode: 600, logo: 800 },
  medium: { dark: 1500, converge: 1500, explode: 1000, logo: 1500 },
  long: { dark: 2500, converge: 2500, explode: 1500, logo: 2500 },
};
