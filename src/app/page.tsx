"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import type { FormEvent } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const COURT_SPECS = [
  { label: "SURFACE", value: "PickleRoll Pro（PPA Asia公式採用）" },
  { label: "COURTS", value: "3面（ハードコート）" },
  { label: "LAYOUT", value: "観戦可能な1面ショーコートに変更可能" },
  { label: "TYPE", value: "全天候型インドア / 空調完備" },
] as const;

const AMENITIES = [
  { name: "空調完備", description: "年間を通じて快適なプレー環境を維持" },
  { name: "更衣室", description: "シャワー・ロッカー完備の清潔な更衣室" },
  { name: "トレーニングエリア", description: "ウォームアップ・ストレッチ用スペース" },
  { name: "ラウンジスペース", description: "観戦・休憩に最適なくつろぎの空間" },
  { name: "レンタル用品", description: "パドル・シューズなど手ぶらで利用可能" },
  { name: "無人チェックイン対応", description: "QRコードで24時間スムーズに入館" },
] as const;

const SERVICES = [
  {
    number: "01",
    titleJa: "コートレンタル",
    titleEn: "COURT RENTAL",
    description: "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。",
    image: "/images/alex-saks-3k-yNMhYl5k-unsplash.jpg",
    imageAlt: "Indoor court with net",
  },
  {
    number: "02",
    titleJa: "レッスン & クリニック",
    titleEn: "LESSONS & CLINICS",
    description: "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。海外トッププレーヤーを招聘した特別クリニックも定期開催。",
    image: "/images/jon-matthews-usqfZcs_GfM-unsplash.jpg",
    imageAlt: "Player reach shot",
  },
  {
    number: "03",
    titleJa: "トレーニングプログラム",
    titleEn: "TRAINING",
    description: "フィジカルトレーニングを取り入れたピックルボール強化プログラム。併設トレーニングエリアでコンディショニング。プレーの質を根本から高める。",
    image: "/images/jon-matthews-q13YtbIPuv0-unsplash.jpg",
    imageAlt: "Player ready stance",
  },
  {
    number: "04",
    titleJa: "大会 & リーグ",
    titleEn: "TOURNAMENTS & LEAGUES",
    description: "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで。",
    image: "/images/jon-matthews-1gOtJQQyN04-unsplash.jpg",
    imageAlt: "Two players community",
  },
  {
    number: "05",
    titleJa: "イベント",
    titleEn: "EVENTS",
    description: "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。異業種コラボレーションやプロモーションイベントの会場としても。",
    image: "/images/luxe-pickleball-VTKZwNXhaSc-unsplash.jpg",
    imageAlt: "Paddles crossed",
  },
] as const;

const PLANS = [
  { nameEn: "VISITOR", nameJa: "ビジター", type: "都度利用", isRecommended: false },
  { nameEn: "REGULAR", nameJa: "レギュラー会員", type: "月額制", isRecommended: true },
  { nameEn: "PREMIUM", nameJa: "プレミアム会員", type: "月額制", isRecommended: false },
] as const;

const TIMELINE = [
  { text: "北海道出身。8歳でバドミントンを始める", highlightYear: "" },
  { text: "青森山田高校・中央大学で競技経験を積む", highlightYear: "" },
  { text: "インターハイ・全国高校選抜 シングルスベスト8", highlightYear: "" },
  { text: "全日本総合バドミントン選手権 4度出場", highlightYear: "" },
  { text: "クロスミントン転向", highlightYear: "2015年" },
  { text: "世界選手権ミックスダブルス4連覇、シングルス2連覇（計6度優勝）", highlightYear: "" },
  { text: "ピックルボール転向、選手兼大会ディレクター", highlightYear: "2023年" },
  { text: "RST Agency株式会社 代表取締役", highlightYear: "" },
] as const;

const ACCESS_ROUTES = [
  { line: "JR総武線", station: "「本八幡駅」北口", walkTime: "徒歩1分" },
  { line: "都営新宿線", station: "「本八幡駅」", walkTime: "徒歩3分" },
  { line: "京成本線", station: "「京成八幡駅」", walkTime: "徒歩5分" },
] as const;

