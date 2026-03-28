# Resend Contacts Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ティザーページの EmailSignup フォームから送信されたメールアドレスを Resend Contacts API に登録する。

**Architecture:** Next.js Route Handler (`POST /api/subscribe`) がクライアントからのリクエストを受け、バリデーション後に Resend SDK (`resend.contacts.create`) を呼び出す。EmailSignup コンポーネントは idle/loading/success/error の4状態で UI を制御する。

**Tech Stack:** Next.js 16 (App Router), Resend SDK (`resend`), Vitest + React Testing Library, TypeScript strict mode

**Spec:** `docs/superpowers/specs/2026-03-28-resend-contacts-integration-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/resend.ts` | Resend client factory function |
| Create | `src/lib/resend.test.ts` | Client factory tests |
| Create | `src/app/api/subscribe/route.ts` | POST handler: validation → Resend API call |
| Create | `src/app/api/subscribe/route.test.ts` | Route Handler tests |
| Modify | `src/components/teaser/EmailSignup.tsx` | Add fetch + status state machine |
| Modify | `src/components/teaser/EmailSignup.test.tsx` | Replace existing tests with API-integrated tests |
| Modify | `.env` | Add `RESEND_API_KEY=` template |

---

### Task 1: Install `resend` dependency and update `.env`

**Files:**
- Modify: `package.json`
- Modify: `.env`

- [ ] **Step 1: Install the resend package**

Run:
```bash
npm install resend
```

Expected: `resend` added to `dependencies` in `package.json`

- [ ] **Step 2: Add RESEND_API_KEY template to .env**

Edit `.env` to:

```
NEXT_PUBLIC_MAINTENANCE=false
RESEND_API_KEY=
```

- [ ] **Step 3: Run existing tests to confirm nothing broke**

Run:
```bash
npx vitest run
```

Expected: All existing tests PASS

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env
git commit -m "chore: resend パッケージを追加し .env テンプレートを更新"
```

---

### Task 2: Resend client factory (`src/lib/resend.ts`)

**Files:**
- Create: `src/lib/resend.ts`
- Create: `src/lib/resend.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/resend.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("resend", () => ({
  Resend: vi.fn(),
}));

import { Resend } from "resend";
import { createResendClient } from "./resend";

