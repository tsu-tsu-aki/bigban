"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface ServiceItem {
  number: string;
  titleJa: string;
  titleEn: string;
  description: string;
  isReversed: boolean;
  isDark: boolean;
  imageSrc: string;
  imageAlt: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const SERVICES: ServiceItem[] = [
  {
    number: "01",
    titleJa: "コートレンタル",
    titleEn: "COURT RENTAL",
    description:
      "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。",
    isReversed: false,
    isDark: true,
    imageSrc: "/images/alex-saks-3k-yNMhYl5k-unsplash.jpg",
    imageAlt: "Empty court with net and balls",
    ctaLabel: "RESERVE",
    ctaHref: "#",
  },
  {
    number: "02",
    titleJa: "レッスン & クリニック",
    titleEn: "LESSONS & CLINICS",
    description:
      "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。海外トッププレーヤーを招聘した特別クリニックも定期開催。",
    isReversed: true,
    isDark: false,
    imageSrc: "/images/jon-matthews-usqfZcs_GfM-unsplash.jpg",
    imageAlt: "Female player reaching for a shot",
  },
  {
    number: "03",
    titleJa: "トレーニングプログラム",
    titleEn: "TRAINING",
    description:
      "フィジカルトレーニングを取り入れたピックルボール強化プログラム。併設トレーニングエリアでコンディショニング。プレーの質を根本から高める。",
    isReversed: false,
    isDark: true,
    imageSrc: "/images/jon-matthews-q13YtbIPuv0-unsplash.jpg",
    imageAlt: "Male player in ready stance",
  },
  {
    number: "04",
    titleJa: "大会 & リーグ",
    titleEn: "TOURNAMENTS & LEAGUES",
    description:
      "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで。",
    isReversed: true,
    isDark: false,
    imageSrc: "/images/jon-matthews-1gOtJQQyN04-unsplash.jpg",
    imageAlt: "Two players on the court",
  },
  {
    number: "05",
    titleJa: "イベント",
    titleEn: "EVENTS",
    description:
      "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。異業種コラボレーションやプロモーションイベントの会場としても。",
    isReversed: false,
    isDark: true,
    imageSrc: "/images/luxe-pickleball-VTKZwNXhaSc-unsplash.jpg",
    imageAlt: "Paddles crossed on court",
  },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomeServices() {
  return (
    <section id="services">
      {/* Section Title */}
      <div className="bg-deep-black text-text-light py-24 lg:py-32 pb-0 lg:pb-0">
        <motion.div
          className="text-center mb-20 lg:mb-28 mx-auto max-w-7xl px-6 lg:px-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black tracking-[0.15em]">
            SERVICES
          </h2>
          <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
        </motion.div>
      </div>
      {SERVICES.map((service) => (
        <div
          key={service.number}
          data-service-row
          className={
            service.isDark
              ? "bg-deep-black text-text-light"
              : "bg-off-white text-text-dark"
          }
        >
          <div
            className={`mx-auto max-w-7xl px-6 lg:px-12 py-20 lg:py-28 flex flex-col ${
              service.isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
            } gap-8 lg:gap-16 items-center`}
          >
            {/* Image — 60% */}
            <motion.div
              className="relative w-full lg:w-[60%] aspect-[16/10] rounded-sm overflow-hidden"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 1.2, ease: EASE }}
            >
              <Image
                src={service.imageSrc}
                alt={service.imageAlt}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Text content — 40% */}
            <motion.div
              className="w-full lg:w-[40%]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
            >
              <span className="font-serif text-5xl lg:text-7xl text-accent block mb-4">
                {service.number}
              </span>
              <h3 className="font-serif text-2xl lg:text-4xl mb-2">
                {service.titleJa}
              </h3>
              <p className="text-xs tracking-[0.2em] text-text-gray mb-6">
                {service.titleEn}
              </p>
              <p className="text-base leading-relaxed">
                {service.description}
              </p>
              {service.ctaLabel && service.ctaHref && (
                <a
                  href={service.ctaHref}
                  className="inline-block mt-6 bg-accent text-deep-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
                >
                  {service.ctaLabel}
                </a>
              )}
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
}
