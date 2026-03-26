"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const bioLines = [
  "クロスミントン世界選手権 6度優勝",
  "青森山田高校→中央大学→全日本総合選手権4度出場",
  "2023年ピックルボール転向、選手兼大会ディレクター",
];

export default function Founder() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative bg-off-white py-32 md:py-44 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">
          {/* Left: Portrait — extends beyond grid */}
          <div className="md:w-[48%] relative">
            <motion.div
              style={{ y: imageY }}
              className="relative md:-ml-8 lg:-ml-16"
            >
              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={isInView ? { clipPath: "inset(0% 0 0 0)" } : {}}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="aspect-[3/4] max-h-[700px] overflow-hidden"
              >
                {/* Editorial dark portrait placeholder */}
                <div className="w-full h-full bg-gradient-to-b from-[#2a2520] via-[#1a1815] to-[#0d0c0a] relative">
                  {/* Dramatic rim light */}
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-off-white/8 to-transparent" />
                  {/* Subtle warm tone */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0d0c0a] to-transparent" />
                  {/* Light accent */}
                  <div className="absolute top-[25%] right-[15%] w-32 h-32 bg-accent/6 rounded-full blur-[60px]" />
                  {/* Photo direction */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-off-white/20 text-[9px] tracking-[0.3em] uppercase text-center leading-relaxed">
                      [Founder editorial portrait<br />
                      moody, dark background<br />
                      dramatic rim lighting<br />
                      serious expression]
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Bio */}
          <div className="md:w-[52%] md:pl-16 lg:pl-24 flex flex-col justify-center">
            {/* Label */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-[10px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)] mb-8"
            >
              Founder
            </motion.span>

            {/* Name */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="font-[var(--font-dm-serif)] text-[clamp(2rem,4vw,3.5rem)] text-text-dark leading-[1.15] mb-3"
            >
              西村昭彦
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-[13px] tracking-[0.3em] text-text-gray uppercase font-[var(--font-inter)] mb-12"
            >
              AKIHIKO NISHIMURA
            </motion.p>

            {/* Bio lines — stacked, not bulleted */}
            <div className="space-y-5">
              {bioLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.7,
                    delay: 0.4 + i * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="font-[var(--font-inter)] text-text-dark text-[clamp(0.95rem,1.4vw,1.15rem)] leading-relaxed border-l-2 border-accent pl-6"
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
