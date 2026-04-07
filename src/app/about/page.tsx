"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LanguageProvider } from "@/hooks/useLanguage";
import HomeNavigation from "@/components/home/HomeNavigation";
import HomeFooter from "@/components/home/HomeFooter";

import type { FormEvent } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

interface ContactCategory {
  value: string;
  label: string;
}

const CATEGORIES: ContactCategory[] = [
  { value: "", label: "選択してください" },
  { value: "court", label: "コート予約" },
  { value: "lesson", label: "レッスンについて" },
  { value: "press", label: "取材依頼" },
  { value: "other", label: "その他" },
];

interface SectionHeaderProps {
  number: string;
  labelEn: string;
  id: string;
}

function SectionHeader({ number, labelEn, id }: SectionHeaderProps) {
  return (
    <motion.div
      id={id}
      className="mb-12 scroll-mt-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <span className="text-accent/40 font-serif text-sm tracking-wider">
        {number}
      </span>
      <span className="text-text-gray text-sm tracking-wider ml-3">—</span>
      <span className="text-accent text-sm tracking-[0.2em] ml-3">
        {labelEn}
      </span>
    </motion.div>
  );
}

export default function AboutPage() {
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-text-gray/40 bg-transparent py-3 text-text-light placeholder:text-text-gray/60 focus:border-accent focus:outline-none transition-colors";

  return (
    <LanguageProvider>
    <main className="bg-deep-black min-h-screen">
      <HomeNavigation />

      {/* Hero */}
      <section className="pt-28 pb-12 lg:pt-32 lg:pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-black tracking-[0.15em] text-text-light">
              ABOUT US
            </h1>
            <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
          </motion.div>
        </div>
      </section>

      {/* 01 — COMPANY */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="01" labelEn="COMPANY" id="company" />

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <h2 className="text-text-light text-2xl lg:text-3xl font-bold mb-6">
                RST Agency株式会社
              </h2>
              <p className="text-text-light/90 text-base lg:text-lg leading-relaxed mb-4">
                RST Agencyは、THE PICKLE BANG THEORYのプロデュース及び運営を行っているスポーツエージェンシーです。ラケットスポーツの可能性を追求し、その選手や競技の価値向上を目指します。
              </p>
              <p className="text-text-gray text-sm lg:text-base leading-relaxed">
                他にもピックルボールを中心としたイベントの企画・実行や公式大会の企画・運営、選手マネジメントなど行っています。また、代表含め、メンバーたちも競技と向き合うプレーヤーであります。
              </p>
            </motion.div>

            <motion.div
              className="lg:w-[35%] shrink-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <div className="bg-gradient-to-b from-accent/[0.07] to-transparent px-8 py-10 relative">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-text-gray">会社名</dt>
                    <dd className="text-text-light mt-1">RST Agency株式会社</dd>
                  </div>
                  <div>
                    <dt className="text-text-gray">代表取締役</dt>
                    <dd className="text-text-light mt-1">西村昭彦</dd>
                  </div>
                  <div>
                    <dt className="text-text-gray">所在地</dt>
                    <dd className="text-text-light mt-1">東京都品川区</dd>
                  </div>
                  <div>
                    <dt className="text-text-gray">事業内容</dt>
                    <dd className="text-text-light mt-1">スポーツ施設運営 / スポーツイベント / 大会運営 / 商品開発</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 02 — FOUNDER */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="02" labelEn="FOUNDER" id="founder" />

          {/* Name - full width top */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="flex items-baseline gap-4 flex-wrap">
              <h2 className="font-serif text-5xl lg:text-6xl text-text-light">
                西村昭彦
              </h2>
              <p className="text-sm tracking-[0.15em] text-text-gray">
                AKIHIKO NISHIMURA
              </p>
            </div>
          </motion.div>

          {/* Photo left + Text right */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            <motion.div
              className="sm:w-[25%] shrink-0"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                <Image
                  src="/images/founder-nishimura.png"
                  alt="西村昭彦"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </motion.div>

            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <p className="text-text-light/90 text-base lg:text-lg leading-loose mb-4">
                北海道出身。8歳でバドミントンを始め、青森山田高校、中央大学と日本有数のバドミントン強豪校で競技経験を積む。
              </p>
              <p className="text-text-light/90 text-base lg:text-lg leading-loose mb-4">
                青森山田高校時代にはインターハイおよび全国高校選抜大会でシングルスベスト8を記録。社会人では国内最高峰大会である全日本総合バドミントン選手権に4度出場し、日本トップ選手らと対戦した。
              </p>
              <p className="text-text-gray text-base lg:text-lg leading-loose mb-4">
                2015年にクロスミントンへ転向し、世界選手権ミックスダブルス4連覇、シングルス2連覇を含む6度の優勝という世界トップレベルの実績を誇る。
              </p>
              <p className="text-text-gray text-base lg:text-lg leading-loose">
                2023年にピックルボールと出会い、現在は選手活動に加え大会ディレクターとしても活動。ラケットスポーツコミュニティ「Racket Sports Tokyo」を法人化し、RST Agency株式会社代表取締役を務める。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 03 — PLAYERS */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="03" labelEn="PLAYERS" id="players" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="text-text-light text-2xl lg:text-3xl font-bold mb-6">
              PBT契約選手
            </h2>
            <p className="text-text-gray text-sm lg:text-base leading-relaxed mb-12 max-w-2xl">
              THE PICKLE BANG THEORYでは、国内外で活躍するピックルボール選手と契約し、施設でのトレーニングやイベント出演を通じて競技の魅力を発信しています。
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <motion.div
                  key={n}
                  className="bg-gradient-to-b from-accent/[0.04] to-transparent border border-text-gray/10 rounded-sm p-6 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: n * 0.1, ease: EASE }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-text-gray/10 flex items-center justify-center">
                    <span className="text-text-gray text-xs">Photo</span>
                  </div>
                  <p className="text-text-light text-sm font-semibold">選手名 {n}</p>
                  <p className="text-text-gray text-xs mt-1">Coming Soon</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 04 — STAFF */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="04" labelEn="STAFF" id="staff" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="text-text-light text-2xl lg:text-3xl font-bold mb-6">
              スタッフ
            </h2>
            <p className="text-text-gray text-sm lg:text-base leading-relaxed mb-12 max-w-2xl">
              プレイヤーの成長をサポートする、経験豊富なスタッフ陣をご紹介します。
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <motion.div
                  key={n}
                  className="bg-gradient-to-b from-accent/[0.04] to-transparent border border-text-gray/10 rounded-sm p-6 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: n * 0.1, ease: EASE }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-text-gray/10 flex items-center justify-center">
                    <span className="text-text-gray text-xs">Photo</span>
                  </div>
                  <p className="text-text-light text-sm font-semibold">スタッフ名 {n}</p>
                  <p className="text-text-gray text-xs mt-1">Coming Soon</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 05 — PRESS */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="05" labelEn="PRESS" id="press" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="text-text-light text-2xl lg:text-3xl font-bold mb-8">
              プレスリリース
            </h2>

            <div className="border-l-2 border-accent/20 pl-6 lg:pl-8">
              <p className="text-text-light/80 text-base lg:text-lg leading-relaxed mb-4 max-w-3xl">
                クロスミントン世界王者・西村昭彦 本八幡駅徒歩1分に都市型ピックルボール施設『THE PICKLE BANG THEORY』2026年春オープン
              </p>
              <a
                href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent text-sm tracking-wide hover:gap-3 transition-all duration-300"
              >
                PR TIMES <span className="text-lg">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 06 — CONTACT */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="06" labelEn="CONTACT" id="contact" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Info */}
            <motion.div
              className="order-first lg:order-last"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="text-xs tracking-[0.3em] text-text-gray uppercase mb-8">
                GET IN TOUCH
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-text-gray mb-1">Instagram</p>
                  <p className="text-lg text-text-light">@thepicklebangtheory</p>
                </div>
                <div>
                  <p className="text-sm text-text-gray mb-1">Address</p>
                  <p className="text-lg text-text-light">東京都品川区</p>
                </div>
                <div>
                  <p className="text-sm text-text-gray mb-1">Hours</p>
                  <p className="text-lg text-text-light">6:00 – 23:00</p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              className="order-last lg:order-first"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="about-contact-name" className="sr-only">お名前</label>
                  <input id="about-contact-name" name="name" type="text" required placeholder="お名前 *" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="about-contact-email" className="sr-only">メールアドレス</label>
                  <input id="about-contact-email" name="email" type="email" required placeholder="メールアドレス *" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="about-contact-category" className="sr-only">お問い合わせ種別</label>
                  <select id="about-contact-category" name="category" required className={`${inputClass} cursor-pointer`} defaultValue="">
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} disabled={cat.value === ""}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="about-contact-message" className="sr-only">お問い合わせ内容</label>
                  <textarea id="about-contact-message" name="message" required placeholder="お問い合わせ内容 *" rows={5} className={`${inputClass} resize-none`} />
                </div>
                <button type="submit" disabled={status === "sending"} className="bg-accent text-deep-black px-8 py-3 text-sm font-semibold tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50">
                  SEND MESSAGE →
                </button>
                {status === "success" && <p className="text-accent mt-4">送信しました。ありがとうございます。</p>}
                {status === "error" && <p className="text-red-400 mt-4">送信に失敗しました。もう一度お試しください。</p>}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
    </LanguageProvider>
  );
}
