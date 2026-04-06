"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface KeyNumber {
  value: string;
  labelEn: string;
  labelJa: string;
}

interface PrimarySpec {
  labelEn: string;
  labelJa: string;
  description: string;
}

interface FacilityFeature {
  label: string;
  note?: string;
}

const KEY_NUMBERS: KeyNumber[] = [
  { value: "3", labelEn: "COURTS", labelJa: "プロ仕様コート" },
  { value: "6:00–23:00", labelEn: "HOURS", labelJa: "営業時間" },
  { value: "1 min", labelEn: "FROM STATION", labelJa: "駅徒歩1分" },
];

const PRIMARY_SPECS: PrimarySpec[] = [
  {
    labelEn: "SURFACE",
    labelJa: "ハードコート DecoTurf（デコターフ）",
    description: "世界最大級の大会やオリンピックでも採用されてきた高性能サーフェス",
  },
  {
    labelEn: "TYPE",
    labelJa: "全天候型インドア",
    description: "空調完備で年間を通じて快適なプレー環境",
  },
];

const FACILITY_FEATURES: FacilityFeature[] = [
  { label: "トレーニングエリア", note: "準備中" },
  { label: "ラウンジスペース", note: "準備中" },
  { label: "男女別更衣室" },
  { label: "空調完備" },
  { label: "自動販売機" },
  { label: "レンタル用具あり" },
  { label: "無人チェックイン対応予定" },
  { label: "ショーコート1面に変更可能" },
];

interface FacilityImage {
  src: string;
  alt: string;
}

const FACILITY_IMAGES: FacilityImage[] = [
  {
    src: "/images/sarasota-guide-uHdY8VYTfbI-unsplash.jpg",
    alt: "プロ仕様ピクルボールコートの俯瞰",
  },
  {
    src: "/images/facility-interior-01.png",
    alt: "トレーニングエリア",
  },
  {
    src: "/images/facility-interior-02.png",
    alt: "ラウンジスペース",
  },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomeFacility() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section id="facility" className="bg-deep-black py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black tracking-[0.15em] text-text-light">
            FACILITY
          </h2>
          <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
        </motion.div>

        {/* Key Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 mb-12 lg:mb-16">
          {KEY_NUMBERS.map((item, i) => (
            <motion.div
              key={item.labelEn}
              className={`flex flex-col items-center text-center py-6 sm:py-8${
                i < KEY_NUMBERS.length - 1
                  ? " sm:border-r sm:border-accent/20"
                  : ""
              }${i > 0 ? " border-t sm:border-t-0 border-text-gray/10" : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{
                duration: 1.1,
                delay: i * 0.15,
                ease: EASE,
              }}
            >
              <span
                className="font-serif text-text-light font-bold leading-none"
                style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
              >
                {item.value}
              </span>
              <span className="text-xs tracking-[0.25em] text-accent mt-4">
                {item.labelEn}
              </span>
              <span className="text-sm text-text-gray mt-1">
                {item.labelJa}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Facility Image Carousel */}
        <motion.div
          className="relative mb-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <div className="overflow-hidden rounded-sm" ref={emblaRef}>
            <div className="flex">
              {FACILITY_IMAGES.map((image) => (
                <div
                  key={image.src}
                  className="relative aspect-[16/9] min-w-0 flex-[0_0_100%]"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Arrow Buttons */}
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="前の画像"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-text-light hover:bg-black/60 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="次の画像"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-text-light hover:bg-black/60 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-3 mt-6">
            {FACILITY_IMAGES.map((image, i) => (
              <button
                key={image.src}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`画像${i + 1}を表示: ${image.alt}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? "bg-accent scale-125"
                    : "bg-text-gray/30 hover:bg-text-gray/60"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Primary Specs - Glow Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {PRIMARY_SPECS.map((spec, i) => (
            <motion.div
              key={spec.labelEn}
              className="relative bg-gradient-to-b from-accent/[0.07] to-transparent px-8 py-10"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{
                duration: 1.1,
                delay: i * 0.15,
                ease: EASE,
              }}
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
              <span className="text-[10px] tracking-[0.25em] text-accent block mb-3">
                {spec.labelEn}
              </span>
              <span className="text-text-light text-lg lg:text-xl font-bold tracking-wide block mb-2">
                {spec.labelJa}
              </span>
              <span className="text-text-gray text-xs lg:text-sm">
                {spec.description}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Secondary Features - Left Bar Lines */}
        <motion.div
          className="columns-1 sm:columns-2 gap-x-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.0, delay: 0.2, ease: EASE }}
        >
          {FACILITY_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.label}
              className="break-inside-avoid border-l-2 border-accent/15 pl-4 py-3 mb-1 transition-colors duration-300 hover:border-accent/50"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{
                duration: 1.0,
                delay: 0.1 + i * 0.06,
                ease: EASE,
              }}
            >
              <span className="text-text-light text-sm lg:text-base">
                {feature.label}
              </span>
              {feature.note && (
                <span className="text-accent/60 text-xs ml-2 tracking-wider">
                  {feature.note}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* DecoTurf Description */}
        <motion.div
          className="mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <p className="text-text-light text-xl lg:text-2xl leading-relaxed font-semibold tracking-wide mb-6">
            DecoTurf（デコターフ）は、世界最大級のピックルボール大会やテニスのグランドスラム、オリンピックでも採用されてきたハードコートサーフェス。安定したバウンドと高い耐久性により、世界基準のプレー環境を提供します。
          </p>
          <div className="w-10 h-[2px] bg-accent mb-6" />
          <p className="text-text-gray text-sm lg:text-base leading-loose">
            THE PICKLE BANG THEORYでは、プレイヤーが「本気で上達できる環境」を追求し、このDecoTurf（デコターフ）を採用。技術向上・競技力向上にフォーカスした本格的なプレー環境を提供します。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
