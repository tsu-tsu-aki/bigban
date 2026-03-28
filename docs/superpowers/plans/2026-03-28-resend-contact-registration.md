# Resend コンタクト登録 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ティーザーページのメール登録フォームから Resend API にコンタクトを登録する

**Architecture:** Next.js API Route (`POST /api/subscribe`) が Resend SDK を使ってコンタクト登録を行い、EmailSignup クライアントコンポーネントが fetch でこの API を呼び出す。API キーはサーバーサイドに留まる。

**Tech Stack:** Next.js 16 App Router, Resend SDK, TypeScript strict, Vitest + React Testing Library

---

## ファイル構成

| 操作 | ファイル | 責務 |
|------|---------|------|
| 新規 | `src/app/api/subscribe/route.ts` | メール受付 → Resend コンタクト登録 |
| 新規 | `src/app/api/subscribe/route.test.ts` | Route Handler のユニットテスト |
| 改修 | `src/components/teaser/EmailSignup.tsx` | API 呼び出し・状態管理追加 |
| 改修 | `src/components/teaser/EmailSignup.test.tsx` | fetch モック・非同期テスト追加 |

---

### Task 1: resend パッケージをインストール

**Files:**
- Modify: `package.json`

- [ ] **Step 1: パッケージインストール**

```bash
npm install resend
```

- [ ] **Step 2: インストール確認**

```bash
node -e "const { Resend } = require('resend'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: コミット**

```bash
git add package.json package-lock.json
git commit -m "chore: add resend SDK dependency"
```

---

### Task 2: API Route のテストを書く（Red）

**Files:**
- Create: `src/app/api/subscribe/route.test.ts`

- [ ] **Step 1: テストファイルを作成**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: { create: mockCreate },
  })),
}));

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
  });

  it("有効なメールで 201 を返す", async () => {
    mockCreate.mockResolvedValue({
      data: { id: "contact_123" },
      error: null,
    });

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true });
    expect(mockCreate).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  it("空文字のメールで 400 を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("不正な形式のメールで 400 を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("Resend API エラー時に 500 を返す", async () => {
    mockCreate.mockResolvedValue({
      data: null,
      error: { message: "API error", name: "api_error" },
    });

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("email フィールドが無いリクエストで 400 を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/app/api/subscribe/route.test.ts
```

Expected: FAIL — `route.ts` が存在しないためインポートエラー

---

### Task 3: API Route を実装する（Green）

**Files:**
- Create: `src/app/api/subscribe/route.ts`

- [ ] **Step 1: Route Handler を実装**

```typescript
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json() as { email?: string };
  const email = body.email?.trim() ?? "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, error: "有効なメールアドレスを入力してください" },
      { status: 400 },
    );
  }

  const { error } = await resend.contacts.create({ email });

  if (error) {
    return NextResponse.json(
      { success: false, error: "登録に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 2: テストが全て通ることを確認**

```bash
npx vitest run src/app/api/subscribe/route.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 3: コミット**

```bash
git add src/app/api/subscribe/route.ts src/app/api/subscribe/route.test.ts
git commit -m "feat: add POST /api/subscribe route with Resend contact registration"
```

---

### Task 4: EmailSignup コンポーネントのテストを書く（Red）

**Files:**
- Modify: `src/components/teaser/EmailSignup.test.tsx`

- [ ] **Step 1: テストを書き換え**

既存テストを改修し、fetch モック + 非同期テストを追加する。

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailSignup } from "./EmailSignup";

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

describe("EmailSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("メール入力フィールドと送信ボタンが表示される", () => {
    render(<EmailSignup />);

    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登録ｽﾙ/ })).toBeInTheDocument();
  });

  it("送信成功後に確認メッセージが表示される", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /登録ｽﾙ/ }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
  });

  it("送信中はボタンと入力が無効化される", async () => {
    let resolvePromise!: (value: unknown) => void;
    fetchMock.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));

    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /登録ｽﾙ/ }));

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByPlaceholderText("your@email.com")).toBeDisabled();

    resolvePromise({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("送信失敗時にエラーメッセージが表示される", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, error: "失敗" }),
    });

    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /登録ｽﾙ/ }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登録ｽﾙ/ })).toBeEnabled();
  });

  it("空メールでは送信されない", async () => {
    const user = userEvent.setup();
    render(<EmailSignup />);

    const button = screen.getByRole("button", { name: /登録ｽﾙ/ });
    await user.click(button);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("空メールでフォーム送信時に handleSubmit が呼ばれても送信されない", () => {
    render(<EmailSignup />);

    const form = screen.getByRole("button", { name: /登録ｽﾙ/ }).closest("form");
    fireEvent.submit(form!);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/components/teaser/EmailSignup.test.tsx
```

Expected: FAIL — EmailSignup はまだ fetch を呼んでおらず、disabled 属性もない

---

### Task 5: EmailSignup コンポーネントを実装する（Green）

**Files:**
- Modify: `src/components/teaser/EmailSignup.tsx`

- [ ] **Step 1: コンポーネントを改修**

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const isSubmitting = status === "submitting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setStatus("submitting");

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
      }
    } catch {
      setStatus("error");
    }
  };

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
            className="flex flex-col gap-0"
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
                disabled={isSubmitting}
                className="flex-1 bg-transparent border border-[#E6E6E6]/20 border-r-0 px-5 py-4 text-[13px] text-[#E6E6E6] tracking-wide placeholder:text-[#8A8A8A]/50 focus:outline-none focus:border-[#E6E6E6]/40 transition-colors font-[var(--font-inter)] rounded-l-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#F6FF54] text-[#0A0A0A] px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#F6FF54]/90 transition-colors shrink-0 font-[var(--font-inter)] rounded-r-sm disabled:opacity-50"
              >
                {isSubmitting ? "..." : "登録ｽﾙ"}
              </button>
            </div>
            {status === "error" && (
              <p role="alert" className="mt-3 text-red-400 text-[12px] tracking-wide font-[var(--font-inter)]">
                登録に失敗しました。もう一度お試しください。
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
            <p className="text-[#F6FF54] text-[13px] tracking-[0.15em] font-[var(--font-inter)]">
              REGISTERED — WE&apos;LL BE IN TOUCH.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: テストが全て通ることを確認**

```bash
npx vitest run src/components/teaser/EmailSignup.test.tsx
```

Expected: 6 tests PASS

- [ ] **Step 3: コミット**

```bash
git add src/components/teaser/EmailSignup.tsx src/components/teaser/EmailSignup.test.tsx
git commit -m "feat: integrate EmailSignup with POST /api/subscribe"
```

---

### Task 6: 全テスト + カバレッジ確認

**Files:** なし（検証のみ）

- [ ] **Step 1: 全テスト実行**

```bash
npx vitest run
```

Expected: All tests PASS

- [ ] **Step 2: カバレッジ確認**

```bash
npx vitest run --coverage
```

Expected: 100% coverage (statements, branches, functions, lines)

- [ ] **Step 3: ビルド確認**

```bash
npm run build
```

Expected: ビルド成功、エラーなし

- [ ] **Step 4: コミット（必要な修正があった場合のみ）**

```bash
git add -A
git commit -m "fix: address coverage or build issues"
```
