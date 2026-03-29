"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { ReactNode, FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

function MarqueeBand({ children, speed = 30, reverse = false, className = "" }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  return (<div className={`overflow-hidden whitespace-nowrap ${className}`}><div className="inline-flex" style={{ animation: `${reverse ? "marquee-right" : "marquee-left"} ${speed}s linear infinite` }}>{children}{children}</div></div>);
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function Home() {
  const [status, setStatus] = useState<FormStatus>("idle");
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), category: fd.get("category"), message: fd.get("message") }) });
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <main className="bg-black overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-black/50">
        <Image src="/logos/yoko-neon.png" alt="THE PICKLE BANG THEORY" width={160} height={32} className="h-6 w-auto" />
        <a href="#" className="bg-[#F6FF54] px-4 py-2 text-xs font-semibold tracking-wider text-black">RESERVE</a>
      </header>
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}>
          <Image src="/logos/yoko-neon.png" alt="THE PICKLE BANG THEORY" width={300} height={60} className="mx-auto h-12 w-auto lg:h-16" priority />
        </motion.div>
        <div className="absolute inset-0 flex flex-col justify-center pointer-events-none overflow-hidden">
          <MarqueeBand speed={25} className="mb-4 -rotate-2"><span className="font-serif text-[8vw] text-white/[0.05] mr-8">THE PICKLE BANG THEORY --- THE PICKLE BANG THEORY --- </span></MarqueeBand>
          <MarqueeBand speed={20} reverse className="mb-4"><span className="font-serif text-[12vw] text-[#F6FF54] mr-8">ビッグバンが始まる --- ビッグバンが始まる --- </span></MarqueeBand>
          <MarqueeBand speed={35} className="rotate-1"><span className="text-sm tracking-[0.5em] text-white/[0.08] mr-12">FROM A SMALL DINK TO A BIG MOVEMENT --- FROM A SMALL DINK TO A BIG MOVEMENT --- </span></MarqueeBand>
        </div>
        <motion.a href="#" className="relative z-10 mt-12 bg-[#F6FF54] px-8 py-4 text-sm font-semibold tracking-wider text-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>RESERVE A COURT →</motion.a>
      </section>

      {/* Info bands */}
      <div className="border-y border-[#222]">
        <MarqueeBand speed={30} className="bg-[#111] py-4"><span className="text-sm tracking-[0.15em] text-[#E6E6E6]/60 mr-12">3 COURTS --- 6:00-23:00 --- 本八幡駅徒歩1分 --- プロ仕様ハードコート --- 4,800万+ US PLAYERS --- 3 COURTS --- 6:00-23:00 --- 本八幡駅徒歩1分 --- プロ仕様ハードコート --- 4,800万+ US PLAYERS --- </span></MarqueeBand>
        <MarqueeBand speed={25} reverse className="bg-[#0a0a0a] py-4 border-t border-[#222]"><span className="text-lg tracking-[0.1em] text-[#E6E6E6]/40 mr-12 font-serif">COURT RENTAL --- LESSONS --- TRAINING --- TOURNAMENTS --- EVENTS --- COURT RENTAL --- LESSONS --- TRAINING --- TOURNAMENTS --- EVENTS --- </span></MarqueeBand>
      </div>

      {/* Concept */}
      <section className="px-8 py-24 lg:py-32">
        <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="text-xs tracking-[0.3em] text-[#555] mb-6">CONCEPT</p>
          <p className="text-base leading-[2] text-[#E6E6E6]/80 lg:text-lg">クロスミントン世界王者・西村昭彦が、本気で上達したいすべてのプレーヤーのために作った空間。本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。練習、トレーニング、試合、そしてコミュニティ——すべてがここに。</p>
        </motion.div>
      </section>

      {/* Visual break - court aerial */}
      <div className="relative w-full aspect-[21/9] overflow-hidden">
        <Image src="/images/sarasota-guide-uHdY8VYTfbI-unsplash.jpg" alt="Aerial court view" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Facility */}
      <section className="px-8 py-16 border-t border-[#222]">
        <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-xs tracking-[0.3em] text-[#555] mb-8">FACILITY</p>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 mb-8">
            {[{ l: "SURFACE", v: "PickleRoll Pro（PPA Asia公式採用）" }, { l: "COURTS", v: "3面（ハードコート）" }, { l: "LAYOUT", v: "観戦可能な1面ショーコートに変更可能" }, { l: "TYPE", v: "全天候型インドア / 空調完備" }].map((s) => (
              <div key={s.l}><span className="text-[10px] tracking-[0.2em] text-[#F6FF54]">{s.l}</span><p className="mt-1 text-sm text-[#E6E6E6]/80">{s.v}</p></div>
            ))}
          </div>
        </motion.div>
        <MarqueeBand speed={35} className="mt-8"><span className="text-sm text-[#E6E6E6]/20 mr-8">空調完備 --- 更衣室 --- トレーニングエリア --- ラウンジスペース --- レンタル用品 --- 無人チェックイン対応 --- 空調完備 --- 更衣室 --- トレーニングエリア --- ラウンジスペース --- レンタル用品 --- 無人チェックイン対応 --- </span></MarqueeBand>
      </section>

      {/* Services */}
      <section className="px-8 py-16 border-t border-[#222]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-[#555] mb-12">SERVICES</p>
          {[
            { n: "01", t: "コートレンタル", en: "COURT RENTAL", d: "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。" },
            { n: "02", t: "レッスン & クリニック", en: "LESSONS & CLINICS", d: "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。海外トッププレーヤーを招聘した特別クリニックも定期開催。" },
            { n: "03", t: "トレーニングプログラム", en: "TRAINING", d: "フィジカルトレーニングを取り入れたピックルボール強化プログラム。併設トレーニングエリアでコンディショニング。" },
            { n: "04", t: "大会 & リーグ", en: "TOURNAMENTS & LEAGUES", d: "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで。" },
            { n: "05", t: "イベント", en: "EVENTS", d: "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。異業種コラボレーションやプロモーションイベントの会場としても。" },
          ].map((svc, i) => (
            <div key={svc.n}>
              <motion.div className="py-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <span className="font-serif text-4xl text-[#F6FF54] lg:text-5xl">{svc.n}</span>
                <h3 className="mt-2 font-serif text-2xl text-[#E6E6E6] lg:text-3xl">{svc.t}</h3>
                <p className="mt-1 text-xs tracking-[0.15em] text-[#555]">{svc.en}</p>
                <p className="mt-3 text-sm text-[#E6E6E6]/60 max-w-xl">{svc.d}</p>
              </motion.div>
              {i < 4 && <MarqueeBand speed={40 + i * 5} reverse={i % 2 === 1} className="border-t border-[#222] py-2"><span className="text-[10px] tracking-[0.3em] text-[#E6E6E6]/10 mr-8">{svc.en} --- {svc.en} --- {svc.en} --- {svc.en} --- </span></MarqueeBand>}
            </div>
          ))}
        </div>
      </section>

      {/* Visual break - player action */}
      <div className="relative w-full aspect-[21/9] overflow-hidden">
        <Image src="/images/jon-matthews-usqfZcs_GfM-unsplash.jpg" alt="Player reach shot" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Pricing */}
      <section className="px-8 py-24 border-t border-[#222]">
        <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-serif text-3xl text-[#E6E6E6] lg:text-4xl">料金の詳細は近日公開</h2>
          <p className="mt-4 text-sm text-[#555]">最新情報はInstagramでお知らせいたします。</p>
          <a href="https://instagram.com/thepicklebangtheory" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[#F6FF54]">@thepicklebangtheory</a>
          <div className="mt-10 grid grid-cols-1 border-t border-[#333] md:grid-cols-3">
            {[{ en: "VISITOR", ja: "ビジター", type: "都度利用", rec: false }, { en: "REGULAR", ja: "レギュラー会員", type: "月額制", rec: true }, { en: "PREMIUM", ja: "プレミアム会員", type: "月額制", rec: false }].map((t, i) => (
              <div key={t.en} className={`px-6 py-8 border-b md:border-b-0 border-[#333] ${i < 2 ? "md:border-r" : ""} ${t.rec ? "border-t-2 border-t-[#F6FF54]" : ""}`}>
                <p className="text-xs tracking-[0.2em] text-[#555]">{t.en}</p><p className="mt-1 text-base text-[#E6E6E6]">{t.ja}</p><p className="mt-1 text-xs text-[#555]">{t.type}</p><p className="mt-4 text-xs text-[#555]">COMING SOON</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-2 justify-center"><span className="mt-1.5 h-2 w-2 rounded-full bg-[#F6FF54] shrink-0" /><p className="text-sm text-[#E6E6E6]/60">レンタルパドル・ボールをご用意しています。手ぶらでお気軽にお越しください。</p></div>
        </motion.div>
      </section>

      {/* Founder */}
      <section className="py-32 px-8 text-center border-t border-[#222]">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="text-xs tracking-[0.3em] text-[#555]">FOUNDER</p>
          <h2 className="mt-6 font-serif text-[clamp(4rem,12vw,12rem)] leading-none text-[#E6E6E6]">西村昭彦</h2>
          <p className="mt-4 text-sm tracking-[0.2em] text-[#555]">AKIHIKO NISHIMURA</p>
        </motion.div>
        <MarqueeBand speed={40} className="mt-12"><span className="text-sm text-[#E6E6E6]/20 mr-8">北海道出身 --- 青森山田高校 --- クロスミントン世界王者 --- 6度優勝 --- RST Agency --- 北海道出身 --- 青森山田高校 --- クロスミントン世界王者 --- 6度優勝 --- RST Agency --- </span></MarqueeBand>
        <div className="mt-12 max-w-md mx-auto space-y-2 text-sm text-[#E6E6E6]/60 text-left">
          <p>北海道出身。8歳でバドミントンを始める</p><p>青森山田高校・中央大学で競技経験を積む</p><p>インターハイ・全国高校選抜 シングルスベスト8</p><p>全日本総合バドミントン選手権 4度出場</p>
          <p><span className="text-[#F6FF54] font-semibold">2015</span> クロスミントン転向</p><p>世界選手権ミックスダブルス4連覇、シングルス2連覇（計6度優勝）</p>
          <p><span className="text-[#F6FF54] font-semibold">2023</span> ピックルボール転向、選手兼大会ディレクター</p><p>RST Agency株式会社 代表取締役</p>
        </div>
        <div className="mt-8 max-w-md mx-auto border-t border-[#333] pt-6 text-left">
          <p className="text-xs tracking-[0.3em] text-[#555]">PRESS</p>
          <p className="mt-2 text-sm text-[#E6E6E6]/50">クロスミントン世界王者・西村昭彦 本八幡駅徒歩1分に都市型ピックルボール施設 2026年春オープン</p>
          <a href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[#F6FF54]">PR TIMES →</a>
        </div>
      </section>

      {/* Access */}
      <section className="px-8 py-24 border-t border-[#222]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-[#555] mb-8">ACCESS</p>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.5!2d139.924!3d35.721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5Y2D6JGJ55yM5biC5bed5biC5YWr5bmhMi0xNi02!5e0!3m2!1sja!2sjp!4v1" title="THE PICKLE BANG THEORY 所在地" className="w-full h-[300px] lg:h-[400px] border-0 mb-12" loading="lazy" />
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-2"><p className="text-lg font-semibold text-[#E6E6E6]">THE PICKLE BANG THEORY</p><p className="text-sm text-[#555]">〒272-0021</p><p className="text-sm text-[#E6E6E6]">千葉県市川市八幡2-16-6 6階</p><p className="text-sm text-[#E6E6E6]">営業時間：6:00 – 23:00（不定休）</p><p className="text-sm text-[#E6E6E6]">Email：<a href="mailto:hello@rstagency.com" className="text-[#F6FF54]">hello@rstagency.com</a></p></div>
            <div>{[{ line: "JR総武線", st: "「本八幡駅」北口", t: "徒歩1分" }, { line: "都営新宿線", st: "「本八幡駅」", t: "徒歩3分" }, { line: "京成本線", st: "「京成八幡駅」", t: "徒歩5分" }].map((r) => (
              <div key={r.st} className="flex items-baseline justify-between border-b border-[#333] py-4"><span className="text-sm text-[#E6E6E6]"><span className="text-[#555]">{r.line}</span> <span className="font-semibold">{r.st}</span></span><span className="text-sm font-semibold text-[#F6FF54]">{r.t}</span></div>
            ))}<p className="mt-4 text-sm text-[#555]">お車でお越しの方は近隣のコインパーキングをご利用ください。</p></div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-8 py-24 border-t border-[#222]">
        <div className="max-w-4xl mx-auto">
          <motion.p className="font-serif text-[clamp(2rem,5vw,5rem)] text-[#E6E6E6] text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>GET IN TOUCH</motion.p>
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="space-y-8"><div><span className="text-xs text-[#555]">Email</span><a href="mailto:hello@rstagency.com" className="mt-1 block text-xl text-[#F6FF54]">hello@rstagency.com</a></div><div><span className="text-xs text-[#555]">Instagram</span><p className="mt-1 text-lg text-[#E6E6E6]">@thepicklebangtheory</p></div><div><span className="text-xs text-[#555]">Address</span><p className="mt-1 text-lg text-[#E6E6E6]">千葉県市川市八幡2-16-6 6階</p></div><div><span className="text-xs text-[#555]">Hours</span><p className="mt-1 text-lg text-[#E6E6E6]">6:00 – 23:00</p></div></div>
            <div>{status === "success" ? <p className="font-serif text-2xl text-[#E6E6E6]">送信しました。</p> : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div><label htmlFor="l-name" className="block text-xs text-[#555]">お名前 *</label><input id="l-name" name="name" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]" /></div>
                <div><label htmlFor="l-email" className="block text-xs text-[#555]">メールアドレス *</label><input id="l-email" name="email" type="email" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]" /></div>
                <div><label htmlFor="l-phone" className="block text-xs text-[#555]">電話番号</label><input id="l-phone" name="phone" type="tel" className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]" /></div>
                <div><label htmlFor="l-cat" className="block text-xs text-[#555]">お問い合わせ種別 *</label><select id="l-cat" name="category" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]"><option value="" className="bg-black">選択してください</option><option value="court" className="bg-black">コート予約</option><option value="lesson" className="bg-black">レッスンについて</option><option value="press" className="bg-black">取材依頼</option><option value="other" className="bg-black">その他</option></select></div>
                <div><label htmlFor="l-msg" className="block text-xs text-[#555]">お問い合わせ内容 *</label><textarea id="l-msg" name="message" required rows={4} className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none resize-none focus:border-[#F6FF54]" /></div>
                {status === "error" && <p className="text-sm text-red-400">送信に失敗しました</p>}
                <button type="submit" disabled={status === "submitting"} className="w-full bg-[#F6FF54] py-4 text-sm font-semibold tracking-wider text-black disabled:opacity-50 lg:w-auto lg:px-12">{status === "submitting" ? "SENDING..." : "SEND MESSAGE →"}</button>
              </form>
            )}</div>
          </div>
        </div>
        <MarqueeBand speed={50} className="mt-16"><span className="text-xs text-[#E6E6E6]/10 tracking-[0.2em] mr-12">千葉県市川市八幡2-16-6 6階 --- 6:00-23:00 --- hello@rstagency.com --- 千葉県市川市八幡2-16-6 6階 --- 6:00-23:00 --- hello@rstagency.com --- </span></MarqueeBand>
      </section>

      <footer className="py-6 text-center border-t border-[#222]"><p className="text-[10px] text-[#555]/30">© 2026 RST Agency Inc.</p></footer>
    </main>
  );
}
