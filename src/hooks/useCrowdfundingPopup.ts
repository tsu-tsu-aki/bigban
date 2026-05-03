"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";

const SESSION_KEY = "bigban-crowdfunding-dismissed";
const TRIGGER_DELAY_MS = 1500;

/* istanbul ignore next -- SSR-only snapshot */
const noop = () => () => {};

export function useCrowdfundingPopup() {
  const isMounted = useSyncExternalStore(
    noop,
    () => true,
    /* istanbul ignore next -- SSR-only snapshot */
    () => false,
  );

  const [isNotDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "true";
    } catch {
      return true;
    }
  });

  const [isTriggered, setIsTriggered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // 訪問から TRIGGER_DELAY_MS 経過でポップアップを表示する。
  // sessionStorage で「閉じた」フラグが立っていればタイマーは仕掛けない。
  useEffect(() => {
    if (!isMounted || !isNotDismissed) return;

    const timeoutId = window.setTimeout(() => {
      setIsTriggered(true);
    }, TRIGGER_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isMounted, isNotDismissed]);

  const isOpen = isMounted && isTriggered && !isDismissed;

  const closePopup = useCallback(() => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  return { isOpen, closePopup };
}
