"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ServicesHero() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="relative h-[60vh] min-h-[450px] bg-deep-black overflow-hidden flex flex-col justify-end">
      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22/%3E%3C/svg%3E')] bg-repeat bg-[length:256px_256px]" />

      {/* Subtle light accents */}
      <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-off-white/[0.02] rounded-full blur-[150px]" />
      <div className="absolute bottom-[30%] right-[15%] w-64 h-64 bg-accent/[0.03] rounded-full blur-[120px]" />

      {/* SERVICES — oversized, clipping at edges */}
      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-[var(--font-inter)] text-[clamp(6rem,16vw,15rem)] font-bold tracking-[0.12em] text-off-white/8 leading-[0.85] uppercase select-none -mx-4"
        >
          {t("hero.title")}
        </motion.h1>
      </div>

      {/* Subtitle */}
      <div className="max-w-[1440px] mx-auto w-full px-8 md:px-16 lg:px-24 pb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-[12px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)]"
        >
          {t("hero.subtitle")}
        </motion.p>
      </div>
    </section>
  );
}
