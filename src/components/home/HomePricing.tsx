"use client";

import { motion } from "framer-motion";

interface PricingPlan {
  nameEn: string;
  nameJa: string;
  type: string;
  isRecommended: boolean;
}

const PLANS: PricingPlan[] = [
  {
    nameEn: "VISITOR",
    nameJa: "ビジター",
    type: "都度利用",
    isRecommended: false,
  },
  {
    nameEn: "REGULAR",
    nameJa: "レギュラー会員",
    type: "月額制",
    isRecommended: true,
  },
  {
    nameEn: "PREMIUM",
    nameJa: "プレミアム会員",
    type: "月額制",
    isRecommended: false,
  },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomePricing() {
  return (
    <section id="pricing" className="bg-deep-black py-24 lg:py-32 text-off-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* 近日公開見出し */}
        <motion.h2
          className="font-serif text-3xl lg:text-5xl text-center mb-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          料金の詳細は近日公開
        </motion.h2>

        {/* Instagram言及 */}
        <motion.p
          className="text-center text-text-gray mb-16"
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
            className="text-accent hover:underline ml-1"
          >
            @thepicklebangtheory
          </a>
        </motion.p>

        {/* Blue gradient line */}
        <div className="h-px mb-0" style={{ background: 'linear-gradient(90deg, transparent, #306EC3, transparent)' }} />

        {/* 3カラム料金プレビュー */}
        <motion.div
          className="grid md:grid-cols-3 border-t border-[#2a2a2a]"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          {PLANS.map((plan, i) => (
            <div
              key={plan.nameEn}
              className={`border-b border-[#2a2a2a] ${
                i < PLANS.length - 1 ? "md:border-r" : ""
              } ${
                plan.isRecommended ? "border-t-2 border-t-accent" : ""
              } p-8 lg:p-10`}
            >
              <p className="text-xs tracking-[0.2em] text-text-gray mb-1">
                {plan.nameEn} / {plan.nameJa}
              </p>
              <p className="text-sm text-text-gray mb-6">{plan.type}</p>
              <p className="font-serif text-2xl">COMING SOON</p>
              {plan.isRecommended && (
                <span className="inline-block mt-4 text-xs tracking-[0.15em] text-accent">
                  おすすめ
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {/* レンタル案内 */}
        <motion.div
          className="flex items-center gap-3 mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        >
          <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
          <p className="text-sm text-text-gray">
            レンタルパドル・ボールをご用意しています。手ぶらでお気軽にお越しください。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
