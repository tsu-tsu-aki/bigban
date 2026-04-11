"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import HomeNavigation from "@/components/home/HomeNavigation";
import HomeFooter from "@/components/home/HomeFooter";

import type { FormEvent } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

interface ContactCategory {
  value: string;
  label: string;
}

function useCategories(): ContactCategory[] {
  const t = useTranslations("About");
  return [
    { value: "", label: t("contact.categoryDefault") },
    { value: "court", label: t("contact.categoryCourt") },
    { value: "lesson", label: t("contact.categoryLesson") },
    { value: "press", label: t("contact.categoryPress") },
    { value: "other", label: t("contact.categoryOther") },
  ];
}

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

export default function AboutContent() {
  const t = useTranslations("About");
  const categories = useCategories();

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
              {t("hero.title")}
            </h1>
            <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
          </motion.div>
        </div>
      </section>

      {/* 01 -- COMPANY */}
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
                {t("company.name")}
              </h2>
              <p className="text-text-light/90 text-base lg:text-lg leading-relaxed mb-4">
                {t("company.description1")}
              </p>
              <p className="text-text-light/90 text-sm lg:text-base leading-relaxed">
                {t("company.description2")}
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
                    <dt className="text-text-gray">{t("company.labelCompanyName")}</dt>
                    <dd className="text-text-light mt-1">{t("company.name")}</dd>
                  </div>
                  <div>
                    <dt className="text-text-gray">{t("company.labelCeo")}</dt>
                    <dd className="text-text-light mt-1">{t("company.valueCeo")}</dd>
                  </div>
                  <div>
                    <dt className="text-text-gray">{t("company.labelAddress")}</dt>
                    <dd className="text-text-light mt-1">{t("company.valueAddress")}</dd>
                  </div>
                  <div>
                    <dt className="text-text-gray">{t("company.labelBusiness")}</dt>
                    <dd className="text-text-light mt-1">{t("company.valueBusiness")}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 02 -- FOUNDER */}
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
                {t("founder.name")}
              </h2>
              <p className="text-sm tracking-[0.15em] text-text-gray">
                {t("founder.nameEn")}
              </p>
            </div>
          </motion.div>

          {/* Photo left + Text right */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            <motion.div
              className="w-[40%] sm:w-[25%] shrink-0"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                <Image
                  src="/images/founder-nishimura.png"
                  alt={t("founder.imageAlt")}
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
                {t("founder.bio1")}
              </p>
              <p className="text-text-light/90 text-base lg:text-lg leading-loose mb-4">
                {t("founder.bio2")}
              </p>
              <p className="text-text-light/90 text-base lg:text-lg leading-loose mb-4">
                {t("founder.bio3")}
              </p>
              <p className="text-text-light/90 text-base lg:text-lg leading-loose">
                {t("founder.bio4")}
              </p>
            </motion.div>
          </div>

          {/* Achievements — MEDAL SHOWCASE */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h3 className="text-xs tracking-[0.3em] text-text-gray font-bold mb-10">
              PICKLEBALL CAREER
            </h3>

            {/* Table */}
            <div className="overflow-x-auto">
              <div className="hidden sm:grid grid-cols-[70px_1fr_1fr_120px] gap-4 border-b border-accent/30 pb-2 mb-2">
                <span className="text-[10px] tracking-[0.3em] text-text-gray">YEAR</span>
                <span className="text-[10px] tracking-[0.3em] text-text-gray">TOURNAMENT</span>
                <span className="text-[10px] tracking-[0.3em] text-text-gray">EVENT</span>
                <span className="text-[10px] tracking-[0.3em] text-text-gray text-right">RESULT</span>
              </div>
              {(["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"] as const).map((key) => ({
                year: t(`founder.achievements.${key}.year`),
                tournament: t(`founder.achievements.${key}.tournament`),
                event: t(`founder.achievements.${key}.event`),
                result: t(`founder.achievements.${key}.result`),
                type: t(`founder.achievements.${key}.type`),
              })).map((row, i) => (
                <motion.div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-[70px_1fr_1fr_120px] gap-1 sm:gap-4 border-b border-white/[0.05] py-3 hover:bg-white/[0.02] transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                >
                  <span className="text-accent text-sm font-bold">{row.year}</span>
                  <span className="text-text-light text-sm">{row.tournament}</span>
                  <span className="text-text-gray text-sm">{row.event}</span>
                  <span className={`text-sm sm:text-right ${
                    row.type === "gold" || row.type === "silver" ? "text-accent font-bold" :
                    "text-text-gray"
                  }`}>
                    {row.result}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 03 -- OUR PLAYERS */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="03" labelEn="OUR PLAYERS" id="players" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="text-text-light text-2xl lg:text-3xl font-bold mb-6">
              {t("players.title")}
            </h2>
            <p className="text-text-light/90 text-sm lg:text-base leading-relaxed mb-12 max-w-2xl">
              {t("players.description")}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              {[
                { name: t("players.playerName"), ig: "@taro_yamada_pb", bio: t("players.playerBio"), hasContent: true },
                { name: t("players.comingSoon"), ig: "", bio: "", hasContent: false },
              ].map((player, n) => (
                <motion.div
                  key={n}
                  className="bg-gradient-to-b from-accent/[0.04] to-transparent border border-text-gray/10 rounded-sm overflow-hidden"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: n * 0.15, ease: EASE }}
                >
                  <div className="aspect-[4/3] bg-text-gray/5 flex items-center justify-center">
                    <span className="text-text-gray text-sm">Photo</span>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-text-light text-lg lg:text-xl font-semibold mb-1">{player.name}</p>
                    {player.ig && (
                      <p className="text-text-light/90 text-sm lg:text-base mb-3">{player.ig}</p>
                    )}
                    {player.bio && (
                      <p className="text-text-light/90 text-sm lg:text-base leading-relaxed">{player.bio}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 04 -- OUR CREW */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="04" labelEn="OUR CREW" id="crew" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="text-text-light text-2xl lg:text-3xl font-bold mb-6">
              {t("crew.title")}
            </h2>
            <p className="text-text-light/90 text-sm lg:text-base leading-relaxed mb-12 max-w-2xl">
              {t("crew.description")}
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
                  <p className="text-text-light text-sm font-semibold">{t("crew.comingSoon")}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 05 -- NEWS */}
      <section className="py-12 lg:py-16 border-t border-text-gray/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader number="05" labelEn="NEWS" id="news" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="text-text-light text-2xl lg:text-3xl font-bold mb-8">
              {t("news.title")}
            </h2>

            <div className="border-l-2 border-accent/20 pl-6 lg:pl-8">
              <p className="text-text-light/90 text-base lg:text-lg leading-relaxed mb-4 max-w-3xl">
                {t("news.body")}
              </p>
              <a
                href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent text-sm tracking-wide hover:gap-3 transition-all duration-300"
              >
                {t("news.prTimes")} <span className="text-lg">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 06 -- CONTACT */}
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
                {t("contact.getInTouch")}
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-text-gray mb-1">{t("contact.instagram")}</p>
                  <a
                    href="https://www.instagram.com/thepicklebangtheory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-text-light hover:text-accent transition-colors"
                  >
                    @thepicklebangtheory
                  </a>
                </div>
                <div>
                  <p className="text-sm text-text-gray mb-1">{t("contact.address")}</p>
                  <p className="text-lg text-text-light">{t("contact.addressValue")}</p>
                </div>
                <div>
                  <p className="text-sm text-text-gray mb-1">{t("contact.hours")}</p>
                  <p className="text-lg text-text-light">{t("contact.hoursValue")}</p>
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
                  <label htmlFor="about-contact-name" className="sr-only">{t("contact.labelName")}</label>
                  <input id="about-contact-name" name="name" type="text" required placeholder={t("contact.placeholderName")} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="about-contact-email" className="sr-only">{t("contact.labelEmail")}</label>
                  <input id="about-contact-email" name="email" type="email" required placeholder={t("contact.placeholderEmail")} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="about-contact-category" className="sr-only">{t("contact.labelCategory")}</label>
                  <select id="about-contact-category" name="category" required className={`${inputClass} cursor-pointer`} defaultValue="">
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} disabled={cat.value === ""}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="about-contact-message" className="sr-only">{t("contact.labelMessage")}</label>
                  <textarea id="about-contact-message" name="message" required placeholder={t("contact.placeholderMessage")} rows={5} className={`${inputClass} resize-none`} />
                </div>
                <button type="submit" disabled={status === "sending"} className="bg-accent text-deep-black px-8 py-3 text-sm font-semibold tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {t("contact.sendMessage")}
                </button>
                {status === "success" && <p className="text-accent mt-4">{t("contact.successMessage")}</p>}
                {status === "error" && <p className="text-red-400 mt-4">{t("contact.errorMessage")}</p>}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
