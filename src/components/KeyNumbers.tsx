"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface CountUpProps {
  target: string;
  suffix?: string;
  duration?: number;
}

function CountUp({ target, suffix = "", duration = 2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    // Handle non-numeric targets like "6:00–23:00"
    const numericMatch = target.match(/^[\d,.]+/);
    if (!numericMatch) {
      // Reveal as-is with a slight delay
      const timer = setTimeout(() => setDisplay(target), 300);
      return () => clearTimeout(timer);
    }

    const numStr = numericMatch[0].replace(/,/g, "");
    const targetNum = parseFloat(numStr);
    const startTime = performance.now();
    const restOfString = target.slice(numericMatch[0].length);

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetNum * eased);

      const formatted = target.includes(",")
        ? current.toLocaleString()
        : current.toString();

      setDisplay(formatted + restOfString);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

const stats = [
  { number: "3", label: "COURTS", sublabel: "プロ仕様コート" },
  { number: "6:00–23:00", label: "HOURS", sublabel: "営業時間" },
  { number: "1", label: "FROM STATION", sublabel: "駅徒歩1分", suffix: " min" },
  { number: "4,800", label: "US PLAYERS", sublabel: "米国競技人口", suffix: "万+" },
];

export default function KeyNumbers() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative bg-deep-black py-28 md:py-40 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-off-white/10 to-transparent" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">
        <div className="flex flex-wrap justify-between gap-12 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="flex-1 min-w-[180px]"
            >
              <div className="font-[var(--font-dm-serif)] text-[clamp(4rem,8vw,7rem)] leading-none text-off-white tracking-tight">
                <CountUp target={stat.number} suffix={stat.suffix} />
              </div>
              <div className="mt-4 text-[10px] tracking-[0.35em] text-accent uppercase font-[var(--font-inter)] font-medium">
                {stat.label}
              </div>
              <div className="mt-1 text-[12px] text-text-gray font-[var(--font-inter)]">
                {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
