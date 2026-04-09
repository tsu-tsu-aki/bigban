"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const FACILITY_IMAGES = [
  { src: "/images/sarasota-guide-uHdY8VYTfbI-unsplash.jpg", altKey: "court" as const },
  { src: "/images/facility-interior-01.png", altKey: "training" as const },
  { src: "/images/facility-interior-02.png", altKey: "lounge" as const },
];

const FEATURE_KEYS = [
  { key: "trainingArea" as const, hasNote: true },
  { key: "lounge" as const, hasNote: true },
  { key: "changingRooms" as const, hasNote: false },
  { key: "airConditioning" as const, hasNote: false },
  { key: "vendingMachine" as const, hasNote: false },
  { key: "rentalEquipment" as const, hasNote: false },
  { key: "unmannedCheckin" as const, hasNote: false },
  { key: "showCourt" as const, hasNote: false },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomeFacility() {
  const t = useTranslations("HomeFacility");
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

  const keyNumbers = [
    { value: t("keyNumbers.courts.value"), labelEn: t("keyNumbers.courts.labelEn"), labelJa: t("keyNumbers.courts.labelJa") },
    { value: t("keyNumbers.hours.value"), labelEn: t("keyNumbers.hours.labelEn"), labelJa: t("keyNumbers.hours.labelJa") },
    { value: t("keyNumbers.station.value"), labelEn: t("keyNumbers.station.labelEn"), labelJa: t("keyNumbers.station.labelJa") },
  ];

  const primarySpecs = [
    { labelEn: t("specs.surface.labelEn"), labelJa: t("specs.surface.labelJa"), description: t("specs.surface.description") },
    { labelEn: t("specs.type.labelEn"), labelJa: t("specs.type.labelJa"), description: t("specs.type.description") },
  ];

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
            {t("title")}
          </h2>
          <div className="mx-auto mt-4 w-14 h-[3px] bg-accent" />
        </motion.div>

        {/* Key Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 mb-12 lg:mb-16">
          {keyNumbers.map((item, i) => (
            <motion.div
              key={item.labelEn}
              className={`flex flex-col items-center text-center py-6 sm:py-8${
                i < keyNumbers.length - 1
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
          <div className="overflow-hidden rounded-sm select-none" ref={emblaRef}>
            <div className="flex">
              {FACILITY_IMAGES.map((image) => (
                <div
                  key={image.src}
                  className="relative aspect-[16/9] min-w-0 flex-[0_0_100%]"
                >
                  <Image
                    src={image.src}
                    alt={t(`images.${image.altKey}`)}
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
            aria-label={t("carousel.prev")}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-text-light hover:bg-black/60 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label={t("carousel.next")}
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
                aria-label={t("carousel.showImage", { index: i + 1, alt: t(`images.${image.altKey}`) })}
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
          {primarySpecs.map((spec, i) => (
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
          className="columns-2 gap-x-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.0, delay: 0.2, ease: EASE }}
        >
          {FEATURE_KEYS.map((feature, i) => (
            <motion.div
              key={feature.key}
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
                {t(`features.${feature.key}`)}
              </span>
              {feature.hasNote && (
                <span className="text-accent/60 text-xs ml-2 tracking-wider">
                  {t("features.preparing")}
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
          <p className="text-text-light text-base sm:text-xl lg:text-2xl leading-relaxed font-semibold tracking-wide mb-6">
            {t("decoturf.title")}
          </p>
          <div className="w-10 h-[2px] bg-accent mb-6" />
          <p className="text-text-gray text-sm lg:text-base leading-loose">
            {t("decoturf.description")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
