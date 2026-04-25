# ニュースCMS化 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** microCMSをヘッドレスCMSとして導入し、ハードコードされたニュースを非エンジニア投稿可能な運用に置き換える。多言語（ja/en）・予約投稿・プレビュー・SEO構造化データ・サイトマップ対応の新設 `/news` と `/news/[slug]` を追加し、About内「05 NEWS」セクションをCMS連携に差し替える。

**Architecture:** microCMS (Hobby無料) をコンテンツストア、Next.js 16 App Router を配信層とする。`fetch + next: { tags }` の自前クライアント + Zod境界検証。リッチテキストは isomorphic-dompurify でサニタイズ後に出力。画像は microCMS imgix + `next/image`。Webhook `/api/revalidate` で on-demand ISR、Draft Mode + Cookie で `draftKey` 受け渡し。Feature Flag `NEXT_PUBLIC_USE_CMS_NEWS` で段階的ロールバック可能。

**Tech Stack:** Next.js 16.2 / next-intl 4.9 / TypeScript 5.9 / Tailwind CSS 4 / Vitest 4 / React Testing Library / Zod / isomorphic-dompurify / MSW (新規導入)

**Spec:** `docs/superpowers/specs/2026-04-19-news-cms-integration-design.md`

---

## 設計変更履歴（v2 — 2026-04-25 大幅改訂）

> **重要**: 本セクションは v1 (片言語可方針のみ) を**置き換え**ます。設計書改訂 (commits `0f43538`, `6e0be60`) で以下の変更を反映済み。実装着手時は **設計書を一次ソース**として、本計画書のタスクで矛盾するコード例・テスト例は本セクションのデルタに従って読み替えてください。

### A. 設計デルタ一覧（Q1〜Q12 + プロチームレビュー指摘）

#### A-1. microCMS スキーマ刷新（設計書 §4.1）
| 追加 | 概要 |
|---|---|
| `bodyHtml` | テキストエリア。**AI 生成HTMLの主軸**。Server Component で厳格サニタイズ |
| `displayMode` | セレクト `html`/`rich` 必須・デフォルトなし |
| `excerpt` | テキスト 160字必須。description/OGP/JSON-LD の供給源 |
| `body` (既存) | リッチエディタ → **保険用**に降格 |

→ 影響: Task 4, 6, 7, 12, 13, 17, 19, 20, 22

#### A-2. 多言語片言語可（v1 範囲）
- 各記事は ja/en どちらか1件で運用可、両方揃えてもOK
- 対向言語不在時は `notFound()`、`NewsLanguageSwitcher` は対向言語一覧へフォールバック
- `alternates.languages` は対向言語存在時のみ出力
- `getSlugLocaleMap()` でビルド時 hreflang fetch を集約メモ化（チームレビュー H7）

→ 影響: Task 6, 19 + 新タスク (NewsLanguageSwitcher)

#### A-3. Next.js 16 Cache Components 採用（設計書 §3.2, §7.3.2, §14-1）
- 旧来の `fetch` の `next: { tags }` から **`'use cache'` + `cacheTag()` + `cacheLife()`** に全面移行
- `revalidateTag` は引き続き有効でこれらのタグを無効化
- `next.config.ts` に `experimental.cacheComponents: true`（Next.js 16 安定化に応じて削除可）
- `'use cache'` 関数内では `setRequestLocale` 等の dynamic API は **呼べない** → page.tsx 最上位で呼び出し、データ層は引数で `locale` を受ける

→ 影響: Task 5, 6, 18, 19, 21

#### A-4. ページネーション方針変更（設計書 §5, §6.2）
- 「もっと見る」クライアント追加ロード方式 **廃止** (SEOインデックス不可、Cache Components 利点喪失)
- **`/news?page=N&category=X` のサーバーサイドページネーション + `<Link>` ナビゲーション**に変更
- `<NewsPagination>` Server Component を新設（前後ボタン + 番号リンク、`rel="prev"/"next"`、`aria-current="page"`）

→ 影響: **Task 11 廃止**, **Task 15 (LoadMoreButton) 廃止**, **新タスク `NewsPagination`**, Task 18

#### A-5. サニタイズ二段構え（設計書 §3.2.1, §14-3）
- 新ファイル `src/lib/news/sanitize.ts` に `STRICT_HTML_CONFIG` (`displayMode='html'`) と `RICH_EDITOR_CONFIG` (`displayMode='rich'`) を定義
- 共通禁止: `script, iframe, style, base, link, object, embed, form` タグ + `style, on*, formaction` 属性
- `addHook('afterSanitizeAttributes')` で `<a>` に `target="_blank"` + `rel="noopener noreferrer"` 強制
- `addHook('uponSanitizeAttribute')` で `<img src>` を `images.microcms-assets.io` ホスト限定
- 許可属性に `class` を含める（カスタムクラス保持）
- **Server Component 限定**（クライアントバンドル30KB混入防止、`"use client"` 禁止）

→ 影響: **新タスク (Task 12-pre) `lib/news/sanitize.ts`**, Task 12 リネーム

#### A-6. Webhook強化（設計書 §7.3.1）
- 署名検証は **`crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))`** で定長比較
- microCMS の `x-microcms-signature` は `HMAC-SHA256(body, secret).digest('hex')` の **prefix 無し hex 文字列**
- bodyは `await request.text()` で raw 取得（HMAC計算用）
- **冪等性チェック**: 同一 `(id, type, signature)` を Vercel KV (or Upstash Redis) で 5 分保持、既出はスキップ (リプレイ攻撃対策)
- `revalidateTag('news')` + `revalidateTag(\`news-${id}-ja\`)` + `news-${id}-en` (locale確定不能のため両方発火)
- 認証失敗は `{ error: 'Unauthorized' }` 汎用メッセージのみ

→ 影響: Task 8

#### A-7. Draft Mode強化（設計書 §7.1）
- 順序検証: **Origin ヘッダ → secret (timingSafeEqual) → slug 形式 (`^[a-z0-9-]+$`) → locale enum → 実在チェック → enable → Cookie → リダイレクト**
- Origin 許可リスト環境変数 `MICROCMS_DRAFT_ALLOWED_ORIGINS` を追加
- Cookie: `HttpOnly + SameSite=None + Secure + maxAge: 1800`、ローカル開発時は `SameSite=lax` に切替
- リダイレクト先は構築URL `/news/${slug}` (ja) / `/en/news/${slug}` (en) のみ、クエリ由来は禁止

→ 影響: Task 9, Task 10 (Origin 検証追加)

#### A-8. Feature Flag リネーム（設計書 §8）
- `NEXT_PUBLIC_USE_CMS_NEWS` → **`USE_CMS_NEWS`** (サーバ専用)
- 理由: クライアントバンドル露出防止、機能存在の情報漏洩防止
- フラグ値は build-time inline、変更後は再デプロイ必須

→ 影響: Task 2 (全リファレンス), 影響箇所すべて

#### A-9. 画像方針変更（設計書 §7.4）
- Vercel Image Optimization は使わない、**imgix に最適化を委譲**
- `next/image` は `unoptimized` プロパティで利用、または `<img>` で imgix URL 直接指定
- `images.remotePatterns` は **パスプレフィックスで絞り**: `{ hostname: 'images.microcms-assets.io', pathname: '/assets/<service-id>/**' }`
- `sizes` 属性必須:
  - カード: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
  - 詳細アイキャッチ: `sizes="(max-width: 768px) 100vw, (max-width: 1280px) 85vw, 1200px"`
- 本文中画像 (AI HTML 内) はサニタイズで microCMS ホスト強制

→ 影響: Task 13, 19, 23

#### A-10. excerpt の取り扱い（設計書 §4.1, §7.5）
- description / OGP / JSON-LD は **`excerpt` フィールド (160字必須) から**
- 本文機械抽出 (HTMLタグ除去 + 先頭120字切出) は **廃止**
- Task 7 (抜粋ユーティリティ) は意味的に変更: 「`excerpt` フィールドを安全にプレーンテキストとして取り出す薄いラッパ」または不要

→ 影響: Task 7 (大改装 or 廃止), 17, 19, 22

#### A-11. JSON-LD 必須フィールド追加（設計書 §7.5）
- `publisher` (`@type=Organization` + `logo.ImageObject`), `mainEntityOfPage` を必須化
- `description` は `excerpt` から
- `headline` は 110字以内（AI生成側で担保、サイト側は超過時の警告ログのみ）

→ 影響: Task 17

#### A-12. URL/`localePrefix: 'as-needed'` 整合（設計書 §5）
- ja は prefix 無し: `/news`, `/news/[slug]`
- en のみ prefix: `/en/news`, `/en/news/[slug]`
- About 内アンカー: `/#news` (ja) / `/en/#news` (en)
- `alternates.languages` 構築時もこの URL 規則を使用

→ 影響: Task 18, 19, 21, 22

#### A-13. 動的 OGP の最適化（設計書 §7.5）
- アイキャッチがあれば `metadata.openGraph.images` に imgix URL **直接指定**
- `opengraph-image.tsx` (Task 20) は **アイキャッチ無し記事のフォールバック専用**にスコープ縮小

→ 影響: Task 19 (metadata に直接指定), Task 20 (フォールバック化)

#### A-14. ファイル構成変更（設計書 §9）
- `lib/microcms/queries.ts` → `queries/{list,detail,slugs}.ts` に分割
- `RichEditorContent.tsx` → **`NewsBodyRenderer.tsx`** にリネーム (displayMode 両モード対応)
- `LoadMoreButton.tsx` 廃止
- `NewsPagination.tsx` 新設 (Server Component)
- `NewsLanguageSwitcher.tsx` 新設 (Client Component)
- `lib/news/sanitize.ts` 新設

#### A-15. テスト戦略（設計書 §11）
- Lighthouse CI 予算: LCP ≤ 2500 / CLS ≤ 0.1 / INP ≤ 200 / Performance ≥ 0.9
- `setRequestLocale` の検証: E2E でレスポンスヘッダ `x-nextjs-cache: HIT` 等を確認
- サニタイズテストは両 CONFIG + `<a>` 自動属性付与 + `<img>` ホスト除去
- `NewsBodyRenderer` テスト: html/rich/フォールバック/両空→`notFound` 4分岐

#### A-16. AI 運用境界（設計書 §17）
- AI agent → microCMS Management API のフローは **本計画書スコープ外**
- 別ドキュメント `docs/operations/ai-news-prompt.md` で管理（既に作成済）
- Web サイト側は契約 (画像ホスト/タグ範囲/displayMode/多言語/excerpt/title字数) を信頼せず常に Zod + サニタイズで境界防御

---

### B. タスク影響度マトリクス

凡例: 🔴 大改装 / 🟠 中規模変更 / 🟡 小規模追加 / ⚫ 削除 / ➕ 新タスク

| Task | Title | 影響 | 主な変更 |
|---|---|:-:|---|
| 1 | 依存関係 | 🟠 | + `@vercel/kv` (Webhook冪等性), + `@lhci/cli`, 確認: `isomorphic-dompurify` |
| 2 | Feature Flag | 🟠 | `NEXT_PUBLIC_USE_CMS_NEWS` → `USE_CMS_NEWS` (全所リネーム) |
| 3 | ニュース定数 | 🟡 | `NEWS_PAGE_SIZE = 12`, サニタイズホワイトリスト基本値 |
| 4 | Zod スキーマ | 🔴 | `bodyHtml`, `displayMode`(`z.enum(['html','rich'])`), `excerpt`(`max(160)`) 追加。`body` を任意化 |
| 5 | fetch クライアント | 🔴 | `'use cache'` + `cacheTag` + `cacheLife({revalidate:3600,expire:86400})` 構造に |
| 6 | クエリ関数 | 🔴 | `queries/{list,detail,slugs}.ts` に分割 + `getSlugLocaleMap()` 集約メモ化 + `hasNewsInLocale()` (v1からの継続) |
| 7 | 抜粋ユーティリティ | 🟠 | `excerpt` フィールドを HTML タグ無しプレーンとして返す薄いラッパに変更（旧来の本文機械抽出は廃止） |
| 8 | /api/revalidate | 🔴 | `timingSafeEqual` + Vercel KV 冪等性 + raw body取得 |
| 9 | /api/draft/enable | 🔴 | Origin → secret → slug形式 → locale → 実在チェックの多段検証 |
| 10 | /api/draft/disable | 🟠 | Origin 検証追加, maxAge 1800 で自動失効依存 |
| 11 | /api/news (load more) | ⚫ | **削除** |
| 12-pre | lib/news/sanitize.ts | ➕ | 新タスク: 二段構え DOMPurify 設定 + addHook |
| 12 | RichEditorContent → **NewsBodyRenderer** | 🔴 | リネーム + displayMode 分岐 + フォールバック + サニタイズ呼び分け |
| 13 | NewsCard | 🟠 | `excerpt` 表示, `unoptimized` + `sizes`, AI HTMLでも見た目崩れない確認 |
| 14 | CategoryChips | 🟡 | URL同期は維持（`?page=1&category=...`） |
| 15 | LoadMoreButton | ⚫ | **削除** |
| 15' | **NewsPagination** | ➕ | 新タスク: 前後/番号リンク、`rel="prev/next"`, `aria-current` |
| 16 | PreviewBanner | 🟡 | maxAge 1800 で自動失効 |
| 17 | NewsArticleJsonLd | 🟠 | `publisher`+`logo.ImageObject`, `mainEntityOfPage` 追加, description=excerpt |
| 18 | 一覧ページ | 🔴 | `?page=N&category=X` 処理 + `'use cache'` + `setRequestLocale` 最上位 + `notFound()` の境界 |
| 19 | 詳細ページ | 🔴 | `NewsBodyRenderer` 利用 + `NewsLanguageSwitcher` 連携 + `'use cache'` + alternates条件分岐 + metadata.openGraph 直接 |
| 19-pre | NewsLanguageSwitcher | ➕ | 新タスク: Client Component (router.push 利用) |
| 20 | 動的OGP画像 | 🟠 | スコープ縮小: アイキャッチ無し記事のフォールバック専用 |
| 21 | サイトマップ | 🟠 | `'use cache'` + `cacheLife('hours')`, レコード単位URL出力 |
| 22 | About 05 NEWS | 🟠 | `excerpt` 表示, `cacheTag('news')` 共有, displayMode は意識不要(本文表示しないため) |
| 23 | next.config.ts | 🟠 | `remotePatterns` パスプレフィックス + `experimental.cacheComponents: true` |
| 24 | env.example | 🟡 | `USE_CMS_NEWS`, `MICROCMS_DRAFT_ALLOWED_ORIGINS`, `KV_*` 追加 |
| 25 | 運用マニュアル | 🟡 | AI 運用ガイド (`docs/operations/ai-news-prompt.md`) への参照 |
| 26 | 全体検証 | 🟠 | Lighthouse CI 予算チェック + setRequestLocale 静的化検証 |
| 27 | PR作成 | ⚫ ※ | 影響なし |

