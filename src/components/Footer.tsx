"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";

const navKeys = ["facility", "services", "pricing", "access"] as const;

const navHrefs: Record<(typeof navKeys)[number], string> = {
  facility: "#facility",
  services: "#services",
  pricing: "#pricing",
  access: "#access",
};

export default function Footer() {
  const t = useTranslations("Footer");
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer ref={ref} id="contact" className="relative bg-deep-black pt-20 pb-12">
      {/* Accent separator */}
      <div className="h-[1px] bg-accent/40 mb-20" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="md:w-1/3"
          >
            <p className="text-[12px] tracking-[0.35em] text-off-white font-medium uppercase font-[var(--font-inter)]">
              {t("brandName")}
            </p>
            <p className="mt-3 text-[13px] text-text-gray font-[var(--font-inter)] leading-relaxed">
              {t("tagline")}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-[10px] tracking-[0.35em] text-text-gray uppercase mb-5 font-[var(--font-inter)]">
              {t("navigationLabel")}
            </p>
            <div className="flex flex-col gap-3">
              {navKeys.map((key) => (
                <a
                  key={key}
                  href={navHrefs[key]}
                  className="text-[13px] text-off-white/70 hover:text-off-white transition-colors duration-300 font-[var(--font-inter)]"
                >
                  {t(key)}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-[10px] tracking-[0.35em] text-text-gray uppercase mb-5 font-[var(--font-inter)]">
              {t("contactLabel")}
            </p>
            <div className="flex flex-col gap-3 text-[13px] text-off-white/70 font-[var(--font-inter)]">
              <p>{t("address")}</p>
            </div>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-[10px] tracking-[0.35em] text-text-gray uppercase mb-5 font-[var(--font-inter)]">
              {t("socialLabel")}
            </p>
            <a
              href="#"
              className="group flex items-center gap-2 text-[13px] text-off-white/70 hover:text-off-white transition-colors duration-300 font-[var(--font-inter)]"
            >
              {/* Instagram icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              {t("instagram")}
            </a>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-off-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-text-gray font-[var(--font-inter)]">
            {t("copyright")}
          </p>
          <p className="text-[11px] text-text-gray/50 font-[var(--font-inter)]">
            {t("allRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
