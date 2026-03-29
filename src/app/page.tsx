"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import Image from "next/image";

import type { FormEvent } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const slideLeft = {
  initial: { x: -100, opacity: 0 },
  whileInView: { x: 0, opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: EASE },
};

const slideRight = {
  initial: { x: 100, opacity: 0 },
  whileInView: { x: 0, opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: EASE },
};

const SERVICES = [
  {
    n: "01",
    t: "コートレンタル",
    en: "COURT RENTAL",
    d: "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。",
  },
  {
    n: "02",
    t: "レッスン & クリニック",
    en: "LESSONS & CLINICS",
    d: "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。海外トッププレーヤーを招聘した特別クリニックも定期開催。",
  },
  {
    n: "03",
    t: "トレーニングプログラム",
    en: "TRAINING",
    d: "フィジカルトレーニングを取り入れたピックルボール強化プログラム。併設トレーニングエリアでコンディショニング。プレーの質を根本から高める。",
  },
  {
    n: "04",
    t: "大会 & リーグ",
    en: "TOURNAMENTS & LEAGUES",
    d: "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで。",
  },
  {
    n: "05",
    t: "イベント",
    en: "EVENTS",
    d: "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。異業種コラボレーションやプロモーションイベントの会場としても。",
  },
] as const;

const TIMELINE = [
  { year: "2009", text: "バドミントンでインターハイ・国体出場" },
  { year: "2015", text: "クロスミントンに転向" },
  { year: "2016", text: "クロスミントン世界選手権 初出場・初優勝" },
  { year: "2016–24", text: "世界選手権 6度優勝・日本代表" },
  { year: "2023", text: "ピックルボールに転向" },
  { year: "2024", text: "全日本ピックルボール選手権 男子シングルス 準優勝" },
  { year: "2025", text: "RST Agency株式会社 代表取締役就任" },
  { year: "2026", text: "THE PICKLE BANG THEORY 設立" },
] as const;

const SPECS = [
  { label: "面数", value: "3面" },
  { label: "コートサイズ", value: "13.41m × 6.10m（USA Pickleball 公式規格）" },
  { label: "サーフェス", value: "ハードコート（DecoTurf / Pro Cushion 予定）" },
  { label: "天井高", value: "約 6m（ロブ・スマッシュに対応）" },
] as const;

const AMENITIES = [
  "更衣室・シャワー",
  "フリーWi-Fi",
  "レンタルパドル & ボール",
  "プロショップ（パドル・シューズ等）",
  "ラウンジ & 観戦スペース",
  "トレーニングエリア",
] as const;

const STATIONS = [
  { line: "都営新宿線", station: "本八幡駅", exit: "A2出口", time: "徒歩 1 分" },
  { line: "JR総武線", station: "本八幡駅", exit: "北口", time: "徒歩 3 分" },
  { line: "京成本線", station: "京成八幡駅", exit: "", time: "徒歩 5 分" },
] as const;

interface FormState {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
}

