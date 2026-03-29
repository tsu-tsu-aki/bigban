"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const CONCEPT_LINES = [
  "クロスミントン世界王者・西村昭彦が、",
  "本気で上達したいすべてのプレーヤーのために作った空間。",
  "本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。",
  "練習、トレーニング、試合、そしてコミュニティ——すべてがここに。",
];

export default function HomeConcept() {
  return (
    <section id="concept" className="bg-off-white text-text-dark py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex items-start gap-8 lg:gap-16">
          {/* Desktop vertical label */}
          <div className="hidden lg:flex shrink-0 pt-2">
            <span
              className="text-xs tracking-[0.3em] text-text-gray font-bold"
              style={{ writingMode: "vertical-rl" }}
            >
              CONCEPT
            </span>
          </div>

          {/* Mobile label */}
          <div className="lg:hidden mb-8">
            <span className="text-xs tracking-[0.3em] text-text-gray font-bold">
              CONCEPT
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 lg:pl-12">
          {/* Text content */}
          <div className="flex-1">
            {CONCEPT_LINES.map((line, i) => (
              <motion.p
                key={line}
                className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.15,
                  ease: EASE,
                }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Concept photo */}
          <div className="relative w-full lg:w-[45%] shrink-0 aspect-[4/3] overflow-hidden rounded-sm">
            <Image
              src="/images/jon-matthews-ajk3K-zgiPU-unsplash.jpg"
              alt="Moody overhead court shot"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
