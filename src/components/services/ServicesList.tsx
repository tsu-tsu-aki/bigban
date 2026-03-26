"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

interface ServiceData {
  num: string;
  titleJa: string;
  titleEn: string;
  body: string[];
  dark: boolean;
  imageFirst: boolean;
  imageDirection: string[];
  imageLights: { position: string; color: string; size: string }[];
}

const services: ServiceData[] = [
  {
    num: "01",
    titleJa: "コートレンタル",
    titleEn: "COURT RENTAL",
    body: [
      "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。",
      "早朝6:00から深夜23:00まで。あなたのスケジュールに合わせて。",
    ],
    dark: true,
    imageFirst: true,
    imageDirection: ["Empty court, clean surface", "dramatic overhead lighting", "pristine professional setup"],
    imageLights: [
      { position: "top-[15%] left-[25%]", color: "bg-off-white/4", size: "w-80 h-80" },
      { position: "top-[10%] right-[30%]", color: "bg-off-white/3", size: "w-60 h-60" },
      { position: "bottom-[25%] left-[40%]", color: "bg-accent/4", size: "w-48 h-48" },
    ],
  },
  {
    num: "02",
    titleJa: "レッスン & クリニック",
    titleEn: "LESSONS & CLINICS",
    body: [
      "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。",
      "海外トッププレーヤーを招聘した特別クリニックも定期開催。",
    ],
    dark: false,
    imageFirst: false,
    imageDirection: ["Coach demonstrating technique", "paddle grip close-up", "focused instruction moment"],
    imageLights: [
      { position: "top-[20%] right-[20%]", color: "bg-off-white/6", size: "w-72 h-72" },
      { position: "bottom-[30%] left-[25%]", color: "bg-accent/5", size: "w-56 h-56" },
    ],
  },
  {
    num: "03",
    titleJa: "トレーニングプログラム",
    titleEn: "TRAINING",
    body: [
      "フィジカルトレーニングを取り入れたピックルボール強化プログラム。",
      "併設トレーニングエリアでコンディショニング。プレーの質を根本から高める。",
    ],
    dark: true,
    imageFirst: true,
    imageDirection: ["Training area with weights", "stretch mats, court visible behind", "moody industrial feel"],
    imageLights: [
      { position: "top-[25%] left-[20%]", color: "bg-off-white/3", size: "w-64 h-64" },
      { position: "bottom-[20%] right-[25%]", color: "bg-accent/3", size: "w-48 h-48" },
    ],
  },
  {
    num: "04",
    titleJa: "大会 & リーグ",
    titleEn: "TOURNAMENTS & LEAGUES",
    body: [
      "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで、競技の場を提供。",
    ],
    dark: false,
    imageFirst: false,
    imageDirection: ["Scoreboard, post-match handshake", "spectators watching intensely", "competitive atmosphere"],
    imageLights: [
      { position: "top-[15%] left-[30%]", color: "bg-off-white/5", size: "w-80 h-80" },
      { position: "bottom-[25%] right-[20%]", color: "bg-accent/4", size: "w-56 h-56" },
    ],
  },
  {
    num: "05",
    titleJa: "イベント",
    titleEn: "EVENTS",
    body: [
      "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。",
      "異業種コラボレーションやプロモーションイベントの会場としても。",
    ],
    dark: true,
    imageFirst: true,
    imageDirection: ["Show court setup", "spectator seating, event lighting", "atmosphere of anticipation"],
    imageLights: [
      { position: "top-[10%] left-[20%]", color: "bg-accent/5", size: "w-72 h-72" },
      { position: "top-[20%] right-[25%]", color: "bg-off-white/4", size: "w-64 h-64" },
      { position: "bottom-[15%] left-[45%]", color: "bg-off-white/3", size: "w-48 h-48" },
    ],
  },
];

function ImagePlaceholder({
  direction,
  lights,
  dark,
}: {
  direction: string[];
  lights: ServiceData["imageLights"];
  dark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.08, 1]);

  const baseBg = dark
    ? "from-[#111] via-[#0d0d0d] to-[#080808]"
    : "from-[#2a2825] via-[#1e1c1a] to-[#141210]";

  return (
    <div ref={ref} className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[500px]">
      <motion.div style={{ y, scale }} className="absolute inset-[-10%] w-[120%] h-[120%]">
        <div className={`w-full h-full bg-gradient-to-br ${baseBg} relative`}>
          {lights.map((light, i) => (
            <div
              key={i}
              className={`absolute ${light.position} ${light.size} ${light.color} rounded-full blur-[100px]`}
            />
          ))}
          <div className="absolute bottom-4 right-4">
            {direction.map((line, i) => (
              <p key={i} className="text-off-white/15 text-[8px] tracking-[0.3em] uppercase leading-relaxed text-right">
                [{line}]
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ServiceBlock({ service }: { service: ServiceData }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const bg = service.dark ? "bg-deep-black" : "bg-off-white";
  const textColor = service.dark ? "text-off-white" : "text-text-dark";
  const subTextColor = service.dark ? "text-off-white/70" : "text-text-dark/70";

  return (
    <section ref={ref} className={`relative ${bg} overflow-hidden`}>
      <div className="max-w-[1440px] mx-auto">
        <div
          className={`flex flex-col ${
            service.imageFirst ? "md:flex-row" : "md:flex-row-reverse"
          }`}
        >
          {/* Image — 58% */}
          <div className="md:w-[58%]">
            <motion.div
              initial={{ clipPath: service.imageFirst ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
              animate={isInView ? { clipPath: "inset(0 0% 0 0%)" } : {}}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full"
            >
              <ImagePlaceholder
                direction={service.imageDirection}
                lights={service.imageLights}
                dark={service.dark}
              />
            </motion.div>
          </div>

          {/* Text — 42% */}
          <div className="md:w-[42%] flex items-center">
            <div
              className={`w-full px-8 ${
                service.imageFirst ? "md:pl-16 lg:pl-24 md:pr-8" : "md:pr-16 lg:pr-24 md:pl-8"
              } py-20 md:py-28`}
            >
              {/* Number */}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-[var(--font-dm-serif)] text-[clamp(4rem,7vw,6rem)] text-accent leading-none block mb-4"
              >
                {service.num}
              </motion.span>

              {/* English label */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-[10px] tracking-[0.4em] text-text-gray uppercase font-[var(--font-inter)] mb-3"
              >
                {service.titleEn}
              </motion.p>

              {/* Japanese title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
                className={`font-[var(--font-dm-serif)] text-[clamp(1.8rem,3.5vw,2.8rem)] ${textColor} leading-tight mb-8`}
              >
                {service.titleJa}
              </motion.h2>

              {/* Body */}
              {service.body.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.12 }}
                  className={`font-[var(--font-inter)] ${subTextColor} text-[clamp(0.9rem,1.2vw,1.05rem)] leading-[2] tracking-wide ${
                    i < service.body.length - 1 ? "mb-4" : ""
                  }`}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesList() {
  return (
    <>
      {services.map((service, i) => (
        <ServiceBlock key={i} service={service} />
      ))}
    </>
  );
}
