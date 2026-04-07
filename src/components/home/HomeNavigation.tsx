"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useActiveSection } from "@/hooks/useActiveSection";

const SECTION_IDS = ["concept", "facility", "services", "pricing", "about", "access"];

const NAV_ITEMS = [
  { label: "CONCEPT", href: "/#concept", id: "concept" },
  { label: "FACILITY", href: "/#facility", id: "facility" },
  { label: "SERVICES", href: "/#services", id: "services" },
  { label: "PRICING", href: "/#pricing", id: "pricing" },
  { label: "ABOUT", href: "/#about", id: "about" },
  { label: "ACCESS", href: "/#access", id: "access" },
];

export default function HomeNavigation() {
  const { language, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const activeSection = useActiveSection(SECTION_IDS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname]
  );
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY < 100) {
        setIsNavVisible(true);
      } else if (currentY > lastScrollY.current) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentY;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileLinkClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const isJa = language === "ja";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="backdrop-blur-md bg-deep-black/80">
        <div className="mx-auto flex items-center justify-between px-6 py-4 max-w-7xl">
          {/* Desktop: Logo */}
          <Link href="/" className="hidden md:block" onClick={handleLogoClick}>
            <Image
              src="/logos/yoko-neon.png"
              alt="THE PICKLE BANG THEORY"
              width={180}
              height={40}
            />
          </Link>

          {/* Mobile: Mark */}
          <Link href="/" className="block md:hidden" onClick={handleLogoClick}>
            <Image
              src="/logos/mark-neon.png"
              alt="THE PICKLE BANG THEORY mark"
              width={40}
              height={40}
            />
          </Link>

          {/* Desktop: Nav links */}
          <nav
            aria-label="メインナビゲーション"
            className="hidden md:flex items-center gap-8"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`text-sm uppercase tracking-widest transition-colors hover:text-text-light ${
                  activeSection === item.id ? "text-accent" : "text-text-gray"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop: Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle
              isJa={isJa}
              onToggle={toggleLanguage}
            />
            <a
              href="#"
              className="bg-accent text-deep-black px-5 py-2 text-xs font-bold uppercase tracking-widest"
            >
              RESERVE
            </a>
          </div>

          {/* Mobile: Right side */}
          <div className="flex md:hidden items-center gap-4">
            <LanguageToggle
              isJa={isJa}
              onToggle={toggleLanguage}
            />
            <button
              aria-label="メニューを開く"
              onClick={handleOpenMenu}
              className="text-text-light"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            role="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-deep-black flex flex-col items-center justify-center"
          >
            <button
              aria-label="メニューを閉じる"
              onClick={handleCloseMenu}
              className="absolute top-6 right-6 text-text-light"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <nav className="flex flex-col items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={handleMobileLinkClick}
                  className={`text-2xl uppercase tracking-widest transition-colors ${
                    activeSection === item.id ? "text-accent" : "text-text-light"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <a
              href="#"
              className="mt-12 bg-accent text-deep-black px-8 py-3 text-sm font-bold uppercase tracking-widest"
            >
              RESERVE
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

interface LanguageToggleProps {
  isJa: boolean;
  onToggle: () => void;
}

function LanguageToggle({ isJa, onToggle }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        onClick={isJa ? undefined : onToggle}
        className={isJa ? "text-text-light" : "text-text-gray"}
      >
        JP
      </button>
      <span className="text-text-gray">/</span>
      <button
        onClick={isJa ? onToggle : undefined}
        className={isJa ? "text-text-gray" : "text-text-light"}
      >
        EN
      </button>
    </div>
  );
}
