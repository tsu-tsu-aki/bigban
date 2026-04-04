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
          className="text-center mb-20 lg:mb-28"
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

        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          {/* Text content */}
          <div className="flex-1">
            <motion.p
              className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              宇宙がビッグバンによって誕生したように、この場所から新しいピックルボール文化が広がり、大きなムーブメントへと発展していくことを願い名付けました。
            </motion.p>

            <motion.p
              className="text-sm md:text-base leading-loose text-text-gray mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
            >
              一つの小さなプレー。一つの小さなディンク。その積み重ねがやがて大きなエネルギーとなり、新しいスポーツ文化を生み出していく。THE
              PICKLE BANG
              THEORYは、そんな&ldquo;ピックルボールのビッグバン&rdquo;が生まれる場所を目指しています。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
            >
              <div className="w-10 h-[2px] bg-accent mb-6" />
              <p className="text-accent text-lg lg:text-xl font-bold tracking-wide">
                小さなディンクから、大きなムーブメントへ
              </p>
            </motion.div>
          </div>

          {/* Photo */}
          <motion.div
            className="relative w-full lg:w-[45%] shrink-0 aspect-[4/3] overflow-hidden rounded-sm"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            <Image
              src="/images/jon-matthews-ajk3K-zgiPU-unsplash.jpg"
              alt="Paddle and ball in atmospheric lighting"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
