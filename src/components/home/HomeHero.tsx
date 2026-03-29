"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMagneticButton } from "@/hooks/useMagneticButton";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const HEADLINE_LINES = [
  { text: "ここから、", isAccent: false },
  { text: "ピックルボールの", isAccent: false },
  { text: "ビッグバン", isAccent: true },
  { text: "が始まる。", isAccent: false },
];

export default function HomeHero() {
  const { ref, position, handleMouseMove, handleMouseLeave } =
    useMagneticButton();

  return (
    <section className="relative min-h-screen bg-deep-black overflow-hidden">
      {/* Asymmetric split layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left 60%: headline */}
        <div className="flex w-[60%] flex-col justify-center px-8 md:px-16 lg:px-24">
          <h1 className="font-serif text-[clamp(2.5rem,7vw,7.5rem)] leading-[1.1] text-text-light">
            {HEADLINE_LINES.map((line, i) => (
              <span key={line.text} className="block overflow-hidden">
                <motion.span
                  className={`block ${line.isAccent ? "text-accent" : ""}`}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + i * 0.15,
                    ease: EASE,
                  }}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* English tagline */}
          <motion.p
            className="mt-8 text-sm tracking-[0.3em] text-text-gray md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
          >
            FROM A SMALL DINK TO A BIG MOVEMENT
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: EASE }}
          >
            <a
              ref={ref as React.RefObject<HTMLAnchorElement>}
              href="#reserve"
              className="inline-block bg-accent px-8 py-4 text-sm font-bold tracking-widest text-deep-black transition-transform"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
              }}
            >
              RESERVE A COURT →
            </a>
          </motion.div>
        </div>

        {/* Right 40%: photo with diagonal clip */}
        <div
          className="relative w-[40%]"
          style={{
            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        >
          <Image
            src="/images/jon-matthews-YFNDwuYoyCA-unsplash.jpg"
            alt="Player mid-swing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Blue ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[600px] h-[600px] rounded-full blur-[200px]"
             style={{ background: 'rgba(48,110,195,0.06)' }} />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-8 z-20">
        <motion.span
          className="inline-block text-xs tracking-[0.2em] text-text-gray animate-bounce"
          style={{ writingMode: "vertical-rl" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2, ease: EASE }}
        >
          SCROLL
        </motion.span>
      </div>
    </section>
  );
}
