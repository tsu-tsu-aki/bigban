"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface PriceRow {
  timeSlot: string;
  weekday: string;
  weekend: string;
}

const COURT_PRICES: PriceRow[] = [
  { timeSlot: "6:00-9:00", weekday: "¥4,980", weekend: "¥7,980" },
  { timeSlot: "9:00-18:00", weekday: "¥5,960", weekend: "¥7,980" },
  { timeSlot: "18:00-23:00", weekday: "¥7,980", weekend: "¥7,980" },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomePricing() {
  return (
    <section
      id="pricing"
      className="bg-deep-black py-24 lg:py-32 text-text-light"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Title */}
        <motion.div
          className="text-center mb-20 lg:mb-28"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black tracking-[0.15em]">
            PRICING
          </h2>
          <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
        </motion.div>

        {/* OPEN記念価格 */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="text-accent text-sm sm:text-base font-semibold tracking-wide opacity-85">
          5月31日までのOPEN記念価格{"\u{1F239}\uFE0F"}☝️👽
          </p>
          <div className="mx-auto mt-4 w-10 h-px bg-accent/30" />
        </motion.div>

        {/* Court Rental Table */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          <p className="text-[10px] tracking-[0.25em] text-accent mb-4">
            COURT RENTAL
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-text-gray/20">
                  <th className="text-left py-3 px-3 text-text-gray font-normal text-xs" />
                  <th className="text-right py-3 px-3 text-text-gray font-normal text-xs">
                    平日
                  </th>
                  <th className="text-right py-3 px-3 text-text-gray font-normal text-xs">
                    週末・祝日
                  </th>
                </tr>
              </thead>
              <tbody>
                {COURT_PRICES.map((row) => (
                  <tr
                    key={row.timeSlot}
                    className="border-b border-text-gray/10"
                  >
                    <td className="py-4 px-3 text-text-light">
                      {row.timeSlot}
                    </td>
                    <td className="py-4 px-3 text-text-light text-right font-semibold">
                      {row.weekday}
                    </td>
                    <td className="py-4 px-3 text-text-light text-right font-semibold">
                      {row.weekend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Training Area & Membership */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <motion.div
            className="border border-text-gray/15 rounded-sm px-5 py-4 flex items-center justify-between"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          >
            <div>
              <span className="text-[10px] tracking-[0.25em] text-accent block mb-1">
                TRAINING AREA
              </span>
              <span className="text-text-light text-sm">
                トレーニングエリア
              </span>
            </div>
            <span className="text-accent/50 text-xs tracking-wider">
              準備中
            </span>
          </motion.div>

          <motion.div
            className="border border-text-gray/15 rounded-sm px-5 py-4 flex items-center justify-between"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          >
            <div>
              <span className="text-[10px] tracking-[0.25em] text-accent block mb-1">
                MEMBERSHIP
              </span>
              <span className="text-text-light text-sm">会員制度</span>
            </div>
            <span className="text-accent/50 text-xs tracking-wider">
              近日公開
            </span>
          </motion.div>
        </div>

        {/* Footer notes */}
        <motion.div
          className="border-t border-text-gray/10 pt-8 space-y-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
        >
          <div className="flex items-start gap-3">
            <span className="text-accent text-xs mt-0.5">▸</span>
            <p className="text-text-gray text-sm">
              イベント利用もしくは貸切のみレンタルパドルあり
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent text-xs mt-0.5">▸</span>
            <p className="text-text-gray text-sm">
              トレーニングエリアやラウンジスペースを含む施設全ての貸切をご希望、法人利用ご希望の場合は
              <Link
                href="/about#contact"
                className="text-accent hover:underline"
              >
                お問い合わせ
              </Link>
              ください。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
