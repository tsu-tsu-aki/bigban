"use client";

import { useTranslations } from "next-intl";

interface CrowdfundingBadgeProps {
  onClick: () => void;
}

export default function CrowdfundingBadge({ onClick }: CrowdfundingBadgeProps) {
  const t = useTranslations("CrowdfundingPopup");

  return (
    <button
      onClick={onClick}
      aria-label={t("openPopup")}
      className="relative bg-accent/10 border border-accent text-accent text-xs font-bold uppercase tracking-widest px-3 py-1 hover:bg-accent hover:text-deep-black motion-safe:transition-colors cursor-pointer"
    >
      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-ping" />
      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent" />
      {t("badgeLabel")}
    </button>
  );
}
