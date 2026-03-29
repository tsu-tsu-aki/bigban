"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import type { FormEvent } from "react";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const charVariants = {
  hidden: { y: 100, opacity: 0, rotate: 5 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ─────────────────────────────────────────────
   AnimatedText — character-by-character reveal
───────────────────────────────────────────── */

function AnimatedText({
  text,
  className,
  isHero = false,
}: {
  text: string;
  className?: string;
  isHero?: boolean;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          variants={charVariants}
          initial="hidden"
          {...(isHero
            ? { animate: "visible" }
            : { whileInView: "visible", viewport: { once: true } })}
          custom={i}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */

const CONCEPT_TEXT =
  "クロスミントン世界王者・西村昭彦が、本気で上達したいすべてのプレーヤーのために作った空間。本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。練習、トレーニング、試合、そしてコミュニティ——すべてがここに。";

const NUMBERS = [
  { watermark: "3", value: "3", labelEn: "COURTS", labelJa: "プロ仕様コート" },
  {
    watermark: "17",
    value: "6:00–23:00",
    labelEn: "HOURS",
    labelJa: "営業時間",
  },
  {
    watermark: "1",
    value: "1 min",
    labelEn: "FROM STATION",
    labelJa: "駅徒歩1分",
  },
  {
    watermark: "48M",
    value: "4,800万+",
    labelEn: "US PLAYERS",
    labelJa: "米国競技人口",
  },
];

const COURT_SPECS = [
  { label: "SURFACE", value: "PickleRoll Pro（PPA Asia公式採用）" },
  { label: "COURTS", value: "3面（ハードコート）" },
  { label: "LAYOUT", value: "観戦可能な1面ショーコートに変更可能" },
  { label: "TYPE", value: "全天候型インドア / 空調完備" },
];

const AMENITIES = [
  { name: "空調完備", description: "年間を通じて快適なプレー環境を維持" },
  { name: "更衣室", description: "シャワー・ロッカー完備の清潔な更衣室" },
  {
    name: "トレーニングエリア",
    description: "ウォームアップ・ストレッチ用スペース",
  },
  { name: "ラウンジスペース", description: "観戦・休憩に最適なくつろぎの空間" },
  {
    name: "レンタル用品",
    description: "パドル・シューズなど手ぶらで利用可能",
  },
  {
    name: "無人チェックイン対応",
    description: "QRコードで24時間スムーズに入館",
  },
];

const SERVICES = [
  {
    number: "01",
    titleJa: "コートレンタル",
    titleEn: "COURT RENTAL",
    description:
      "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。",
  },
  {
    number: "02",
    titleJa: "レッスン & クリニック",
    titleEn: "LESSONS & CLINICS",
    description:
      "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。海外トッププレーヤーを招聘した特別クリニックも定期開催。",
  },
  {
    number: "03",
    titleJa: "トレーニングプログラム",
    titleEn: "TRAINING",
    description:
      "フィジカルトレーニングを取り入れたピックルボール強化プログラム。併設トレーニングエリアでコンディショニング。プレーの質を根本から高める。",
  },
  {
    number: "04",
    titleJa: "大会 & リーグ",
    titleEn: "TOURNAMENTS & LEAGUES",
    description:
      "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで。",
  },
  {
    number: "05",
    titleJa: "イベント",
    titleEn: "EVENTS",
    description:
      "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。異業種コラボレーションやプロモーションイベントの会場としても。",
  },
];

const PLANS = [
  { nameEn: "VISITOR", nameJa: "ビジター", type: "都度利用", isRecommended: false },
  { nameEn: "REGULAR", nameJa: "レギュラー会員", type: "月額制", isRecommended: true },
  { nameEn: "PREMIUM", nameJa: "プレミアム会員", type: "月額制", isRecommended: false },
];

const TIMELINE = [
  { text: "北海道出身。8歳でバドミントンを始める" },
  { text: "青森山田高校・中央大学で競技経験を積む" },
  { text: "インターハイ・全国高校選抜 シングルスベスト8" },
  { text: "全日本総合バドミントン選手権 4度出場" },
  { text: "クロスミントン転向", highlightYear: "2015年" },
  {
    text: "世界選手権ミックスダブルス4連覇、シングルス2連覇（計6度優勝）",
  },
  {
    text: "ピックルボール転向、選手兼大会ディレクター",
    highlightYear: "2023年",
  },
  { text: "RST Agency株式会社 代表取締役" },
];

const ACCESS_ROUTES = [
  { line: "JR総武線", station: "「本八幡駅」北口", walkTime: "徒歩1分" },
  { line: "都営新宿線", station: "「本八幡駅」", walkTime: "徒歩3分" },
  { line: "京成本線", station: "「京成八幡駅」", walkTime: "徒歩5分" },
];

const CATEGORIES = [
  { value: "", label: "選択してください" },
  { value: "court", label: "コート予約" },
  { value: "lesson", label: "レッスンについて" },
  { value: "press", label: "取材依頼" },
  { value: "other", label: "その他" },
];

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.!2d139.924!3d35.726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5Y2D6JGJ55yM5biC5bed5biC5YWr5bmhMi0xNi02!5e0!3m2!1sja!2sjp!4v1";

const PRESS_URL =
  "https://prtimes.jp/main/html/rd/p/000000003.000179043.html";

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default function Home() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus("sending");
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setFormStatus(res.ok ? "success" : "error");
    } catch {
      setFormStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-[#333] bg-transparent py-3 text-[#E6E6E6] placeholder:text-[#666]/60 focus:border-[#F6FF54] focus:outline-none transition-colors";

  return (
    <main className="bg-black overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-4 lg:px-12 transition-all duration-300 backdrop-blur-md bg-black/50">
        <Image src="/logos/yoko-neon.png" alt="THE PICKLE BANG THEORY" width={160} height={32} className="h-6 w-auto" />
        <a href="#" className="bg-[#F6FF54] px-4 py-2 text-xs font-semibold tracking-wider text-black">RESERVE</a>
      </header>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image src="/images/jon-matthews-YFNDwuYoyCA-unsplash.jpg" alt="Player mid-swing" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        {/* Neon logo */}
        <motion.div className="relative z-10"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: EASE }}
        >
          <Image
            src="/logos/tate-neon.png"
            alt="THE PICKLE BANG THEORY"
            width={300}
            height={400}
            className="mx-auto h-[35vh] w-auto"
            priority
          />
        </motion.div>

        {/* Main title — character animation */}
        <div className="relative z-10 mt-8 text-center">
          <h1 className="font-serif text-[clamp(3rem,9vw,9rem)] leading-[1.1]">
            <AnimatedText
              text="ビッグバン"
              className="text-[#F6FF54]"
              isHero
            />
          </h1>
          <motion.p
            className="mt-4 text-sm tracking-[0.3em] text-[#666]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            FROM A SMALL DINK TO A BIG MOVEMENT
          </motion.p>
        </div>

        {/* CTA */}
        <motion.a
          href="#contact"
          className="relative z-10 mt-10 bg-[#F6FF54] px-10 py-4 text-sm font-semibold tracking-wider text-black transition-opacity hover:opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          RESERVE A COURT &rarr;
        </motion.a>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 z-10 scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <span className="block h-10 w-px bg-[#666]/40 mx-auto" />
          <span className="block mt-2 text-[10px] tracking-[0.3em] text-[#666]">
            SCROLL
          </span>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          CONCEPT MARQUEE
      ═══════════════════════════════════════ */}
      <section className="overflow-hidden py-20 border-y border-[#222]">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: "marquee 50s linear infinite" }}
        >
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className="font-serif text-[clamp(2rem,4vw,4rem)] text-[#E6E6E6]/20 mr-16"
            >
              {CONCEPT_TEXT}
              {"  ━━━  "}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NUMBERS — full-screen each
      ═══════════════════════════════════════ */}
      {NUMBERS.map((stat, idx) => (
        <section
          key={stat.labelEn}
          className="relative flex h-screen items-center justify-center overflow-hidden"
        >
          {/* Giant watermark */}
          <span
            className="absolute font-serif text-[20vw] md:text-[25vw] leading-none text-[#E6E6E6]/[0.07] select-none pointer-events-none"
            aria-hidden="true"
          >
            {stat.watermark}
          </span>

          {/* Actual value centered */}
          <motion.div
            className="relative text-center z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.7, ease: EASE }}>
              <span className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#E6E6E6]">
                {stat.value}
              </span>
            </motion.div>
            <motion.p
              className="mt-4 text-xs tracking-[0.3em] text-[#F6FF54]"
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {stat.labelEn}
            </motion.p>
            <motion.p
              className="mt-2 text-sm text-[#666]"
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {stat.labelJa}
            </motion.p>
          </motion.div>

          {/* Thin divider at bottom */}
          {idx < NUMBERS.length - 1 && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px bg-[#333]" />
          )}
        </section>
      ))}

      {/* ═══════════════════════════════════════
          FACILITY
      ═══════════════════════════════════════ */}
      <section id="facility" className="relative py-32 lg:py-40 px-6 lg:px-12 overflow-hidden">
        {/* Facility background image */}
        <div className="absolute inset-0">
          <Image src="/images/sarasota-guide-uHdY8VYTfbI-unsplash.jpg" alt="Aerial court view" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/80" />
        </div>
        {/* Giant watermark */}
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[18vw] text-[#E6E6E6]/[0.04] select-none pointer-events-none whitespace-nowrap"
          aria-hidden="true"
        >
          FACILITY
        </span>

        <div className="relative mx-auto max-w-6xl z-10">
          <motion.p
            className="text-xs tracking-[0.3em] text-[#666] mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            FACILITY
          </motion.p>

          {/* Court Specs — typographic grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 mb-20">
            {COURT_SPECS.map((spec, i) => (
              <motion.div
                key={spec.label}
                className="border-b border-[#222] pb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              >
                <span className="block text-xs tracking-[0.25em] text-[#F6FF54] mb-2">
                  {spec.label}
                </span>
                <span className="block text-lg text-[#E6E6E6] leading-relaxed">
                  {spec.value}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Amenities — list with hover reveal */}
          <motion.div
            className="border-t border-[#222]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {AMENITIES.map((amenity, i) => (
              <motion.div
                key={amenity.name}
                className="group flex items-baseline justify-between border-b border-[#222] py-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              >
                <span className="text-[#E6E6E6] text-base">
                  {amenity.name}
                </span>
                <span className="text-[#666] text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4 text-right">
                  {amenity.description}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════ */}
      <section id="services" className="py-32 lg:py-40 px-6 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.p
            className="text-xs tracking-[0.3em] text-[#666] mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            SERVICES
          </motion.p>

          <div className="space-y-24">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.number}
                className="border-b border-[#222] pb-12"
                initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="flex items-baseline gap-6 mb-4">
                  <span className="font-serif text-6xl md:text-8xl text-[#F6FF54] leading-none">
                    {service.number}
                  </span>
                  <div>
                    <h3 className="font-serif text-3xl md:text-5xl text-[#E6E6E6] leading-tight">
                      {service.titleJa}
                    </h3>
                    <p className="text-xs tracking-[0.25em] text-[#666] mt-1">
                      {service.titleEn}
                    </p>
                  </div>
                </div>
                <p className="text-base text-[#E6E6E6]/80 leading-relaxed max-w-2xl ml-0 md:ml-28">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
      <section id="pricing" className="py-32 lg:py-40 px-6 lg:px-12 border-t border-[#222]">
        <div className="mx-auto max-w-6xl">
          {/* Coming soon headline */}
          <div className="text-center mb-8 overflow-hidden">
            <h2 className="font-serif text-3xl md:text-5xl">
              <AnimatedText
                text="料金の詳細は近日公開"
                className="text-[#E6E6E6]"
              />
            </h2>
          </div>

          {/* Instagram */}
          <motion.p
            className="text-center text-[#666] mb-20"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            最新情報はInstagramでお知らせいたします。
            <a
              href="https://www.instagram.com/thepicklebangtheory"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F6FF54] hover:underline ml-1"
            >
              @thepicklebangtheory
            </a>
          </motion.p>

          {/* 3 Tiers */}
          <motion.div
            className="grid md:grid-cols-3 border-t border-[#333]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {PLANS.map((plan, i) => (
              <div
                key={plan.nameEn}
                className={`border-b border-[#333] ${
                  i < PLANS.length - 1 ? "md:border-r" : ""
                } ${
                  plan.isRecommended ? "border-t-2 border-t-[#F6FF54]" : ""
                } p-8 lg:p-10`}
              >
                <p className="text-xs tracking-[0.2em] text-[#666] mb-1">
                  {plan.nameEn} / {plan.nameJa}
                </p>
                <p className="text-sm text-[#666] mb-6">{plan.type}</p>
                <p className="font-serif text-2xl text-[#E6E6E6]">
                  COMING SOON
                </p>
                {plan.isRecommended && (
                  <span className="inline-block mt-4 text-xs tracking-[0.15em] text-[#F6FF54]">
                    おすすめ
                  </span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Rental note */}
          <motion.div
            className="flex items-center gap-3 mt-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            <span className="h-2 w-2 rounded-full bg-[#F6FF54] shrink-0" />
            <p className="text-sm text-[#666]">
              レンタルパドル・ボールをご用意しています。手ぶらでお気軽にお越しください。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOUNDER
      ═══════════════════════════════════════ */}
      <section id="founder" className="relative py-32 lg:py-40 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/jon-matthews-ViVHl-M_ezI-unsplash.jpg" alt="Athletic backhand" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative mx-auto max-w-6xl z-10">
          <motion.p
            className="text-xs tracking-[0.3em] text-[#666] mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            FOUNDER
          </motion.p>

          {/* Giant name */}
          <div className="overflow-hidden mb-4">
            <h2 className="font-serif text-[clamp(4rem,15vw,15rem)] leading-[0.9]">
              <AnimatedText text="西村昭彦" className="text-[#E6E6E6]" />
            </h2>
          </div>

          <motion.p
            className="text-sm tracking-[0.2em] text-[#666] mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            AKIHIKO NISHIMURA ━ クロスミントン世界選手権 6度優勝
          </motion.p>

          {/* Timeline */}
          <div className="max-w-3xl">
            <ul className="space-y-4">
              {TIMELINE.map((entry, i) => (
                <motion.li
                  key={entry.text}
                  className="flex items-start gap-4 text-[#E6E6E6]/90 text-base lg:text-lg leading-relaxed"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                >
                  <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#F6FF54]" />
                  <span>
                    {entry.highlightYear && (
                      <span className="text-[#F6FF54] font-bold">
                        {entry.highlightYear}{" "}
                      </span>
                    )}
                    {entry.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Press */}
          <div className="mt-20 border-t border-[#222] pt-12">
            <motion.p
              className="text-xs tracking-[0.3em] text-[#666] font-bold mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              PRESS
            </motion.p>
            <motion.p
              className="text-[#E6E6E6]/80 text-base lg:text-lg leading-relaxed mb-4 max-w-3xl"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              クロスミントン世界王者・西村昭彦
              本八幡駅徒歩1分に都市型ピックルボール施設「THE PICKLE BANG
              THEORY」2026年春オープン
            </motion.p>
            <motion.a
              href={PRESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#F6FF54] text-sm tracking-wide hover:underline"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              PR TIMES &rarr;
            </motion.a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ACCESS
      ═══════════════════════════════════════ */}
      <section id="access" className="py-32 lg:py-40 px-6 lg:px-12 border-t border-[#222]">
        <div className="mx-auto max-w-6xl">
          <motion.p
            className="text-xs tracking-[0.3em] text-[#666] mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            ACCESS
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-16">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="font-serif text-2xl text-[#E6E6E6] mb-6">
                THE PICKLE BANG THEORY
              </p>
              <div className="space-y-2 text-base text-[#E6E6E6]/80 leading-relaxed">
                <p>〒272-0021</p>
                <p>千葉県市川市八幡2-16-6 6階</p>
                <p>営業時間：6:00 – 23:00（不定休）</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:hello@rstagency.com"
                    className="text-[#F6FF54] hover:underline"
                  >
                    hello@rstagency.com
                  </a>
                </p>
              </div>
            </motion.div>

            {/* Routes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <ul>
                {ACCESS_ROUTES.map((route) => (
                  <li
                    key={route.line}
                    className="flex items-center justify-between py-4 border-b border-[#222] text-[#E6E6E6]"
                  >
                    <span>
                      <span className="font-semibold">{route.line}</span>{" "}
                      {route.station}
                    </span>
                    <span className="text-[#F6FF54] font-semibold">
                      {route.walkTime}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[#666] text-sm">
                お車でお越しの方は近隣のコインパーキングをご利用ください。
              </p>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <iframe
              src={MAPS_EMBED_URL}
              title="THE PICKLE BANG THEORY 所在地"
              className="h-[300px] md:h-[450px] w-full"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CONTACT
      ═══════════════════════════════════════ */}
      <section id="contact" className="py-32 lg:py-40 px-6 lg:px-12 border-t border-[#222]">
        <div className="mx-auto max-w-6xl">
          {/* Giant heading */}
          <div className="overflow-hidden mb-20">
            <h2 className="font-serif text-[clamp(2rem,7vw,7rem)]">
              <AnimatedText text="GET IN TOUCH" className="text-[#E6E6E6]" />
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="contact-name" className="sr-only">
                    お名前
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="お名前 *"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="sr-only">
                    メールアドレス
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="メールアドレス *"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="sr-only">
                    電話番号
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="電話番号"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-category" className="sr-only">
                    お問い合わせ種別
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    required
                    className={`${inputClass} cursor-pointer`}
                    defaultValue=""
                  >
                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat.value}
                        value={cat.value}
                        disabled={cat.value === ""}
                      >
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="sr-only">
                    お問い合わせ内容
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    placeholder="お問い合わせ内容 *"
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="bg-[#F6FF54] text-black px-8 py-3 text-sm font-semibold tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  SEND MESSAGE &rarr;
                </button>

                {formStatus === "success" && (
                  <p className="text-[#F6FF54] mt-4">
                    送信しました。ありがとうございます。
                  </p>
                )}
                {formStatus === "error" && (
                  <p className="text-red-400 mt-4">
                    送信に失敗しました。もう一度お試しください。
                  </p>
                )}
              </form>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <div className="space-y-8">
                <div>
                  <p className="text-sm text-[#666] mb-1">Email</p>
                  <a
                    href="mailto:hello@rstagency.com"
                    className="text-xl text-[#F6FF54] hover:underline"
                  >
                    hello@rstagency.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-[#666] mb-1">Instagram</p>
                  <a
                    href="https://www.instagram.com/thepicklebangtheory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-[#E6E6E6] hover:text-[#F6FF54] transition-colors"
                  >
                    @thepicklebangtheory
                  </a>
                </div>
                <div>
                  <p className="text-sm text-[#666] mb-1">Address</p>
                  <p className="text-lg text-[#E6E6E6]">
                    千葉県市川市八幡2-16-6 6階
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#666] mb-1">Hours</p>
                  <p className="text-lg text-[#E6E6E6]">6:00 – 23:00</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="py-16 px-6 border-t border-[#222]">
        <div className="mx-auto max-w-6xl text-center">
          {/* Brand name stretched wide */}
          <p className="font-serif text-[clamp(1rem,3vw,2rem)] tracking-[0.5em] text-[#666]/30">
            THE PICKLE BANG THEORY
          </p>
          <div className="mt-4 flex items-center justify-center gap-8">
            <Image
              src="/logos/yoko-neon.png"
              alt="THE PICKLE BANG THEORY"
              width={120}
              height={40}
              className="h-6 w-auto opacity-30"
            />
          </div>
          <p className="mt-6 text-[10px] tracking-[0.3em] text-[#666]/20">
            &copy; 2026 RST Agency Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
