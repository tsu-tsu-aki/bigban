"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex min-h-screen items-center justify-center px-8 ${className}`}>
      <motion.div className="w-full max-w-xl text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}>
        {children}
      </motion.div>
    </section>
  );
}

export default function Home() {
  const [status, setStatus] = useState<FormStatus>("idle");
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), category: fd.get("category"), message: fd.get("message") }) });
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <main className="bg-[#080808]">
      {/* 1. Logo */}
      <section className="flex h-screen items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} className="text-center">
          <Image src="/logos/yoko-w.png" alt="THE PICKLE BANG THEORY" width={200} height={40} className="mx-auto h-8 w-auto" priority />
          <motion.div className="mx-auto mt-12 h-px bg-[#B8A88A]" initial={{ width: 0 }} animate={{ width: 128 }} transition={{ duration: 1.5, delay: 2 }} />
        </motion.div>
      </section>

      {/* Full-bleed image break */}
      <section className="h-screen relative">
        <Image src="/images/jon-matthews-YFNDwuYoyCA-unsplash.jpg" alt="Player mid-swing" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />
      </section>

      {/* 2-3. Headline */}
      <Section><h1 className="font-serif text-[clamp(2.5rem,5vw,5rem)] text-[#E8E4DF]">ここから。</h1></Section>
      <Section>
        <div className="leading-[2.5]">
          {["ピックルボールの", "ビッグバンが", "始まる"].map((w, i) => (
            <motion.span key={w} className="block font-serif text-[clamp(2rem,4vw,4rem)] text-[#E8E4DF]" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.5 }}>{w}</motion.span>
          ))}
        </div>
      </Section>

      {/* 4. Tagline + CTA */}
      <Section>
        <p className="text-xs tracking-[0.3em] text-[#555]">FROM A SMALL DINK TO A BIG MOVEMENT</p>
        <a href="#" className="mt-8 inline-block bg-[#B8A88A] px-8 py-4 text-sm font-semibold tracking-wider text-[#080808]">RESERVE A COURT →</a>
      </Section>

      {/* 5. Concept */}
      <Section>
        <p className="text-[11px] tracking-[0.3em] text-[#555] mb-8">CONCEPT</p>
        <p className="text-sm leading-[2.2] text-[#E8E4DF]/80">クロスミントン世界王者・西村昭彦が、本気で上達したいすべてのプレーヤーのために作った空間。本八幡駅徒歩1分。プロ仕様ハードコート3面。早朝から深夜まで。練習、トレーニング、試合、そしてコミュニティ——すべてがここに。</p>
      </Section>

      {/* 6-9. Numbers */}
      {[{ v: "3", l: "COURTS" }, { v: "6:00–23:00", l: "HOURS" }, { v: "1 min", l: "FROM STATION" }, { v: "4,800万+", l: "US PLAYERS" }].map((s) => (
        <Section key={s.l}><span className="font-serif text-[clamp(5rem,20vw,20rem)] leading-none text-[#E8E4DF]">{s.v}</span><p className="mt-4 text-[11px] tracking-[0.3em] text-[#555]">{s.l}</p></Section>
      ))}

      {/* 10. Facility */}
      <Section>
        <p className="text-[11px] tracking-[0.3em] text-[#555] mb-8">FACILITY</p>
        <div className="grid grid-cols-2 gap-6 text-left">
          {[{ l: "SURFACE", v: "PickleRoll Pro（PPA Asia公式採用）" }, { l: "COURTS", v: "3面（ハードコート）" }, { l: "LAYOUT", v: "観戦可能な1面ショーコートに変更可能" }, { l: "TYPE", v: "全天候型インドア / 空調完備" }].map((s) => (
            <div key={s.l}><span className="text-[10px] tracking-[0.2em] text-[#B8A88A]">{s.l}</span><p className="mt-1 text-[13px] text-[#E8E4DF]/80">{s.v}</p></div>
          ))}
        </div>
      </Section>

      {/* 11. Amenities */}
      <Section>
        <div className="space-y-4">
          {["空調完備", "更衣室", "トレーニングエリア", "ラウンジスペース", "レンタル用品", "無人チェックイン対応"].map((a) => (
            <p key={a} className="text-[13px] text-[#E8E4DF]/60 border-b border-[#222] pb-4">{a}</p>
          ))}
        </div>
      </Section>

      {/* 12-16. Services */}
      {[
        { n: "01", t: "コートレンタル", en: "COURT RENTAL", d: "時間貸しのレンタルコート。無人チェックインで手軽に予約・利用可能。早朝6:00から深夜23:00まで。" },
        { n: "02", t: "レッスン & クリニック", en: "LESSONS & CLINICS", d: "プロ選手による直接指導。レベル別プログラムで初心者から上級者まで対応。海外トッププレーヤーを招聘した特別クリニックも定期開催。" },
        { n: "03", t: "トレーニングプログラム", en: "TRAINING", d: "フィジカルトレーニングを取り入れたピックルボール強化プログラム。併設トレーニングエリアでコンディショニング。" },
        { n: "04", t: "大会 & リーグ", en: "TOURNAMENTS & LEAGUES", d: "オリジナル大会・リーグを定期開催。賞金付きトーナメントから幅広いレベルに対応したリーグ戦まで。" },
        { n: "05", t: "イベント", en: "EVENTS", d: "1面ショーコートへのレイアウト変更で本格的な観戦イベントを実現。異業種コラボレーションやプロモーションイベントの会場としても。" },
      ].map((svc) => (
        <Section key={svc.n}>
          <span className="font-serif text-5xl text-[#B8A88A]/40">{svc.n}</span>
          <h3 className="mt-2 font-serif text-2xl text-[#E8E4DF]">{svc.t}</h3>
          <p className="mt-1 text-xs tracking-[0.15em] text-[#555]">{svc.en}</p>
          <p className="mt-4 text-[13px] leading-relaxed text-[#E8E4DF]/60">{svc.d}</p>
        </Section>
      ))}

      {/* 17. Pricing */}
      <Section>
        <h2 className="font-serif text-2xl text-[#E8E4DF] lg:text-3xl">料金の詳細は近日公開</h2>
        <p className="mt-4 text-[13px] text-[#555]">最新情報はInstagramでお知らせいたします。</p>
        <a href="https://instagram.com/thepicklebangtheory" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] text-[#B8A88A]">@thepicklebangtheory</a>
        <div className="mt-10 space-y-6">
          {[{ en: "VISITOR", ja: "ビジター", type: "都度利用" }, { en: "REGULAR", ja: "レギュラー会員", type: "月額制" }, { en: "PREMIUM", ja: "プレミアム会員", type: "月額制" }].map((t) => (
            <div key={t.en} className="border-b border-[#222] pb-4"><p className="text-[10px] tracking-[0.2em] text-[#555]">{t.en}</p><p className="mt-1 text-[13px] text-[#E8E4DF]">{t.ja} — {t.type}</p><p className="mt-1 text-[10px] text-[#555]">COMING SOON</p></div>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-[#E8E4DF]/50">レンタルパドル・ボールをご用意しています。手ぶらでお気軽にお越しください。</p>
      </Section>

      {/* 18. Founder */}
      <Section>
        <p className="text-[11px] tracking-[0.3em] text-[#555]">FOUNDER</p>
        <h2 className="mt-6 font-serif text-[clamp(3rem,8vw,8rem)] text-[#E8E4DF]">西村昭彦</h2>
        <p className="mt-2 text-[13px] tracking-[0.15em] text-[#555]">AKIHIKO NISHIMURA</p>
        <div className="mt-8 space-y-2 text-[13px] text-[#E8E4DF]/60 text-left">
          <p>北海道出身。8歳でバドミントンを始める</p><p>青森山田高校・中央大学で競技経験を積む</p><p>インターハイ・全国高校選抜 シングルスベスト8</p><p>全日本総合バドミントン選手権 4度出場</p>
          <p><span className="text-[#B8A88A] font-semibold">2015</span> クロスミントン転向</p><p>世界選手権ミックスダブルス4連覇、シングルス2連覇（計6度優勝）</p>
          <p><span className="text-[#B8A88A] font-semibold">2023</span> ピックルボール転向、選手兼大会ディレクター</p><p>RST Agency株式会社 代表取締役</p>
        </div>
      </Section>

      {/* 19. Press */}
      <Section>
        <p className="text-[11px] tracking-[0.3em] text-[#555]">PRESS</p>
        <p className="mt-4 text-[13px] text-[#E8E4DF]/60 leading-relaxed">クロスミントン世界王者・西村昭彦 本八幡駅徒歩1分に都市型ピックルボール施設 2026年春オープン</p>
        <a href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[13px] text-[#B8A88A]">PR TIMES →</a>
      </Section>

      {/* 20. Access */}
      <Section>
        <p className="text-[11px] tracking-[0.3em] text-[#555] mb-8">ACCESS</p>
        <div className="space-y-2 text-[13px]"><p className="text-[#E8E4DF]">THE PICKLE BANG THEORY</p><p className="text-[#555]">〒272-0021</p><p className="text-[#E8E4DF]">千葉県市川市八幡2-16-6 6階</p><p className="text-[#E8E4DF]">営業時間：6:00 – 23:00（不定休）</p></div>
        <div className="mt-8 space-y-4">
          {[{ line: "JR総武線「本八幡駅」北口", t: "徒歩1分" }, { line: "都営新宿線「本八幡駅」", t: "徒歩3分" }, { line: "京成本線「京成八幡駅」", t: "徒歩5分" }].map((r) => (
            <div key={r.line} className="flex justify-between border-b border-[#222] pb-3"><span className="text-[13px] text-[#E8E4DF]/60">{r.line}</span><span className="text-[13px] text-[#B8A88A]">{r.t}</span></div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-[#555]">お車でお越しの方は近隣のコインパーキングをご利用ください。</p>
      </Section>

      {/* 21. Map */}
      <section className="flex items-center justify-center px-8 py-16">
        <motion.div className="w-full max-w-3xl" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.5!2d139.924!3d35.721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5Y2D6JGJ55yM5biC5bed5biC5YWr5bmhMi0xNi02!5e0!3m2!1sja!2sjp!4v1" title="THE PICKLE BANG THEORY 所在地" className="w-full h-[300px] border-0" loading="lazy" />
        </motion.div>
      </section>

      {/* 22. Contact Form */}
      <section className="flex min-h-screen items-center justify-center px-8">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}>
          {status === "success" ? <p className="font-serif text-2xl text-[#E8E4DF] text-center">送信しました。</p> : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div><label htmlFor="i-name" className="block text-[11px] text-[#555]">お名前 *</label><input id="i-name" name="name" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E8E4DF] outline-none focus:border-[#B8A88A]" /></div>
              <div><label htmlFor="i-email" className="block text-[11px] text-[#555]">メールアドレス *</label><input id="i-email" name="email" type="email" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E8E4DF] outline-none focus:border-[#B8A88A]" /></div>
              <div><label htmlFor="i-phone" className="block text-[11px] text-[#555]">電話番号</label><input id="i-phone" name="phone" type="tel" className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E8E4DF] outline-none focus:border-[#B8A88A]" /></div>
              <div><label htmlFor="i-cat" className="block text-[11px] text-[#555]">お問い合わせ種別 *</label><select id="i-cat" name="category" required className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E8E4DF] outline-none focus:border-[#B8A88A]"><option value="" className="bg-[#080808]">選択してください</option><option value="court" className="bg-[#080808]">コート予約</option><option value="lesson" className="bg-[#080808]">レッスンについて</option><option value="press" className="bg-[#080808]">取材依頼</option><option value="other" className="bg-[#080808]">その他</option></select></div>
              <div><label htmlFor="i-msg" className="block text-[11px] text-[#555]">お問い合わせ内容 *</label><textarea id="i-msg" name="message" required rows={4} className="mt-2 w-full border-b border-[#333] bg-transparent pb-3 text-[#E8E4DF] outline-none resize-none focus:border-[#B8A88A]" /></div>
              {status === "error" && <p className="text-sm text-red-400">送信に失敗しました</p>}
              <button type="submit" disabled={status === "submitting"} className="w-full bg-[#B8A88A] py-4 text-sm font-semibold tracking-wider text-[#080808] disabled:opacity-50">SEND MESSAGE →</button>
            </form>
          )}
        </motion.div>
      </section>

      {/* 23. Contact Info */}
      <Section>
        <div className="space-y-6">
          <div><span className="text-[11px] text-[#555]">Email</span><a href="mailto:hello@rstagency.com" className="mt-1 block text-lg text-[#B8A88A]">hello@rstagency.com</a></div>
          <div><span className="text-[11px] text-[#555]">Instagram</span><p className="mt-1 text-base text-[#E8E4DF]">@thepicklebangtheory</p></div>
          <div><span className="text-[11px] text-[#555]">Hours</span><p className="mt-1 text-base text-[#E8E4DF]">6:00 – 23:00</p></div>
        </div>
      </Section>

      <footer className="flex items-center justify-center py-12"><span className="text-[10px] tracking-[0.2em] text-[#555]/30">© 2026 RST Agency Inc.</span></footer>
    </main>
  );
}
