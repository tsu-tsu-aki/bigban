"use client";

import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from "react";

const SESSION_KEY = "bigban-crowdfunding-dismissed";

/* istanbul ignore next -- SSR-only snapshot */
const noop = () => () => {};

export function useCrowdfundingPopup() {
  const isMounted = useSyncExternalStore(
    noop,
    () => true,
    /* istanbul ignore next -- SSR-only snapshot */
    () => false
  );

  const [isNotDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "true";
    } catch {
      return true;
    }
  });

  const [isTriggered, setIsTriggered] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasTriggered = useRef(false);

  // about usセクション通過時にポップアップを表示
  useEffect(() => {
    if (!isMounted || !isNotDismissed || hasTriggered.current) return;

    const aboutSection = document.getElementById("about");
    if (!aboutSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // about usセクションが画面外に出た（通過した）タイミングで表示
        if (!entry.isIntersecting && hasTriggered.current === false) {
          const rect = aboutSection.getBoundingClientRect();
          if (rect.bottom < 0) {
            hasTriggered.current = true;
            setIsTriggered(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(aboutSection);
    return () => observer.disconnect();
  }, [isMounted, isNotDismissed]);

  const isOpen = isMounted && ((isTriggered && !isDismissed) || isManualOpen);

  const closePopup = useCallback(() => {
    setIsManualOpen(false);
    setIsDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const openPopup = useCallback(() => {
    setIsManualOpen(true);
  }, []);

  return { isOpen, openPopup, closePopup };
}
