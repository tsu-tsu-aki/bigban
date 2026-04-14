"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

interface Player {
  name: string;
  ig: string;
  bio: string;
  hasContent: boolean;
}

export default function PlayerCarousel() {
  const t = useTranslations("About");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const players = useMemo<Player[]>(
    () => [
      {
        name: t("players.playerName"),
        ig: t("players.playerIg"),
        bio: t("players.playerBio"),
        hasContent: true,
      },
      {
        name: t("players.comingSoon"),
        ig: "",
        bio: "",
        hasContent: false,
      },
    ],
    [t]
  );

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

  const handleScrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const handleScrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const handleScrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <motion.div
      className="relative"
      aria-roledescription="carousel"
      aria-label={t("players.carousel.regionLabel")}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="overflow-hidden select-none" ref={emblaRef}>
        <div className="flex">
          {players.map((player, i) => (
            <div
              key={i}
              className="min-w-0 flex-[0_0_100%] px-2"
            >
              <div className="bg-gradient-to-b from-accent/[0.04] to-transparent border border-text-gray/10 rounded-sm overflow-hidden">
                <div className="aspect-[4/3] bg-text-gray/5 flex items-center justify-center">
                  <span className="text-text-gray text-sm">Photo</span>
                </div>
                <div className="p-6 text-center">
                  <p className="text-text-light text-lg lg:text-xl font-semibold mb-1">
                    {player.name}
                  </p>
                  {player.ig && (
                    <p className="text-text-light/90 text-sm lg:text-base mb-3">
                      {player.ig}
                    </p>
                  )}
                  {player.bio && (
                    <p className="text-text-light/90 text-sm lg:text-base leading-relaxed">
                      {player.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleScrollPrev}
        aria-label={t("players.carousel.prev")}
        className="absolute left-3 top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-text-light hover:bg-black/60 transition-colors"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleScrollNext}
        aria-label={t("players.carousel.next")}
        className="absolute right-3 top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-text-light hover:bg-black/60 transition-colors"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="flex justify-center gap-3 mt-6">
        {players.map((player, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleScrollTo(i)}
            aria-label={t("players.carousel.showPlayer", { index: i + 1, name: player.name })}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? "bg-accent scale-125"
                : "bg-text-gray/30 hover:bg-text-gray/60"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