export default function Home() {
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: "submitting", message: "" });

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setFormState({
          status: "success",
          message: "お問い合わせを受け付けました。ありがとうございます。",
        });
        form.reset();
      } else {
        setFormState({
          status: "error",
          message: "送信に失敗しました。もう一度お試しください。",
        });
      }
    } catch {
      setFormState({
        status: "error",
        message: "ネットワークエラーが発生しました。もう一度お試しください。",
      });
    }
  }

  return (
    <main className="bg-[#0A0A0A]">
      {/* ─── Fixed Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 lg:px-16 bg-[#0A0A0A]/80 backdrop-blur-md">
        <Image
          src="/logos/yoko-w.png"
          alt="THE PICKLE BANG THEORY"
          width={160}
          height={32}
          className="h-6 w-auto"
          priority
        />
        <a
          href="#contact"
          className="bg-[#C8FF00] px-5 py-2.5 text-xs font-semibold tracking-wider text-black transition-opacity hover:opacity-80"
        >
          RESERVE
        </a>
      </header>

      {/* ─── Hero Split ─── */}
      <section className="flex min-h-screen flex-col lg:flex-row">
        <motion.div
          className="flex w-full lg:w-1/2 items-center justify-center bg-[#0A0A0A] px-8 py-32 lg:px-16"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="max-w-lg">
            <h1 className="font-serif text-[clamp(2rem,5vw,5rem)] leading-[1.15] text-[#E6E6E6]">
              ここから、
              <br />
              ピックルボールの
              <br />
              <span className="text-[#C8FF00]">ビッグバン</span>
              <br />
              が始まる。
            </h1>
            <p className="mt-6 text-xs tracking-[0.3em] text-[#8A8A8A]">
              FROM A SMALL DINK TO A BIG MOVEMENT
            </p>
            <a
              href="#contact"
              className="mt-10 inline-block border border-[#C8FF00] px-8 py-4 text-sm font-semibold tracking-wider text-[#C8FF00] transition-colors hover:bg-[#C8FF00] hover:text-black"
            >
              RESERVE A COURT &rarr;
            </a>
          </div>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 items-center justify-center bg-[#141414] min-h-[50vh] lg:min-h-0"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden">
            <Image src="/images/jon-matthews-YFNDwuYoyCA-unsplash.jpg" alt="Player mid-swing" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </motion.div>
      </section>

      {/* ─── Concept Split ─── */}
      <section className="flex min-h-[70vh] flex-col lg:flex-row">
        <motion.div
          className="flex w-full lg:w-1/2 items-center justify-center bg-[#0A0A0A] p-12 lg:p-20"
          {...slideLeft}
        >
          <span className="text-xs tracking-[0.3em] text-[#8A8A8A] lg:[writing-mode:vertical-rl]">
            CONCEPT
          </span>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 items-center bg-[#141414] p-12 lg:p-20"
          {...slideRight}
        >
          <div className="max-w-lg">
            <p className="text-base leading-[2] text-[#E6E6E6]/80 lg:text-lg">
              クロスミントン世界王者・西村昭彦が、本気で上達したいすべてのプレーヤーのために作った空間。
              本八幡駅徒歩1分、プロ仕様ハードコート3面を備えたインドア専用施設。
              早朝6時から深夜23時まで、無人チェックインで手軽に利用可能。
              プロ選手による直接指導や、フィジカルを統合したトレーニングプログラム、
              賞金付きトーナメントの定期開催まで ——
              ただの「打てる場所」ではなく、プレーヤーが進化する場所を目指す。
            </p>
          </div>
        </motion.div>
      </section>

      {/* ─── Numbers Split ─── */}
      <section className="flex min-h-[50vh] flex-col lg:flex-row">
        <motion.div
          className="flex w-full lg:w-1/2 flex-col items-center justify-center gap-12 bg-[#141414] p-12"
          {...slideLeft}
        >
          <div className="text-center">
            <span className="font-serif text-7xl text-[#E6E6E6] lg:text-9xl">3</span>
            <span className="mt-2 block text-xs tracking-[0.2em] text-[#8A8A8A]">COURTS</span>
          </div>
          <div className="text-center">
            <span className="font-serif text-4xl text-[#E6E6E6] lg:text-6xl">6:00–23:00</span>
            <span className="mt-2 block text-xs tracking-[0.2em] text-[#8A8A8A]">HOURS</span>
          </div>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 flex-col items-center justify-center gap-12 bg-[#0A0A0A] p-12"
          {...slideRight}
        >
          <div className="text-center">
            <span className="font-serif text-7xl text-[#E6E6E6] lg:text-9xl">1</span>
            <span className="text-4xl text-[#E6E6E6] lg:text-5xl"> min</span>
            <span className="mt-2 block text-xs tracking-[0.2em] text-[#8A8A8A]">FROM STATION</span>
          </div>
          <div className="text-center">
            <span className="font-serif text-4xl text-[#E6E6E6] lg:text-5xl">4,800万+</span>
            <span className="mt-2 block text-xs tracking-[0.2em] text-[#8A8A8A]">US PLAYERS</span>
          </div>
        </motion.div>
      </section>

      {/* ─── Facility Split ─── */}
      <section className="flex min-h-[70vh] flex-col lg:flex-row">
        <motion.div
          className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[#0A0A0A] p-12 lg:p-20"
          {...slideLeft}
        >
          <p className="text-xs tracking-[0.3em] text-[#8A8A8A] mb-8">FACILITY</p>
          <div className="relative aspect-video w-full max-w-md overflow-hidden">
            <Image src="/images/sarasota-guide-uHdY8VYTfbI-unsplash.jpg" alt="Aerial court view" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 items-center bg-[#141414] p-12 lg:p-20"
          {...slideRight}
        >
          <div className="max-w-md w-full">
            <h3 className="text-xs tracking-[0.3em] text-[#C8FF00] mb-6">SPECS</h3>
            <dl className="space-y-4">
              {SPECS.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs tracking-wider text-[#8A8A8A]">{spec.label}</dt>
                  <dd className="mt-1 text-sm text-[#E6E6E6]/80">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <h3 className="text-xs tracking-[0.3em] text-[#C8FF00] mt-12 mb-6">AMENITIES</h3>
            <ul className="space-y-2">
              {AMENITIES.map((amenity) => (
                <li key={amenity} className="flex items-center gap-3 text-sm text-[#E6E6E6]/80">
                  <span className="h-1 w-1 rounded-full bg-[#C8FF00]" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* ─── Services (5 alternating splits) ─── */}
      {SERVICES.map((svc, i) => {
        const isEven = i % 2 === 0;
        const contentBlock = (
          <div className="max-w-sm">
            <span className="font-serif text-6xl text-[#C8FF00] lg:text-7xl">{svc.n}</span>
            <h3 className="mt-4 font-serif text-2xl text-[#E6E6E6] lg:text-3xl">{svc.t}</h3>
            <p className="mt-2 text-xs tracking-[0.15em] text-[#8A8A8A]">{svc.en}</p>
            <p className="mt-6 text-sm leading-relaxed text-[#E6E6E6]/60">{svc.d}</p>
          </div>
        );
        const serviceImages: Record<string, { src: string; alt: string }> = {
          "01": { src: "/images/alex-saks-3k-yNMhYl5k-unsplash.jpg", alt: "Indoor court with net" },
          "02": { src: "/images/jon-matthews-usqfZcs_GfM-unsplash.jpg", alt: "Player reach shot" },
          "03": { src: "/images/jon-matthews-q13YtbIPuv0-unsplash.jpg", alt: "Player ready stance" },
          "04": { src: "/images/jon-matthews-1gOtJQQyN04-unsplash.jpg", alt: "Two players community" },
          "05": { src: "/images/luxe-pickleball-VTKZwNXhaSc-unsplash.jpg", alt: "Paddles crossed" },
        };
        const img = serviceImages[svc.n] ?? { src: "", alt: "" };
        const photoBlock = (
          <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden">
            <Image src={img.src} alt={img.alt} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        );

        return (
          <section key={svc.n} className="flex min-h-[60vh] flex-col lg:flex-row">
            <motion.div
              className={`flex w-full lg:w-1/2 items-center p-12 lg:p-20 ${
                isEven ? "bg-[#0A0A0A] lg:justify-end" : "bg-[#141414] lg:justify-center"
              }`}
              {...slideLeft}
            >
              {isEven ? contentBlock : photoBlock}
            </motion.div>
            <motion.div
              className={`flex w-full lg:w-1/2 items-center p-12 lg:p-20 ${
                isEven ? "bg-[#141414] lg:justify-center" : "bg-[#0A0A0A] lg:justify-start"
              }`}
              {...slideRight}
            >
              {isEven ? photoBlock : contentBlock}
            </motion.div>
          </section>
        );
      })}

      {/* ─── Pricing Split ─── */}
      <section className="flex min-h-[70vh] flex-col lg:flex-row">
        <motion.div
          className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[#0A0A0A] p-12 lg:p-20"
          {...slideLeft}
        >
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-[#8A8A8A] mb-6">PRICING</p>
            <p className="text-xl text-[#E6E6E6] font-serif">料金の詳細は近日公開</p>
            <a
              href="https://www.instagram.com/thepicklebangtheory"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-sm text-[#C8FF00] underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              @thepicklebangtheory
            </a>
          </div>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 items-center bg-[#141414] p-12 lg:p-20"
          {...slideRight}
        >
          <div className="max-w-md w-full space-y-8">
            {[
              {
                tier: "VISITOR",
                desc: "ビジター（都度利用）",
                note: "入会金不要・誰でも利用可能",
              },
              {
                tier: "REGULAR",
                desc: "レギュラー会員",
                note: "月額制・コートレンタル割引",
              },
              {
                tier: "PREMIUM",
                desc: "プレミアム会員",
                note: "月額制・レッスン付き・優先予約",
              },
            ].map((plan) => (
              <div key={plan.tier} className="border-l-2 border-[#C8FF00] pl-6">
                <p className="text-xs tracking-[0.2em] text-[#C8FF00]">{plan.tier}</p>
                <p className="mt-1 text-base text-[#E6E6E6]">{plan.desc}</p>
                <p className="mt-1 text-sm text-[#8A8A8A]">{plan.note}</p>
              </div>
            ))}
            <div className="pt-4 border-t border-[#333]">
              <p className="text-xs tracking-[0.2em] text-[#8A8A8A]">COURT RENTAL</p>
              <p className="mt-2 text-sm text-[#E6E6E6]/80">
                1面あたりの時間貸し。料金は時間帯・会員種別により異なります。
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Founder Split ─── */}
      <section className="flex min-h-[70vh] flex-col lg:flex-row">
        <motion.div
          className="relative flex w-full lg:w-1/2 items-center justify-center overflow-hidden p-12 lg:p-20"
          {...slideLeft}
        >
          <Image src="/images/jon-matthews-ViVHl-M_ezI-unsplash.jpg" alt="Athletic backhand" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10">
            <p className="text-xs tracking-[0.3em] text-[#8A8A8A]">FOUNDER</p>
            <h2 className="mt-6 font-serif text-5xl text-[#E6E6E6] lg:text-7xl">西村昭彦</h2>
            <p className="mt-3 text-sm tracking-[0.2em] text-[#8A8A8A]">AKIHIKO NISHIMURA</p>
          </div>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 items-center bg-[#141414] p-12 lg:p-20"
          {...slideRight}
        >
          <div className="max-w-md w-full">
            <div className="space-y-4">
              {TIMELINE.map((entry) => (
                <div key={entry.year + entry.text} className="flex gap-6">
                  <span className="shrink-0 text-sm font-semibold text-[#C8FF00] w-20">
                    {entry.year}
                  </span>
                  <span className="text-sm text-[#E6E6E6]/70">{entry.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-[#333]">
              <p className="text-xs tracking-[0.3em] text-[#8A8A8A] mb-4">PRESS</p>
              <a
                href="https://prtimes.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#C8FF00] underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                PR TIMES &rarr;
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Access Split ─── */}
      <section className="flex min-h-[60vh] flex-col lg:flex-row">
        <motion.div
          className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[#0A0A0A] p-12 lg:p-20"
          {...slideLeft}
        >
          <div className="w-full max-w-md">
            <p className="text-xs tracking-[0.3em] text-[#8A8A8A] mb-6">ACCESS</p>
            <div className="aspect-video w-full overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.5!2d139.924!3d35.722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQzJzE5LjIiTiAxMznCsDU1JzI2LjQiRQ!5e0!3m2!1sja!2sjp!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="THE PICKLE BANG THEORY 所在地"
              />
            </div>
            <p className="mt-4 text-sm text-[#E6E6E6]/60">
              〒272-0021 千葉県市川市八幡2-16-6 6階
            </p>
          </div>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 items-center bg-[#141414] p-12 lg:p-20"
          {...slideRight}
        >
          <div className="max-w-md w-full">
            <h3 className="text-xs tracking-[0.3em] text-[#C8FF00] mb-8">STATION ROUTES</h3>
            <div className="space-y-6">
              {STATIONS.map((st) => (
                <div key={st.line} className="border-l-2 border-[#333] pl-6">
                  <p className="text-xs tracking-wider text-[#8A8A8A]">{st.line}</p>
                  <p className="mt-1 text-base text-[#E6E6E6]">
                    {st.station}
                    {st.exit && <span className="text-[#8A8A8A]"> {st.exit}</span>}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#C8FF00]">{st.time}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-[#333]">
              <p className="text-sm text-[#E6E6E6]/60">
                駐車場: 専用駐車場はございません。近隣のコインパーキングをご利用ください。
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Contact Split ─── */}
      <section id="contact" className="flex min-h-[80vh] flex-col lg:flex-row">
        <motion.div
          className="flex w-full lg:w-1/2 items-center justify-center bg-[#0A0A0A] p-12 lg:p-20"
          {...slideLeft}
        >
          <div className="max-w-sm">
            <p className="text-xs tracking-[0.3em] text-[#8A8A8A]">CONTACT</p>
            <h2 className="mt-4 font-serif text-4xl text-[#E6E6E6] lg:text-5xl">GET IN TOUCH</h2>

            <div className="mt-10 space-y-5">
              <a
                href="mailto:hello@rstagency.com"
                className="block text-xl text-[#C8FF00] transition-opacity hover:opacity-80"
              >
                hello@rstagency.com
              </a>
              <a
                href="https://www.instagram.com/thepicklebangtheory"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[#E6E6E6]/60 transition-opacity hover:opacity-80"
              >
                @thepicklebangtheory
              </a>
              <p className="text-sm text-[#E6E6E6]/50">
                〒272-0021 千葉県市川市八幡2-16-6 6階
              </p>
              <p className="text-sm text-[#E6E6E6]/50">営業時間: 6:00 – 23:00</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex w-full lg:w-1/2 items-center justify-center bg-[#141414] p-12 lg:p-20"
          {...slideRight}
        >
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs tracking-wider text-[#8A8A8A] mb-2">
                お名前 *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border-b border-[#333] bg-transparent px-0 py-3 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#C8FF00] placeholder:text-[#555]"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs tracking-wider text-[#8A8A8A] mb-2">
                メールアドレス *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border-b border-[#333] bg-transparent px-0 py-3 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#C8FF00] placeholder:text-[#555]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs tracking-wider text-[#8A8A8A] mb-2">
                電話番号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full border-b border-[#333] bg-transparent px-0 py-3 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#C8FF00] placeholder:text-[#555]"
                placeholder="090-1234-5678"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-xs tracking-wider text-[#8A8A8A] mb-2"
              >
                件名 *
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="w-full border-b border-[#333] bg-transparent px-0 py-3 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#C8FF00] placeholder:text-[#555]"
                placeholder="コート予約について"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-xs tracking-wider text-[#8A8A8A] mb-2"
              >
                メッセージ *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full border-b border-[#333] bg-transparent px-0 py-3 text-sm text-[#E6E6E6] outline-none transition-colors focus:border-[#C8FF00] placeholder:text-[#555] resize-none"
                placeholder="お問い合わせ内容をご記入ください"
              />
            </div>

            {formState.status === "success" && (
              <p className="text-sm text-[#C8FF00]">{formState.message}</p>
            )}
            {formState.status === "error" && (
              <p className="text-sm text-red-400">{formState.message}</p>
            )}

            <button
              type="submit"
              disabled={formState.status === "submitting"}
              className="w-full bg-[#C8FF00] py-4 text-sm font-semibold tracking-wider text-black transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {formState.status === "submitting" ? "送信中..." : "SEND MESSAGE"}
            </button>
          </form>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="flex flex-col items-center justify-center bg-[#0A0A0A] py-12 border-t border-[#222]">
        <Image
          src="/logos/yoko-w.png"
          alt="THE PICKLE BANG THEORY"
          width={140}
          height={28}
          className="h-5 w-auto opacity-40"
        />
        <p className="mt-4 text-xs text-[#8A8A8A]/50">
          &copy; 2026 THE PICKLE BANG THEORY. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
