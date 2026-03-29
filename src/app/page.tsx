"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Spread animations across 0-0.65 range (sticky sections)
  // Remaining 0.65-1.0 is for normal-flow Access/Contact sections
  const logoScale = useTransform(scrollYProgress, [0, 0.06], [3, 1]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.06], [0, 1]);

  const w1 = useTransform(scrollYProgress, [0.07, 0.1], [0, 1]);
  const w2 = useTransform(scrollYProgress, [0.11, 0.14], [0, 1]);
  const w3 = useTransform(scrollYProgress, [0.15, 0.18], [0, 1]);
  const w4 = useTransform(scrollYProgress, [0.19, 0.22], [0, 1]);
  const tagO = useTransform(scrollYProgress, [0.22, 0.24], [0, 1]);

  const conceptO = useTransform(scrollYProgress, [0.25, 0.30], [0, 1]);

  const n1 = useTransform(scrollYProgress, [0.31, 0.33], [0, 1]);
  const n2 = useTransform(scrollYProgress, [0.33, 0.35], [0, 1]);
  const n3 = useTransform(scrollYProgress, [0.35, 0.37], [0, 1]);
  const n4 = useTransform(scrollYProgress, [0.37, 0.39], [0, 1]);

  const facO = useTransform(scrollYProgress, [0.40, 0.44], [0, 1]);

  const s1 = useTransform(scrollYProgress, [0.45, 0.47], [0, 1]);
  const s2 = useTransform(scrollYProgress, [0.47, 0.49], [0, 1]);
  const s3 = useTransform(scrollYProgress, [0.49, 0.51], [0, 1]);
  const s4 = useTransform(scrollYProgress, [0.51, 0.53], [0, 1]);
  const s5 = useTransform(scrollYProgress, [0.53, 0.55], [0, 1]);

  const priceO = useTransform(scrollYProgress, [0.56, 0.60], [0, 1]);

  const fScale = useTransform(scrollYProgress, [0.61, 0.68], [0.3, 1]);
  const fO = useTransform(scrollYProgress, [0.61, 0.65], [0, 1]);

  const [status, setStatus] = useState<FormStatus>("idle");
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), category: fd.get("category"), message: fd.get("message") }) });
    setStatus(res.ok ? "success" : "error");
  }

  const svcData = [
    { o: s1, n: "01", t: "コートレンタル", en: "COURT RENTAL", d: "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。" },
    { o: s2, n: "02", t: "レッスン & クリニック", en: "LESSONS & CLINICS", d: "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。" },
    { o: s3, n: "03", t: "トレーニング", en: "TRAINING", d: "フィジカルトレーニング統合プログラム。併設トレーニングエリアでコンディショニング。" },
    { o: s4, n: "04", t: "大会 & リーグ", en: "TOURNAMENTS & LEAGUES", d: "オリジナル大会・リーグを定期開催。賞金付きトーナメント。" },
    { o: s5, n: "05", t: "イベント", en: "EVENTS", d: "ショーコートへのレイアウト変更で観戦イベント実現。異業種コラボレーション。" },
  ];

  return (
    <div ref={containerRef} className="relative bg-black">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-black/50">
        <Image src="/logos/yoko-neon.png" alt="THE PICKLE BANG THEORY" width={160} height={32} className="h-6 w-auto" />
        <a href="#" className="bg-[#F6FF54] px-4 py-2 text-xs font-semibold tracking-wider text-black">RESERVE</a>
      </header>

      {/* Progress bar */}
      <div className="fixed right-0 top-0 z-50 h-screen w-1">
        <motion.div className="w-full origin-top bg-[#F6FF54]" style={{ scaleY: progressScaleY, height: "100%" }} />
      </div>

      {/* Scroll space for sticky animations */}
      <div style={{ height: "700vh" }}>
        {/* Logo */}
        <div className="sticky top-0 z-[30] flex h-screen items-center justify-center">
          <motion.div style={{ scale: logoScale, opacity: logoOpacity }}>
            <Image src="/logos/yoko-neon.png" alt="THE PICKLE BANG THEORY" width={400} height={80} className="h-16 w-auto lg:h-20" priority />
          </motion.div>
        </div>

        {/* Headline */}
        <div className="sticky top-0 z-[31] flex h-screen items-center justify-center px-8">
          <div className="text-center">
            <div className="font-serif text-[clamp(2rem,5vw,5rem)] leading-[1.4]">
              <motion.span className="block text-[#E6E6E6]" style={{ opacity: w1 }}>ここから、</motion.span>
              <motion.span className="block text-[#E6E6E6]" style={{ opacity: w2 }}>ピックルボールの</motion.span>
              <motion.span className="block text-[#F6FF54]" style={{ opacity: w3 }}>ビッグバン</motion.span>
              <motion.span className="block text-[#E6E6E6]" style={{ opacity: w4 }}>が始まる。</motion.span>
            </div>
            <motion.p className="mt-6 text-xs tracking-[0.3em] text-[#888]" style={{ opacity: tagO }}>FROM A SMALL DINK TO A BIG MOVEMENT</motion.p>
          </div>
        </div>

        {/* Concept */}
        <div className="sticky top-0 z-[32] flex h-screen items-center justify-center bg-black px-8">
          <motion.div className="max-w-2xl text-center" style={{ opacity: conceptO }}>
            <p className="text-xs tracking-[0.3em] text-[#888] mb-6">CONCEPT</p>
            <p className="text-lg leading-[2] text-[#E6E6E6]">クロスミントン世界王者・西村昭彦が、本気で上達したいすべてのプレーヤーのために作った空間。本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。練習、トレーニング、試合、そしてコミュニティ——すべてがここに。</p>
          </motion.div>
        </div>

        {/* Numbers */}
        <div className="sticky top-0 z-[33] flex h-screen items-center justify-center bg-black">
          <div className="grid grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-20 px-8">
            {[{ o: n1, v: "3", en: "COURTS", ja: "プロ仕様コート" }, { o: n2, v: "6:00–23:00", en: "HOURS", ja: "営業時間" }, { o: n3, v: "1 min", en: "FROM STATION", ja: "駅徒歩1分" }, { o: n4, v: "4,800万+", en: "US PLAYERS", ja: "米国競技人口" }].map((s) => (
              <motion.div key={s.en} className="text-center" style={{ opacity: s.o }}><span className="font-serif text-5xl text-[#E6E6E6] lg:text-7xl">{s.v}</span><p className="mt-2 text-xs tracking-[0.2em] text-[#888]">{s.en}</p><p className="mt-1 text-sm text-[#E6E6E6]/50">{s.ja}</p></motion.div>
            ))}
          </div>
        </div>

        {/* Facility */}
        <div className="sticky top-0 z-[34] flex h-screen items-center justify-center bg-black px-8">
          <motion.div className="max-w-3xl" style={{ opacity: facO }}>
            <p className="text-xs tracking-[0.3em] text-[#888] mb-8">FACILITY</p>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 mb-12">
              {[{ l: "SURFACE", v: "PickleRoll Pro（PPA Asia公式採用）" }, { l: "COURTS", v: "3面（ハードコート）" }, { l: "LAYOUT", v: "観戦可能な1面ショーコートに変更可能" }, { l: "TYPE", v: "全天候型インドア / 空調完備" }].map((s) => (
                <div key={s.l}><span className="text-[10px] tracking-[0.2em] text-[#F6FF54]">{s.l}</span><p className="mt-1 text-sm text-[#E6E6E6]">{s.v}</p></div>
              ))}
            </div>
            <div className="space-y-3 border-t border-[#333] pt-6">
              {["空調完備", "更衣室", "トレーニングエリア", "ラウンジスペース", "レンタル用品", "無人チェックイン対応"].map((a) => (
                <p key={a} className="text-sm text-[#E6E6E6]/60 border-b border-[#222] pb-3">{a}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Services */}
        <div className="sticky top-0 z-[35] flex h-screen items-center justify-center bg-black px-8">
          <div className="max-w-2xl w-full space-y-6">
            {svcData.map((svc) => (
              <motion.div key={svc.n} style={{ opacity: svc.o }}>
                <span className="font-serif text-3xl text-[#F6FF54] lg:text-4xl">{svc.n}</span>
                <h3 className="mt-1 font-serif text-lg text-[#E6E6E6] lg:text-xl">{svc.t}</h3>
                <p className="text-xs tracking-[0.15em] text-[#888]">{svc.en}</p>
                <p className="mt-2 text-sm text-[#E6E6E6]/60">{svc.d}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="sticky top-0 z-[36] flex h-screen items-center justify-center bg-black px-8">
          <motion.div className="max-w-2xl text-center" style={{ opacity: priceO }}>
            <h2 className="font-serif text-3xl text-[#E6E6E6] lg:text-5xl">料金の詳細は近日公開</h2>
            <p className="mt-4 text-sm text-[#888]">最新情報はInstagramでお知らせいたします。</p>
            <a href="https://instagram.com/thepicklebangtheory" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[#F6FF54]">@thepicklebangtheory</a>
            <div className="mt-8 grid grid-cols-3 border-t border-[#333]">
              {[{ en: "VISITOR", ja: "ビジター", type: "都度利用", rec: false }, { en: "REGULAR", ja: "レギュラー会員", type: "月額制", rec: true }, { en: "PREMIUM", ja: "プレミアム会員", type: "月額制", rec: false }].map((t, i) => (
                <div key={t.en} className={`px-4 py-6 ${i < 2 ? "border-r border-[#333]" : ""} ${t.rec ? "border-t-2 border-t-[#F6FF54]" : ""}`}>
                  <p className="text-xs tracking-[0.2em] text-[#888]">{t.en}</p><p className="mt-1 text-sm text-[#E6E6E6]">{t.ja}</p><p className="mt-4 text-xs text-[#888]">COMING SOON</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Founder */}
        <div className="sticky top-0 z-[37] flex h-screen items-center justify-center bg-black px-8">
          <motion.div className="text-center max-w-2xl" style={{ scale: fScale, opacity: fO }}>
            <p className="text-xs tracking-[0.3em] text-[#888]">FOUNDER</p>
            <h2 className="mt-4 font-serif text-[clamp(3rem,10vw,10rem)] leading-none text-[#E6E6E6]">西村昭彦</h2>
            <p className="mt-2 text-sm tracking-[0.2em] text-[#888]">AKIHIKO NISHIMURA</p>
            <div className="mt-8 space-y-2 text-sm text-[#E6E6E6]/70 text-left max-w-md mx-auto">
              <p>北海道出身。8歳でバドミントンを始める</p><p>青森山田高校・中央大学で競技経験を積む</p><p>インターハイ・全国高校選抜 シングルスベスト8</p><p>全日本総合バドミントン選手権 4度出場</p>
              <p><span className="text-[#F6FF54] font-semibold">2015</span> クロスミントン転向</p><p>世界選手権ミックスダブルス4連覇、シングルス2連覇（計6度優勝）</p>
              <p><span className="text-[#F6FF54] font-semibold">2023</span> ピックルボール転向、選手兼大会ディレクター</p><p>RST Agency株式会社 代表取締役</p>
            </div>
            <div className="mt-6 border-t border-[#333] pt-4 text-left max-w-md mx-auto">
              <p className="text-xs tracking-[0.3em] text-[#888]">PRESS</p>
              <a href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[#F6FF54]">PR TIMES →</a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Access - normal flow, above sticky sections */}
      <section className="relative z-[40] bg-black px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-[#888] mb-8">ACCESS</p>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.5!2d139.924!3d35.721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTbCsDQzJzE1LjYiTiAxMznCsDU1JzI2LjQiRQ!5e0!3m2!1sja!2sjp!4v1" title="THE PICKLE BANG THEORY" className="w-full h-[300px] lg:h-[400px] border-0 mb-12" loading="lazy" />
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-2"><p className="text-lg font-semibold text-[#E6E6E6]">THE PICKLE BANG THEORY</p><p className="text-sm text-[#888]">〒272-0021</p><p className="text-sm text-[#E6E6E6]">千葉県市川市八幡2-16-6 6階</p><p className="text-sm text-[#E6E6E6]">営業時間：6:00 – 23:00（不定休）</p><p className="text-sm text-[#E6E6E6]">Email：<a href="mailto:hello@rstagency.com" className="text-[#F6FF54]">hello@rstagency.com</a></p></div>
            <div>{[{ line: "JR総武線", st: "「本八幡駅」北口", t: "徒歩1分" }, { line: "都営新宿線", st: "「本八幡駅」", t: "徒歩3分" }, { line: "京成本線", st: "「京成八幡駅」", t: "徒歩5分" }].map((r) => (
              <div key={r.st} className="flex items-baseline justify-between border-b border-[#333] py-4"><span className="text-sm text-[#E6E6E6]"><span className="text-[#888]">{r.line}</span> <span className="font-semibold">{r.st}</span></span><span className="text-sm font-semibold text-[#F6FF54]">{r.t}</span></div>
            ))}<p className="mt-4 text-sm text-[#888]">お車でお越しの方は近隣のコインパーキングをご利用ください。</p></div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="relative z-[40] bg-black px-8 py-24 border-t border-[#333]">
        <div className="max-w-4xl mx-auto grid gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#888]">GET IN TOUCH</p>
            <div className="mt-8 space-y-8"><div><span className="text-xs text-[#888]">Email</span><a href="mailto:hello@rstagency.com" className="mt-1 block text-xl text-[#F6FF54]">hello@rstagency.com</a></div><div><span className="text-xs text-[#888]">Instagram</span><p className="mt-1 text-lg text-[#E6E6E6]">@thepicklebangtheory</p></div><div><span className="text-xs text-[#888]">Address</span><p className="mt-1 text-lg text-[#E6E6E6]">千葉県市川市八幡2-16-6 6階</p></div><div><span className="text-xs text-[#888]">Hours</span><p className="mt-1 text-lg text-[#E6E6E6]">6:00 – 23:00</p></div></div>
          </div>
          <div>{status === "success" ? <div className="flex items-center justify-center min-h-[300px]"><p className="font-serif text-2xl text-[#E6E6E6]">送信しました。</p></div> : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div><label htmlFor="j-name" className="block text-xs text-[#888]">お名前 *</label><input id="j-name" name="name" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]" /></div>
              <div><label htmlFor="j-email" className="block text-xs text-[#888]">メールアドレス *</label><input id="j-email" name="email" type="email" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]" /></div>
              <div><label htmlFor="j-phone" className="block text-xs text-[#888]">電話番号</label><input id="j-phone" name="phone" type="tel" className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]" /></div>
              <div><label htmlFor="j-cat" className="block text-xs text-[#888]">お問い合わせ種別 *</label><select id="j-cat" name="category" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none focus:border-[#F6FF54]"><option value="" className="bg-black">選択してください</option><option value="court" className="bg-black">コート予約</option><option value="lesson" className="bg-black">レッスンについて</option><option value="press" className="bg-black">取材依頼</option><option value="other" className="bg-black">その他</option></select></div>
              <div><label htmlFor="j-msg" className="block text-xs text-[#888]">お問い合わせ内容 *</label><textarea id="j-msg" name="message" required rows={4} className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E6E6E6] outline-none resize-none focus:border-[#F6FF54]" /></div>
              {status === "error" && <p className="text-sm text-red-400">送信に失敗しました</p>}
              <button type="submit" disabled={status === "submitting"} className="w-full bg-[#F6FF54] py-4 text-sm font-semibold tracking-wider text-black disabled:opacity-50 lg:w-auto lg:px-12">{status === "submitting" ? "SENDING..." : "SEND MESSAGE →"}</button>
            </form>
          )}</div>
        </div>
        <p className="mt-16 text-center text-[10px] text-[#888]/30">© 2026 RST Agency Inc.</p>
      </section>
    </div>
  );
}
