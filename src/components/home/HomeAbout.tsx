"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomeAbout() {
  return (
    <section
      id="about"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0d0d1a, #0A0A0A)",
      }}
    >
      {/* Background image */}
      <Image
        src="/images/jon-matthews-ViVHl-M_ezI-unsplash.jpg"
        alt=""
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/65" />

      {/* Blue ambient glow */}
      <div
        className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "rgba(48,110,195,0.12)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Title */}
        <motion.div
          className="text-center mb-20 lg:mb-28"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black tracking-[0.15em] text-text-light">
            ABOUT US
          </h2>
          <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
        </motion.div>

        {/* Photo + Text layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: Photo */}
          <motion.div
            className="lg:w-[40%] shrink-0"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0 overflow-hidden rounded-sm">
              <Image
                src="/images/jon-matthews-ViVHl-M_ezI-unsplash.jpg"
                alt="西村昭彦"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div
            className="flex-1 flex flex-col justify-center"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
          >
            <span className="text-[10px] tracking-[0.25em] text-accent block mb-4">
              FOUNDER & CEO
            </span>
            <h3 className="font-serif text-4xl lg:text-5xl text-text-light mb-2">
              西村昭彦
            </h3>
            <p className="text-sm tracking-[0.15em] text-text-gray mb-8">
              AKIHIKO NISHIMURA
            </p>

            <p className="text-text-light/90 text-base lg:text-lg leading-relaxed mb-4">
              クロスミントン世界選手権6度優勝。バドミントンで全日本総合選手権に4度出場した競技経験を活かし、RST
              Agency株式会社を設立。
            </p>
            <p className="text-text-gray text-sm lg:text-base leading-relaxed mb-10">
              本格的なプレー環境を求めるプレイヤーのために、都市型ピックルボール施設を構想。
            </p>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-accent text-sm tracking-[0.15em] hover:gap-3 transition-all duration-300"
            >
              詳しく見る
              <span className="text-lg">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
