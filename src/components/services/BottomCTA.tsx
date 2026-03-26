"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function BottomCTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative bg-accent overflow-hidden">
      {/* Subtle grain */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22/%3E%3C/svg%3E')] bg-repeat bg-[length:256px_256px]" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-[var(--font-dm-serif)] text-[clamp(1.8rem,3.5vw,3rem)] text-deep-black leading-tight max-w-lg"
        >
          まずはコートを予約してみませんか？
        </motion.h2>

        {/* CTA Button */}
        <motion.a
          href="#reserve"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="group inline-flex items-center gap-3 bg-deep-black text-off-white px-12 py-5 text-[12px] tracking-[0.25em] uppercase font-[var(--font-inter)] font-semibold hover:bg-[#1a1a1a] transition-colors duration-300"
          style={{ borderRadius: "2px" }}
        >
          RESERVE
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </motion.a>
      </div>
    </section>
  );
}
