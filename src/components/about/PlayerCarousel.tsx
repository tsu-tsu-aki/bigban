"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import PlayerCard, { type Player } from "./PlayerCard";

interface PlayerCarouselProps {
  players: Player[];
}

export default function PlayerCarousel({ players }: PlayerCarouselProps) {
  const t = useTranslations("About");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

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
    <div
      className="relative"
      aria-roledescription="carousel"
      aria-label={t("players.carousel.regionLabel")}
    >
      <div className="overflow-hidden select-none" ref={emblaRef}>
        <div className="flex">
          {players.map((player, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${players.length}`}
              className="min-w-0 flex-[0_0_100%] px-2"
            >
              <PlayerCard player={player} />
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
    </div>
  );
}