**新タスク 3件**: `lib/news/sanitize.ts`, `NewsPagination`, `NewsLanguageSwitcher`
**削除タスク 2件**: Task 11 (`/api/news`), Task 15 (`LoadMoreButton`)

---

### C. 実装着手時のチェックリスト

- [ ] 設計書 §3.2.1 サニタイズマトリクスを `lib/news/sanitize.ts` の Zod スキーマ・テストに転載
- [ ] 設計書 §6.3.1 フォールバック疑似コードを `NewsBodyRenderer.tsx` テスト 4 分岐に展開
- [ ] 設計書 §7.1 Draft Mode 検証順序 a〜h を `/api/draft/enable` 実装に対応
- [ ] 設計書 §7.3.1 Webhook 検証手順 1〜9 を `/api/revalidate` 実装に対応
- [ ] 設計書 §14-4 `setRequestLocale` の `'use cache'` 内不可制約を全 page.tsx で守る
- [ ] チームレビュー指摘の CRITICAL 3件 (Cache Components, timingSafeEqual+冪等性, setRequestLocale) は実装直後に検証

---

## 前提条件

- **Worktree**: `/Users/tsutsumi.akihiro/dev/bigban-news-cms`（ブランチ `feature/news-cms-integration`）
- **ベースラインテスト**: 55 files / 480 tests すべて PASS 済み
- **既存パターン**: `@/` エイリアス、テスト共置 (`file.test.tsx`)、vitest coverage **100%必須**、next-intl ja/en 2言語、`localePrefix: "as-needed"`
- **コミットメッセージ規約**: Conventional Commits（`feat:`, `fix:`, `test:`, `chore:` など）
- **作業ディレクトリ**: 各 `git` / `npm` コマンドは worktree ルートで実行する

---

## ファイル構成マップ

**新規作成**
- `src/config/featureFlags.ts` + test
- `src/constants/news.ts` + test
- `src/lib/microcms/schema.ts` + test
- `src/lib/microcms/client.ts` + test
- `src/lib/microcms/queries.ts` + test
- `src/lib/news/excerpt.ts` + test
- `src/components/news/RichEditorContent.tsx` + test
- `src/components/news/NewsCard.tsx` + test
- `src/components/news/CategoryChips.tsx` + test
- `src/components/news/LoadMoreButton.tsx` + test
- `src/components/news/PreviewBanner.tsx` + test
- `src/components/news/NewsArticleJsonLd.tsx` + test
- `src/app/api/revalidate/route.ts` + test
- `src/app/api/draft/enable/route.ts` + test
- `src/app/api/draft/disable/route.ts` + test
- `src/app/api/news/route.ts` + test
- `src/app/[locale]/news/page.tsx` + test
- `src/app/[locale]/news/loading.tsx`
- `src/app/[locale]/news/error.tsx` + test
- `src/app/[locale]/news/[slug]/page.tsx` + test
- `src/app/[locale]/news/[slug]/loading.tsx`
- `src/app/[locale]/news/[slug]/opengraph-image.tsx` + test
- `__mocks__/microcms-fixtures.ts`
- `docs/operations/news-admin-manual.md`

**修正**
- `package.json`
- `next.config.ts`
- `src/app/sitemap.ts` + test
- `src/app/[locale]/about/AboutContent.tsx` + test
- `src/app/[locale]/about/page.tsx`
- `messages/ja.json`, `messages/en.json`
- `.env.local.example`
- `CLAUDE.md`

---

## Task 1: 依存関係の追加

**Files:** Modify `package.json`

- [ ] **Step 1: 依存を追加**

Run:
```bash
npm install zod isomorphic-dompurify
npm install --save-dev msw@^2.8.0
```

- [ ] **Step 2: 既存テストが壊れていないことを確認**

Run: `npm test`
期待: 55 files / 480 tests PASS

- [ ] **Step 3: コミット**

```bash
git add package.json package-lock.json
git commit -m "chore: ニュースCMS化に必要な依存(zod/isomorphic-dompurify/msw)を追加"
```

---

## Task 2: Feature Flag ユーティリティ

**Files:**
- Create: `src/config/featureFlags.ts`
- Test: `src/config/featureFlags.test.ts`

- [ ] **Step 1: テスト作成**

`src/config/featureFlags.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("isCmsNewsEnabled", () => {
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("'true' で true", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_CMS_NEWS", "true");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(true);
  });

  it("'false' で false", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_CMS_NEWS", "false");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(false);
  });

  it("未設定で false", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_CMS_NEWS", "");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(false);
  });

  it("想定外の値で false", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_CMS_NEWS", "yes");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(false);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/config/featureFlags.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/config/featureFlags.ts`:

```typescript
export function isCmsNewsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_CMS_NEWS === "true";
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/config/featureFlags.test.ts`
期待: 4 tests PASS

- [ ] **Step 5: コミット**

```bash
git add src/config/featureFlags.ts src/config/featureFlags.test.ts
git commit -m "feat: CMSニュース機能のfeature flagを追加"
```

---

## Task 3: ニュース定数

**Files:**
- Create: `src/constants/news.ts` + test

- [ ] **Step 1: テスト**

`src/constants/news.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  NEWS_CATEGORIES, NEWS_PAGE_SIZE, ABOUT_NEWS_LIMIT,
  DETAIL_PAGE_STATIC_LIMIT, type NewsCategoryId,
} from "./news";

describe("news constants", () => {
  it("4カテゴリ", () => { expect(NEWS_CATEGORIES).toHaveLength(4); });
  it("すべて id/labelJa/labelEn/color を持つ", () => {
    for (const c of NEWS_CATEGORIES) {
      expect(c.id).toBeDefined();
      expect(c.labelJa).toBeDefined();
      expect(c.labelEn).toBeDefined();
      expect(c.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
  it("IDは notice/media/event/campaign", () => {
    expect(NEWS_CATEGORIES.map((c) => c.id)).toEqual([
      "notice", "media", "event", "campaign",
    ]);
  });
  it("NEWS_PAGE_SIZE=12", () => { expect(NEWS_PAGE_SIZE).toBe(12); });
  it("ABOUT_NEWS_LIMIT=3", () => { expect(ABOUT_NEWS_LIMIT).toBe(3); });
  it("DETAIL_PAGE_STATIC_LIMIT=100", () => { expect(DETAIL_PAGE_STATIC_LIMIT).toBe(100); });
  it("NewsCategoryId が正しく推論される", () => {
    const id: NewsCategoryId = "notice";
    expect(id).toBe("notice");
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/constants/news.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/constants/news.ts`:

```typescript
export const NEWS_CATEGORIES = [
  { id: "notice",   labelJa: "お知らせ",     labelEn: "Notice",   color: "#C8FF00" },
  { id: "media",    labelJa: "メディア掲載", labelEn: "Media",    color: "#8AB4FF" },
  { id: "event",    labelJa: "イベント",     labelEn: "Event",    color: "#FF6A3D" },
  { id: "campaign", labelJa: "キャンペーン", labelEn: "Campaign", color: "#F6FF54" },
] as const;

export type NewsCategoryId = (typeof NEWS_CATEGORIES)[number]["id"];

export const NEWS_PAGE_SIZE = 12;
export const ABOUT_NEWS_LIMIT = 3;
export const DETAIL_PAGE_STATIC_LIMIT = 100;
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/constants/news.test.ts`
期待: 7 PASS

- [ ] **Step 5: コミット**

```bash
git add src/constants/news.ts src/constants/news.test.ts
git commit -m "feat: ニュースカテゴリ・ページング定数を追加"
```

---

## Task 4: Zod スキーマ

**Files:** Create `src/lib/microcms/schema.ts` + test

- [ ] **Step 1: テスト**

`src/lib/microcms/schema.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { newsItemSchema, newsListSchema } from "./schema";

const validItem = {
  id: "abc123",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
  publishedAt: "2026-04-01T00:00:00.000Z",
  revisedAt: "2026-04-01T00:00:00.000Z",
  title: "タイトル",
  slug: "grand-opening-2026",
  locale: ["ja"],
  category: ["notice"],
  body: "<p>本文</p>",
  eyecatch: {
    url: "https://images.microcms-assets.io/assets/xxx/test.jpg",
    width: 1200, height: 630,
  },
  externalLink: { label: "詳細を見る", url: "https://example.com" },
};

describe("newsItemSchema", () => {
  it("完全なレコードをパース", () => {
    const p = newsItemSchema.parse(validItem);
    expect(p.title).toBe("タイトル");
    expect(p.locale).toBe("ja");
    expect(p.category).toEqual(["notice"]);
  });

  it("eyecatch/externalLink なしでもOK", () => {
    const { eyecatch: _e, externalLink: _el, ...minimal } = validItem;
    void _e; void _el;
    const p = newsItemSchema.parse(minimal);
    expect(p.eyecatch).toBeUndefined();
    expect(p.externalLink).toBeUndefined();
  });

  it("body 未指定は空文字にデフォルト", () => {
    const { body: _b, ...noBody } = validItem;
    void _b;
    const p = newsItemSchema.parse(noBody);
    expect(p.body).toBe("");
  });

  it("locale 想定外はエラー", () => {
    expect(() => newsItemSchema.parse({ ...validItem, locale: ["fr"] })).toThrow();
  });

  it("category 想定外はエラー", () => {
    expect(() => newsItemSchema.parse({ ...validItem, category: ["invalid"] })).toThrow();
  });

  it("必須欠落でエラー", () => {
    const { title: _t, ...missing } = validItem;
    void _t;
    expect(() => newsItemSchema.parse(missing)).toThrow();
  });

  it("externalLink.url 非URLはエラー", () => {
    expect(() =>
      newsItemSchema.parse({ ...validItem, externalLink: { label: "x", url: "not-url" } }),
    ).toThrow();
  });
});

describe("newsListSchema", () => {
  it("contents配列をパース", () => {
    const p = newsListSchema.parse({
      contents: [validItem], totalCount: 1, offset: 0, limit: 12,
    });
    expect(p.contents).toHaveLength(1);
  });
  it("空でもOK", () => {
    const p = newsListSchema.parse({
      contents: [], totalCount: 0, offset: 0, limit: 12,
    });
    expect(p.contents).toEqual([]);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/lib/microcms/schema.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/lib/microcms/schema.ts`:

```typescript
import { z } from "zod";

const localeSelect = z.array(z.enum(["ja", "en"])).min(1).max(1).transform((v) => v[0]);
const categoryEnum = z.enum(["notice", "media", "event", "campaign"]);
const eyecatch = z.object({ url: z.string().url(), width: z.number(), height: z.number() });
const externalLink = z.object({ label: z.string(), url: z.string().url() });

export const newsItemSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
  revisedAt: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  locale: localeSelect,
  category: z.array(categoryEnum).min(1),
  body: z.string().optional().default(""),
  eyecatch: eyecatch.optional(),
  externalLink: externalLink.optional(),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

export const newsListSchema = z.object({
  contents: z.array(newsItemSchema),
  totalCount: z.number(),
  offset: z.number(),
  limit: z.number(),
});
export type NewsList = z.infer<typeof newsListSchema>;
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/lib/microcms/schema.test.ts`
期待: 9 PASS

- [ ] **Step 5: コミット**

```bash
git add src/lib/microcms/schema.ts src/lib/microcms/schema.test.ts
git commit -m "feat: microCMS ニュースのZodスキーマ"
```

---

## Task 5: microCMS fetch クライアント

**Files:** Create `src/lib/microcms/client.ts` + test

- [ ] **Step 1: テスト**

`src/lib/microcms/client.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { z } from "zod";

const schema = z.object({ id: z.string() });

describe("microcmsFetch", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "example");
    vi.stubEnv("MICROCMS_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("APIキー+tags付きでGET", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    const r = await microcmsFetch("news/x", schema, { tags: ["news"] });
    expect(r.id).toBe("x");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.microcms.io/api/v1/news/x",
      expect.objectContaining({
        headers: { "X-MICROCMS-API-KEY": "test-key" },
        next: { tags: ["news"] },
      }),
    );
  });

  it("searchParams を URL クエリに付加", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    await microcmsFetch("news", schema, {
      tags: ["news"],
      searchParams: { limit: 12, offset: 0, filters: "locale[equals]ja" },
    });
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain("limit=12");
    expect(url).toContain("offset=0");
  });

  it("undefined の searchParam は無視", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    await microcmsFetch("news", schema, {
      tags: ["news"],
      searchParams: { limit: 12, offset: undefined },
    });
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).not.toContain("offset=");
  });

  it("draftKey 指定時は no-store + ?draftKey=", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    await microcmsFetch("news/x", schema, { tags: ["news"], draftKey: "dk-1" });
    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string, RequestInit,
    ];
    expect(url).toContain("draftKey=dk-1");
    expect((init as { cache?: string }).cache).toBe("no-store");
    expect((init as { next?: unknown }).next).toBeUndefined();
  });

  it("!res.ok で例外", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false, status: 404, statusText: "Not Found",
    });
    const { microcmsFetch } = await import("./client");
    await expect(
      microcmsFetch("news/x", schema, { tags: ["news"] }),
    ).rejects.toThrow(/404/);
  });

  it("環境変数未設定で import エラー", async () => {
    vi.unstubAllEnvs();
    await expect(import("./client")).rejects.toThrow(/MICROCMS/);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/lib/microcms/client.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/lib/microcms/client.ts`:

