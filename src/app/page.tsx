"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

function Cell({ children, className = "", span = "", delay = 0 }: { children: React.ReactNode; className?: string; span?: string; delay?: number }) {
  return (
    <motion.div className={`border border-[#222] p-6 lg:p-8 transition-colors hover:bg-white/5 ${span} ${className}`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [status, setStatus] = useState<FormStatus>("idle");
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), category: fd.get("category"), message: fd.get("message") }) });
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-2 lg:p-3">
      <header className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-3 backdrop-blur-md bg-[#0A0A0A]/70">
        <Image src="/logos/yoko-w.png" alt="THE PICKLE BANG THEORY" width={120} height={24} className="h-5 w-auto" />
        <a href="#" className="bg-[#C8FF00] px-3 py-1.5 text-[10px] font-semibold tracking-wider text-black">RESERVE</a>
      </header>
      <div className="grid grid-cols-1 gap-2 pt-14 lg:grid-cols-6 lg:gap-2">

        {/* Hero */}
        <Cell span="lg:col-span-3 lg:row-span-2" className="bg-[#0A0A0A] flex flex-col justify-center lg:p-16">
          <h1 className="font-serif text-[clamp(2rem,4vw,4rem)] leading-[1.2] text-[#E6E6E6]">ここから、<br />ピックルボールの<br /><span className="text-[#C8FF00]">ビッグバン</span><br />が始まる。</h1>
          <p className="mt-4 text-xs tracking-[0.3em] text-[#666]">FROM A SMALL DINK TO A BIG MOVEMENT</p>
          <a href="#" className="mt-6 inline-block bg-[#C8FF00] px-6 py-3 text-sm font-semibold tracking-wider text-black self-start">RESERVE A COURT →</a>
        </Cell>

        {/* Logo */}
        <Cell span="" className="bg-[#111] flex items-center justify-center" delay={0.1}>
          <Image src="/logos/yoko-w.png" alt="THE PICKLE BANG THEORY" width={160} height={32} className="h-8 w-auto" priority />
        </Cell>

        {/* Photo */}
        <Cell span="lg:col-span-2 lg:row-span-2" className="relative overflow-hidden min-h-[200px] p-0 lg:p-0" delay={0.15}>
          <Image src="/images/jon-matthews-YFNDwuYoyCA-unsplash.jpg" alt="Player mid-swing" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </Cell>

        {/* Numbers */}
        {[{ v: "3", l: "COURTS", bg: "#0A0A0A" }, { v: "6:00–23:00", l: "HOURS", bg: "#111" }, { v: "1 min", l: "STATION", bg: "#141414" }].map((s, i) => (
          <Cell key={s.l} className={`flex flex-col items-center justify-center text-center`} delay={i * 0.05} span="">
            <span className="font-serif text-[clamp(1.5rem,3vw,3rem)] text-[#E6E6E6]">{s.v}</span>
            <span className="mt-2 text-[10px] tracking-[0.2em] text-[#666]">{s.l}</span>
          </Cell>
        ))}

        {/* 4th number */}
        <Cell className="flex flex-col items-center justify-center text-center bg-[#111]" delay={0.15}>
          <span className="font-serif text-[clamp(1.2rem,2.5vw,2.5rem)] text-[#E6E6E6]">4,800万+</span>
          <span className="mt-2 text-[10px] tracking-[0.2em] text-[#666]">US PLAYERS</span>
        </Cell>

        {/* Concept */}
        <Cell span="lg:col-span-3" className="bg-[#141414] lg:p-12" delay={0.05}>
          <p className="text-[10px] tracking-[0.3em] text-[#666] mb-4">CONCEPT</p>
          <p className="text-sm leading-relaxed text-[#E6E6E6]/80 lg:text-base">クロスミントン世界王者・西村昭彦が、本気で上達したいすべてのプレーヤーのために作った空間。本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。練習、トレーニング、試合、そしてコミュニティ——すべてがここに。</p>
        </Cell>

        {/* Facility */}
        <Cell span="lg:col-span-3" className="bg-[#0A0A0A] lg:p-12" delay={0.1}>
          <p className="text-[10px] tracking-[0.3em] text-[#666] mb-4">FACILITY</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[{ l: "SURFACE", v: "PickleRoll Pro（PPA Asia公式採用）" }, { l: "COURTS", v: "3面（ハードコート）" }, { l: "LAYOUT", v: "ショーコート変更可能" }, { l: "TYPE", v: "全天候型インドア / 空調完備" }].map((s) => (
              <div key={s.l}><span className="text-[9px] tracking-[0.2em] text-[#C8FF00]">{s.l}</span><p className="mt-1 text-xs text-[#E6E6E6]/80">{s.v}</p></div>
            ))}
          </div>
          <div className="border-t border-[#222] pt-4 space-y-2">
            {["空調完備", "更衣室", "トレーニングエリア", "ラウンジスペース", "レンタル用品", "無人チェックイン対応"].map((a) => (
              <p key={a} className="text-xs text-[#E6E6E6]/50">{a}</p>
            ))}
          </div>
        </Cell>

        {/* Services */}
        <Cell span="lg:col-span-6" className="bg-[#111] lg:p-12">
          <p className="text-[10px] tracking-[0.3em] text-[#666] mb-6">SERVICES</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { n: "01", t: "コートレンタル", en: "COURT RENTAL", d: "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。" },
              { n: "02", t: "レッスン & クリニック", en: "LESSONS & CLINICS", d: "プロ選手による直接指導。レベル別プログラム対応。" },
              { n: "03", t: "トレーニング", en: "TRAINING", d: "フィジカルトレーニング統合プログラム。コンディショニング。" },
              { n: "04", t: "大会 & リーグ", en: "TOURNAMENTS", d: "賞金付きトーナメントからリーグ戦まで。" },
              { n: "05", t: "イベント", en: "EVENTS", d: "ショーコート観戦イベント。異業種コラボ。" },
            ].map((svc) => (
              <div key={svc.n}><span className="text-lg text-[#C8FF00] font-serif">{svc.n}</span><h3 className="mt-1 text-sm font-semibold text-[#E6E6E6]">{svc.t}</h3><p className="text-[10px] tracking-[0.15em] text-[#666]">{svc.en}</p><p className="mt-2 text-xs text-[#E6E6E6]/50">{svc.d}</p></div>
            ))}
          </div>
        </Cell>

        {/* Pricing */}
        <Cell span="lg:col-span-3" className="bg-[#141414] lg:p-12">
          <h2 className="font-serif text-xl text-[#E6E6E6]">料金の詳細は近日公開</h2>
          <p className="mt-2 text-xs text-[#666]">最新情報はInstagramでお知らせいたします。</p>
          <a href="https://instagram.com/thepicklebangtheory" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#C8FF00]">@thepicklebangtheory</a>
          <div className="mt-6 space-y-3">
            {[{ en: "VISITOR", ja: "ビジター", type: "都度利用" }, { en: "REGULAR", ja: "レギュラー会員", type: "月額制" }, { en: "PREMIUM", ja: "プレミアム会員", type: "月額制" }].map((t) => (
              <div key={t.en} className="border-b border-[#222] pb-3"><p className="text-[9px] tracking-[0.2em] text-[#666]">{t.en}</p><p className="text-xs text-[#E6E6E6]">{t.ja} — {t.type} — <span className="text-[#666]">COMING SOON</span></p></div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[#E6E6E6]/50">レンタルパドル・ボールをご用意しています。</p>
        </Cell>

        {/* Founder */}
        <Cell span="lg:col-span-3" className="bg-gradient-to-br from-[#0d0d1a] to-[#0A0A0A] lg:p-12">
          <p className="text-[10px] tracking-[0.3em] text-[#666]">FOUNDER</p>
          <h2 className="mt-2 font-serif text-3xl text-[#E6E6E6]">西村昭彦</h2>
          <p className="mt-1 text-xs tracking-[0.15em] text-[#666]">AKIHIKO NISHIMURA</p>
          <div className="mt-4 space-y-1 text-xs text-[#E6E6E6]/60">
            <p>北海道出身。8歳でバドミントンを始める</p><p>青森山田高校・中央大学で競技経験を積む</p><p>インターハイ・全国高校選抜 ベスト8</p><p>全日本総合 4度出場</p>
            <p><span className="text-[#C8FF00]">2015</span> クロスミントン転向</p><p>世界選手権 6度優勝</p>
            <p><span className="text-[#C8FF00]">2023</span> ピックルボール転向</p><p>RST Agency 代表取締役</p>
          </div>
          <div className="mt-4 border-t border-[#222] pt-3"><p className="text-[9px] text-[#666]">PRESS</p><a href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#C8FF00]">PR TIMES →</a></div>
        </Cell>

        {/* Access */}
        <Cell span="lg:col-span-3" className="bg-[#0A0A0A] lg:p-12">
          <p className="text-[10px] tracking-[0.3em] text-[#666] mb-4">ACCESS</p>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.5!2d139.924!3d35.721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5Y2D6JGJ55yM5biC5bed5biC5YWr5bmhMi0xNi02!5e0!3m2!1sja!2sjp!4v1" title="THE PICKLE BANG THEORY 所在地" className="w-full h-[200px] border-0 mb-4" loading="lazy" />
          <div className="space-y-1 text-xs"><p className="text-[#E6E6E6]">〒272-0021 千葉県市川市八幡2-16-6 6階</p><p className="text-[#E6E6E6]/60">6:00 – 23:00（不定休）</p></div>
          <div className="mt-4 space-y-2">
            {[{ line: "JR本八幡駅 北口", t: "徒歩1分" }, { line: "都営新宿線 本八幡駅", t: "徒歩3分" }, { line: "京成八幡駅", t: "徒歩5分" }].map((r) => (
              <div key={r.line} className="flex justify-between text-xs border-b border-[#222] pb-2"><span className="text-[#E6E6E6]/60">{r.line}</span><span className="text-[#C8FF00]">{r.t}</span></div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[#666]">お車でお越しの方は近隣のコインパーキングをご利用ください。</p>
        </Cell>

        {/* Contact */}
        <Cell span="lg:col-span-3" className="bg-[#141414] lg:p-12">
          <p className="text-[10px] tracking-[0.3em] text-[#666] mb-4">CONTACT</p>
          {status === "success" ? <p className="font-serif text-xl text-[#E6E6E6]">送信しました。</p> : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label htmlFor="k-name" className="block text-[10px] text-[#666]">お名前 *</label><input id="k-name" name="name" required className="mt-1 w-full border-b border-[#333] bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none focus:border-[#C8FF00]" /></div>
              <div><label htmlFor="k-email" className="block text-[10px] text-[#666]">メールアドレス *</label><input id="k-email" name="email" type="email" required className="mt-1 w-full border-b border-[#333] bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none focus:border-[#C8FF00]" /></div>
              <div><label htmlFor="k-phone" className="block text-[10px] text-[#666]">電話番号</label><input id="k-phone" name="phone" type="tel" className="mt-1 w-full border-b border-[#333] bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none focus:border-[#C8FF00]" /></div>
              <div><label htmlFor="k-cat" className="block text-[10px] text-[#666]">種別 *</label><select id="k-cat" name="category" required className="mt-1 w-full border-b border-[#333] bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none focus:border-[#C8FF00]"><option value="" className="bg-[#141414]">選択</option><option value="court" className="bg-[#141414]">コート予約</option><option value="lesson" className="bg-[#141414]">レッスン</option><option value="press" className="bg-[#141414]">取材依頼</option><option value="other" className="bg-[#141414]">その他</option></select></div>
              <div><label htmlFor="k-msg" className="block text-[10px] text-[#666]">内容 *</label><textarea id="k-msg" name="message" required rows={3} className="mt-1 w-full border-b border-[#333] bg-transparent pb-2 text-sm text-[#E6E6E6] outline-none resize-none focus:border-[#C8FF00]" /></div>
              {status === "error" && <p className="text-xs text-red-400">送信に失敗しました</p>}
              <button type="submit" disabled={status === "submitting"} className="w-full bg-[#C8FF00] py-3 text-xs font-semibold tracking-wider text-black disabled:opacity-50">SEND MESSAGE →</button>
            </form>
          )}
          <div className="mt-6 space-y-3"><a href="mailto:hello@rstagency.com" className="block text-sm text-[#C8FF00]">hello@rstagency.com</a><p className="text-xs text-[#E6E6E6]/50">@thepicklebangtheory</p></div>
        </Cell>

      </div>

      {/* Footer */}
      <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3">
        <div className="border border-[#222] bg-[#0A0A0A] px-6 py-4 flex items-center"><Image src="/logos/yoko-w.png" alt="THE PICKLE BANG THEORY" width={120} height={24} className="h-5 w-auto opacity-60" /></div>
        <div className="border border-[#222] bg-[#0A0A0A] px-6 py-4 flex items-center justify-center gap-4">
          {["CONCEPT", "FACILITY", "SERVICES", "PRICING", "ACCESS", "CONTACT"].map((l) => (<span key={l} className="text-[9px] tracking-[0.15em] text-[#666]">{l}</span>))}
        </div>
        <div className="border border-[#222] bg-[#0A0A0A] px-6 py-4 flex items-center justify-between"><span className="text-[9px] text-[#666]/40">© 2026 RST Agency Inc.</span><span className="text-[9px] text-[#666]/40">〒272-0021</span></div>
      </div>
    </main>
  );
}
