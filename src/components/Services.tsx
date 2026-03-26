"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const services = [
  {
    num: "01",
    title: "コートレンタル",
    desc: "無人チェックインで手軽に利用",
    bgGradient: "from-[#1a1a0a] via-[#0d0d0d] to-deep-black",
  },
  {
    num: "02",
    title: "レッスン & クリニック",
    desc: "プロ選手による直接指導",
    bgGradient: "from-[#0a1a1a] via-[#0d0d0d] to-deep-black",
  },
  {
    num: "03",
    title: "大会 & リーグ",
    desc: "賞金付きトーナメント開催",
    bgGradient: "from-[#1a0a1a] via-[#0d0d0d] to-deep-black",
  },
  {
    num: "04",
    title: "トレーニング",
    desc: "フィジカル強化プログラム",
    bgGradient: "from-[#1a1a1a] via-[#0d0d0d] to-deep-black",
  },
];

function ServiceRow({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer border-b border-off-white/10 overflow-hidden"
    >
      {/* Hover background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${service.bgGradient}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 py-10 md:py-14 flex items-center gap-8 md:gap-16">
        {/* Number */}
        <motion.span
          animate={{ x: isHovered ? 8 : 0 }}
          transition={{ duration: 0.3 }}
          className="font-[var(--font-dm-serif)] text-[clamp(2rem,4vw,3.5rem)] text-accent leading-none min-w-[80px]"
        >
          {service.num}
        </motion.span>

        {/* Title */}
        <motion.h3
          animate={{ x: isHovered ? 12 : 0 }}
          transition={{ duration: 0.3, delay: 0.03 }}
          className="font-[var(--font-dm-serif)] text-[clamp(1.5rem,3.5vw,3rem)] text-off-white leading-tight flex-1"
        >
          {service.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          animate={{ opacity: isHovered ? 1 : 0.5, x: isHovered ? -8 : 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block font-[var(--font-inter)] text-text-gray text-sm tracking-wide max-w-[250px] text-right"
        >
          {service.desc}
        </motion.p>

        {/* Arrow */}
        <motion.span
          animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-accent text-2xl"
        >
          &rarr;
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="services" className="relative bg-deep-black py-24 md:py-32">
      {/* Section label */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6"
        >
          <span className="text-[10px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)]">
            Services
          </span>
          <div className="flex-1 h-[1px] bg-off-white/10" />
        </motion.div>
      </div>

      {/* Service rows */}
      <div className="border-t border-off-white/10">
        {services.map((service, i) => (
          <ServiceRow key={i} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}
