"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href="#reserve"
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="magnetic-button inline-block text-[11px] tracking-[0.25em] uppercase bg-accent text-deep-black px-10 py-4 font-semibold hover:bg-accent/90 transition-colors duration-300"
      style={{ borderRadius: "2px" }}
    >
      {children}
    </motion.a>
  );
}

const headlineLines = [
  { text: "ここから、", accent: false },
  { text: "ピックルボールの", accent: false },
  { text: "ビッグバンが始まる。", accent: true },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-deep-black custom-cursor-area"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Custom Cursor */}
      <motion.div
        className="custom-cursor fixed pointer-events-none z-[60] mix-blend-difference"
        animate={{
          x: cursorPos.x - 20,
          y: cursorPos.y - 20,
          scale: isHovering ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className="w-10 h-10 rounded-full border border-off-white/60" />
      </motion.div>

      <div className="relative h-full max-w-[1440px] mx-auto flex">
        {/* Left: Headline — 60% */}
        <div className="w-[60%] flex flex-col justify-center pl-8 md:pl-16 lg:pl-24 pr-8 z-10">
          <div className="mb-8">
            {headlineLines.map((line, i) => (
              <div key={i} className="overflow-hidden">
                <motion.h1
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1,
                    delay: 0.5 + i * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="font-[var(--font-dm-serif)] text-[clamp(3rem,7vw,7.5rem)] leading-[1.05] tracking-tight"
                >
                  {line.accent ? (
                    <>
                      <span className="text-accent">ビッグバン</span>
                      <span className="text-off-white">が始まる。</span>
                    </>
                  ) : (
                    <span className="text-off-white">{line.text}</span>
                  )}
                </motion.h1>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-[11px] tracking-[0.4em] text-text-gray uppercase mb-10 font-[var(--font-inter)]"
          >
            FROM A SMALL DINK TO A BIG MOVEMENT
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <MagneticButton>RESERVE A COURT &rarr;</MagneticButton>
          </motion.div>
        </div>

        {/* Right: Hero Image — 40% */}
        <div className="w-[40%] relative h-full overflow-hidden">
          {/* Diagonal clip mask */}
          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
            style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}
          >
            <motion.div
              style={{ y: imageY, scale: imageScale }}
              className="w-full h-full"
            >
              {/* Atmospheric placeholder — dark moody court shot */}
              <div className="w-full h-full bg-gradient-to-br from-deep-black via-[#1a1a1a] to-[#0d0d0d] relative">
                {/* Dramatic side lighting simulation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-deep-black/80 to-transparent" />
                {/* Moody light spots */}
                <div className="absolute top-[20%] left-[30%] w-64 h-64 bg-accent/8 rounded-full blur-[100px]" />
                <div className="absolute bottom-[30%] right-[20%] w-48 h-48 bg-off-white/5 rounded-full blur-[80px]" />
                {/* Photo direction text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-text-gray/30 text-[10px] tracking-[0.3em] uppercase text-center max-w-[200px] leading-relaxed">
                    [Player mid-swing close-up<br />
                    dramatic side lighting<br />
                    shallow depth of field]
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-end gap-3"
      >
        <span className="vertical-text text-[10px] tracking-[0.3em] text-text-gray/60 uppercase">
          Scroll
        </span>
        <div className="scroll-indicator">
          <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
            <path d="M6 0v20M1 16l5 5 5-5" stroke="#8A8A8A" strokeWidth="1" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
