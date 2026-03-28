"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "loading" | "success" | "error";

function getErrorMessage(status: number): string {
  if (status === 400) return "メールアドレスを確認してください";
  if (status === 429) return "しばらくしてからお試しください";
  return "エラーが発生しました。もう一度お試しください";
}

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(getErrorMessage(response.status));
      }
    } catch {
      setStatus("error");
      setErrorMessage("エラーが発生しました。もう一度お試しください");
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-0">
              <label htmlFor="email-signup" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email-signup"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
                className="flex-1 bg-transparent border border-[#E6E6E6]/20 border-r-0 px-5 py-4 text-[13px] text-[#E6E6E6] tracking-wide placeholder:text-[#8A8A8A]/50 focus:outline-none focus:border-[#E6E6E6]/40 transition-colors font-[var(--font-inter)] rounded-l-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#F6FF54] text-[#0A0A0A] px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#F6FF54]/90 transition-colors shrink-0 font-[var(--font-inter)] rounded-r-sm disabled:opacity-50"
              >
                {isLoading ? "送信中..." : "NOTIFY ME"}
              </button>
            </div>
            {errorMessage && (
              <p
                role="alert"
                aria-live="polite"
                className="text-red-400 text-[12px] tracking-wide font-[var(--font-inter)]"
              >
                {errorMessage}
              </p>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p
              role="status"
              aria-live="polite"
              className="text-[#F6FF54] text-[13px] tracking-[0.15em] font-[var(--font-inter)]"
            >
              REGISTERED — WE&apos;LL BE IN TOUCH.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
