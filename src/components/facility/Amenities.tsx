"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const amenities = [
  { name: "空調完備", desc: "年間を通じて最適な室温を維持。真夏でも快適にプレー可能。" },
  { name: "更衣室", desc: "男女別の清潔な更衣スペース。シャワー完備。" },
  { name: "トレーニングエリア", desc: "コート外でのフィジカル強化に対応した専用スペース。" },
  { name: "ラウンジスペース", desc: "試合観戦やミーティングに使えるリラックス空間。" },
  { name: "レンタル用品", desc: "パドル・ボールの貸出あり。手ぶらでも参加可能。" },
  { name: "無人チェックイン対応", desc: "スマートロック＆QR認証で24時間スムーズに入退室。" },
];

function AmenityRow({
  item,
  index,
}: {
  item: (typeof amenities)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border-b border-off-white/10 cursor-pointer group"
    >
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 py-6 md:py-8 flex items-start justify-between gap-8">
        <div className="flex items-center gap-6 md:gap-10 flex-1">
          {/* Index number */}
          <motion.span
            animate={{ color: isHovered ? "#C8FF00" : "#8A8A8A" }}
            transition={{ duration: 0.3 }}
            className="text-[11px] tracking-[0.2em] font-[var(--font-inter)] min-w-[30px]"
          >
            {String(index + 1).padStart(2, "0")}
          </motion.span>

          {/* Name + expandable description */}
          <div className="flex-1">
            <motion.p
              animate={{ x: isHovered ? 8 : 0 }}
              transition={{ duration: 0.3 }}
              className="font-[var(--font-inter)] text-[clamp(1rem,1.8vw,1.35rem)] text-off-white tracking-wide"
            >
              {item.name}
            </motion.p>

            <AnimatePresence>
              {isHovered && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden font-[var(--font-inter)] text-[13px] text-text-gray leading-relaxed mt-2 max-w-lg"
                >
                  {item.desc}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Expand indicator */}
        <motion.span
          animate={{ rotate: isHovered ? 90 : 0, opacity: isHovered ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          className="text-off-white/50 text-lg mt-1"
        >
          +
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function Amenities() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative bg-deep-black py-24 md:py-32">
      {/* Section label */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6"
        >
          <span className="text-[10px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)]">
            Amenities
          </span>
          <div className="flex-1 h-[1px] bg-off-white/10" />
        </motion.div>
      </div>

      {/* Amenity rows */}
      <div className="border-t border-off-white/10">
        {amenities.map((item, i) => (
          <AmenityRow key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