const CATEGORIES = [
  { value: "", label: "選択してください" },
  { value: "court", label: "コート予約" },
  { value: "lesson", label: "レッスンについて" },
  { value: "press", label: "取材依頼" },
  { value: "other", label: "その他" },
] as const;

const NAV_LINKS = [
  { label: "CONCEPT", href: "#concept" },
  { label: "FACILITY", href: "#facility" },
  { label: "SERVICES", href: "#services" },
  { label: "PRICING", href: "#pricing" },
  { label: "ACCESS", href: "#access" },
  { label: "CONTACT", href: "#contact" },
] as const;

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.!2d139.924!3d35.726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5Y2D6JGJ55yM5biC5bed5biC5YWr5bmhMi0xNi02!5e0!3m2!1sja!2sjp!4v1";

const PRESS_TITLE =
  "クロスミントン世界王者・西村昭彦 本八幡駅徒歩1分に都市型ピックルボール施設『THE PICKLE BANG THEORY』2026年春オープン";

const PRESS_URL =
  "https://prtimes.jp/main/html/rd/p/000000003.000179043.html";

export default function Home() {
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

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
      if (!res.ok) { setFormStatus("error"); return; }
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-[#8A8A8A]/40 bg-transparent py-3 text-[#E6E6E6] placeholder:text-[#8A8A8A]/60 focus:border-[#F6FF54] focus:outline-none transition-colors";

  return (
    <main className="h-screen overflow-y-auto snap-y snap-mandatory" style={{ scrollBehavior: "smooth" }}>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-4 lg:px-12 transition-all duration-300 backdrop-blur-md bg-black/50">
        <Image src="/logos/yoko-neon.png" alt="THE PICKLE BANG THEORY" width={160} height={32} className="h-6 w-auto" />
        <a href="#" className="bg-[#F6FF54] px-4 py-2 text-xs font-semibold tracking-wider text-black">RESERVE</a>
      </header>

      {/* Section 1: Hero */}
      <section className="relative flex h-screen snap-start items-center justify-center bg-black overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image src="/images/jon-matthews-YFNDwuYoyCA-unsplash.jpg" alt="Player mid-swing" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#306EC3]/[0.08] rounded-full blur-[220px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-[#11317B]/[0.06] rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 text-center px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: EASE }}
          >
            <Image
              src="/logos/yoko-neon.png"
              alt="THE PICKLE BANG THEORY"
              width={480}
              height={96}
              className="mx-auto h-16 w-auto lg:h-24"
              priority
            />
          </motion.div>
          <motion.h1
            className="mt-10 font-serif text-[clamp(1.8rem,4vw,4rem)] leading-[1.3] text-[#E6E6E6]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            ここから、ピックルボールの<br />
            <span className="text-[#F6FF54]">ビッグバン</span>が始まる。
          </motion.h1>
          <motion.p
            className="mt-5 text-xs tracking-[0.3em] text-[#8A8A8A]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            FROM A SMALL DINK TO A BIG MOVEMENT
          </motion.p>
          <motion.a
            href="#"
            className="mt-8 inline-block bg-[#F6FF54] px-8 py-4 text-sm font-semibold tracking-wider text-black transition-opacity hover:opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            RESERVE A COURT &rarr;
          </motion.a>
        </div>
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] text-[#8A8A8A]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </motion.div>
      </section>

      {/* Section 2: Concept */}
      <section id="concept" className="relative flex h-screen snap-start items-center justify-center bg-[#0a0a1a] px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/jon-matthews-ajk3K-zgiPU-unsplash.jpg" alt="Paddle and ball on court" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/80" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] bg-[#306EC3]/[0.05] rounded-full blur-[180px]" />
        </div>
        <div className="absolute top-8 left-8 text-xs tracking-[0.3em] text-[#8A8A8A]/40 font-bold">CONCEPT</div>
        <motion.div
          className="relative z-10 max-w-2xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <p className="text-lg leading-[2.2] text-[#E6E6E6] lg:text-xl">
            クロスミントン世界王者・西村昭彦が、<br className="hidden lg:block" />
            本気で上達したいすべてのプレーヤーのために作った空間。
          </p>
          <p className="mt-6 text-lg leading-[2.2] text-[#E6E6E6] lg:text-xl">
            本八幡駅徒歩1分。プロ仕様ハードコート3面。<br className="hidden lg:block" />
            早朝から深夜まで。
          </p>
          <p className="mt-6 text-lg leading-[2.2] text-[#E6E6E6] lg:text-xl">
            練習、トレーニング、試合、そしてコミュニティ——<br className="hidden lg:block" />
            すべてがここに。
          </p>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #306EC3, transparent)" }} />
      </section>

      {/* Section 3: Numbers */}
      <section className="relative flex h-screen snap-start items-center justify-center bg-black px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#306EC3]/[0.05] rounded-full blur-[280px]" />
        </div>
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {[
            { v: "3", en: "COURTS", ja: "プロ仕様コート" },
            { v: "6:00–23:00", en: "HOURS", ja: "営業時間" },
            { v: "1 min", en: "FROM STATION", ja: "駅徒歩1分" },
            { v: "4,800万+", en: "US PLAYERS", ja: "米国競技人口" },
          ].map((s, i) => (
            <motion.div
              key={s.en}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <span className="block font-serif text-[clamp(2.5rem,5vw,6rem)] text-[#E6E6E6]">{s.v}</span>
              <span className="mt-2 block text-[10px] tracking-[0.25em] text-[#8A8A8A]">{s.en}</span>
              <span className="mt-1 block text-sm text-[#E6E6E6]/50">{s.ja}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Facility */}
      <section id="facility" className="relative flex h-screen snap-start flex-col items-center justify-center bg-[#0a0a1a] px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/sarasota-guide-uHdY8VYTfbI-unsplash.jpg" alt="Aerial court view" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/75" />
        </div>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[20vw] text-white/[0.03] select-none pointer-events-none">
          FACILITY
        </span>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-[#11317B]/[0.06] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full">
          {/* Court Specs */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {COURT_SPECS.map((spec) => (
              <div key={spec.label}>
                <span className="text-[10px] tracking-[0.2em] text-[#306EC3] font-bold">{spec.label}</span>
                <p className="mt-1.5 text-sm text-[#E6E6E6] leading-relaxed">{spec.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Blue separator */}
          <div className="h-px mb-10" style={{ background: "linear-gradient(90deg, transparent, #306EC3, transparent)" }} />

          {/* Amenities */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            {AMENITIES.map((amenity) => (
              <div key={amenity.name} className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#306EC3]" />
                <div>
                  <p className="text-sm text-[#E6E6E6] font-medium">{amenity.name}</p>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">{amenity.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sections 5-9: Services (5 full-screen sections) */}
      {SERVICES.map((svc, i) => (
        <section
          key={svc.number}
          id={i === 0 ? "services" : undefined}
          className="relative flex h-screen snap-start items-center justify-center bg-black px-8 overflow-hidden"
        >
          {/* Alternating blue ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className={`absolute ${
                i % 2 === 0
                  ? "top-[15%] left-[15%]"
                  : "bottom-[15%] right-[15%]"
              } w-[500px] h-[500px] bg-[#306EC3]/[0.06] rounded-full blur-[200px]`}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto w-full">
            {/* Photo */}
            <motion.div
              className={`relative w-full lg:w-[55%] aspect-[16/10] rounded-sm overflow-hidden ${
                i % 2 !== 0 ? "lg:order-2" : ""
              }`}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <Image src={svc.image} alt={svc.imageAlt} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>

            {/* Text content */}
            <motion.div
              className={`w-full lg:w-[45%] ${i % 2 !== 0 ? "lg:order-1" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <span className="font-serif text-6xl lg:text-8xl text-[#F6FF54] block mb-4">{svc.number}</span>
              <h3 className="font-serif text-3xl lg:text-5xl text-[#E6E6E6] mb-2">{svc.titleJa}</h3>
              <p className="text-[10px] tracking-[0.25em] text-[#8A8A8A] mb-6">{svc.titleEn}</p>
              <p className="text-base leading-[1.9] text-[#E6E6E6]/70 max-w-md">{svc.description}</p>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Section 10: Pricing */}
      <section id="pricing" className="relative flex h-screen snap-start flex-col items-center justify-center bg-[#0a0a1a] px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[25%] left-[35%] w-[500px] h-[500px] bg-[#306EC3]/[0.05] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full">
          <motion.h2
            className="font-serif text-3xl lg:text-5xl text-[#E6E6E6] text-center mb-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            料金の詳細は近日公開
          </motion.h2>

          <motion.p
            className="text-center text-[#8A8A8A] mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
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

          {/* Blue gradient line */}
          <div className="h-px mb-0" style={{ background: "linear-gradient(90deg, transparent, #306EC3, transparent)" }} />

          {/* 3-column pricing */}
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
                <p className="text-xs tracking-[0.2em] text-[#8A8A8A] mb-1">
                  {plan.nameEn} / {plan.nameJa}
                </p>
                <p className="text-sm text-[#8A8A8A] mb-6">{plan.type}</p>
                <p className="font-serif text-2xl text-[#E6E6E6]">COMING SOON</p>
                {plan.isRecommended && (
                  <span className="inline-block mt-4 text-xs tracking-[0.15em] text-[#F6FF54]">おすすめ</span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Rental info */}
          <motion.div
            className="flex items-center gap-3 mt-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            <span className="h-2 w-2 rounded-full bg-[#F6FF54] shrink-0" />
            <p className="text-sm text-[#8A8A8A]">
              レンタルパドル・ボールをご用意しています。手ぶらでお気軽にお越しください。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 11: Founder */}
      <section id="founder" className="relative flex h-screen snap-start items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/jon-matthews-ViVHl-M_ezI-unsplash.jpg" alt="Athletic backhand" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: "rgba(17,49,123,0.08)" }} />
        </div>

        <div className="relative z-10 max-w-5xl w-full px-8">
          <motion.span
            className="block text-xs tracking-[0.3em] text-[#8A8A8A] font-bold mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            FOUNDER
          </motion.span>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Name block */}
            <div className="lg:w-[35%] shrink-0">
              <motion.h2
                className="font-serif text-5xl lg:text-7xl text-[#E6E6E6] mb-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                西村昭彦
              </motion.h2>
              <motion.p
                className="text-sm tracking-[0.2em] text-[#8A8A8A]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              >
                AKIHIKO NISHIMURA
              </motion.p>
            </div>

            {/* Timeline */}
            <div className="flex-1">
              <ul className="space-y-3">
                {TIMELINE.map((entry, i) => (
                  <motion.li
                    key={entry.text}
                    className="flex items-start gap-3 text-[#E6E6E6]/90 text-sm lg:text-base leading-relaxed"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                  >
                    <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#F6FF54]" />
                    <span>
                      {entry.highlightYear && (
                        <span className="text-[#F6FF54] font-bold">{entry.highlightYear} </span>
                      )}
                      {entry.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* PRESS section */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <motion.span
              className="block text-xs tracking-[0.3em] text-[#8A8A8A] font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              PRESS
            </motion.span>
            <motion.p
              className="text-[#E6E6E6]/80 text-sm lg:text-base leading-relaxed mb-3 max-w-3xl"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              {PRESS_TITLE}
            </motion.p>
            <motion.a
              href={PRESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#F6FF54] text-sm tracking-wide hover:underline"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            >
              PR TIMES →
            </motion.a>
          </div>
        </div>
      </section>

      {/* Section 12: Access */}
      <section id="access" className="relative flex h-screen snap-start flex-col items-center justify-center bg-[#0a0a1a] px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-[#306EC3]/[0.04] rounded-full blur-[180px]" />
        </div>

        <div className="relative z-10 max-w-5xl w-full">
          {/* Google Maps */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <iframe
              src={MAPS_EMBED_URL}
              title="THE PICKLE BANG THEORY 所在地"
              className="h-[220px] lg:h-[280px] w-full rounded-sm"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="text-base font-semibold text-[#E6E6E6] mb-3">THE PICKLE BANG THEORY</p>
              <div className="space-y-1 text-sm leading-relaxed text-[#E6E6E6]/80">
                <p>〒272-0021</p>
                <p>千葉県市川市八幡2-16-6 6階</p>
                <p>営業時間：6:00 – 23:00（不定休）</p>
                <p>
                  Email:{" "}
                  <a href="mailto:hello@rstagency.com" className="text-[#F6FF54] hover:underline">
                    hello@rstagency.com
                  </a>
                </p>
              </div>
            </motion.div>

            {/* Access routes */}
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
                    className="flex items-center justify-between py-3 border-b border-[#8A8A8A]/20 text-sm text-[#E6E6E6]"
                  >
                    <span>
                      <span className="font-semibold">{route.line}</span>{" "}
                      {route.station}
                    </span>
                    <span className="text-[#F6FF54] font-semibold">{route.walkTime}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[#8A8A8A] text-xs">
                お車でお越しの方は近隣のコインパーキングをご利用ください。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 13: Contact */}
      <section id="contact" className="relative flex h-screen snap-start items-center justify-center bg-black px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-[#11317B]/[0.06] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-5xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
            {/* Form (left) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="sr-only">お名前</label>
                  <input id="contact-name" name="name" type="text" required placeholder="お名前 *" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="contact-email" className="sr-only">メールアドレス</label>
                  <input id="contact-email" name="email" type="email" required placeholder="メールアドレス *" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="sr-only">電話番号</label>
                  <input id="contact-phone" name="phone" type="tel" placeholder="電話番号" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="contact-category" className="sr-only">お問い合わせ種別</label>
                  <select id="contact-category" name="category" required className={`${inputClass} cursor-pointer`} defaultValue="">
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} disabled={cat.value === ""}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="sr-only">お問い合わせ内容</label>
                  <textarea id="contact-message" name="message" required placeholder="お問い合わせ内容 *" rows={4} className={`${inputClass} resize-none`} />
                </div>
                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="bg-[#F6FF54] text-black px-8 py-3 text-sm font-semibold tracking-[0.15em] uppercase hover:bg-[#F6FF54]/90 transition-colors disabled:opacity-50"
                >
                  SEND MESSAGE →
                </button>
                {formStatus === "success" && (
                  <p className="text-[#F6FF54] mt-3 text-sm">送信しました。ありがとうございます。</p>
                )}
                {formStatus === "error" && (
                  <p className="text-red-400 mt-3 text-sm">送信に失敗しました。もう一度お試しください。</p>
                )}
              </form>
            </motion.div>

            {/* Info (right) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="text-xs tracking-[0.3em] text-[#8A8A8A] uppercase mb-8 font-bold">GET IN TOUCH</p>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">Email</p>
                  <a href="mailto:hello@rstagency.com" className="text-lg text-[#F6FF54] hover:underline">hello@rstagency.com</a>
                </div>
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">Instagram</p>
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
                  <p className="text-xs text-[#8A8A8A] mb-1">Address</p>
                  <p className="text-lg text-[#E6E6E6]">千葉県市川市八幡2-16-6 6階</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">Hours</p>
                  <p className="text-lg text-[#E6E6E6]">6:00 – 23:00</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 14: Footer (no snap) */}
      <footer className="bg-black">
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #306EC3, transparent)" }} />
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Logo */}
            <div>
              <Image
                src="/logos/yoko-neon.png"
                alt="THE PICKLE BANG THEORY"
                width={200}
                height={32}
                className="h-7 w-auto"
              />
            </div>
            {/* Nav links */}
            <nav className="flex flex-wrap gap-x-6 gap-y-3 lg:justify-center">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs tracking-[0.15em] text-[#8A8A8A] hover:text-[#E6E6E6] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            {/* Email */}
            <div className="lg:text-right">
              <a href="mailto:hello@rstagency.com" className="text-xs text-[#8A8A8A] hover:text-[#F6FF54] transition-colors">
                hello@rstagency.com
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#8A8A8A]/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-[#8A8A8A]/50">&copy; 2026 RST Agency Inc.</p>
            <p className="text-[10px] text-[#8A8A8A]/50">〒272-0021 千葉県市川市八幡2-16-6 6階</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