```typescript
import type { z } from "zod";

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!SERVICE_DOMAIN || !API_KEY) {
  throw new Error("MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です");
}

const BASE_URL = `https://${SERVICE_DOMAIN}.microcms.io/api/v1`;

export interface MicrocmsFetchOptions {
  searchParams?: Record<string, string | number | undefined>;
  tags: string[];
  draftKey?: string;
}

export async function microcmsFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  { searchParams, tags, draftKey }: MicrocmsFetchOptions,
): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  if (draftKey) url.searchParams.set("draftKey", draftKey);

  const init: RequestInit = {
    headers: { "X-MICROCMS-API-KEY": API_KEY as string },
    ...(draftKey
      ? { cache: "no-store" as RequestCache }
      : { next: { tags } }),
  };

  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    throw new Error(`microCMS fetch failed: ${res.status} ${res.statusText}`);
  }
  return schema.parse((await res.json()) as unknown);
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/lib/microcms/client.test.ts`
期待: 6 PASS

- [ ] **Step 5: コミット**

```bash
git add src/lib/microcms/client.ts src/lib/microcms/client.test.ts
git commit -m "feat: microCMS fetchクライアント (Next.jsキャッシュ統合)"
```

---

## Task 6: クエリ関数 + フィクスチャ

**Files:**
- Create: `__mocks__/microcms-fixtures.ts`
- Create: `src/lib/microcms/queries.ts` + test

- [ ] **Step 1: フィクスチャ**

`__mocks__/microcms-fixtures.ts`:

```typescript
import type { NewsItem, NewsList } from "@/lib/microcms/schema";

export function makeNewsItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: "abc123",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    publishedAt: "2026-04-01T00:00:00.000Z",
    revisedAt: "2026-04-01T00:00:00.000Z",
    title: "ダミータイトル",
    slug: "dummy-slug",
    locale: "ja",
    category: ["notice"],
    body: "<p>ダミー本文</p>",
    eyecatch: {
      url: "https://images.microcms-assets.io/assets/xxx/test.jpg",
      width: 1200, height: 630,
    },
    ...overrides,
  };
}

export function makeNewsList(items: NewsItem[], totalCount?: number): NewsList {
  return {
    contents: items,
    totalCount: totalCount ?? items.length,
    offset: 0,
    limit: 12,
  };
}
```

- [ ] **Step 2: テスト**

`src/lib/microcms/queries.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { makeNewsItem, makeNewsList } from "../../../__mocks__/microcms-fixtures";

describe("queries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "example");
    vi.stubEnv("MICROCMS_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn());
    vi.doMock("next/headers", () => ({
      cookies: async () => ({ get: (_k: string) => undefined }),
      draftMode: async () => ({ isEnabled: false }),
    }));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.doUnmock("next/headers");
  });

  describe("getNewsList", () => {
    it("locale/orders/limit/offset を渡す", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true, json: async () => makeNewsList([makeNewsItem()]),
      });
      const { getNewsList } = await import("./queries");
      const r = await getNewsList({ locale: "ja", limit: 12, offset: 0 });
      expect(r.contents).toHaveLength(1);
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain("filters=locale[equals]ja");
      expect(decodeURIComponent(url)).toContain("orders=-publishedAt");
      expect(url).toContain("limit=12");
    });

    it("category 指定で filters AND", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true, json: async () => makeNewsList([]),
      });
      const { getNewsList } = await import("./queries");
      await getNewsList({ locale: "ja", limit: 12, offset: 0, category: "media" });
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain(
        "filters=locale[equals]ja[and]category[contains]media",
      );
    });
  });

  describe("getNewsDetail", () => {
    it("1件取得", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true, json: async () => makeNewsList([makeNewsItem({ slug: "g" })]),
      });
      const { getNewsDetail } = await import("./queries");
      const r = await getNewsDetail({ locale: "ja", slug: "g" });
      expect(r?.slug).toBe("g");
    });

    it("見つからないとnull", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true, json: async () => makeNewsList([]),
      });
      const { getNewsDetail } = await import("./queries");
      expect(await getNewsDetail({ locale: "ja", slug: "none" })).toBeNull();
    });

    it("draft mode 有効時は Cookie draftKey 付与", async () => {
      vi.resetModules();
      vi.doMock("next/headers", () => ({
        cookies: async () => ({
          get: (k: string) => (k === "microcms_draft_key" ? { value: "dk-1" } : undefined),
        }),
        draftMode: async () => ({ isEnabled: true }),
      }));
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true, json: async () => makeNewsList([makeNewsItem({ slug: "x" })]),
      });
      const { getNewsDetail } = await import("./queries");
      await getNewsDetail({ locale: "ja", slug: "x" });
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain("draftKey=dk-1");
    });
  });

  describe("getNewsSlugs", () => {
    it("全 locale の slug を返す", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (u: unknown) => {
        const url = String(u);
        if (decodeURIComponent(url).includes("locale[equals]ja")) {
          return {
            ok: true,
            json: async () => makeNewsList([
              makeNewsItem({ slug: "a", locale: "ja" }),
              makeNewsItem({ slug: "b", locale: "ja" }),
            ]),
          };
        }
        return {
          ok: true,
          json: async () => makeNewsList([makeNewsItem({ slug: "c", locale: "en" })]),
        };
      });
      const { getNewsSlugs } = await import("./queries");
      const r = await getNewsSlugs();
      expect(r).toEqual([
        { locale: "ja", slug: "a" },
        { locale: "ja", slug: "b" },
        { locale: "en", slug: "c" },
      ]);
    });
  });
});
```

- [ ] **Step 3: 失敗確認**

Run: `npx vitest run src/lib/microcms/queries.test.ts`
期待: FAIL

- [ ] **Step 4: 実装**

`src/lib/microcms/queries.ts`:

```typescript
import { cookies, draftMode } from "next/headers";

import { microcmsFetch } from "./client";
import { newsListSchema, type NewsItem, type NewsList } from "./schema";
import { DETAIL_PAGE_STATIC_LIMIT, type NewsCategoryId } from "@/constants/news";

type Locale = "ja" | "en";

export interface GetNewsListParams {
  locale: Locale;
  limit: number;
  offset: number;
  category?: NewsCategoryId;
}

export async function getNewsList({
  locale, limit, offset, category,
}: GetNewsListParams): Promise<NewsList> {
  const filters = category
    ? `locale[equals]${locale}[and]category[contains]${category}`
    : `locale[equals]${locale}`;
  return microcmsFetch("news", newsListSchema, {
    searchParams: { filters, orders: "-publishedAt", limit, offset },
    tags: ["news", `news-list-${locale}${category ? `-${category}` : ""}`],
  });
}

export interface GetNewsDetailParams {
  locale: Locale;
  slug: string;
}

async function readDraftKey(): Promise<string | undefined> {
  const draft = await draftMode();
  if (!draft.isEnabled) return undefined;
  const store = await cookies();
  return store.get("microcms_draft_key")?.value;
}

export async function getNewsDetail({
  locale, slug,
}: GetNewsDetailParams): Promise<NewsItem | null> {
  const draftKey = await readDraftKey();
  const list = await microcmsFetch("news", newsListSchema, {
    searchParams: {
      filters: `slug[equals]${slug}[and]locale[equals]${locale}`,
      limit: 1,
    },
    tags: ["news", `news-${slug}-${locale}`],
    draftKey,
  });
  return list.contents[0] ?? null;
}

export interface NewsSlug { locale: Locale; slug: string; }

export async function getNewsSlugs(): Promise<NewsSlug[]> {
  const results: NewsSlug[] = [];
  for (const locale of ["ja", "en"] as const) {
    const list = await microcmsFetch("news", newsListSchema, {
      searchParams: {
        filters: `locale[equals]${locale}`,
        fields: "slug,locale",
        limit: DETAIL_PAGE_STATIC_LIMIT,
      },
      tags: ["news", `news-slugs-${locale}`],
    });
    for (const item of list.contents) {
      results.push({ locale, slug: item.slug });
    }
  }
  return results;
}
```

- [ ] **Step 5: 通過確認**

Run: `npx vitest run src/lib/microcms/queries.test.ts`
期待: 5 PASS

- [ ] **Step 6: コミット**

```bash
git add src/lib/microcms/queries.ts src/lib/microcms/queries.test.ts __mocks__/microcms-fixtures.ts
git commit -m "feat: microCMSクエリ関数(getNewsList/Detail/Slugs)"
```

---

## Task 7: 抜粋ユーティリティ

**Files:** Create `src/lib/news/excerpt.ts` + test

- [ ] **Step 1: テスト**

`src/lib/news/excerpt.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { generateExcerpt } from "./excerpt";

describe("generateExcerpt", () => {
  it("HTMLタグ除去", () => {
    expect(generateExcerpt("<p>こんにちは <strong>世界</strong></p>")).toBe("こんにちは 世界");
  });
  it("120文字超は … を末尾に付与", () => {
    const r = generateExcerpt(`<p>${"あ".repeat(200)}</p>`);
    expect(r.length).toBe(121);
    expect(r.endsWith("…")).toBe(true);
  });
  it("120文字以下は素通し", () => {
    expect(generateExcerpt("<p>短い文章</p>")).toBe("短い文章");
  });
  it("空文字→空文字", () => { expect(generateExcerpt("")).toBe(""); });
  it("連続空白を単一に", () => {
    expect(generateExcerpt("<p>A</p>   <p>B</p>")).toBe("A B");
  });
  it("length オプション", () => {
    const r = generateExcerpt("<p>" + "あ".repeat(50) + "</p>", { length: 10 });
    expect(r.length).toBe(11);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/lib/news/excerpt.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/lib/news/excerpt.ts`:

```typescript
export interface GenerateExcerptOptions { length?: number; }
const DEFAULT_LENGTH = 120;

export function generateExcerpt(
  html: string, options: GenerateExcerptOptions = {},
): string {
  const length = options.length ?? DEFAULT_LENGTH;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/lib/news/excerpt.test.ts`
期待: 6 PASS

- [ ] **Step 5: コミット**

```bash
git add src/lib/news/excerpt.ts src/lib/news/excerpt.test.ts
git commit -m "feat: ニュース本文から抜粋生成ユーティリティ"
```

---

## Task 8: /api/revalidate

**Files:** Create `src/app/api/revalidate/route.ts` + test

- [ ] **Step 1: テスト**

`src/app/api/revalidate/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const revalidateTagMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (tag: string) => revalidateTagMock(tag),
}));

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: new Headers(headers),
    body: JSON.stringify(body),
  });
}

