# ティザーページ コピー更新 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ティザーページの既存タグラインを、新しい日本語/英語見出し + ディバイダー + ボディテキストのコピーセクションに置き換える。

**Architecture:** `TeaserContent.tsx` のタグライン部分（1つの `motion.p`）を、4つの `motion.*` 要素（日本語見出し・英語見出し・ディバイダー・ボディテキスト）で構成されるコピーセクションに置換。後続要素のアニメーションディレイも調整する。

**Tech Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + Framer Motion / Vitest + React Testing Library

**Design spec:** `docs/superpowers/specs/2026-03-28-teaser-copy-update-design.md`

---

## ファイル構成

| 操作 | ファイル | 内容 |
|------|---------|------|
| 変更 | `src/components/teaser/TeaserContent.test.tsx` | テスト更新 |
| 変更 | `src/components/teaser/TeaserContent.tsx` | コピーセクション実装 |

---

## Task 1: テストを更新する（Red）

**Files:**
- Modify: `src/components/teaser/TeaserContent.test.tsx:37-42`

- [ ] **Step 1: 旧タグラインテストを削除し、新コピーセクションのテストを追加**

`src/components/teaser/TeaserContent.test.tsx` の「タグラインが表示される」テスト（37〜42行目）を以下に置き換える：

```tsx
  it("日本語見出しが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(
      screen.getByText(/ここから、ピックルボールのビッグバンが始まる/)
    ).toBeInTheDocument();
  });

  it("英語見出しが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    const heading = screen.getByText(
      /the pickle bang will begin here from your small dinks/i
    );
    expect(heading).toBeInTheDocument();
  });

  it("コピーセクションにディバイダーが存在する", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("ボディテキストが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(
      screen.getByText(/トレーニング、競技、コミュニティが一体となった空間/)
    ).toBeInTheDocument();
  });

  it("強調テキストが正しくマークアップされている", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    const emphasis = screen.getByText(/これは単なるレンタルコートではない/);
    expect(emphasis.tagName).toBe("EM");
  });
```

- [ ] **Step 2: テストを実行して失敗を確認**

Run: `npx vitest run src/components/teaser/TeaserContent.test.tsx`

Expected: 5つの新テストが FAIL。既存テスト（ロゴ、開業日、カウントダウン、メール登録、キーファクト、フッター）は PASS。

- [ ] **Step 3: コミット**

```bash
git add src/components/teaser/TeaserContent.test.tsx
git commit -m "test: ティザーコピーセクションの新テストを追加（Red）"
```

---

## Task 2: コピーセクションを実装する（Green）

**Files:**
- Modify: `src/components/teaser/TeaserContent.tsx:102-111`

- [ ] **Step 1: タグラインセクションを新コピーセクションに置き換え**

`src/components/teaser/TeaserContent.tsx` の102〜111行目（`{/* Tagline */}` から `</motion.p>` まで）を以下に置き換える：

```tsx
        {/* Copy section */}
        <div
          className="text-center max-w-[640px]"
          style={{ marginBottom: "clamp(1.5rem, 3vh, 2.5rem)" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.4 }}
            className="text-[clamp(1.5rem,3.2vw,2.8rem)] text-[#E6E6E6] leading-[1.35] tracking-[-0.01em] font-bold font-[var(--font-dm-serif)]"
          >
            ここから、ピックルボールの
            <br />
            ビッグバンが始まる。
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.7 }}
            className="text-[clamp(0.7rem,1.1vw,0.95rem)] text-[#F6FF54] leading-[1.5] tracking-[0.18em] uppercase font-medium font-[var(--font-inter)] mb-6"
          >
            The pickle bang will begin here
            <br />
            from your small dinks
          </motion.p>

          <motion.div
            role="separator"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 2.9 }}
            className="w-12 h-px mx-auto mb-6"
            style={{
              background:
                "linear-gradient(90deg, transparent, #306EC3, transparent)",
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 3.1 }}
            className="text-[clamp(0.75rem,1.05vw,0.9rem)] text-[#8A8A8A] leading-[2] tracking-[0.02em] max-w-[520px] mx-auto font-[var(--font-inter)]"
          >
            本八幡駅徒歩1分の立地にプロ仕様ピックルボールハードコート3面がオープン。
            <em className="not-italic text-[#E6E6E6] font-semibold">
              これは単なるレンタルコートではない。
            </em>
            トレーニング、競技、コミュニティが一体となった空間。ここから始まります。
          </motion.p>
        </div>
```

- [ ] **Step 2: 後続要素のアニメーションディレイを調整**

同ファイル内の以下のディレイ値を変更する：

メール登録セクション（`{/* Email signup */}` の `motion.div`）:
- `delay: 2.7` → `delay: 3.5`

Key Facts（`{/* Key facts row */}` の `motion.div`）:
- `delay: 3.0` → `delay: 3.8`

フッター（`{/* Footer */}` の `motion.footer`）:
- `delay: 3.2` → `delay: 4.0`

- [ ] **Step 3: テストを実行して全テスト通過を確認**

Run: `npx vitest run src/components/teaser/TeaserContent.test.tsx`

Expected: 全11テストが PASS。

- [ ] **Step 4: コミット**

```bash
git add src/components/teaser/TeaserContent.tsx
git commit -m "feat: ティザーページのコピーセクションを実装"
```

---

## Task 3: リファクタリングとコード品質確認（Refactor）

**Files:**
- Review: `src/components/teaser/TeaserContent.tsx`

- [ ] **Step 1: 型チェックを実行**

Run: `npx tsc --noEmit`

Expected: エラーなし。

- [ ] **Step 2: lint を実行**

Run: `npx next lint`

Expected: エラーなし。

- [ ] **Step 3: 全テストスイートを実行**

Run: `npx vitest run`

Expected: 全テストが PASS。

- [ ] **Step 4: 開発サーバーで目視確認**

Run: `npx next dev`

確認項目:
- ロゴ → オープン日 → カウントダウン → 日本語見出し → 英語見出し → ディバイダー → ボディテキスト → メール登録 の順でアニメーション表示
- 日本語見出しは DM Serif Display で大きく太字
- 英語見出しは Inter でアクセントイエロー（#F6FF54）、uppercase
- 青いグラデーションのディバイダー線が表示
- 「これは単なるレンタルコートではない。」が白文字+セミボールドで強調
- レスポンシブ（モバイル 375px / タブレット 768px / デスクトップ 1440px）

- [ ] **Step 5: コミット（リファクタリングが発生した場合のみ）**

```bash
git add -A
git commit -m "refactor: ティザーコピーセクションのコード整理"
```
