"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FacilityStory() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-off-white py-32 md:py-44 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Large serif quote */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-20 md:mb-28"
        >
          <h2 className="font-[var(--font-dm-serif)] text-[clamp(2rem,4.5vw,4rem)] text-text-dark leading-[1.2] max-w-4xl">
            「ピックルボールの
            <br />
            <span className="text-accent">ビッグバン</span>が生まれる場所」
          </h2>
        </motion.div>

        {/* Editorial 2-column text */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 lg:gap-32">
          {/* Column 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:w-1/2"
          >
            <p className="font-[var(--font-inter)] text-text-dark text-[clamp(0.95rem,1.3vw,1.1rem)] leading-[2] tracking-wide">
              <span className="font-[var(--font-dm-serif)] text-[3.5rem] leading-[0.85] float-left mr-3 mt-1 text-accent">
                宇
              </span>
              宙の始まりとされるビッグバンのように、この場所から新しいピックルボール文化が広がることを目指している。
              単なるコートレンタルではなく、プレーヤーが本気で成長するための環境をゼロから設計した。
            </p>
          </motion.div>

          {/* Column 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:w-1/2"
          >
            <p className="font-[var(--font-inter)] text-text-dark text-[clamp(0.95rem,1.3vw,1.1rem)] leading-[2] tracking-wide">
              年齢やレベルに関係なく、本気で成長したい人が練習に集中し、挑戦し続けられる場所。
              世界トップレベルの競技経験を持つ代表自らがコートに立ち、プレーヤーの成長に向き合う。
              ここは、すべての始まりの場所だ。
            </p>
          </motion.div>
        </div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-20 h-[1px] bg-text-dark/10 origin-left"
        />
      </div>
    </section>
  );
}
