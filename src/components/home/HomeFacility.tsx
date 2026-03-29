"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface CourtSpec {
  label: string;
  value: string;
}

interface Amenity {
  name: string;
  description: string;
}

const COURT_SPECS: CourtSpec[] = [
  { label: "SURFACE", value: "PickleRoll Pro（PPA Asia公式採用）" },
  { label: "COURTS", value: "3面（ハードコート）" },
  { label: "LAYOUT", value: "観戦可能な1面ショーコートに変更可能" },
  { label: "TYPE", value: "全天候型インドア / 空調完備" },
];

const AMENITIES: Amenity[] = [
  { name: "空調完備", description: "年間を通じて快適なプレー環境を維持" },
  { name: "更衣室", description: "シャワー・ロッカー完備の清潔な更衣室" },
  { name: "トレーニングエリア", description: "ウォームアップ・ストレッチ用スペース" },
  { name: "ラウンジスペース", description: "観戦・休憩に最適なくつろぎの空間" },
  { name: "レンタル用品", description: "パドル・シューズなど手ぶらで利用可能" },
  { name: "無人チェックイン対応", description: "QRコードで24時間スムーズに入館" },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomeFacility() {
  return (
    <section id="facility" className="bg-deep-black py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section label */}
        <motion.p
          className="text-xs tracking-[0.3em] text-text-gray mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          FACILITY
        </motion.p>

        {/* Court showcase */}
        <motion.div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-sm mb-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {/* Facility photo */}
          <Image
            src="/images/sarasota-guide-uHdY8VYTfbI-unsplash.jpg"
            alt="Indoor facility court view"
            fill
            className="object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-deep-black/95 via-deep-black/60 to-transparent" />

          {/* Specs overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {COURT_SPECS.map((spec, i) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.1,
                    ease: EASE,
                  }}
                >
                  <span className="block text-xs tracking-[0.2em] text-accent mb-1">
                    {spec.label}
                  </span>
                  <span className="block text-sm text-text-light leading-relaxed">
                    {spec.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Amenities list */}
        <motion.div
          className="border-t border-text-gray/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          {AMENITIES.map((amenity, i) => (
            <motion.div
              key={amenity.name}
              className="group border-b border-text-gray/20 py-4 lg:py-5 flex items-baseline justify-between cursor-default"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.06,
                ease: EASE,
              }}
            >
              <span className="text-text-light text-sm lg:text-base">
                {amenity.name}
              </span>
              <span className="text-text-gray text-xs lg:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4 text-right">
                {amenity.description}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
