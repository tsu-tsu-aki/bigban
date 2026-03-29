"use client";

import { motion } from "framer-motion";

interface KeyNumber {
  value: string;
  labelEn: string;
  labelJa: string;
}

const KEY_NUMBERS: KeyNumber[] = [
  { value: "3", labelEn: "COURTS", labelJa: "プロ仕様コート" },
  { value: "6:00–23:00", labelEn: "HOURS", labelJa: "営業時間" },
  { value: "1 min", labelEn: "FROM STATION", labelJa: "駅徒歩1分" },
  { value: "4,800万+", labelEn: "US PLAYERS", labelJa: "米国競技人口" },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomeKeyNumbers() {
  return (
    <section id="key-numbers" className="bg-deep-black py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {KEY_NUMBERS.map((item, i) => (
            <motion.div
              key={item.labelEn}
              className={`flex flex-col items-center text-center px-4 py-8 lg:py-0${
                i < KEY_NUMBERS.length - 1
                  ? " lg:border-r lg:border-text-gray/20"
                  : ""
              }`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: EASE,
              }}
            >
              <span
                className="font-serif text-text-light"
                style={{ fontSize: "clamp(3rem, 6vw, 6.5rem)" }}
              >
                {item.value}
              </span>
              <span className="text-xs tracking-[0.2em] text-text-gray mt-2">
                {item.labelEn}
              </span>
              <span className="text-sm text-text-light/60 mt-1">
                {item.labelJa}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
