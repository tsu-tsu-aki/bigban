"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

interface ServiceData {
  num: string;
  titleJa: string;
  titleEn: string;
  body: string[];
  dark: boolean;
  imageFirst: boolean;
  imageDirection: string[];
  imageLights: { position: string; color: string; size: string }[];
}

function ImagePlaceholder({
  direction,
  lights,
  dark,
}: {
  direction: string[];
  lights: ServiceData["imageLights"];
  dark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.08, 1]);

  const baseBg = dark
    ? "from-[#111] via-[#0d0d0d] to-[#080808]"
    : "from-[#2a2825] via-[#1e1c1a] to-[#141210]";

  return (
    <div ref={ref} className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:h-full min-h-[350px]">
      <motion.div style={{ y, scale }} className="absolute inset-[-10%] w-[120%] h-[120%]">
        <div className={`w-full h-full bg-gradient-to-br ${baseBg} relative`}>
          {lights.map((light, i) => (
            <div
              key={i}
              className={`absolute ${light.position} ${light.size} ${light.color} rounded-full blur-[100px]`}
            />
          ))}
          {/* Direction label */}
          <div className="absolute bottom-4 right-4">
            <div className="text-right">
              {direction.map((line, i) => (
                <p key={i} className="text-off-white/15 text-[8px] tracking-[0.3em] uppercase leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ServiceSection({ service }: { service: ServiceData }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const bg = service.dark ? "bg-deep-black" : "bg-off-white";
  const textColor = service.dark ? "text-off-white" : "text-text-dark";
  const subTextColor = service.dark ? "text-off-white/70" : "text-text-dark/70";
  const labelColor = service.dark ? "text-text-gray" : "text-text-gray";

  const imageBlock = (
    <div className="md:w-[58%]">
      <motion.div
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <ImagePlaceholder
          direction={service.imageDirection}
          lights={service.imageLights}
          dark={service.dark}
        />
      </motion.div>
    </div>
  );

  const textBlock = (
    <div className="md:w-[42%] flex flex-col justify-center px-8 md:px-0">
      {/* Number */}
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-[var(--font-dm-serif)] text-[clamp(4rem,7vw,6rem)] text-accent leading-none mb-4"
      >
        {service.num}
      </motion.span>

      {/* English title */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={`text-[10px] tracking-[0.4em] ${labelColor} uppercase font-[var(--font-inter)] mb-3`}
      >
        {service.titleEn}
      </motion.p>

      {/* Japanese title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.4 }}
        className={`font-[var(--font-dm-serif)] text-[clamp(1.8rem,3.5vw,2.8rem)] ${textColor} leading-tight mb-8`}
      >
        {service.titleJa}
      </motion.h2>

      {/* Body text */}
      {service.body.map((paragraph, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 + i * 0.12 }}
          className={`font-[var(--font-inter)] ${subTextColor} text-[clamp(0.9rem,1.2vw,1.05rem)] leading-[2] tracking-wide ${i < service.body.length - 1 ? "mb-4" : ""}`}
        >
          {paragraph}
        </motion.p>
      ))}
    </div>
  );

  return (
    <section ref={ref} className={`relative ${bg} overflow-hidden`}>
      <div className="max-w-[1440px] mx-auto">
        <div className={`flex flex-col ${service.imageFirst ? "md:flex-row" : "md:flex-row-reverse"} gap-12 md:gap-0`}>
          {/* Image side */}
          {imageBlock}

          {/* Text side */}
          <div className="md:w-[42%] flex items-center">
            <div className={`w-full ${service.imageFirst ? "md:pl-16 lg:pl-24" : "md:pr-16 lg:pr-24"} py-20 md:py-28`}>
              {textBlock.props.children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
