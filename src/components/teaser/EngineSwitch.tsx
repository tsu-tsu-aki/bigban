"use client";

import type { BigBangConfig, ExplosionStyle, Duration } from "./types";

type EngineType = "canvas" | "webgl";

interface EngineSwitchProps {
  engine: EngineType;
  config: BigBangConfig;
  onEngineChange: (engine: EngineType) => void;
  onConfigChange: (config: BigBangConfig) => void;
  onReplay: () => void;
}

const EXPLOSION_STYLES: ExplosionStyle[] = ["physics", "neon", "minimal"];
const DURATIONS: Duration[] = ["short", "medium", "long"];

export function EngineSwitch({
  engine,
  config,
  onEngineChange,
  onConfigChange,
  onReplay,
}: EngineSwitchProps) {
  const activeClass = "bg-[#F6FF54]/15 text-[#F6FF54]";
  const inactiveClass = "text-[#666]";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-lg border border-[#E6E6E6]/10 bg-[#0A0A0A]/90 px-4 py-3 backdrop-blur-sm">
      {/* Engine */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[9px] tracking-[0.15em] text-[#666] uppercase">Engine</span>
        <div className="flex overflow-hidden rounded border border-[#E6E6E6]/10">
          {(["canvas", "webgl"] as const).map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={engine === e}
              onClick={() => onEngineChange(e)}
              className={`px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase transition-colors ${
                engine === e ? activeClass : inactiveClass
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Explosion Style */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[9px] tracking-[0.15em] text-[#666] uppercase">Explosion</span>
        <div className="flex overflow-hidden rounded border border-[#E6E6E6]/10">
          {EXPLOSION_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              aria-pressed={config.explosionStyle === style}
              onClick={() => onConfigChange({ ...config, explosionStyle: style })}
              className={`px-2.5 py-1.5 text-[11px] uppercase transition-colors ${
                config.explosionStyle === style ? activeClass : inactiveClass
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[9px] tracking-[0.15em] text-[#666] uppercase">Duration</span>
        <div className="flex overflow-hidden rounded border border-[#E6E6E6]/10">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={config.duration === d}
              onClick={() => onConfigChange({ ...config, duration: d })}
              className={`px-2.5 py-1.5 text-[11px] uppercase transition-colors ${
                config.duration === d ? activeClass : inactiveClass
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Replay */}
      <button
        type="button"
        onClick={onReplay}
        className="rounded border border-[#F6FF54]/30 px-4 py-1.5 text-[11px] tracking-[0.1em] text-[#F6FF54] transition-colors hover:bg-[#F6FF54]/10"
      >
        ▶ PLAY
      </button>
    </div>
  );
}
