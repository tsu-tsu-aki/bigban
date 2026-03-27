"use client";

import { motion } from "framer-motion";

import { useCountdown } from "@/hooks/useCountdown";

import { EmailSignup } from "./EmailSignup";

const LAUNCH_DATE = new Date("2026-04-18T00:00:00+09:00");

interface TeaserContentProps {
  logoSrc: string;
}

export function TeaserContent({ logoSrc }: TeaserContentProps) {
  const countdown = useCountdown(LAUNCH_DATE);

  const countdownItems = [
    { value: countdown.days, label: "DAYS" },
    { value: countdown.hours, label: "HOURS" },
    { value: countdown.minutes, label: "MIN" },
    { value: countdown.seconds, label: "SEC" },
  ];

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex items-center justify-end px-8 md:px-16 py-6"
      >
        <span className="text-[10px] tracking-[0.35em] text-[#8A8A8A]/60 uppercase font-[var(--font-inter)]">
          Coming Soon
        </span>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
          style={{ marginBottom: "clamp(1rem, 3vh, 2rem)" }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(48,110,195,0.15) 0%, rgba(17,49,123,0.06) 40%, transparent 70%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="THE PICKLE BANG THEORY"
            className="relative z-[1] w-auto object-contain"
            style={{ height: "clamp(180px, 30vh, 400px)" }}
          />
        </motion.div>

        {/* Open date */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}
          className="text-[12px] md:text-[13px] tracking-[0.4em] text-[#E6E6E6] uppercase font-[var(--font-inter)]"
          style={{ marginBottom: "clamp(0.75rem, 2vh, 1.5rem)" }}
        >
          2026.4.18 OPEN
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.9 }}
          className="flex items-center gap-6 md:gap-10"
          style={{ marginBottom: "clamp(1rem, 2vh, 2rem)" }}
        >
          {countdownItems.map((item, i) => (
            <div key={item.label} className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 2.0 + i * 0.1 }}
              >
                <span className="text-[clamp(2rem,5vw,3.5rem)] text-[#E6E6E6] leading-none block font-[var(--font-dm-serif)]">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-[9px] tracking-[0.35em] text-[#8A8A8A]/50 uppercase mt-2 block font-[var(--font-inter)]">
                  {item.label}
                </span>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.4 }}
          className="text-[#E6E6E6]/50 text-[clamp(0.75rem,1.1vw,0.95rem)] leading-[1.9] tracking-wide text-center max-w-lg font-[var(--font-inter)]"
          style={{ marginBottom: "clamp(1.5rem, 3vh, 2.5rem)" }}
        >
          クロスミントン世界王者が手がける、プレミアムインドアピックルボール施設。本八幡に誕生。
        </motion.p>

        {/* Email signup */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.7 }}
          className="w-full max-w-md"
        >
          <p className="text-[10px] tracking-[0.3em] text-[#8A8A8A]/60 uppercase text-center mb-4 font-[var(--font-inter)]">
            オープン情報をいち早くお届け
          </p>
          <EmailSignup />
        </motion.div>
      </div>

      {/* Key facts row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 3.0 }}
        className="px-8 md:px-16 py-4 border-t border-[#E6E6E6]/[0.06]"
      >
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2 md:gap-x-12">
          {[
            { label: "LOCATION", value: "本八幡駅 徒歩1分" },
            { label: "COURTS", value: "プロ仕様ハードコート 3面" },
            { label: "OPEN", value: "6:00 – 23:00" },
            { label: "FOUNDER", value: "西村昭彦 — 世界王者" },
          ].map((fact) => (
            <div key={fact.label} className="flex items-baseline gap-3 py-2">
              <span className="text-[9px] tracking-[0.3em] text-[#8A8A8A]/40 uppercase font-[var(--font-inter)]">
                {fact.label}
              </span>
              <span className="text-[12px] text-[#E6E6E6]/60 tracking-wide font-[var(--font-inter)]">
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.2 }}
        className="flex items-center justify-between px-8 md:px-16 py-5"
      >
        <span className="text-[10px] text-[#8A8A8A]/30 font-[var(--font-inter)]">
          &copy; 2026 RST Agency Inc.
        </span>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#8A8A8A]/40 hover:text-[#F6FF54] transition-colors duration-300 uppercase font-[var(--font-inter)]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          Instagram
        </a>
        <span className="text-[10px] tracking-[0.2em] text-[#8A8A8A]/30 uppercase font-[var(--font-inter)]">
          Ichikawa, Chiba
        </span>
      </motion.footer>
    </div>
  );
}
