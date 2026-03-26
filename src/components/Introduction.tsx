"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const lines = [
  "クロスミントン世界王者・西村昭彦が、",
  "本気で上達したいすべてのプレーヤーのために作った空間。",
  "本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。",
  "練習、トレーニング、試合、そしてコミュニティ——すべてがここに。",
];

export default function Introduction() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-off-white py-32 md:py-44 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 flex">
        {/* Vertical ABOUT label */}
        <div className="hidden md:flex items-start mr-16 pt-2">
          <span className="vertical-text text-[10px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)]">
            About
          </span>
        </div>

        {/* Main content */}
        <div className="max-w-3xl">
          {lines.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.p
                initial={{ y: "100%", opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{
                  duration: 0.9,
                  delay: i * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="font-[var(--font-inter)] text-text-dark text-[clamp(1.125rem,2.2vw,1.625rem)] leading-[1.9] tracking-wide"
              >
                {line}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
