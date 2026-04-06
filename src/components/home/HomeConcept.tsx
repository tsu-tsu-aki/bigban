"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomeConcept() {
  return (
    <section id="concept" className="bg-off-white text-text-dark py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black tracking-[0.15em]">
            CONCEPT
          </h2>
          <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
        </motion.div>

        {/* Photo overlay with text */}
        <motion.div
          className="relative w-full overflow-hidden rounded-sm"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/9]">
            <Image
              src="/images/concept-bigbang.jpg"
              alt="ビッグバン — 宇宙の誕生"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/70" />

            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="px-6 sm:px-8 md:px-12 lg:px-16 max-w-3xl drop-shadow-lg">
                {/* Lead paragraph */}
                <motion.p
                  className="text-white text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
                >
                  宇宙がビッグバンによって誕生したように、この場所から新しいピックルボール文化が広がり、やがて大きなムーブメントへと発展していく。その想いを込めて、この名前を名付けました。
                </motion.p>

                {/* Poetry lines */}
                <motion.div
                  className="mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                >
                  <p className="text-white text-base sm:text-lg md:text-xl font-bold leading-loose">
                    1つの小さなプレー。
                  </p>
                  <p className="text-white text-base sm:text-lg md:text-xl font-bold leading-loose">
                    1つの小さなディンク。
                  </p>
                </motion.div>

                {/* Description */}
                <motion.div
                  className="mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
                >
                  <p className="text-white/80 text-sm sm:text-base md:text-lg leading-loose mb-2">
                    その積み重ねが、やがて大きなエネルギーとなり、
                    <br className="hidden sm:inline" />
                    新しいスポーツ文化を生み出していく。
                  </p>
                  <p className="text-white/80 text-sm sm:text-base md:text-lg leading-loose">
                    THE PICKLE BANG THEORYは、
                    <br className="hidden sm:inline" />
                    &ldquo;ピックルボールのビッグバン&rdquo;が生まれる場所を目指しています。
                  </p>
                </motion.div>

                {/* Catchcopy */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{ duration: 1.1, delay: 0.4, ease: EASE }}
                >
                  <div className="w-10 h-[2px] bg-accent mb-4" />
                  <p className="text-accent text-lg sm:text-xl lg:text-2xl font-black tracking-wide">
                    小さなディンクから、大きなムーブメントへ。
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
