"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const specKeys = ["surface", "courts", "layout", "type"] as const;

export default function CourtDetails() {
  const t = useTranslations("Facility.court");

  const specs = specKeys.map((key) => ({
    label: t(`${key}Label`),
    value: t(`${key}Value`),
    sub: t(`${key}Sub`),
  }));
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <section ref={ref} className="relative bg-deep-black py-0 overflow-hidden">
      {/* Large showcase image */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <motion.div style={{ scale: imageScale }} className="absolute inset-0">
          {/* Overhead court view placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#080808] relative">
            {/* Court lines — overhead view */}
            <div className="absolute top-[25%] left-[20%] right-[20%] bottom-[25%] border border-off-white/8">
              {/* Center line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-off-white/6" />
              {/* Kitchen lines */}
              <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-off-white/5" />
              <div className="absolute bottom-[30%] left-0 right-0 h-[1px] bg-off-white/5" />
            </div>
            {/* Light pools */}
            <div className="absolute top-[15%] left-[30%] w-80 h-80 bg-off-white/3 rounded-full blur-[140px]" />
            <div className="absolute top-[10%] right-[25%] w-60 h-60 bg-off-white/4 rounded-full blur-[120px]" />
            <div className="absolute bottom-[20%] left-[50%] w-48 h-48 bg-accent/4 rounded-full blur-[100px]" />
            {/* Direction */}
            <div className="absolute bottom-6 right-8">
              <p className="text-text-gray/20 text-[9px] tracking-[0.3em] uppercase text-right leading-relaxed">
                [Overhead court angle<br />
                clean lines, pro lighting<br />
                dramatic shadows]
              </p>
            </div>
          </div>
        </motion.div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/30 to-transparent" />

        {/* Specs overlay — bottom aligned */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 pb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {specs.map((spec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.7,
                    delay: 0.3 + i * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <p className="text-[10px] tracking-[0.35em] text-accent uppercase font-[var(--font-inter)] font-medium mb-3">
                    {spec.label}
                  </p>
                  <p className="font-[var(--font-dm-serif)] text-[clamp(1.3rem,2vw,1.8rem)] text-off-white leading-tight mb-1">
                    {spec.value}
                  </p>
                  <p className="text-[12px] text-text-gray font-[var(--font-inter)]">
                    {spec.sub}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
