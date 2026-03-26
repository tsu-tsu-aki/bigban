"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "FACILITY", href: "/facility" },
  { label: "SERVICES", href: "/services" },
  { label: "PRICING", href: "#pricing" },
  { label: "ACCESS", href: "#access" },
  { label: "CONTACT", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-deep-black/95 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 py-5">
          {/* Logo */}
          <a
            href="#"
            className="font-[var(--font-inter)] text-[11px] tracking-[0.35em] text-off-white font-medium uppercase"
          >
            THE PICKLE BANG THEORY
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative text-[11px] tracking-[0.2em] text-off-white/70 hover:text-off-white transition-colors duration-300 uppercase"
              >
                {link.label}
                <span className="absolute bottom-[-4px] left-0 h-[1px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Reserve Button + Hamburger */}
          <div className="flex items-center gap-6">
            <a
              href="#reserve"
              className="hidden lg:block text-[10px] tracking-[0.2em] uppercase bg-accent text-deep-black px-5 py-2.5 font-semibold hover:bg-accent/90 transition-colors duration-300"
              style={{ borderRadius: "2px" }}
            >
              RESERVE
            </a>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex flex-col gap-1.5 w-7"
              aria-label="Menu"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block h-[1.5px] w-full bg-off-white origin-center"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-[1.5px] w-full bg-off-white"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block h-[1.5px] w-full bg-off-white origin-center"
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-deep-black flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                onClick={() => setMobileOpen(false)}
                className="text-3xl tracking-[0.15em] text-off-white font-[var(--font-dm-serif)]"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#reserve"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onClick={() => setMobileOpen(false)}
              className="mt-4 text-[12px] tracking-[0.2em] uppercase bg-accent text-deep-black px-8 py-3 font-semibold"
            >
              RESERVE A COURT
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
