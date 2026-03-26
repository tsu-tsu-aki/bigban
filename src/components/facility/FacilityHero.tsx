"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function FacilityHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y: bgY }} className="absolute inset-[-15%] w-full h-[130%]">
        <div className="w-full h-full bg-gradient-to-b from-[#0e0e0e] via-[#141414] to-deep-black relative">
          {/* Overhead court lights */}
          <div className="absolute top-[8%] left-[20%] w-96 h-96 bg-off-white/4 rounded-full blur-[150px]" />
          <div className="absolute top-[5%] left-[50%] w-72 h-72 bg-off-white/5 rounded-full blur-[120px]" />
          <div className="absolute top-[12%] right-[20%] w-80 h-80 bg-off-white/3 rounded-full blur-[130px]" />
          {/* Court surface glow */}
          <div className="absolute bottom-[20%] left-[15%] right-[15%] h-[1px] bg-off-white/8" />
          <div className="absolute bottom-[20%] left-[50%] -translate-x-1/2 w-[1px] h-[180px] bg-off-white/5 -translate-y-full" />
          <div className="absolute bottom-[15%] left-[30%] right-[30%] h-[1px] bg-off-white/4" />
          {/* Subtle accent pool */}
          <div className="absolute bottom-[25%] left-[45%] w-60 h-60 bg-accent/3 rounded-full blur-[100px]" />
          {/* Photo direction */}
          <div className="absolute bottom-[8%] right-[5%]">
            <p className="text-text-gray/20 text-[9px] tracking-[0.3em] uppercase text-right leading-relaxed">
              [Interior wide shot<br />
              overhead lights creating<br />
              pools on court surface]
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black/60 via-transparent to-deep-black/80" />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 h-full flex flex-col justify-end pb-20 max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24"
      >
        {/* FACILITY — oversized, clipping at edges */}
        <div className="overflow-hidden -mx-8 md:-mx-16 lg:-mx-24">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-[var(--font-inter)] text-[clamp(6rem,15vw,14rem)] font-bold tracking-[0.15em] text-off-white/10 leading-none uppercase select-none px-8 md:px-16 lg:px-24"
          >
            FACILITY
          </motion.h1>
        </div>

        {/* Japanese subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-[12px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)] mt-6"
        >
          施設紹介
        </motion.p>
      </motion.div>
    </section>
  );
}