describe("createResendClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(Resend).mockClear();
  });

  it("RESEND_API_KEY が設定されている場合 Resend インスタンスを返す", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_123");

    const client = createResendClient();

    expect(Resend).toHaveBeenCalledWith("re_test_123");
    expect(client).toBeInstanceOf(Resend);
  });

  it("RESEND_API_KEY が未設定の場合エラーを投げる", () => {
    vi.stubEnv("RESEND_API_KEY", "");

    expect(() => createResendClient()).toThrow(
      "RESEND_API_KEY environment variable is not set"
    );
  });

  it("RESEND_API_KEY が undefined の場合エラーを投げる", () => {
    delete process.env.RESEND_API_KEY;

    expect(() => createResendClient()).toThrow(
      "RESEND_API_KEY environment variable is not set"
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/lib/resend.test.ts
```

Expected: FAIL — `Cannot find module './resend'`

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/resend.ts`:

```typescript
import { Resend } from "resend";

export function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run src/lib/resend.test.ts
```

Expected: All 3 tests PASS

- [ ] **Step 5: Run full test suite with coverage**

Run:
```bash
npx vitest run --coverage
```

Expected: All tests PASS, 100% coverage maintained

- [ ] **Step 6: Commit**

```bash
git add src/lib/resend.ts src/lib/resend.test.ts
git commit -m "feat: Resend クライアントファクトリ関数を追加"
```

---

### Task 3: Route Handler (`POST /api/subscribe`)

**Files:**
- Create: `src/app/api/subscribe/route.ts`
- Create: `src/app/api/subscribe/route.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/subscribe/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockContactsCreate = vi.fn();

vi.mock("@/lib/resend", () => ({
  createResendClient: vi.fn(() => ({
    contacts: {
      create: mockContactsCreate,
    },
  })),
}));

import { POST } from "./route";

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createBadJsonRequest(): Request {
  return new Request("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not json",
  });
}

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    mockContactsCreate.mockReset();
  });

  it("有効なメールアドレスで 200 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: { id: "contact_123" },
      error: null,
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: "contact_123" });
    expect(mockContactsCreate).toHaveBeenCalledWith({
      email: "test@example.com",
      unsubscribed: false,
    });
  });

  it("不正な JSON で 400 を返す", async () => {
    const response = await POST(createBadJsonRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid request body" });
  });

  it("email が未指定で 400 を返す", async () => {
    const response = await POST(createRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("email が空文字で 400 を返す", async () => {
    const response = await POST(createRequest({ email: "" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("不正なメール形式で 400 を返す", async () => {
    const response = await POST(createRequest({ email: "not-an-email" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("Resend rate_limit_exceeded で 429 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { name: "rate_limit_exceeded", statusCode: 429, message: "Rate limit exceeded" },
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual({ error: "Too many requests" });
  });

  it("Resend validation_error で 400 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { name: "validation_error", statusCode: 422, message: "Invalid" },
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid email address" });
  });

  it("Resend その他エラーで 500 を返す", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { name: "internal_server_error", statusCode: 500, message: "Server error" },
    });

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
  });

  it("予期しない例外で 500 を返す", async () => {
    mockContactsCreate.mockRejectedValue(new Error("Network failure"));

    const response = await POST(createRequest({ email: "test@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/app/api/subscribe/route.test.ts
```

Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: Write minimal implementation**

Create `src/app/api/subscribe/route.ts`:

```typescript
import { createResendClient } from "@/lib/resend";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof (body as Record<string, unknown>).email === "string"
      ? (body as Record<string, unknown>).email as string
      : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    const resend = createResendClient();
    const { data, error } = await resend.contacts.create({
      email,
      unsubscribed: false,
    });

    if (error) {
      if (error.name === "rate_limit_exceeded") {
        return Response.json({ error: "Too many requests" }, { status: 429 });
      }
      if (error.name === "validation_error") {
        return Response.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return Response.json({ id: data?.id }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run src/app/api/subscribe/route.test.ts
```

Expected: All 9 tests PASS

- [ ] **Step 5: Run full test suite with coverage**

Run:
```bash
npx vitest run --coverage
```

Expected: All tests PASS, 100% coverage maintained

- [ ] **Step 6: Commit**

```bash
git add src/app/api/subscribe/route.ts src/app/api/subscribe/route.test.ts
git commit -m "feat: POST /api/subscribe Route Handler を追加"
```

---

### Task 4: EmailSignup コンポーネント改修

**Files:**
- Modify: `src/components/teaser/EmailSignup.tsx`
- Modify: `src/components/teaser/EmailSignup.test.tsx`

- [ ] **Step 1: Write the new tests (replacing existing)**

Replace the entire contents of `src/components/teaser/EmailSignup.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailSignup } from "./EmailSignup";

describe("EmailSignup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("メール入力フィールドと送信ボタンが表示される", () => {
    render(<EmailSignup />);

    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /notify me/i })
    ).toBeInTheDocument();
  });

  it("空メールでは送信されない", async () => {
    const user = userEvent.setup();
    render(<EmailSignup />);

    const button = screen.getByRole("button", { name: /notify me/i });
    await user.click(button);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("空メールでフォーム送信時に submitted にならない", () => {
    render(<EmailSignup />);

    const form = screen
      .getByRole("button", { name: /notify me/i })
      .closest("form");
    fireEvent.submit(form!);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("送信成功で確認メッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "contact_123" }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
  });

  it("送信中はボタンが無効化されローディングテキストが表示される", async () => {
    let resolveFetch: (value: Response) => void;
    vi.spyOn(global, "fetch").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
    expect(screen.getByText(/送信中/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeDisabled();

    resolveFetch!(new Response(JSON.stringify({ id: "contact_123" }), { status: 200 }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeInTheDocument();
    });
  });

  it("API 400 エラーでエラーメッセージが表示されフォームが維持される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText("メールアドレスを確認してください")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /notify me/i })).toBeEnabled();
  });

  it("API 429 エラーでレート制限メッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Too many" }), { status: 429 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText("しばらくしてからお試しください")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("API 500 エラーで汎用エラーメッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました。もう一度お試しください")
      ).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("ネットワークエラーで汎用エラーメッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network failure"));
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました。もう一度お試しください")
      ).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("エラー後にリトライできる", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "contact_123" }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました。もう一度お試しください")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/components/teaser/EmailSignup.test.tsx
```

Expected: FAIL — tests expecting fetch calls and loading state will fail because the component doesn't call fetch yet.

- [ ] **Step 3: Write the updated implementation**

Replace the entire contents of `src/components/teaser/EmailSignup.tsx`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run src/components/teaser/EmailSignup.test.tsx
```

Expected: All 11 tests PASS

- [ ] **Step 5: Run full test suite with coverage**

Run:
```bash
npx vitest run --coverage
```

Expected: All tests PASS, 100% coverage maintained

- [ ] **Step 6: Commit**

```bash
git add src/components/teaser/EmailSignup.tsx src/components/teaser/EmailSignup.test.tsx
git commit -m "feat: EmailSignup に Resend API 連携と状態管理を追加"
```

---

### Task 5: Full integration verification

**Files:** None (verification only)

- [ ] **Step 1: Run the full test suite with coverage**

Run:
```bash
npx vitest run --coverage
```

Expected: All tests PASS, 100% coverage on statements/branches/functions/lines

- [ ] **Step 2: Run the linter**

Run:
```bash
npm run lint
```

Expected: No lint errors

- [ ] **Step 3: Run the build**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors. Note: The build will warn about `RESEND_API_KEY` not being set, which is expected in CI without secrets configured.

- [ ] **Step 4: Verify all commits**

Run:
```bash
git log --oneline -5
```

Expected output (most recent first):
```
<hash> feat: EmailSignup に Resend API 連携と状態管理を追加
<hash> feat: POST /api/subscribe Route Handler を追加
<hash> feat: Resend クライアントファクトリ関数を追加
<hash> chore: resend パッケージを追加し .env テンプレートを更新
<hash> docs: Resend Contacts Integration 設計スペックを追加
```
