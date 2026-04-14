"use client";

import { useTranslations } from "next-intl";

export interface Player {
  name: string;
  ig: string;
  bio: string;
  hasContent: boolean;
}

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const t = useTranslations("About");

  return (
    <div className="bg-gradient-to-b from-accent/[0.04] to-transparent border border-text-gray/10 rounded-sm overflow-hidden h-full">
      <div className="aspect-[4/3] bg-text-gray/5 flex items-center justify-center">
        <span className="text-text-gray text-sm">{t("photoPlaceholder")}</span>
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
  );
}