describe("/api/revalidate POST", () => {
  beforeEach(() => {
    revalidateTagMock.mockClear();
    vi.stubEnv("MICROCMS_WEBHOOK_SECRET", "s3cret");
  });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("secret不一致で401", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news" }, { "x-microcms-signature": "bad" }));
    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("news+id でタグ2つ", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news", id: "abc" }, { "x-microcms-signature": "s3cret" }));
    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("news");
    expect(revalidateTagMock).toHaveBeenCalledWith("news-abc");
  });

  it("api!=news はスキップ", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "other" }, { "x-microcms-signature": "s3cret" }));
    expect(res.status).toBe(200);
    expect((await res.json() as { skipped: boolean }).skipped).toBe(true);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("id無しでも news タグ", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news" }, { "x-microcms-signature": "s3cret" }));
    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("news");
  });

  it("不正body で400", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ broken: true }, { "x-microcms-signature": "s3cret" }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/app/api/revalidate/route.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/app/api/revalidate/route.ts`:

```typescript
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  service: z.string().optional(),
  api: z.string(),
  id: z.string().optional(),
  type: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get("x-microcms-signature");
  if (!secret || secret !== process.env.MICROCMS_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  if (parsed.data.api !== "news") {
    return NextResponse.json({ ok: true, skipped: true });
  }
  revalidateTag("news");
  if (parsed.data.id) revalidateTag(`news-${parsed.data.id}`);
  return NextResponse.json({
    ok: true,
    revalidated: parsed.data.id ? ["news", `news-${parsed.data.id}`] : ["news"],
  });
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/app/api/revalidate/route.test.ts`
期待: 5 PASS

- [ ] **Step 5: コミット**

```bash
git add src/app/api/revalidate/route.ts src/app/api/revalidate/route.test.ts
git commit -m "feat: microCMS Webhook用 /api/revalidate"
```

---

## Task 9: /api/draft/enable

**Files:** Create `src/app/api/draft/enable/route.ts` + test

- [ ] **Step 1: テスト**

`src/app/api/draft/enable/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const enableMock = vi.fn();
const cookieSetMock = vi.fn();
const getNewsDetailMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("next/headers", () => ({
  draftMode: async () => ({ enable: enableMock }),
  cookies: async () => ({ set: cookieSetMock }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
vi.mock("@/lib/microcms/queries", () => ({
  getNewsDetail: (args: unknown) => getNewsDetailMock(args),
}));

function makeReq(url: string) { return new Request(url); }

describe("/api/draft/enable GET", () => {
  beforeEach(() => {
    enableMock.mockClear();
    cookieSetMock.mockClear();
    getNewsDetailMock.mockReset();
    redirectMock.mockClear();
    vi.stubEnv("MICROCMS_DRAFT_SECRET", "ds3cret");
  });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("secret不一致401", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeReq(
      "http://localhost/api/draft/enable?secret=bad&slug=a&draftKey=d"));
    expect(res.status).toBe(401);
  });

  it("slug/draftKey欠落401", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeReq("http://localhost/api/draft/enable?secret=ds3cret"));
    expect(res.status).toBe(401);
  });

  it("不正locale401", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeReq(
      "http://localhost/api/draft/enable?secret=ds3cret&slug=a&draftKey=d&locale=xx"));
    expect(res.status).toBe(401);
  });

  it("slug存在しない401", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(makeReq(
      "http://localhost/api/draft/enable?secret=ds3cret&slug=a&draftKey=d"));
    expect(res.status).toBe(401);
  });

  it("正常系: enable+cookie+redirect", async () => {
    getNewsDetailMock.mockResolvedValue({ slug: "a" });
    const { GET } = await import("./route");
    await expect(GET(makeReq(
      "http://localhost/api/draft/enable?secret=ds3cret&slug=a&draftKey=dk&locale=ja",
    ))).rejects.toThrow(/NEXT_REDIRECT/);
    expect(enableMock).toHaveBeenCalled();
    expect(cookieSetMock).toHaveBeenCalledWith(
      "microcms_draft_key", "dk",
      expect.objectContaining({ httpOnly: true, sameSite: "none", secure: true }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/ja/news/a");
  });

  it("locale未指定はja", async () => {
    getNewsDetailMock.mockResolvedValue({ slug: "a" });
    const { GET } = await import("./route");
    await expect(GET(makeReq(
      "http://localhost/api/draft/enable?secret=ds3cret&slug=a&draftKey=dk",
    ))).rejects.toThrow(/NEXT_REDIRECT/);
    expect(redirectMock).toHaveBeenCalledWith("/ja/news/a");
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/app/api/draft/enable/route.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/app/api/draft/enable/route.ts`:

```typescript
import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getNewsDetail } from "@/lib/microcms/queries";

export const runtime = "nodejs";

type Locale = "ja" | "en";
function isLocale(v: string | null): v is Locale { return v === "ja" || v === "en"; }

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const slug = url.searchParams.get("slug");
  const draftKey = url.searchParams.get("draftKey");
  const localeParam = url.searchParams.get("locale");
  const locale: Locale = isLocale(localeParam) ? localeParam : "ja";

  if (!secret || secret !== process.env.MICROCMS_DRAFT_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!slug || !draftKey) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (localeParam !== null && !isLocale(localeParam)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const item = await getNewsDetail({ locale, slug });
  if (!item) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  (await draftMode()).enable();
  (await cookies()).set("microcms_draft_key", draftKey, {
    httpOnly: true, sameSite: "none", secure: true, path: "/",
  });

  redirect(`/${locale}/news/${slug}`);
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/app/api/draft/enable/route.test.ts`
期待: 6 PASS

- [ ] **Step 5: コミット**

```bash
git add src/app/api/draft/enable/route.ts src/app/api/draft/enable/route.test.ts
git commit -m "feat: プレビュー入口 /api/draft/enable"
```

---

## Task 10: /api/draft/disable

**Files:** Create `src/app/api/draft/disable/route.ts` + test

- [ ] **Step 1: テスト**

`src/app/api/draft/disable/route.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

const disableMock = vi.fn();
const cookieDeleteMock = vi.fn();

vi.mock("next/headers", () => ({
  draftMode: async () => ({ disable: disableMock }),
  cookies: async () => ({ delete: cookieDeleteMock }),
}));

describe("/api/draft/disable GET", () => {
  it("disable + Cookie 削除 + 200", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(disableMock).toHaveBeenCalled();
    expect(cookieDeleteMock).toHaveBeenCalledWith("microcms_draft_key");
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/app/api/draft/disable/route.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/app/api/draft/disable/route.ts`:

```typescript
import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  (await draftMode()).disable();
  (await cookies()).delete("microcms_draft_key");
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/app/api/draft/disable/route.test.ts`
期待: 1 PASS

- [ ] **Step 5: コミット**

```bash
git add src/app/api/draft/disable/route.ts src/app/api/draft/disable/route.test.ts
git commit -m "feat: プレビュー終了 /api/draft/disable"
```

---

## Task 11: /api/news (load more)

**Files:** Create `src/app/api/news/route.ts` + test

- [ ] **Step 1: テスト**

`src/app/api/news/route.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { makeNewsItem, makeNewsList } from "../../../../__mocks__/microcms-fixtures";

const getNewsListMock = vi.fn();
vi.mock("@/lib/microcms/queries", () => ({
  getNewsList: (args: unknown) => getNewsListMock(args),
}));
function makeReq(u: string) { return new Request(u); }

describe("/api/news GET", () => {
  it("locale/offset を getNewsList に渡す", async () => {
    getNewsListMock.mockResolvedValue(makeNewsList([makeNewsItem({ slug: "x" })]));
    const { GET } = await import("./route");
    const res = await GET(makeReq("http://localhost/api/news?locale=ja&offset=12"));
    expect(res.status).toBe(200);
    expect(getNewsListMock).toHaveBeenCalledWith({
      locale: "ja", limit: 12, offset: 12, category: undefined,
    });
    const json = (await res.json()) as { contents: unknown[] };
    expect(json.contents).toHaveLength(1);
  });

  it("category を渡す", async () => {
    getNewsListMock.mockResolvedValue(makeNewsList([]));
    const { GET } = await import("./route");
    await GET(makeReq("http://localhost/api/news?locale=en&offset=0&category=media"));
    expect(getNewsListMock).toHaveBeenCalledWith({
      locale: "en", limit: 12, offset: 0, category: "media",
    });
  });

  it("不正locale 400", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeReq("http://localhost/api/news?locale=fr&offset=0"));
    expect(res.status).toBe(400);
  });

  it("不正offset 400", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeReq("http://localhost/api/news?locale=ja&offset=abc"));
    expect(res.status).toBe(400);
  });

  it("不正category 400", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeReq(
      "http://localhost/api/news?locale=ja&offset=0&category=invalid"));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/app/api/news/route.test.ts`
期待: FAIL

- [ ] **Step 3: 実装**

`src/app/api/news/route.ts`:

```typescript
import { NextResponse } from "next/server";

import { NEWS_CATEGORIES, NEWS_PAGE_SIZE, type NewsCategoryId } from "@/constants/news";
import { getNewsList } from "@/lib/microcms/queries";

export const runtime = "nodejs";

type Locale = "ja" | "en";
function isLocale(v: string | null): v is Locale { return v === "ja" || v === "en"; }
function isCategoryId(v: string): v is NewsCategoryId {
  return NEWS_CATEGORIES.some((c) => c.id === v);
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");
  const offsetRaw = url.searchParams.get("offset");
  const categoryRaw = url.searchParams.get("category");

  if (!isLocale(locale)) {
    return NextResponse.json({ ok: false, error: "invalid_locale" }, { status: 400 });
  }
  const offset = Number(offsetRaw);
  if (!Number.isFinite(offset) || offset < 0) {
    return NextResponse.json({ ok: false, error: "invalid_offset" }, { status: 400 });
  }
  let category: NewsCategoryId | undefined;
  if (categoryRaw) {
    if (!isCategoryId(categoryRaw)) {
      return NextResponse.json({ ok: false, error: "invalid_category" }, { status: 400 });
    }
    category = categoryRaw;
  }

  const list = await getNewsList({
    locale, limit: NEWS_PAGE_SIZE, offset, category,
  });
  return NextResponse.json(list);
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/app/api/news/route.test.ts`
期待: 5 PASS

- [ ] **Step 5: コミット**

```bash
git add src/app/api/news/route.ts src/app/api/news/route.test.ts
git commit -m "feat: 「もっと見る」用 /api/news"
```

---

## Task 12: RichEditorContent（DOMPurifyサニタイズ）

**Files:** Create `src/components/news/RichEditorContent.tsx` + test

- [ ] **Step 1: テスト**

`src/components/news/RichEditorContent.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RichEditorContent } from "./RichEditorContent";

describe("RichEditorContent", () => {
  it("安全なHTMLを描画", () => {
    const { container } = render(<RichEditorContent html="<p>ようこそ</p>" />);
    expect(container.querySelector("p")?.textContent).toBe("ようこそ");
  });

  it("<script>除去", () => {
    const { container } = render(
      <RichEditorContent html="<p>ok</p><script>alert(1)</script>" />);
    expect(container.querySelector("script")).toBeNull();
  });

  it("onclick属性除去", () => {
    const { container } = render(
      <RichEditorContent html='<button onclick="alert(1)">x</button>' />);
    expect(container.querySelector("button")?.getAttribute("onclick")).toBeNull();
  });

  it("iframe は許可、sandbox 付与", () => {
    const { container } = render(
      <RichEditorContent html='<iframe src="https://www.youtube.com/embed/abc"></iframe>' />);
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
  });

  it("target=_blank の a に rel 補完", () => {
    const { container } = render(
      <RichEditorContent html='<a href="https://example.com" target="_blank">link</a>' />);
    expect(container.querySelector("a")?.getAttribute("rel")).toContain("noopener");
  });

  it("prose クラス適用", () => {
    render(<RichEditorContent html="<p>x</p>" />);
    expect(screen.getByTestId("rich-editor-content").className).toContain("prose");
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/components/news/RichEditorContent.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/components/news/RichEditorContent.tsx`:

```typescript
import DOMPurify from "isomorphic-dompurify";

interface RichEditorContentProps { html: string; }

export function RichEditorContent({ html }: RichEditorContentProps) {
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "rel", "allow", "allowfullscreen", "sandbox"],
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
  });

  const withSandbox = clean.replace(
    /<iframe(?![^>]*\ssandbox=)/g,
    '<iframe sandbox="allow-scripts allow-same-origin allow-presentation"',
  );

  const withLinkRel = withSandbox.replace(
    /<a([^>]*?)target="_blank"((?:(?!>).)*?)>/g,
    (match, pre: string, post: string) =>
      match.includes("rel=")
        ? match
        : `<a${pre}target="_blank" rel="noopener noreferrer"${post}>`,
  );

  return (
    <div
      data-testid="rich-editor-content"
      className="prose prose-invert max-w-none"
      // CONTENT IS SANITIZED VIA DOMPurify ABOVE
      dangerouslySetInnerHTML={{ __html: withLinkRel }}
    />
  );
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/components/news/RichEditorContent.test.tsx`
期待: 6 PASS

- [ ] **Step 5: コミット**

```bash
git add src/components/news/RichEditorContent.tsx src/components/news/RichEditorContent.test.tsx
git commit -m "feat: RichEditorContent (DOMPurify サニタイズ+iframe sandbox)"
```

---

## Task 13: NewsCard

**Files:** Create `src/components/news/NewsCard.tsx` + test

- [ ] **Step 1: テスト**

`src/components/news/NewsCard.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsCard } from "./NewsCard";
import { makeNewsItem } from "../../../__mocks__/microcms-fixtures";

describe("NewsCard", () => {
  it("タイトル/日付/カテゴリバッジ", () => {
    render(<NewsCard item={makeNewsItem({
      title: "サンプル",
      publishedAt: "2026-04-01T00:00:00.000Z",
      category: ["media"], slug: "sample",
    })} locale="ja" />);
    expect(screen.getByText("サンプル")).toBeInTheDocument();
    expect(screen.getByText(/2026\.04\.01/)).toBeInTheDocument();
    expect(screen.getByText("メディア掲載")).toBeInTheDocument();
  });

  it("locale=en で英語ラベル+/en prefix", () => {
    render(<NewsCard item={makeNewsItem({ slug: "sample", category: ["media"] })} locale="en" />);
    expect(screen.getByText("Media")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/en/news/sample");
  });

  it("locale=ja prefix なしリンク", () => {
    render(<NewsCard item={makeNewsItem({ slug: "x" })} locale="ja" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/news/x");
  });

  it("eyecatch あり img描画", () => {
    render(<NewsCard item={makeNewsItem({ slug: "y" })} locale="ja" />);
    const img = screen.getByRole("img", { name: "" });
    expect(img.getAttribute("src") ?? "").toContain("test.jpg");
  });

  it("eyecatch なしでプレースホルダ", () => {
    const base = makeNewsItem({ slug: "z" });
    const { eyecatch: _e, ...rest } = base;
    void _e;
    render(<NewsCard item={rest} locale="ja" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByTestId("news-card-placeholder")).toBeInTheDocument();
  });

  it("publishedAt なければ createdAt", () => {
    const base = makeNewsItem({ slug: "p", createdAt: "2026-01-15T00:00:00.000Z" });
    const { publishedAt: _p, ...rest } = base;
    void _p;
    render(<NewsCard item={rest} locale="ja" />);
    expect(screen.getByText(/2026\.01\.15/)).toBeInTheDocument();
  });

  it("time要素 dateTime 属性", () => {
    render(<NewsCard item={makeNewsItem({ publishedAt: "2026-04-01T00:00:00.000Z", slug: "x" })}
                     locale="ja" />);
    const t = screen.getByText(/2026\.04\.01/);
    expect(t.tagName).toBe("TIME");
    expect(t).toHaveAttribute("dateTime", "2026-04-01");
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/components/news/NewsCard.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/components/news/NewsCard.tsx`:

```typescript
import Image from "next/image";
import Link from "next/link";

import { NEWS_CATEGORIES } from "@/constants/news";
import type { NewsItem } from "@/lib/microcms/schema";

type Locale = "ja" | "en";

interface NewsCardProps { item: NewsItem; locale: Locale; }

function formatDate(iso: string): { display: string; iso: string } {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return { display: `${yyyy}.${mm}.${dd}`, iso: `${yyyy}-${mm}-${dd}` };
}

function buildHref(locale: Locale, slug: string): string {
  return locale === "ja" ? `/news/${slug}` : `/en/news/${slug}`;
}

export function NewsCard({ item, locale }: NewsCardProps) {
  const cat = NEWS_CATEGORIES.find((c) => c.id === item.category[0]);
  const label = locale === "ja" ? cat?.labelJa : cat?.labelEn;
  const dateIso = item.publishedAt ?? item.createdAt;
  const date = formatDate(dateIso);

  return (
    <Link
      href={buildHref(locale, item.slug)}
      className="group block border border-text-gray/10 hover:border-accent/60 transition-colors"
    >
      <div className="relative aspect-[16/9] bg-primary overflow-hidden">
        {item.eyecatch ? (
          <Image
            src={`${item.eyecatch.url}?w=600&fm=webp&q=75`}
            alt=""
            width={600}
            height={Math.round((item.eyecatch.height / item.eyecatch.width) * 600)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            data-testid="news-card-placeholder"
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${cat?.color ?? "#8A8A8A"}33 0%, #0A0A0A 100%)`,
            }}
          />
        )}
      </div>
      <div className="p-5 space-y-2">
        <div className="flex items-center gap-3 text-xs text-text-gray">
          {label && (
            <span
              className="inline-block px-2 py-0.5 border"
              style={{ borderColor: cat?.color, color: cat?.color }}
            >
              {label}
            </span>
          )}
          <time dateTime={date.iso}>{date.display}</time>
        </div>
        <h3 className="text-text-light text-base lg:text-lg font-bold leading-snug line-clamp-2">
          {item.title}
        </h3>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/components/news/NewsCard.test.tsx`
期待: 7 PASS

- [ ] **Step 5: コミット**

```bash
git add src/components/news/NewsCard.tsx src/components/news/NewsCard.test.tsx
git commit -m "feat: NewsCard コンポーネント"
```

---

## Task 14: CategoryChips

**Files:** Create `src/components/news/CategoryChips.tsx` + test

- [ ] **Step 1: テスト**

`src/components/news/CategoryChips.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(""),
}));

import { CategoryChips } from "./CategoryChips";

describe("CategoryChips", () => {
  beforeEach(() => { pushMock.mockClear(); });

  it("All+4カテゴリ=5ボタン", () => {
    render(<CategoryChips locale="ja" activeCategory={undefined} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("activeCategory に一致で aria-pressed=true", () => {
    render(<CategoryChips locale="ja" activeCategory="media" />);
    expect(screen.getByRole("button", { name: "メディア掲載" }))
      .toHaveAttribute("aria-pressed", "true");
  });

  it("Allはactive=undefined で pressed=true", () => {
    render(<CategoryChips locale="ja" activeCategory={undefined} />);
    expect(screen.getByRole("button", { name: "すべて" }))
      .toHaveAttribute("aria-pressed", "true");
  });

  it("カテゴリクリックで /news?category=xxx", () => {
    render(<CategoryChips locale="ja" activeCategory={undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "メディア掲載" }));
    expect(pushMock).toHaveBeenCalledWith("/news?category=media");
  });

  it("Allクリックで /news", () => {
    render(<CategoryChips locale="ja" activeCategory="media" />);
    fireEvent.click(screen.getByRole("button", { name: "すべて" }));
    expect(pushMock).toHaveBeenCalledWith("/news");
  });

  it("locale=en /en/news プレフィックス", () => {
    render(<CategoryChips locale="en" activeCategory={undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Media" }));
    expect(pushMock).toHaveBeenCalledWith("/en/news?category=media");
  });

  it("en All ラベルが All", () => {
    render(<CategoryChips locale="en" activeCategory={undefined} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/components/news/CategoryChips.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/components/news/CategoryChips.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";

import { NEWS_CATEGORIES, type NewsCategoryId } from "@/constants/news";

type Locale = "ja" | "en";

interface CategoryChipsProps {
  locale: Locale;
  activeCategory: NewsCategoryId | undefined;
}

function basePath(locale: Locale): string {
  return locale === "ja" ? "/news" : "/en/news";
}

function allLabel(locale: Locale): string {
  return locale === "ja" ? "すべて" : "All";
}

export function CategoryChips({ locale, activeCategory }: CategoryChipsProps) {
  const router = useRouter();

  function handleClick(id: NewsCategoryId | null) {
    if (id === null) router.push(basePath(locale));
    else router.push(`${basePath(locale)}?category=${id}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        type="button"
        aria-pressed={activeCategory === undefined}
        onClick={() => handleClick(null)}
        className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${
          activeCategory === undefined
            ? "border-accent text-accent"
            : "border-text-gray/40 text-text-gray hover:border-text-light/60"
        }`}
      >
        {allLabel(locale)}
      </button>
      {NEWS_CATEGORIES.map((c) => {
        const label = locale === "ja" ? c.labelJa : c.labelEn;
        const active = activeCategory === c.id;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleClick(c.id)}
            className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${
              active
                ? "border-accent text-accent"
                : "border-text-gray/40 text-text-gray hover:border-text-light/60"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/components/news/CategoryChips.test.tsx`
期待: 7 PASS

- [ ] **Step 5: コミット**

```bash
git add src/components/news/CategoryChips.tsx src/components/news/CategoryChips.test.tsx
git commit -m "feat: CategoryChips (クライアントコンポーネント)"
```

---

## Task 15: LoadMoreButton

**Files:** Create `src/components/news/LoadMoreButton.tsx` + test

- [ ] **Step 1: テスト**

`src/components/news/LoadMoreButton.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoadMoreButton } from "./LoadMoreButton";
import { makeNewsItem, makeNewsList } from "../../../__mocks__/microcms-fixtures";

describe("LoadMoreButton", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("初期ボタン描画", () => {
    render(<LoadMoreButton locale="ja" initialTotal={20} initialCount={12} category={undefined} />);
    expect(screen.getByRole("button", { name: /もっと見る/ })).toBeInTheDocument();
  });

  it("locale=en 英語ラベル", () => {
    render(<LoadMoreButton locale="en" initialTotal={20} initialCount={12} category={undefined} />);
    expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
  });

  it("total到達でボタン非表示+以上です", () => {
    render(<LoadMoreButton locale="ja" initialTotal={12} initialCount={12} category={undefined} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("以上です")).toBeInTheDocument();
  });

  it("クリックで fetch → カード追加", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => makeNewsList([
        makeNewsItem({ id: "n1", slug: "n1", title: "追加1" }),
        makeNewsItem({ id: "n2", slug: "n2", title: "追加2" }),
      ], 20),
    });
    render(<LoadMoreButton locale="ja" initialTotal={20} initialCount={12} category={undefined} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => { expect(screen.getByText("追加1")).toBeInTheDocument(); });
    expect(global.fetch).toHaveBeenCalledWith("/api/news?locale=ja&offset=12");
  });

  it("category がクエリに付く", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, json: async () => makeNewsList([], 20),
    });
    render(<LoadMoreButton locale="ja" initialTotal={20} initialCount={12} category="media" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/news?locale=ja&offset=12&category=media");
    });
  });

  it("ロード中disabled", async () => {
    let resolveFn: (v: unknown) => void = () => {};
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((r) => { resolveFn = r; }),
    );
    render(<LoadMoreButton locale="ja" initialTotal={20} initialCount={12} category={undefined} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toBeDisabled();
    resolveFn({ ok: true, json: async () => makeNewsList([], 20) });
    await waitFor(() => expect(screen.queryByText("以上です")).toBeInTheDocument());
  });

  it("通信失敗でエラー表示", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
    render(<LoadMoreButton locale="ja" initialTotal={20} initialCount={12} category={undefined} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText(/読み込みに失敗/)).toBeInTheDocument());
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("!ok でもエラー", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false, status: 500,
    });
    render(<LoadMoreButton locale="ja" initialTotal={20} initialCount={12} category={undefined} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText(/読み込みに失敗/)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/components/news/LoadMoreButton.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/components/news/LoadMoreButton.tsx`:

```typescript
"use client";

import { useState } from "react";

import { NewsCard } from "./NewsCard";
import { NEWS_PAGE_SIZE, type NewsCategoryId } from "@/constants/news";
import type { NewsItem, NewsList } from "@/lib/microcms/schema";

type Locale = "ja" | "en";

interface LoadMoreButtonProps {
  locale: Locale;
  initialTotal: number;
  initialCount: number;
  category: NewsCategoryId | undefined;
}

export function LoadMoreButton({
  locale, initialTotal, initialCount, category,
}: LoadMoreButtonProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loaded, setLoaded] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = initialTotal;
  const done = loaded >= total;

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ locale, offset: String(loaded) });
      if (category) params.set("category", category);
      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as NewsList;
      setItems((prev) => [...prev, ...data.contents]);
      setLoaded((prev) => prev + data.contents.length);
    } catch {
      setError(locale === "ja"
        ? "読み込みに失敗しました。もう一度お試しください。"
        : "Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-12">
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      )}
      <div className="text-center">
        {done ? (
          <p className="text-text-gray text-sm">
            {locale === "ja" ? "以上です" : "End of list"}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="px-8 py-3 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
          >
            {loading
              ? locale === "ja" ? "読み込み中…" : "Loading…"
              : locale === "ja"
                ? `もっと見る (+${Math.min(NEWS_PAGE_SIZE, total - loaded)})`
                : `Load more (+${Math.min(NEWS_PAGE_SIZE, total - loaded)})`}
          </button>
        )}
        {error && <p className="mt-4 text-sm text-text-light/80">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/components/news/LoadMoreButton.test.tsx`
期待: 8 PASS

- [ ] **Step 5: コミット**

```bash
git add src/components/news/LoadMoreButton.tsx src/components/news/LoadMoreButton.test.tsx
git commit -m "feat: LoadMoreButton (クライアント追加ロード)"
```

---

## Task 16: PreviewBanner

**Files:** Create `src/components/news/PreviewBanner.tsx` + test

- [ ] **Step 1: テスト**

`src/components/news/PreviewBanner.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PreviewBanner } from "./PreviewBanner";

describe("PreviewBanner", () => {
  it("ja 日本語", () => {
    render(<PreviewBanner locale="ja" />);
    expect(screen.getByText(/プレビューモード/)).toBeInTheDocument();
  });
  it("en 英語", () => {
    render(<PreviewBanner locale="en" />);
    expect(screen.getByText(/Preview mode/i)).toBeInTheDocument();
  });
  it("終了リンクが /api/draft/disable", () => {
    render(<PreviewBanner locale="ja" />);
    expect(screen.getByRole("link", { name: /終了/ }))
      .toHaveAttribute("href", "/api/draft/disable");
  });
  it("role=status + aria-live=polite", () => {
    render(<PreviewBanner locale="ja" />);
    const b = screen.getByRole("status");
    expect(b).toHaveAttribute("aria-live", "polite");
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/components/news/PreviewBanner.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/components/news/PreviewBanner.tsx`:

```typescript
type Locale = "ja" | "en";

interface PreviewBannerProps { locale: Locale; }

export function PreviewBanner({ locale }: PreviewBannerProps) {
  const label = locale === "ja" ? "プレビューモード中" : "Preview mode";
  const linkLabel = locale === "ja" ? "終了" : "Exit";
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-50 bg-accent text-primary text-xs tracking-wider py-2 text-center"
    >
      {label}
      <a href="/api/draft/disable" className="ml-4 underline">{linkLabel}</a>
    </div>
  );
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/components/news/PreviewBanner.test.tsx`
期待: 4 PASS

- [ ] **Step 5: コミット**

```bash
git add src/components/news/PreviewBanner.tsx src/components/news/PreviewBanner.test.tsx
git commit -m "feat: PreviewBanner"
```

---

## Task 17: NewsArticleJsonLd

**Files:** Create `src/components/news/NewsArticleJsonLd.tsx` + test

- [ ] **Step 1: テスト**

`src/components/news/NewsArticleJsonLd.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { NewsArticleJsonLd } from "./NewsArticleJsonLd";
import { makeNewsItem } from "../../../__mocks__/microcms-fixtures";

function readJsonLd() {
  const s = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  return JSON.parse(s?.textContent ?? "{}") as Record<string, unknown>;
}

describe("NewsArticleJsonLd", () => {
  it("NewsArticle スキーマ", () => {
    render(<NewsArticleJsonLd item={makeNewsItem({
      title: "T", slug: "s",
      publishedAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-02T00:00:00.000Z",
    })} locale="ja" />);
    const d = readJsonLd();
    expect(d["@type"]).toBe("NewsArticle");
    expect(d.headline).toBe("T");
    expect(d.inLanguage).toBe("ja");
    expect(d.datePublished).toBe("2026-04-01T00:00:00.000Z");
    expect(d.dateModified).toBe("2026-04-02T00:00:00.000Z");
  });

  it("eyecatch があれば image に", () => {
    render(<NewsArticleJsonLd item={makeNewsItem({ title: "w" })} locale="ja" />);
    expect(readJsonLd().image).toBeDefined();
  });

  it("publishedAt 無しは createdAt", () => {
    const base = makeNewsItem({ createdAt: "2026-02-02T00:00:00.000Z" });
    const { publishedAt: _p, ...rest } = base;
    void _p;
    render(<NewsArticleJsonLd item={rest} locale="ja" />);
    expect(readJsonLd().datePublished).toBe("2026-02-02T00:00:00.000Z");
  });

  it("locale=en inLanguage=en", () => {
    render(<NewsArticleJsonLd item={makeNewsItem()} locale="en" />);
    expect(readJsonLd().inLanguage).toBe("en");
  });

  it("eyecatch 無しは image なし", () => {
    const base = makeNewsItem();
    const { eyecatch: _e, ...rest } = base;
    void _e;
    render(<NewsArticleJsonLd item={rest} locale="ja" />);
    expect(readJsonLd().image).toBeUndefined();
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/components/news/NewsArticleJsonLd.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/components/news/NewsArticleJsonLd.tsx`:

```typescript
import { SITE_URL } from "@/constants/site";
import { generateExcerpt } from "@/lib/news/excerpt";
import type { NewsItem } from "@/lib/microcms/schema";

type Locale = "ja" | "en";

interface NewsArticleJsonLdProps { item: NewsItem; locale: Locale; }

export function NewsArticleJsonLd({ item, locale }: NewsArticleJsonLdProps) {
  const url = `${SITE_URL}${locale === "ja" ? "" : "/en"}/news/${item.slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: generateExcerpt(item.body),
    datePublished: item.publishedAt ?? item.createdAt,
    dateModified: item.updatedAt,
    inLanguage: locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: { "@type": "Organization", name: "THE PICKLE BANG THEORY" },
  };
  if (item.eyecatch) {
    data.image = `${item.eyecatch.url}?w=1200&fm=jpg`;
  }
  return (
    <script
      type="application/ld+json"
      // Content is serialized via JSON.stringify, no XSS risk
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/components/news/NewsArticleJsonLd.test.tsx`
期待: 5 PASS

- [ ] **Step 5: コミット**

```bash
git add src/components/news/NewsArticleJsonLd.tsx src/components/news/NewsArticleJsonLd.test.tsx
git commit -m "feat: NewsArticle JSON-LD"
```

---

## Task 18: ニュース一覧ページ + loading + error

**Files:**
- Create: `src/app/[locale]/news/page.tsx` + test
- Create: `src/app/[locale]/news/loading.tsx`
- Create: `src/app/[locale]/news/error.tsx` + test

- [ ] **Step 1: messages に News セクション追加**

`messages/ja.json` トップレベルに追加（既存 `news` は残す）:

```json
"News": { "heading": "ニュース" }
```

`messages/en.json` トップレベルに追加:

```json
"News": { "heading": "News" }
```

- [ ] **Step 2: page.tsx のテスト**

`src/app/[locale]/news/page.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeNewsItem, makeNewsList } from "../../../../__mocks__/microcms-fixtures";

const getNewsListMock = vi.fn();
const notFoundMock = vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); });
vi.mock("@/lib/microcms/queries", () => ({
  getNewsList: (args: unknown) => getNewsListMock(args),
}));
vi.mock("next/navigation", () => ({ notFound: () => notFoundMock() }));
vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async () => (k: string) => (k === "heading" ? "ニュース" : k),
}));
vi.mock("next-intl", () => ({
  hasLocale: (_l: readonly string[], v: string) => v === "ja" || v === "en",
}));
vi.mock("@/config/featureFlags", () => ({ isCmsNewsEnabled: () => true }));
vi.mock("next/headers", () => ({ draftMode: async () => ({ isEnabled: false }) }));

async function renderPage(
  params: { locale: string },
  search: Record<string, string> = {},
) {
  const { default: NewsPage } = await import("./page");
  const jsx = await NewsPage({
    params: Promise.resolve(params),
    searchParams: Promise.resolve(search),
  });
  render(jsx);
}

describe("NewsPage", () => {
  it("12件カード描画", async () => {
    getNewsListMock.mockResolvedValue(makeNewsList(
      Array.from({ length: 12 }, (_, i) =>
        makeNewsItem({ id: `x${i}`, slug: `s${i}`, title: `T${i}` })), 24));
    await renderPage({ locale: "ja" });
    expect(screen.getByText("T0")).toBeInTheDocument();
    expect(screen.getByText("T11")).toBeInTheDocument();
  });

  it("category を渡す", async () => {
    getNewsListMock.mockResolvedValue(makeNewsList([]));
    await renderPage({ locale: "ja" }, { category: "media" });
    expect(getNewsListMock).toHaveBeenCalledWith(
      expect.objectContaining({ category: "media", offset: 0, limit: 12 }),
    );
  });

  it("不正category で notFound", async () => {
    await expect(renderPage({ locale: "ja" }, { category: "invalid" }))
      .rejects.toThrow(/NEXT_NOT_FOUND/);
  });

  it("不正locale で notFound", async () => {
    await expect(renderPage({ locale: "fr" })).rejects.toThrow(/NEXT_NOT_FOUND/);
  });

  it("flag OFF で notFound", async () => {
    vi.resetModules();
    vi.doMock("@/config/featureFlags", () => ({ isCmsNewsEnabled: () => false }));
    await expect(renderPage({ locale: "ja" })).rejects.toThrow(/NEXT_NOT_FOUND/);
    vi.doUnmock("@/config/featureFlags");
  });

  it("空リストメッセージ", async () => {
    getNewsListMock.mockResolvedValue(makeNewsList([], 0));
    await renderPage({ locale: "ja" });
    expect(screen.getByText(/表示できるニュースはありません/)).toBeInTheDocument();
  });

  it("draft時にPreviewBanner", async () => {
    vi.resetModules();
    vi.doMock("next/headers", () => ({ draftMode: async () => ({ isEnabled: true }) }));
    getNewsListMock.mockResolvedValue(makeNewsList([]));
    await renderPage({ locale: "ja" });
    expect(screen.getByRole("status")).toBeInTheDocument();
    vi.doUnmock("next/headers");
  });
});
```

- [ ] **Step 3: 失敗確認**

Run: `npx vitest run src/app/[locale]/news/page.test.tsx`
期待: FAIL

- [ ] **Step 4: 実装**

`src/app/[locale]/news/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { isCmsNewsEnabled } from "@/config/featureFlags";
import { NEWS_CATEGORIES, NEWS_PAGE_SIZE, type NewsCategoryId } from "@/constants/news";
import { getNewsList } from "@/lib/microcms/queries";
import { NewsCard } from "@/components/news/NewsCard";
import { CategoryChips } from "@/components/news/CategoryChips";
import { LoadMoreButton } from "@/components/news/LoadMoreButton";
import { PreviewBanner } from "@/components/news/PreviewBanner";

type Locale = "ja" | "en";

interface NewsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseCategory(raw: string): NewsCategoryId | null {
  const found = NEWS_CATEGORIES.find((c) => c.id === raw);
  return found ? found.id : null;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: NewsPageProps) {
  const { locale } = await params;
  const title = locale === "ja"
    ? "ニュース | THE PICKLE BANG THEORY"
    : "News | THE PICKLE BANG THEORY";
  const description = locale === "ja"
    ? "最新のお知らせ・メディア掲載・イベント情報"
    : "Latest announcements, media coverage, and event information";
  return { title, description };
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  if (!isCmsNewsEnabled()) notFound();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  let category: NewsCategoryId | undefined;
  if (typeof sp.category === "string") {
    const parsed = parseCategory(sp.category);
    if (parsed === null) notFound();
    category = parsed;
  }

  const t = await getTranslations("News");
  const draft = await draftMode();
  const list = await getNewsList({
    locale: locale as Locale, limit: NEWS_PAGE_SIZE, offset: 0, category,
  });

  return (
    <section className="min-h-screen bg-primary text-text-light py-16 lg:py-24">
      {draft.isEnabled && <PreviewBanner locale={locale as Locale} />}
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <p className="text-xs tracking-[0.3em] text-text-gray uppercase mb-4">News</p>
        <h1 className="text-text-light text-3xl lg:text-4xl font-bold mb-8">
          {t("heading")}
        </h1>
        <CategoryChips locale={locale as Locale} activeCategory={category} />
        {list.contents.length === 0 ? (
          <p className="text-text-gray py-16">
            {locale === "ja"
              ? "現在表示できるニュースはありません。"
              : "No news to show right now."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.contents.map((item) => (
                <NewsCard key={item.id} item={item} locale={locale as Locale} />
              ))}
            </div>
            <LoadMoreButton
              locale={locale as Locale}
              initialTotal={list.totalCount}
              initialCount={list.contents.length}
              category={category}
            />
          </>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: loading.tsx**

`src/app/[locale]/news/loading.tsx`:

```typescript
export default function Loading() {
  return (
    <section className="min-h-screen bg-primary py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-text-gray/10">
              <div className="aspect-[16/9] bg-text-gray/10 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 bg-text-gray/10 animate-pulse" />
                <div className="h-4 w-full bg-text-gray/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: error.tsx + test**

`src/app/[locale]/news/error.tsx`:

```typescript
"use client";

interface ErrorProps { error: Error; reset: () => void; }

export default function NewsError({ reset }: ErrorProps) {
  return (
    <section className="min-h-screen bg-primary text-text-light flex items-center justify-center">
      <div className="text-center space-y-6">
        <p>ニュースの読み込みに失敗しました。</p>
        <button
          type="button"
          onClick={reset}
          className="px-8 py-3 border border-accent text-accent text-sm tracking-wider"
        >
          再試行
        </button>
      </div>
    </section>
  );
}
```

`src/app/[locale]/news/error.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NewsError from "./error";

describe("news error.tsx", () => {
  it("reset ボタンで reset を呼ぶ", () => {
    const reset = vi.fn();
    render(<NewsError error={new Error("x")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(reset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 7: 通過確認**

Run: `npm test -- src/app/[locale]/news`
期待: 全PASS

- [ ] **Step 8: コミット**

```bash
git add src/app/[locale]/news messages/ja.json messages/en.json
git commit -m "feat: ニュース一覧ページ + loading/error + 翻訳キー"
```

---

## Task 19: ニュース詳細ページ + loading

**Files:** Create `src/app/[locale]/news/[slug]/page.tsx` + test + loading

- [ ] **Step 1: テスト**

`src/app/[locale]/news/[slug]/page.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeNewsItem } from "../../../../../__mocks__/microcms-fixtures";

const getNewsDetailMock = vi.fn();
const getNewsSlugsMock = vi.fn();
const notFoundMock = vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); });
vi.mock("@/lib/microcms/queries", () => ({
  getNewsDetail: (args: unknown) => getNewsDetailMock(args),
  getNewsSlugs: () => getNewsSlugsMock(),
}));
vi.mock("next/navigation", () => ({ notFound: () => notFoundMock() }));
vi.mock("next-intl/server", () => ({ setRequestLocale: vi.fn() }));
vi.mock("next-intl", () => ({
  hasLocale: (_l: readonly string[], v: string) => v === "ja" || v === "en",
}));
vi.mock("@/config/featureFlags", () => ({ isCmsNewsEnabled: () => true }));
vi.mock("next/headers", () => ({ draftMode: async () => ({ isEnabled: false }) }));

async function renderPage(params: { locale: string; slug: string }) {
  const { default: Detail } = await import("./page");
  const jsx = await Detail({ params: Promise.resolve(params) });
  render(jsx);
}

describe("NewsDetailPage", () => {
  it("記事+JSON-LD描画", async () => {
    getNewsDetailMock.mockResolvedValue(makeNewsItem({
      title: "本件", slug: "x", body: "<p>hi</p>",
    }));
    await renderPage({ locale: "ja", slug: "x" });
    expect(screen.getByRole("heading", { name: "本件" })).toBeInTheDocument();
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeNull();
  });

  it("記事なし notFound", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    await expect(renderPage({ locale: "ja", slug: "none" }))
      .rejects.toThrow(/NEXT_NOT_FOUND/);
  });

  it("flag OFF notFound", async () => {
    vi.resetModules();
    vi.doMock("@/config/featureFlags", () => ({ isCmsNewsEnabled: () => false }));
    await expect(renderPage({ locale: "ja", slug: "x" }))
      .rejects.toThrow(/NEXT_NOT_FOUND/);
    vi.doUnmock("@/config/featureFlags");
  });

  it("不正locale notFound", async () => {
    await expect(renderPage({ locale: "fr", slug: "x" }))
      .rejects.toThrow(/NEXT_NOT_FOUND/);
  });

  it("externalLink ボタン", async () => {
    getNewsDetailMock.mockResolvedValue(makeNewsItem({
      slug: "x",
      externalLink: { label: "詳しくはこちら", url: "https://example.com" },
    }));
    await renderPage({ locale: "ja", slug: "x" });
    const a = screen.getByRole("link", { name: /詳しくはこちら/ });
    expect(a).toHaveAttribute("href", "https://example.com");
    expect(a).toHaveAttribute("target", "_blank");
  });

  it("戻るリンク /news", async () => {
    getNewsDetailMock.mockResolvedValue(makeNewsItem({ slug: "x" }));
    await renderPage({ locale: "ja", slug: "x" });
    expect(screen.getByRole("link", { name: /一覧/ })).toHaveAttribute("href", "/news");
  });

  it("locale=en 戻るリンク /en/news", async () => {
    getNewsDetailMock.mockResolvedValue(makeNewsItem({ slug: "x", locale: "en" }));
    await renderPage({ locale: "en", slug: "x" });
    expect(screen.getByRole("link", { name: /news index/i }))
      .toHaveAttribute("href", "/en/news");
  });

  it("generateStaticParams が全slug返す", async () => {
    getNewsSlugsMock.mockResolvedValue([
      { locale: "ja", slug: "a" },
      { locale: "en", slug: "b" },
    ]);
    const { generateStaticParams } = await import("./page");
    const r = await generateStaticParams();
    expect(r).toEqual([
      { locale: "ja", slug: "a" },
      { locale: "en", slug: "b" },
    ]);
  });

  it("generateMetadata title", async () => {
    getNewsDetailMock.mockResolvedValue(makeNewsItem({ title: "T", slug: "x" }));
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta.title).toContain("T");
  });

  it("generateMetadata 記事なし空", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta).toEqual({});
  });

  it("draftモードで noindex", async () => {
    vi.resetModules();
    vi.doMock("next/headers", () => ({ draftMode: async () => ({ isEnabled: true }) }));
    getNewsDetailMock.mockResolvedValue(makeNewsItem({ title: "T", slug: "x" }));
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
    vi.doUnmock("next/headers");
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/app/[locale]/news/[slug]/page.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/app/[locale]/news/[slug]/page.tsx`:

```typescript
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { routing } from "@/i18n/routing";
import { isCmsNewsEnabled } from "@/config/featureFlags";
import { EXTERNAL_LINK_PROPS } from "@/constants/site";
import { NEWS_CATEGORIES } from "@/constants/news";
import { getNewsDetail, getNewsSlugs } from "@/lib/microcms/queries";
import { generateExcerpt } from "@/lib/news/excerpt";
import { NewsArticleJsonLd } from "@/components/news/NewsArticleJsonLd";
import { RichEditorContent } from "@/components/news/RichEditorContent";
import { PreviewBanner } from "@/components/news/PreviewBanner";

import type { Metadata } from "next";

type Locale = "ja" | "en";

interface PageProps { params: Promise<{ locale: string; slug: string }>; }

export async function generateStaticParams() {
  return getNewsSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const item = await getNewsDetail({ locale: locale as Locale, slug });
  if (!item) return {};
  const draft = await draftMode();
  return {
    title: `${item.title} | THE PICKLE BANG THEORY`,
    description: generateExcerpt(item.body),
    ...(draft.isEnabled ? { robots: { index: false, follow: false } } : {}),
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function NewsDetailPage({ params }: PageProps) {
  if (!isCmsNewsEnabled()) notFound();
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const item = await getNewsDetail({ locale: locale as Locale, slug });
  if (!item) notFound();

  const draft = await draftMode();
  const cat = NEWS_CATEGORIES.find((c) => c.id === item.category[0]);
  const backHref = locale === "ja" ? "/news" : "/en/news";
  const backLabel = locale === "ja" ? "← ニュース一覧へ" : "← News index";

  return (
    <article className="min-h-screen bg-primary text-text-light py-16 lg:py-24">
      {draft.isEnabled && <PreviewBanner locale={locale as Locale} />}
      <NewsArticleJsonLd item={item} locale={locale as Locale} />
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <Link href={backHref} className="text-xs tracking-wider text-text-gray">
          {backLabel}
        </Link>
        <div className="mt-6 flex items-center gap-3 text-xs">
          {cat && (
            <span
              className="inline-block px-2 py-0.5 border"
              style={{ borderColor: cat.color, color: cat.color }}
            >
              {locale === "ja" ? cat.labelJa : cat.labelEn}
            </span>
          )}
          <time dateTime={(item.publishedAt ?? item.createdAt).slice(0, 10)}>
            {formatDate(item.publishedAt ?? item.createdAt)}
          </time>
        </div>
        <h1 className="mt-4 text-2xl lg:text-4xl font-bold leading-tight">
          {item.title}
        </h1>
        {item.eyecatch && (
          <div className="mt-8">
            <Image
              src={`${item.eyecatch.url}?w=1200&fm=webp&q=80`}
              alt=""
              width={1200}
              height={Math.round((item.eyecatch.height / item.eyecatch.width) * 1200)}
              className="w-full h-auto"
              priority
            />
          </div>
        )}
        <div className="mt-10">
          <RichEditorContent html={item.body} />
        </div>
        {item.externalLink && (
          <div className="mt-10">
            <a
              href={item.externalLink.url}
              {...EXTERNAL_LINK_PROPS}
              className="inline-flex items-center gap-2 px-6 py-3 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-primary transition-colors"
            >
              {item.externalLink.label}
              <span>→</span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 4: loading.tsx**

`src/app/[locale]/news/[slug]/loading.tsx`:

```typescript
export default function Loading() {
  return (
    <section className="min-h-screen bg-primary py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-12 space-y-6">
        <div className="h-3 w-32 bg-text-gray/10 animate-pulse" />
        <div className="h-10 w-3/4 bg-text-gray/10 animate-pulse" />
        <div className="aspect-[16/9] bg-text-gray/10 animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-text-gray/10 animate-pulse" />
          <div className="h-4 bg-text-gray/10 animate-pulse" />
          <div className="h-4 w-2/3 bg-text-gray/10 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: 通過確認**

Run: `npx vitest run src/app/[locale]/news/[slug]/page.test.tsx`
期待: 11 PASS

- [ ] **Step 6: コミット**

```bash
git add src/app/[locale]/news/[slug]
git commit -m "feat: ニュース詳細ページ (JSON-LD + RichEditor + プレビュー)"
```

---

## Task 20: 動的OGP画像

**Files:** Create `src/app/[locale]/news/[slug]/opengraph-image.tsx` + test

- [ ] **Step 1: テスト**

`src/app/[locale]/news/[slug]/opengraph-image.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";

const getNewsDetailMock = vi.fn();
vi.mock("@/lib/microcms/queries", () => ({
  getNewsDetail: (args: unknown) => getNewsDetailMock(args),
}));

describe("news detail opengraph-image", () => {
  it("eyecatchあり: 302 で画像URLへ", async () => {
    getNewsDetailMock.mockResolvedValue({
      slug: "x", locale: "ja",
      eyecatch: { url: "https://images.microcms-assets.io/e.jpg", width: 1, height: 1 },
    });
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({ params: Promise.resolve({ locale: "ja", slug: "x" }) });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toContain("e.jpg");
    expect(res.headers.get("location") ?? "").toContain("w=1200");
  });

  it("eyecatchなし: 共通OGP", async () => {
    getNewsDetailMock.mockResolvedValue({ slug: "x", locale: "ja", eyecatch: undefined });
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({ params: Promise.resolve({ locale: "ja", slug: "x" }) });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toMatch(/opengraph-image/);
  });

  it("記事なし: 共通OGP", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({ params: Promise.resolve({ locale: "ja", slug: "none" }) });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toMatch(/opengraph-image/);
  });

  it("不正locale: 共通OGPへ", async () => {
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({ params: Promise.resolve({ locale: "fr", slug: "x" }) });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toMatch(/opengraph-image/);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/app/[locale]/news/[slug]/opengraph-image.test.tsx`
期待: FAIL

- [ ] **Step 3: 実装**

`src/app/[locale]/news/[slug]/opengraph-image.tsx`:

```typescript
import { getNewsDetail } from "@/lib/microcms/queries";
import { SITE_URL } from "@/constants/site";

export const runtime = "nodejs";
export const alt = "THE PICKLE BANG THEORY";
export const contentType = "image/jpeg";
export const size = { width: 1200, height: 630 };

type Locale = "ja" | "en";

interface Params { params: Promise<{ locale: string; slug: string }>; }

export default async function Image({ params }: Params): Promise<Response> {
  const { locale, slug } = await params;
  const fallback = `${SITE_URL}${locale === "en" ? "/en" : ""}/opengraph-image`;
  if (locale !== "ja" && locale !== "en") {
    return Response.redirect(fallback, 302);
  }
  const item = await getNewsDetail({ locale: locale as Locale, slug });
  if (!item?.eyecatch) {
    return Response.redirect(fallback, 302);
  }
  const url = `${item.eyecatch.url}?w=1200&h=630&fit=crop&fm=jpg`;
  return Response.redirect(url, 302);
}
```

- [ ] **Step 4: 通過確認**

Run: `npx vitest run src/app/[locale]/news/[slug]/opengraph-image.test.tsx`
期待: 4 PASS

- [ ] **Step 5: コミット**

```bash
git add src/app/[locale]/news/[slug]/opengraph-image.tsx src/app/[locale]/news/[slug]/opengraph-image.test.tsx
git commit -m "feat: ニュース詳細の動的OGP (アイキャッチ→フォールバック)"
```

---

## Task 21: サイトマップ拡張

**Files:** Modify `src/app/sitemap.ts` + `src/app/sitemap.test.ts`

- [ ] **Step 1: テスト追記**

`src/app/sitemap.test.ts` の `beforeEach` を以下に置き換え（各 `describe` 内にも追加）:

```typescript
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", PROD_URL);
  vi.doMock("@/lib/microcms/queries", () => ({
    getNewsSlugs: async () => [],
  }));
});
```

既存の `it` 内の `sitemap()` 呼び出しを **すべて `await sitemap()`** に変更。

さらに末尾に以下を追加:

```typescript
describe("news sitemap entries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PROD_URL);
  });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("ニュース一覧 /news を含む", async () => {
    vi.doMock("@/lib/microcms/queries", () => ({ getNewsSlugs: async () => [] }));
    const { default: sitemap } = await import("./sitemap");
    const entries = await sitemap();
    expect(entries.map((e) => e.url)).toContain(`${PROD_URL}/news`);
  });

  it("ニュース詳細をslugごとに含む", async () => {
    vi.doMock("@/lib/microcms/queries", () => ({
      getNewsSlugs: async () => [
        { locale: "ja", slug: "s1" },
        { locale: "en", slug: "s2" },
      ],
    }));
    const { default: sitemap } = await import("./sitemap");
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain(`${PROD_URL}/news/s1`);
    expect(urls).toContain(`${PROD_URL}/en/news/s2`);
  });
});
```

- [ ] **Step 2: sitemap.ts を更新**

`src/app/sitemap.ts`:

```typescript
import { SITE_URL } from "@/constants/site";
import { SITEMAP_ROUTES } from "@/constants/routes";
import { getNewsSlugs } from "@/lib/microcms/queries";

import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = SITEMAP_ROUTES.map(
    ({ path, priority, changeFrequency }) => {
      const jaPath = path === "/" ? "" : path;
      const enPath = path === "/" ? "/en" : `/en${path}`;
      const jaUrl = `${SITE_URL}${jaPath}`;
      const enUrl = `${SITE_URL}${enPath}`;
      return {
        url: jaUrl,
        changeFrequency,
        priority,
        alternates: {
          languages: { ja: jaUrl, en: enUrl, "x-default": jaUrl },
        },
      };
    },
  );

  const newsIndex: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/news`,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: {
      languages: {
        ja: `${SITE_URL}/news`,
        en: `${SITE_URL}/en/news`,
        "x-default": `${SITE_URL}/news`,
      },
    },
  }];

  const slugs = await getNewsSlugs();
  const newsDetails: MetadataRoute.Sitemap = slugs.map(({ locale, slug }) => ({
    url: locale === "ja" ? `${SITE_URL}/news/${slug}` : `${SITE_URL}/en/news/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...newsIndex, ...newsDetails];
}
```

- [ ] **Step 3: 通過確認**

Run: `npx vitest run src/app/sitemap.test.ts`
期待: 全PASS

- [ ] **Step 4: コミット**

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat: サイトマップに /news と詳細URLを追加"
```

---

## Task 22: About 05 NEWS セクションの CMS 連携化

**Files:**
- Modify: `src/app/[locale]/about/AboutContent.tsx` + `about.test.tsx`
- Modify: `src/app/[locale]/about/page.tsx`

- [ ] **Step 1: 現状を確認**

Run: `grep -n "news" src/app/[locale]/about/AboutContent.tsx | head`

- [ ] **Step 2: page.tsx を更新**

`src/app/[locale]/about/page.tsx` のレンダリング部分を修正（既存の `<AboutContent />` 呼び出しを置き換え）:

```typescript
// page.tsx 先頭に import 追加
import { ABOUT_NEWS_LIMIT } from "@/constants/news";
import { isCmsNewsEnabled } from "@/config/featureFlags";
import { getNewsList } from "@/lib/microcms/queries";

// default export 関数内（既存の await params/setRequestLocale の後）に追記
const newsItems = isCmsNewsEnabled()
  ? (await getNewsList({
      locale: locale as "ja" | "en",
      limit: ABOUT_NEWS_LIMIT,
      offset: 0,
    })).contents
  : [];

// return 文で AboutContent に props を渡す
return <AboutContent newsItems={newsItems} locale={locale as "ja" | "en"} />;
```

- [ ] **Step 3: AboutContent.tsx を変更**

`src/app/[locale]/about/AboutContent.tsx` に以下の修正を行う:

1. 先頭の import に追加:

```typescript
import Link from "next/link";
import { isCmsNewsEnabled } from "@/config/featureFlags";
import { generateExcerpt } from "@/lib/news/excerpt";
import type { NewsItem } from "@/lib/microcms/schema";
```

2. コンポーネントシグネチャを変更:

```typescript
interface AboutContentProps {
  newsItems: NewsItem[];
  locale: "ja" | "en";
}

export function AboutContent({ newsItems, locale }: AboutContentProps) {
```

3. 既存の「05 -- NEWS」セクション内 `<div className="space-y-10">…</div>` を以下に差し替える:

```tsx
<div className="space-y-10">
  {isCmsNewsEnabled() && newsItems.length > 0 ? (
    <>
      {newsItems.map((item) => {
        const href = locale === "ja" ? `/news/${item.slug}` : `/en/news/${item.slug}`;
        return (
          <div key={item.id} className="border-l-2 border-accent/20 pl-6 lg:pl-8">
            <h3 className="text-accent text-lg lg:text-xl font-bold mb-3">
              {item.title}
            </h3>
            <p className="text-text-light/90 text-base lg:text-lg leading-relaxed mb-4 max-w-3xl">
              {generateExcerpt(item.body)}
            </p>
            <Link
              href={href}
              className="group inline-flex items-center gap-2 text-accent text-sm tracking-wide"
            >
              {locale === "ja" ? "続きを読む" : "Read more"}
              <span className="inline-block text-lg motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        );
      })}
      <Link
        href={locale === "ja" ? "/news" : "/en/news"}
        className="inline-flex items-center gap-2 text-text-light text-sm tracking-wide"
      >
        {locale === "ja" ? "すべてのニュースを見る" : "View all news"}
        <span>→</span>
      </Link>
    </>
  ) : (
    <>
      {/* 旧ハードコード (Feature Flag OFF時のフォールバック) */}
      <div className="border-l-2 border-accent/20 pl-6 lg:pl-8">
        <h3 className="text-accent text-lg lg:text-xl font-bold mb-3">
          {t("news.crowdfundingHeadline")}
        </h3>
        <p className="text-text-light/90 text-base lg:text-lg leading-relaxed mb-4 max-w-3xl">
          {t("news.crowdfundingBody")}
        </p>
        <a
          href={CAMPFIRE_URL}
          {...EXTERNAL_LINK_PROPS}
          className="group inline-flex items-center gap-2 text-accent text-sm tracking-wide"
        >
          {t("news.crowdfundingLink")}
          <span className="inline-block text-lg motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
      <div className="border-l-2 border-accent/20 pl-6 lg:pl-8">
        <p className="text-text-light/90 text-base lg:text-lg leading-relaxed mb-4 max-w-3xl">
          {t("news.body")}
        </p>
        <a
          href="https://prtimes.jp/main/html/rd/p/000000003.000179043.html"
          {...EXTERNAL_LINK_PROPS}
          className="group inline-flex items-center gap-2 text-accent text-sm tracking-wide"
        >
          {t("news.prTimes")}
          <span className="inline-block text-lg motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </>
  )}
</div>
```

さらに `h2` のタイトルを `t("news.title")` から `t("News.heading")` に変更（新 i18n キーを使用）。

- [ ] **Step 4: 既存テスト `about.test.tsx` を更新**

既存の NEWS セクション関連テストが壊れるので修正する。既存 `AboutContent` を呼ぶところを `<AboutContent newsItems={[]} locale="ja" />` に変更。既存の「クラウドファンディング」を探すテストは **Feature flag OFF時のみ通る** よう `vi.doMock("@/config/featureFlags", () => ({ isCmsNewsEnabled: () => false }))` を先頭で設定。

新規テストを追加:

```typescript
describe("AboutContent 05 NEWS (CMS integration)", () => {
  beforeEach(() => { vi.resetModules(); });

  it("flag ON+3件で NewsItem 表示", async () => {
    vi.doMock("@/config/featureFlags", () => ({ isCmsNewsEnabled: () => true }));
    const { AboutContent } = await import("./AboutContent");
    const items = Array.from({ length: 3 }, (_, i) => ({
      id: `n${i}`, slug: `s${i}`, title: `ニュース${i}`,
      createdAt: "2026-04-01T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
      publishedAt: "2026-04-01T00:00:00.000Z",
      locale: "ja" as const, category: ["notice" as const],
      body: "<p>本文</p>",
    }));
    render(<AboutContent newsItems={items} locale="ja" />);
    expect(screen.getByText("ニュース0")).toBeInTheDocument();
    expect(screen.getByText("ニュース2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /すべてのニュース/ }))
      .toHaveAttribute("href", "/news");
  });

  it("flag OFF は旧ハードコード表示", async () => {
    vi.doMock("@/config/featureFlags", () => ({ isCmsNewsEnabled: () => false }));
    const { AboutContent } = await import("./AboutContent");
    render(<AboutContent newsItems={[]} locale="ja" />);
    expect(screen.getByText(/クラウドファンディング/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: 通過確認**

Run: `npm test -- src/app/[locale]/about`
期待: 全PASS

- [ ] **Step 6: コミット**

```bash
git add src/app/[locale]/about
git commit -m "feat: About 05 NEWSをCMS連携化 (flag ONで最新3件, OFFで旧表示)"
```

---

## Task 23: next.config.ts の `remotePatterns`

**Files:** Modify `next.config.ts`

- [ ] **Step 1: 現状確認**

Run: `cat next.config.ts`

- [ ] **Step 2: 編集**

`images` フィールドが無ければ追加、あれば `remotePatterns` に追記:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.microcms-assets.io",
      pathname: "/assets/**",
    },
  ],
},
```

- [ ] **Step 3: 型チェック**

Run: `npx tsc --noEmit`
期待: エラー 0件

- [ ] **Step 4: コミット**

```bash
git add next.config.ts
git commit -m "chore: next.config.ts で microCMS 画像ドメインを許可"
```

---

## Task 24: `.env.local.example` + CLAUDE.md

**Files:** Modify `.env.local.example`, `CLAUDE.md`

- [ ] **Step 1: `.env.local.example` を更新**

存在確認: `ls .env.local.example 2>/dev/null`

追記または新規作成:

```
# microCMS (news CMS)
MICROCMS_SERVICE_DOMAIN=
MICROCMS_API_KEY=
MICROCMS_WEBHOOK_SECRET=
MICROCMS_DRAFT_SECRET=

# Feature flags
NEXT_PUBLIC_USE_CMS_NEWS=false
```

- [ ] **Step 2: CLAUDE.md に環境変数セクションを追加**

`CLAUDE.md` の末尾に追加:

```markdown
## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public site URL (SEO/OGP absolute URLs) |
| `RESEND_API_KEY` | ✅ | Resend API (contact/subscribe) |
| `MICROCMS_SERVICE_DOMAIN` | ✅ | microCMS service subdomain |
| `MICROCMS_API_KEY` | ✅ | microCMS read-only API key |
| `MICROCMS_WEBHOOK_SECRET` | ✅ | Shared secret for /api/revalidate webhook |
| `MICROCMS_DRAFT_SECRET` | ✅ | Shared secret for /api/draft/enable preview |
| `NEXT_PUBLIC_USE_CMS_NEWS` | — | `true` to use CMS news, `false` (default) falls back to hardcoded |
```

- [ ] **Step 3: コミット**

```bash
git add .env.local.example CLAUDE.md
git commit -m "docs: 環境変数の例と仕様"
```

---

## Task 25: 運用マニュアル

**Files:** Create `docs/operations/news-admin-manual.md`

- [ ] **Step 1: マニュアル作成**

`docs/operations/news-admin-manual.md`:

```markdown
# ニュース運用マニュアル

microCMSの管理画面からニュースを投稿・編集する手順です。

## ログイン

1. https://<サービスドメイン>.microcms.io にアクセス
2. 登録したメールアドレス・パスワードでログイン

## 新規ニュースの公開

1. 左サイドバー「API」→「news」
2. 右上「追加」
3. 以下を入力:
   - **タイトル**
   - **スラッグ (slug)**: 半角英数ハイフンのみ、URLに使用される（例: `grand-opening-2026`）
   - **言語 (locale)**: `ja` または `en` をひとつ選択
   - **カテゴリ (category)**: `notice` / `media` / `event` / `campaign` から1つ以上
   - **アイキャッチ**: 推奨 **16:9**、幅 **1200px以上**（1920x1080推奨）
   - **本文 (body)**: リッチエディタ (見出し / 太字 / リンク / 画像埋め込み可)
   - **外部リンク (externalLink)**: 任意。PR TimesやCampfire等の誘導ボタン用
4. 画面右上「公開」→ 「公開」で即時公開
5. 2〜3秒後、本番サイトに自動反映

## 下書き & プレビュー

1. 公開せず「下書き保存」
2. 「画面プレビュー」ボタンで公開前サイトを確認
3. 問題なければ「公開」

## 予約投稿

1. 公開操作時に「公開日時を指定」
2. 日時指定して「公開予約」
3. 指定時刻に自動公開 + サイト反映

## 日英両対応の記事

日英は **別レコード** で登録:
1. `locale=ja` で日本語版を追加
2. **同じslug** + `locale=en` で英語版を追加
3. サイト側で `/news/<slug>` と `/en/news/<slug>` に自動配置

## カテゴリの使い分け

- **お知らせ (notice)**: 営業時間変更、一般情報
- **メディア掲載 (media)**: 新聞・Web記事・TV
- **イベント (event)**: 大会、交流会、体験会
- **キャンペーン (campaign)**: 期間限定割引、CF

## 画像

- microCMS画像は自動でWebP/AVIF最適化
- 元画像は大きめ (1200px以上) でアップ
- **外部URLの画像はリッチエディタには埋められない** → 必ずmicroCMSにアップロード

## トラブルシューティング

- **公開したのにサイト反映されない**: microCMS管理画面の「Webhook履歴」で `/api/revalidate` のHTTPレスポンスを確認。200以外なら開発者に連絡
- **「画面プレビュー」が真っ白**: ブラウザのプライベートモードで再試行、またはCookieを有効化
- **画像が表示されない**: メディアライブラリで該当画像のURLと存在を確認

## 問い合わせ先

- システムトラブル: 開発担当
- 記事内容: 編集責任者
```

- [ ] **Step 2: コミット**

```bash
git add docs/operations/news-admin-manual.md
git commit -m "docs: ニュース運用マニュアル"
```

---

## Task 26: 全体検証

- [ ] **Step 1: 全テスト**

Run: `npm test`
期待: 全PASS

- [ ] **Step 2: カバレッジ100%**

Run: `npm run test:coverage 2>&1 | tail -30`
期待: statements/branches/functions/lines すべて **100%**

**もしカバレッジ不足なら**: 欠けている分岐のテストを追加してから次のStepへ。

- [ ] **Step 3: 型チェック**

Run: `npx tsc --noEmit`
期待: 0件

- [ ] **Step 4: Lint**

Run: `npm run lint`
期待: 0件

- [ ] **Step 5: 本番ビルド**

Run:
```bash
MICROCMS_SERVICE_DOMAIN=dummy \
MICROCMS_API_KEY=dummy \
MICROCMS_WEBHOOK_SECRET=dummy \
MICROCMS_DRAFT_SECRET=dummy \
NEXT_PUBLIC_USE_CMS_NEWS=false \
NEXT_PUBLIC_SITE_URL=https://www.thepicklebang.com \
RESEND_API_KEY=dummy \
npm run build 2>&1 | tail -30
```
期待: Build successful（flag OFFなのでmicroCMS fetchは走らない）

- [ ] **Step 6: 修正が必要なら修正してコミット**

```bash
git add .
git commit -m "fix: 検証で見つかった問題を修正"
```

---

## Task 27: PR作成

- [ ] **Step 1: コミット履歴確認**

Run: `git log --oneline develop..HEAD`
期待: 各タスクのコミットが並ぶ

- [ ] **Step 2: リモート push**

Run: `git push -u origin feature/news-cms-integration`
期待: 成功

- [ ] **Step 3: PR作成（ユーザーに確認してから）**

ユーザーに以下のPR作成を提案:

```bash
gh pr create --base develop --title "feat: ニュースをmicroCMSでCMS化 (一覧/詳細/About連携)" --body "$(cat <<'EOF'
## Summary
- microCMSをヘッドレスCMSとして導入、ニュースの投稿/編集を非エンジニアが実施可能に
- `/news` 一覧ページ + `/news/[slug]` 詳細ページを新設 (日英対応、カテゴリフィルタ、もっと見る)
- About 05 NEWS セクションをCMS連携化 (最新3件)
- プレビュー / 予約投稿 / Webhook ISR / JSON-LD / OGP / サイトマップ全対応
- Feature flag `NEXT_PUBLIC_USE_CMS_NEWS` で段階的ロールアウト可能

設計: `docs/superpowers/specs/2026-04-19-news-cms-integration-design.md`
計画: `docs/superpowers/plans/2026-04-19-news-cms-integration.md`
運用: `docs/operations/news-admin-manual.md`

## Test plan
- [ ] Vercel Preview で microCMS 管理画面から記事投稿 → 自動反映確認
- [ ] 下書きプレビュー動作確認
- [ ] 予約投稿動作確認
- [ ] /news 一覧のカテゴリフィルタ・もっと見る動作
- [ ] /news/[slug] 詳細ページ日英切替
- [ ] About 05 NEWS がCMS記事表示になる (flag ON時)
- [ ] Feature flag OFF で旧ハードコード表示に戻る
- [ ] スマホ実機で各ページレイアウト確認
- [ ] Lighthouse で SEO スコア確認
EOF
)"
```

**PR作成はユーザー承認後に開発者が実行**。本プランでは自動実行しない。

---

## 本プランのスコープ外（フェーズ5-c以降）

- `messages/ja.json` / `messages/en.json` の旧 `news.*` キー削除
- About 内 Feature Flag 分岐コード削除
- `NEXT_PUBLIC_USE_CMS_NEWS` 環境変数削除

→ 2週間本番安定運用を確認した後に別PRで実施。

---

## Self-Review

**Spec coverage:**
- §4 スキーマ → Task 4
- §5 URL/ページ構成 → Task 8-11, 18, 19
- §6 UI/UX → Task 12-17, 18, 19, 22
- §7 運用フロー → Task 8, 9, 10, 12, 17, 20, 21
- §8 Feature Flag → Task 2, 18, 19, 22
- §9 ファイル構成 → 全タスク
- §10 環境変数 → Task 24
- §11 テスト戦略 → 各タスクのTDD + Task 26
- §12 ロールアウト → Task 25, 27
- §13 ロールバック → Task 2 + 22 の flag 分岐
- §14 ハマりポイント → 各実装で対処済み

**Type consistency:**
- `NewsItem` / `NewsList` / `NewsCategoryId` / `Locale` を全タスクで一貫使用
- `getNewsList` / `getNewsDetail` / `getNewsSlugs` シグネチャは Task 6 で定義し Task 8/18/19/21/22 で同一使用
- `isCmsNewsEnabled` は Task 2 で定義し Task 18/19/22 で同名使用

**No placeholders:** 各ステップにコード・コマンド・期待値を明記。
