"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";
import { useTranslations } from "next-intl";
import { CAMPFIRE_URL, EXTERNAL_LINK_PROPS } from "@/constants/site";

const SESSION_KEY = "bigban-crowdfunding-sticky-dismissed";

/* istanbul ignore next -- SSR-only snapshot */
const noop = () => () => {};

/**
 * 右下に常時表示するクラファン訴求のミニカード (仮実装)。
 * - sessionStorage で「閉じた」状態を保持 (同セッション中は再表示しない)
 * - SSR ではレンダリングしない (useSyncExternalStore で hydration 安全に判定)
 * - モーダル CrowdfundingPopup (z-70) より下の z-40 で配置
 */
export default function CrowdfundingSticky() {
  const t = useTranslations("CrowdfundingPopup");

  const isMounted = useSyncExternalStore(
    noop,
    () => true,
    /* istanbul ignore next -- SSR-only snapshot */
    () => false,
  );

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });

  const handleClose = useCallback(() => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  if (!isMounted || isDismissed) return null;

  return (
    <aside
      role="complementary"
      aria-label={t("headline")}
      data-testid="crowdfunding-sticky"
      className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-deep-black border border-accent/40 shadow-2xl"
    >
      <button
        aria-label={t("close")}
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 text-text-gray hover:text-text-light bg-black/60 rounded-full w-7 h-7 flex items-center justify-center motion-safe:transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="p-4 pr-8 space-y-2">
        <p className="font-serif text-base font-black text-accent tracking-wider">
          {t("headline")}
        </p>
        <p className="text-xs text-accent/90 font-bold leading-snug">
          {t("bonus")}
        </p>
        <a
          href={CAMPFIRE_URL}
          {...EXTERNAL_LINK_PROPS}
          aria-label={t("ctaAriaLabel")}
          className="block bg-accent text-deep-black font-bold uppercase tracking-widest text-xs px-3 py-2 text-center hover:bg-accent/90 motion-safe:transition-colors"
        >
          {t("cta")}
        </a>
      </div>
    </aside>
  );
}
