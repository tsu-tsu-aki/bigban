"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";

const companyKeys = ["name", "founded", "address", "business"] as const;

export default function CompanyInfo() {
  const t = useTranslations("Facility.company");
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative bg-deep-black py-24 md:py-32">
      {/* Top separator */}
      <div className="h-[1px] bg-off-white/8 mb-20" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-[10px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)] mb-12"
        >
          {t("sectionLabel")}
        </motion.p>

        {/* Text-only data */}
        <div className="max-w-2xl space-y-6">
          {companyKeys.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8"
            >
              <span className="text-[11px] tracking-[0.2em] text-text-gray uppercase font-[var(--font-inter)] min-w-[100px]">
                {t(`${key}Label`)}
              </span>
              <span className="font-[var(--font-inter)] text-off-white/80 text-[15px] leading-relaxed">
                {t(`${key}Value`)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
