"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────── Countdown Hook ─────────────── */
const LAUNCH_DATE = new Date("2026-04-18T00:00:00+09:00");

function useCountdown(targetDate: Date) {
  const calc = useCallback(() => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDate]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

/* ─────────────── Email Form ─────────────── */
function EmailSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-transparent border border-[#E6E6E6]/20 border-r-0 px-5 py-4 text-[13px] text-[#E6E6E6] tracking-wide placeholder:text-[#8A8A8A]/50 focus:outline-none focus:border-[#E6E6E6]/40 transition-colors"
              style={{
                fontFamily: "var(--font-inter)",
                borderRadius: "2px 0 0 2px",
              }}
            />
            <button
              type="submit"
              className="bg-[#F6FF54] text-[#0A0A0A] px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#F6FF54]/90 transition-colors shrink-0"
              style={{
                fontFamily: "var(--font-inter)",
                borderRadius: "0 2px 2px 0",
              }}
            >
              NOTIFY ME
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p
              className="text-[#F6FF54] text-[13px] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              REGISTERED — WE&apos;LL BE IN TOUCH.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Main Teaser Page ─────────────── */
export default function TeaserPreview1() {
  const countdown = useCountdown(LAUNCH_DATE);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handler = (e: MouseEvent) =>
      setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const countdownItems = [
    { value: countdown.days, label: "DAYS" },
    { value: countdown.hours, label: "HOURS" },
    { value: countdown.minutes, label: "MIN" },
    { value: countdown.seconds, label: "SEC" },
  ];

  return (
    <div className="relative min-h-screen bg-[#000000] overflow-x-hidden cursor-none">
      {/* Custom cursor — circle, mix-blend-difference */}
      <motion.div
        className="fixed pointer-events-none z-[100] mix-blend-difference"
        animate={{ x: cursorPos.x - 16, y: cursorPos.y - 16 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      >
        <div className="w-8 h-8 rounded-full border border-[#E6E6E6]/50" />
      </motion.div>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Subtle ambient lighting — blue tones from palette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#306EC3]/[0.06] rounded-full blur-[200px]" />
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#11317B]/[0.05] rounded-full blur-[150px]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header — "Coming Soon" top-right */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-end px-8 md:px-16 py-6"
        >
          <span
            className="text-[10px] tracking-[0.35em] text-[#8A8A8A]/60 uppercase"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Coming Soon
          </span>
        </motion.header>

        {/* Main content — vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Logo — hero centerpiece with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.4,
              delay: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative"
            style={{ marginBottom: "clamp(1rem, 3vh, 2rem)" }}
          >
            {/* Organic neon glow behind logo — radial gradient, not tied to image rect */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(48,110,195,0.15) 0%, rgba(17,49,123,0.06) 40%, transparent 70%)",
              }}
            />
            {/* Main logo — PNG on matched black background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/tate-neon-hybrid.svg"
              alt="THE PICKLE BANG THEORY"
              className="relative z-[1] w-auto object-contain"
              style={{ height: "clamp(180px, 30vh, 400px)" }}
            />
          </motion.div>

          {/* "2025.4.18 OPEN" */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.6 }}
            className="text-[12px] md:text-[13px] tracking-[0.4em] text-[#E6E6E6] uppercase"
            style={{ marginBottom: "clamp(0.75rem, 2vh, 1.5rem)" }}
            style={{ fontFamily: "var(--font-inter)" }}
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
                  <span
                    className="text-[clamp(2rem,5vw,3.5rem)] text-[#E6E6E6] leading-none block"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[9px] tracking-[0.35em] text-[#8A8A8A]/50 uppercase mt-2 block"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
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
            className="text-[#E6E6E6]/50 text-[clamp(0.75rem,1.1vw,0.95rem)] leading-[1.9] tracking-wide text-center max-w-lg"
            style={{ marginBottom: "clamp(1.5rem, 3vh, 2.5rem)" }}
            style={{ fontFamily: "var(--font-inter)" }}
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
            <p
              className="text-[10px] tracking-[0.3em] text-[#8A8A8A]/60 uppercase text-center mb-4"
              style={{ fontFamily: "var(--font-inter)" }}
            >
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
              { label: "HOURS", value: "6:00 – 23:00" },
              { label: "FOUNDER", value: "西村昭彦 — 世界王者" },
            ].map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline gap-3 py-2"
              >
                <span
                  className="text-[9px] tracking-[0.3em] text-[#8A8A8A]/40 uppercase"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {fact.label}
                </span>
                <span
                  className="text-[12px] text-[#E6E6E6]/60 tracking-wide"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
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
          <span
            className="text-[10px] text-[#8A8A8A]/30"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            &copy; 2026 RST Agency Inc.
          </span>

          {/* Instagram link */}
          <a
            href="#"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#8A8A8A]/40 hover:text-[#F6FF54] transition-colors duration-300 uppercase"
            style={{ fontFamily: "var(--font-inter)" }}
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
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            Instagram
          </a>

          <span
            className="text-[10px] tracking-[0.2em] text-[#8A8A8A]/30 uppercase"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ichikawa, Chiba
          </span>
        </motion.footer>
      </div>
    </div>
  );
}
