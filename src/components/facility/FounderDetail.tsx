"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const timeline = [
  { year: "", text: "北海道出身。8歳でバドミントンを始める" },
  { year: "", text: "青森山田高校・中央大学で競技経験を積む" },
  { year: "", text: "インターハイ・全国高校選抜 シングルスベスト8" },
  { year: "", text: "全日本総合バドミントン選手権 4度出場" },
  { year: "2015", text: "クロスミントン転向" },
  { year: "", text: "世界選手権ミックスダブルス4連覇、シングルス2連覇（計6度優勝）" },
  { year: "2023", text: "ピックルボール転向、選手兼大会ディレクター" },
  { year: "", text: "RST Agency株式会社 代表取締役" },
];

export default function FounderDetail() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Full-width cinematic background */}
      <motion.div style={{ y: bgY }} className="absolute inset-[-10%] w-full h-[120%]">
        <div className="w-full h-full bg-gradient-to-br from-[#151210] via-[#0d0b0a] to-[#080706] relative">
          {/* Dramatic side light */}
          <div className="absolute top-0 right-0 w-2/5 h-full bg-gradient-to-l from-off-white/5 to-transparent" />
          {/* Warm accent */}
          <div className="absolute top-[30%] right-[20%] w-72 h-72 bg-accent/4 rounded-full blur-[120px]" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-deep-black to-transparent" />
          {/* Photo direction */}
          <div className="absolute top-[10%] right-[5%]">
            <p className="text-text-gray/15 text-[9px] tracking-[0.3em] uppercase text-right leading-relaxed">
              [Founder on court<br />
              dramatic cinematic<br />
              training or mid-rally]
            </p>
          </div>
        </div>
      </motion.div>

      {/* Semi-transparent overlay for text */}
      <div className="absolute inset-0 bg-gradient-to-r from-deep-black/90 via-deep-black/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 py-32 md:py-44">
        <div className="max-w-2xl">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] tracking-[0.4em] text-accent uppercase font-[var(--font-inter)] font-medium mb-6">
              Founder
            </p>
            <h2 className="font-[var(--font-inter)] text-[clamp(1.5rem,3vw,2.5rem)] text-off-white tracking-[0.15em] uppercase font-light mb-2">
              AKIHIKO NISHIMURA
            </h2>
            <p className="font-[var(--font-dm-serif)] text-[clamp(2.5rem,5vw,4rem)] text-off-white leading-tight mb-16">
              西村昭彦
            </p>
          </motion.div>

          {/* Timeline — stacked text with year markers */}
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex items-start gap-6 py-3 border-l border-off-white/10 pl-6 relative"
              >
                {/* Year marker dot */}
                <div
                  className={`absolute left-[-3px] top-[18px] w-[5px] h-[5px] rounded-full ${
                    item.year ? "bg-accent" : "bg-off-white/20"
                  }`}
                />

                {/* Year */}
                <span className="text-[12px] text-accent font-[var(--font-inter)] tracking-wide min-w-[45px] mt-[1px]">
                  {item.year}
                </span>

                {/* Text */}
                <p className="font-[var(--font-inter)] text-off-white/80 text-[clamp(0.9rem,1.2vw,1.05rem)] leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
