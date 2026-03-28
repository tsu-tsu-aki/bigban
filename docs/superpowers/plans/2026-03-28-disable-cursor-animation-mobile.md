# Disable Custom Cursor Animation on Touch Devices — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** タッチデバイスでカスタムカーソル（マウス追従の丸）を非表示にする

**Architecture:** CSS-onlyアプローチ。`@media (pointer: fine)` メディアクエリで `cursor: none` とカーソル丸の表示をマウスデバイスのみに限定する。JSロジックは変更しない。

**Tech Stack:** CSS Media Queries Level 4, Tailwind CSS v4, Vitest + React Testing Library

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/globals.css` | Modify | `.custom-cursor-area` をメディアクエリでラップ、`.custom-cursor` クラス追加 |
| `src/app/teaser/page.tsx` | Modify | `cursor-none` → `custom-cursor-area`、カーソル丸に `.custom-cursor` 追加 |
| `src/components/Hero.tsx` | Modify | カーソル丸に `.custom-cursor` 追加 |
| `src/app/teaser/page.test.tsx` | Modify | アサーション更新、タッチデバイステスト追加 |

---

### Task 1: テスト更新（TeaserPage）

**Files:**
- Modify: `src/app/teaser/page.test.tsx`

- [ ] **Step 1: 既存テストを更新し、新テストを追加（Redフェーズ）**

`src/app/teaser/page.test.tsx` の内容を以下に変更する:

```tsx
import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TeaserPage from "./page";

vi.mock("@/components/teaser/BigBangCanvas", () => ({
  BigBangCanvas: ({ onPhaseChange }: { onPhaseChange: (phase: string) => void }) => {
    setTimeout(() => onPhaseChange("content"), 0);
    return <canvas data-testid="canvas-engine" />;
  },
}));

describe("TeaserPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-27T00:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態で Canvas エンジンが表示される", () => {
    render(<TeaserPage />);
    expect(screen.getByTestId("canvas-engine")).toBeInTheDocument();
  });

  it("演出完了後にティザーコンテンツが表示される", async () => {
    render(<TeaserPage />);
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByText("2026.4.17 18:00 OPEN")).toBeInTheDocument();
  });

  it("custom-cursor-area クラスが適用される", () => {
    render(<TeaserPage />);
    const container = screen.getByTestId("teaser-page");
    expect(container).toHaveClass("custom-cursor-area");
  });

  it("カスタムカーソル要素に custom-cursor クラスが適用される", () => {
    render(<TeaserPage />);
    const container = screen.getByTestId("teaser-page");
    const cursorElement = container.querySelector(".custom-cursor");
    expect(cursorElement).toBeInTheDocument();
  });

  it("マウス移動でカーソル位置が更新される", () => {
    render(<TeaserPage />);

    fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });

    const container = screen.getByTestId("teaser-page");
    expect(container).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テストを実行し、失敗を確認**

Run: `npx vitest run src/app/teaser/page.test.tsx`
Expected: 2つのテストが FAIL（`custom-cursor-area` クラスが見つからない、`.custom-cursor` 要素が見つからない）

---

### Task 2: globals.css の変更

**Files:**
- Modify: `src/app/globals.css:50-53`

- [ ] **Step 3: `.custom-cursor-area` をメディアクエリでラップし、`.custom-cursor` を追加**

`src/app/globals.css` の以下の部分を変更する:

```css
/* Before (line 50-53) */
/* Custom cursor for hero */
.custom-cursor-area {
  cursor: none;
}
```

↓

```css
/* Custom cursor — hidden on touch devices */
.custom-cursor {
  display: none;
}

@media (pointer: fine) {
  .custom-cursor-area {
    cursor: none;
  }
  .custom-cursor {
    display: block;
  }
}
```

---

### Task 3: TeaserPage コンポーネントの変更

**Files:**
- Modify: `src/app/teaser/page.tsx:34,38`

- [ ] **Step 4: `cursor-none` を `custom-cursor-area` に変更**

`src/app/teaser/page.tsx` の34行目を変更:

```tsx
/* Before */
className="relative min-h-screen bg-[#000000] overflow-x-hidden cursor-none"

/* After */
className="relative min-h-screen bg-[#000000] overflow-x-hidden custom-cursor-area"
```

- [ ] **Step 5: カーソル丸の `motion.div` に `custom-cursor` クラスを追加**

`src/app/teaser/page.tsx` の38行目を変更:

```tsx
/* Before */
className="fixed pointer-events-none z-[100] mix-blend-difference"

/* After */
className="custom-cursor fixed pointer-events-none z-[100] mix-blend-difference"
```

- [ ] **Step 6: テストを実行し、全て通ることを確認**

Run: `npx vitest run src/app/teaser/page.test.tsx`
Expected: ALL PASS（5 tests）

- [ ] **Step 7: コミット**

```bash
git add src/app/globals.css src/app/teaser/page.tsx src/app/teaser/page.test.tsx
git commit -m "feat: disable custom cursor on touch devices for teaser page"
```

---

### Task 4: Hero コンポーネントの変更

**Files:**
- Modify: `src/components/Hero.tsx:71`

- [ ] **Step 8: カーソル丸の `motion.div` に `custom-cursor` クラスを追加**

`src/components/Hero.tsx` の71行目を変更:

```tsx
/* Before */
className="fixed pointer-events-none z-[60] mix-blend-difference"

/* After */
className="custom-cursor fixed pointer-events-none z-[60] mix-blend-difference"
```

- [ ] **Step 9: 全テストを実行し、通ることを確認**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 10: コミット**

```bash
git add src/components/Hero.tsx
git commit -m "feat: disable custom cursor on touch devices for hero section"
```

---

### Task 5: 手動ビジュアル確認

- [ ] **Step 11: DevTools でデバイスエミュレーションを使い、タッチデバイスでカーソル丸が非表示であることを確認**

Run: `npm run dev`

確認項目:
1. デスクトップ表示: カーソル丸が表示され、マウスに追従する
2. DevTools > デバイスツールバー > スマホ（iPhone 14など）に切り替え: カーソル丸が非表示、通常のカーソルが表示される
3. Teaserページ (`/teaser`) と Homeページ (`/`) の両方で確認
