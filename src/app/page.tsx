"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import Image from "next/image";

import type { FormEvent, ChangeEvent } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 },
};

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}

export default function Home() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitStatus("success");
      setForm({ name: "", email: "", phone: "", category: "", message: "" });
    } catch {
      setSubmitStatus("error");
    }
  }

  const panel = "relative h-screen w-screen shrink-0 snap-start overflow-hidden";

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-4 lg:px-12 transition-all duration-300 backdrop-blur-md bg-black/50">
        <Image src="/logos/yoko-w.png" alt="THE PICKLE BANG THEORY" width={160} height={32} className="h-6 w-auto" />
        <a href="#" className="bg-[#F6FF54] px-4 py-2 text-xs font-semibold tracking-wider text-black">RESERVE</a>
      </header>

      <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-x-auto lg:overflow-y-hidden lg:snap-x lg:snap-mandatory" style={{ scrollBehavior: "smooth" }}>

        {/* PANEL 1 — HERO */}
        <section className={`${panel} flex items-center bg-black pt-20 lg:pt-0`}>

          <div className="relative z-10 px-8 lg:max-w-[55%] lg:px-16">
            <motion.h1
              className="font-serif text-[clamp(2.5rem,7vw,8rem)] leading-[1.05] tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="block text-[#E6E6E6]">ここから、</span>
              <span className="block text-[#E6E6E6]">ピックルボールの</span>
              <span className="block text-[#F6FF54]">ビッグバン</span>
              <span className="block text-[#E6E6E6]">が始まる。</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-[10px] tracking-[0.35em] text-[#8A8A8A] lg:text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              FROM A SMALL DINK TO A BIG MOVEMENT
            </motion.p>

            <motion.a
              href="#"
              className="mt-8 inline-block bg-[#F6FF54] px-8 py-4 text-sm font-semibold tracking-wider text-black transition-opacity hover:opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              RESERVE A COURT &rarr;
            </motion.a>
          </div>

          <div className="absolute inset-y-0 right-0 hidden w-[45%] lg:block">
            <div className="relative w-full h-full overflow-hidden">
              <Image src="/images/jon-matthews-YFNDwuYoyCA-unsplash.jpg" alt="Player mid-swing" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>

          <motion.div
            className="absolute bottom-8 right-8 hidden text-[10px] tracking-[0.3em] text-[#8A8A8A] lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            SWIPE &rarr;
          </motion.div>
        </section>

        {/* PANEL 2 — CONCEPT */}
        <section className={`${panel} flex items-center bg-[#0a0a0a]`}>
          <div className="grid h-full w-full lg:grid-cols-2">
            <div className="flex flex-col justify-center px-8 py-20 lg:px-16">
              <motion.p
                className="text-[10px] tracking-[0.4em] text-[#8A8A8A]"
                {...fadeIn}
              >
                CONCEPT
              </motion.p>
              <motion.p
                className="mt-8 font-sans text-base leading-[2] text-[#E6E6E6] lg:text-lg lg:leading-[2.2]"
                {...fadeIn}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                クロスミントン世界王者・西村昭彦が、本気で上達したいすべてのプレーヤーのために作った空間。本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。練習、トレーニング、試合、そしてコミュニティ——すべてがここに。
              </motion.p>
            </div>
            <div className="relative hidden lg:flex overflow-hidden">
              <Image src="/images/jon-matthews-ajk3K-zgiPU-unsplash.jpg" alt="Paddle and ball on court" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>
        </section>

        {/* PANEL 3 — KEY NUMBERS */}
        <section className={`${panel} flex items-center bg-black`}>
          <div className="grid w-full grid-cols-2 gap-12 px-8 lg:grid-cols-4 lg:gap-0 lg:px-16">
            {[
              { value: "3", en: "COURTS", ja: "プロ仕様コート" },
              { value: "6:00–23:00", en: "HOURS", ja: "営業時間" },
              { value: "1 min", en: "FROM STATION", ja: "駅徒歩1分" },
              { value: "4,800万+", en: "US PLAYERS", ja: "米国競技人口" },
            ].map((stat, i) => (
              <motion.div
                key={stat.en}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
              >
                <span className="block font-serif text-[clamp(2rem,5vw,6rem)] text-[#E6E6E6]">
                  {stat.value}
                </span>
                <span className="mt-3 block text-[10px] tracking-[0.25em] text-[#8A8A8A]">
                  {stat.en}
                </span>
                <span className="mt-1 block text-sm text-[#E6E6E6]/50">
                  {stat.ja}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PANEL 4 — FACILITY */}
        <section className={`${panel} flex items-center bg-[#0a0a0a]`}>
          <div className="w-full px-8 lg:px-16">
            <motion.p className="text-[10px] tracking-[0.4em] text-[#8A8A8A]" {...fadeIn}>
              FACILITY
            </motion.p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
              {[
                { label: "SURFACE", value: "PickleRoll Pro（PPA Asia公式採用）" },
                { label: "COURTS", value: "3面（ハードコート）" },
                { label: "LAYOUT", value: "観戦可能な1面ショーコートに変更可能" },
                { label: "TYPE", value: "全天候型インドア / 空調完備" },
              ].map((spec, i) => (
                <motion.div
                  key={spec.label}
                  className="border-b border-[#E6E6E6]/10 pb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <p className="text-[10px] tracking-[0.3em] text-[#F6FF54]">{spec.label}</p>
                  <p className="mt-2 text-sm text-[#E6E6E6] lg:text-base">{spec.value}</p>
                </motion.div>
              ))}
            </div>

            <motion.div className="mt-12" {...fadeIn} transition={{ duration: 0.8, delay: 0.4 }}>
              <p className="text-[10px] tracking-[0.3em] text-[#8A8A8A]">AMENITIES</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {["空調完備", "更衣室", "トレーニングエリア", "ラウンジスペース", "レンタル用品", "無人チェックイン対応"].map((item) => (
                  <span
                    key={item}
                    className="border border-[#E6E6E6]/15 px-4 py-2 text-xs text-[#E6E6E6]/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* PANEL 5 — SERVICES */}
        <section className={`${panel} flex items-center bg-black`}>
          <div className="w-full px-8 lg:px-16">
            <motion.p className="text-[10px] tracking-[0.4em] text-[#8A8A8A]" {...fadeIn}>
              SERVICES
            </motion.p>
            <div className="mt-8 space-y-8 lg:space-y-6">
              {[
                {
                  num: "01",
                  ja: "コートレンタル",
                  en: "COURT RENTAL",
                  desc: "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。",
                },
                {
                  num: "02",
                  ja: "レッスン & クリニック",
                  en: "LESSONS & CLINICS",
                  desc: "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。海外トッププレーヤーを招聘した特別クリニックも定期開催。",
                },
                {
                  num: "03",
                  ja: "トレーニングプログラム",
                  en: "TRAINING",
                  desc: "フィジカルトレーニングを取り入れたピックルボール強化プログラム。併設トレーニングエリアでコンディショニング。プレーの質を根本から高める。",
                },
                {
                  num: "04",
                  ja: "大会 & リーグ",
                  en: "TOURNAMENTS & LEAGUES",
                  desc: "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで。",
                },
                {
                  num: "05",
                  ja: "イベント",
                  en: "EVENTS",
                  desc: "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。異業種コラボレーションやプロモーションイベントの会場としても。",
                },
              ].map((service, i) => (
                <motion.div
                  key={service.num}
                  className="group border-b border-[#E6E6E6]/10 pb-6 lg:pb-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-serif text-2xl text-[#F6FF54] lg:text-3xl">{service.num}</span>
                    <div>
                      <h3 className="font-serif text-xl text-[#E6E6E6] lg:text-2xl">{service.ja}</h3>
                      <p className="mt-0.5 text-[10px] tracking-[0.2em] text-[#8A8A8A]">{service.en}</p>
                    </div>
                  </div>
                  <p className="mt-3 pl-0 text-sm leading-relaxed text-[#E6E6E6]/60 lg:pl-14">
                    {service.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PANEL 6 — PRICING */}
        <section className={`${panel} flex items-center bg-[#0a0a0a]`}>
          <div className="w-full px-8 lg:px-16">
            <motion.h2
              className="font-serif text-3xl text-[#E6E6E6] lg:text-5xl"
              {...fadeIn}
            >
              料金の詳細は近日公開
            </motion.h2>
            <motion.p
              className="mt-4 text-sm text-[#E6E6E6]/60"
              {...fadeIn}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              最新情報はInstagramでお知らせいたします。{" "}
              <a
                href="https://www.instagram.com/thepicklebangtheory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F6FF54] underline underline-offset-4"
              >
                @thepicklebangtheory
              </a>
            </motion.p>

            <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
              {[
                { name: "VISITOR", ja: "ビジター", sub: "都度利用", isRecommended: false },
                { name: "REGULAR", ja: "レギュラー会員", sub: "月額制", isRecommended: true },
                { name: "PREMIUM", ja: "プレミアム会員", sub: "月額制", isRecommended: false },
              ].map((tier, i) => (
                <motion.div
                  key={tier.name}
                  className={`relative border px-6 py-8 ${tier.isRecommended ? "border-[#F6FF54]/40 bg-[#F6FF54]/5" : "border-[#E6E6E6]/10"}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  {tier.isRecommended && (
                    <span className="absolute -top-3 left-6 bg-[#F6FF54] px-3 py-1 text-[10px] font-semibold tracking-wider text-black">
                      RECOMMENDED
                    </span>
                  )}
                  <p className="text-xs tracking-[0.3em] text-[#8A8A8A]">{tier.name}</p>
                  <p className="mt-2 font-serif text-xl text-[#E6E6E6]">{tier.ja}</p>
                  <p className="mt-1 text-xs text-[#E6E6E6]/50">{tier.sub}</p>
                  <p className="mt-6 text-sm font-semibold tracking-wider text-[#F6FF54]">COMING SOON</p>
                </motion.div>
              ))}
            </div>

            <motion.p
              className="mt-10 text-sm text-[#E6E6E6]/50"
              {...fadeIn}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              レンタルパドル・ボールをご用意しています。手ぶらでお気軽にお越しください。
            </motion.p>
          </div>
        </section>

        {/* PANEL 7 — FOUNDER */}
        <section className={`${panel} relative flex items-center`}>
          <div className="absolute inset-0 overflow-hidden">
            <Image src="/images/jon-matthews-ViVHl-M_ezI-unsplash.jpg" alt="Athletic backhand" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 w-full px-8 lg:px-16">
            <motion.p className="text-[10px] tracking-[0.4em] text-[#8A8A8A]" {...fadeIn}>
              FOUNDER
            </motion.p>
            <motion.h2
              className="mt-4 font-serif text-5xl text-[#E6E6E6] lg:text-7xl"
              {...fadeIn}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              西村昭彦
            </motion.h2>
            <motion.p
              className="mt-2 text-xs tracking-[0.25em] text-[#8A8A8A]"
              {...fadeIn}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              AKIHIKO NISHIMURA
            </motion.p>

            <div className="mt-8 space-y-3 lg:mt-10">
              {[
                "北海道出身。8歳でバドミントンを始める",
                "青森山田高校・中央大学で競技経験を積む",
                "インターハイ・全国高校選抜 シングルスベスト8",
                "全日本総合バドミントン選手権 4度出場",
                "2015年 クロスミントン転向",
                "世界選手権ミックスダブルス4連覇、シングルス2連覇（計6度優勝）",
                "2023年 ピックルボール転向、選手兼大会ディレクター",
                "RST Agency株式会社 代表取締役",
              ].map((entry, i) => (
                <motion.p
                  key={i}
                  className="text-sm leading-relaxed text-[#E6E6E6]/70"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                >
                  <span className="mr-3 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-[#F6FF54]" />
                  {entry}
                </motion.p>
              ))}
            </div>

            <motion.div
              className="mt-10 border-t border-[#E6E6E6]/10 pt-6"
              {...fadeIn}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-[10px] tracking-[0.3em] text-[#8A8A8A]">PRESS</p>
              <a
                href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-[#E6E6E6]/70 transition-colors hover:text-[#F6FF54]"
              >
                クロスミントン世界王者が手がけるピックルボール施設{" "}
                <span className="text-[#F6FF54]">PR TIMES &rarr;</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* PANEL 8 — ACCESS */}
        <section className={`${panel} flex items-center bg-[#0a0a0a]`}>
          <div className="grid h-full w-full lg:grid-cols-2">
            <div className="hidden h-full lg:block">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.!2d139.924!3d35.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQzJzEyLjAiTiAxMznCsDU1JzI2LjQiRQ!5e0!3m2!1sja!2sjp!4v1"
                title="THE PICKLE BANG THEORY 所在地"
                loading="lazy"
                className="h-full w-full border-0 grayscale"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col justify-center px-8 py-16 lg:px-16">
              <motion.p className="text-[10px] tracking-[0.4em] text-[#8A8A8A]" {...fadeIn}>
                ACCESS
              </motion.p>

              <motion.div className="mt-8 space-y-1" {...fadeIn} transition={{ duration: 0.8, delay: 0.2 }}>
                <p className="font-serif text-xl text-[#E6E6E6]">THE PICKLE BANG THEORY</p>
                <p className="text-sm text-[#E6E6E6]/60">{"\u3012"}272-0021</p>
                <p className="text-sm text-[#E6E6E6]/60">千葉県市川市八幡2-16-6 6階</p>
                <p className="text-sm text-[#E6E6E6]/60">営業時間：6:00 – 23:00（不定休）</p>
                <p className="text-sm text-[#E6E6E6]/60">
                  Email：<a href="mailto:hello@rstagency.com" className="text-[#F6FF54] hover:underline">hello@rstagency.com</a>
                </p>
              </motion.div>

              <motion.div className="mt-10 space-y-4" {...fadeIn} transition={{ duration: 0.8, delay: 0.4 }}>
                {[
                  { line: "JR総武線「本八幡駅」北口", time: "徒歩1分" },
                  { line: "都営新宿線「本八幡駅」", time: "徒歩3分" },
                  { line: "京成本線「京成八幡駅」", time: "徒歩5分" },
                ].map((route) => (
                  <div key={route.line} className="flex items-baseline justify-between border-b border-[#E6E6E6]/10 pb-3">
                    <p className="text-sm text-[#E6E6E6]/70">{route.line}</p>
                    <p className="text-sm font-semibold text-[#F6FF54]">{route.time}</p>
                  </div>
                ))}
              </motion.div>

              <motion.p
                className="mt-8 text-xs text-[#8A8A8A]"
                {...fadeIn}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                お車でお越しの方は近隣のコインパーキングをご利用ください。
              </motion.p>

              <div className="mt-8 block h-48 lg:hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.!2d139.924!3d35.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQzJzEyLjAiTiAxMznCsDU1JzI2LjQiRQ!5e0!3m2!1sja!2sjp!4v1"
                  title="THE PICKLE BANG THEORY 所在地"
                  loading="lazy"
                  className="h-full w-full border-0 grayscale"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* PANEL 9 — CONTACT */}
        <section className={`${panel} flex items-center bg-black`}>
          <div className="grid h-full w-full lg:grid-cols-2">
            <div className="flex flex-col justify-center px-8 py-16 lg:px-16">
              <motion.p className="text-[10px] tracking-[0.4em] text-[#8A8A8A]" {...fadeIn}>
                CONTACT
              </motion.p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="contact-name" className="block text-[10px] tracking-[0.2em] text-[#8A8A8A]">
                    お名前 <span className="text-[#F6FF54]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="mt-2 w-full border-b border-[#E6E6E6]/20 bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#F6FF54]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-[10px] tracking-[0.2em] text-[#8A8A8A]">
                    メールアドレス <span className="text-[#F6FF54]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="mt-2 w-full border-b border-[#E6E6E6]/20 bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#F6FF54]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-[10px] tracking-[0.2em] text-[#8A8A8A]">
                    電話番号
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-2 w-full border-b border-[#E6E6E6]/20 bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#F6FF54]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-category" className="block text-[10px] tracking-[0.2em] text-[#8A8A8A]">
                    お問い合わせ種別
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="mt-2 w-full border-b border-[#E6E6E6]/20 bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#F6FF54]"
                  >
                    <option value="" className="bg-black">選択してください</option>
                    <option value="コート予約" className="bg-black">コート予約</option>
                    <option value="レッスンについて" className="bg-black">レッスンについて</option>
                    <option value="取材依頼" className="bg-black">取材依頼</option>
                    <option value="その他" className="bg-black">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-[10px] tracking-[0.2em] text-[#8A8A8A]">
                    お問い合わせ内容
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    className="mt-2 w-full border-b border-[#E6E6E6]/20 bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#F6FF54] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitStatus === "sending"}
                  className="mt-4 inline-block bg-[#F6FF54] px-8 py-4 text-sm font-semibold tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitStatus === "sending" ? "SENDING..." : "SEND MESSAGE \u2192"}
                </button>

                {submitStatus === "success" && (
                  <p className="mt-4 text-sm text-[#F6FF54]">送信が完了しました。ありがとうございます。</p>
                )}
                {submitStatus === "error" && (
                  <p className="mt-4 text-sm text-red-400">送信に失敗しました。もう一度お試しください。</p>
                )}
              </form>
            </div>

            <div className="flex flex-col justify-center border-t border-[#E6E6E6]/10 px-8 py-16 lg:border-l lg:border-t-0 lg:px-16">
              <motion.div {...fadeIn}>
                <p className="text-[10px] tracking-[0.4em] text-[#8A8A8A]">GET IN TOUCH</p>

                <a
                  href="mailto:hello@rstagency.com"
                  className="mt-6 block text-xl text-[#F6FF54] hover:underline lg:text-2xl"
                >
                  hello@rstagency.com
                </a>

                <a
                  href="https://www.instagram.com/thepicklebangtheory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-sm text-[#E6E6E6]/70 hover:text-[#F6FF54]"
                >
                  @thepicklebangtheory
                </a>

                <p className="mt-6 text-sm text-[#E6E6E6]/60">千葉県市川市八幡2-16-6 6階</p>
                <p className="mt-1 text-sm text-[#E6E6E6]/60">6:00 – 23:00</p>
              </motion.div>

              <motion.p
                className="mt-auto pt-12 text-[10px] text-[#8A8A8A]/40"
                {...fadeIn}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                &copy; 2026 RST Agency Inc.
              </motion.p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
