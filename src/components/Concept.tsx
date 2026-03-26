"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

export default function Concept() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[90vh] min-h-[600px] overflow-hidden flex items-center justify-center"
    >
      {/* Parallax Background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-[-10%] w-[120%] h-[120%]"
      >
        {/* Moody empty court — dramatic overhead lighting */}
        <div className="w-full h-full bg-gradient-to-b from-[#0d0d0d] via-[#151515] to-deep-black relative">
          {/* Overhead light circles */}
          <div className="absolute top-[15%] left-[25%] w-80 h-80 bg-off-white/4 rounded-full blur-[120px]" />
          <div className="absolute top-[10%] right-[30%] w-60 h-60 bg-off-white/3 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] left-[55%] w-40 h-40 bg-accent/5 rounded-full blur-[80px]" />
          {/* Court lines suggestion */}
          <div className="absolute bottom-[30%] left-[20%] right-[20%] h-[1px] bg-off-white/5" />
          <div className="absolute bottom-[30%] left-[50%] w-[1px] h-[200px] bg-off-white/5 -translate-y-full" />
          {/* Photo direction */}
          <div className="absolute bottom-[15%] right-[10%]">
            <p className="text-text-gray/20 text-[9px] tracking-[0.3em] uppercase text-right leading-relaxed">
              [Wide-angle empty court<br />
              overhead lights creating<br />
              pools of light on floor]
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-deep-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-[var(--font-dm-serif)] text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.15] text-off-white mb-8"
        >
          「単なるレンタルコートではない。」
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-[var(--font-inter)] text-off-white/70 text-[clamp(0.95rem,1.5vw,1.2rem)] leading-[1.9] max-w-2xl mx-auto"
        >
          トレーニング、競技、コミュニティが一体となった空間。
          <br />
          すべてのプレーヤーが、自分の限界を超えるために集まる場所。
        </motion.p>
      </div>
    </section>
  );
}
