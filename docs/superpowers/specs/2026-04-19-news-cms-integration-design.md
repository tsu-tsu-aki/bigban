# ニュースCMS化 設計書

**作成日**: 2026-04-19
**ブランチ**: `feature/news-cms-integration`
**対象**: `THE PICKLE BANG THEORY` ブランドサイト（Next.js 16 + next-intl + Vercel）

## 1. 背景と目的

現在、ニュースは `src/app/[locale]/about/AboutContent.tsx` の「05 NEWS」セクションに2件ハードコードされており、`messages/ja.json` / `messages/en.json` の `news.*` キーで多言語管理されている。

今後ニュースの投稿頻度が増え、オーナー（非エンジニア）が直接投稿・管理できる体制が必要になったため、ヘッドレスCMSを導入する。

## 2. 要件サマリ

| 要件 | 内容 |
|------|------|
| 投稿者 | オーナー（非エンジニア）が日本語UIから直接投稿 |
| 投稿件数 | 月10〜20件想定 |
| 言語 | 日本語 / 英語の2言語 |
| コンテンツ | タイトル、本文（リッチテキスト）、アイキャッチ画像、外部リンク、カテゴリ/タグ、公開日時 |
| 運用機能 | 下書き、予約投稿、プレビュー |
| 新設ページ | ニュース一覧、ニュース詳細 |
| 既存ページ影響 | Aboutページ「05 NEWS」セクションをCMS連携に置き換え |
| SEO | 構造化データ（NewsArticle JSON-LD）、サイトマップ登録、OGP |

## 3. 技術選定

### 3.1 CMS：microCMS（Hobby無料プラン）

3者リサーチ（microCMS単体 / 競合7社比較 / Next.js 16統合パターン）の結果、**microCMS採用**で確定。

**採用理由**
- 日本語ネイティブUI（非エンジニアが迷わず操作可能）
- Hobby無料枠で本件要件を満たす（メンバー3名、月20GB転送、商用可）
- imgix内蔵の画像CDNで `next/image` との統合容易
- Next.js 16 App Router + on-demand ISR の成熟パターンが公式・コミュニティに存在

**競合比較で分かった重要事実**
- **Newt は 2026-11-24 サービス終了確定**（候補外）
- **Contentful は2025改定で無料プラン商用不可**（候補外）
- **Payload 3** は技術的魅力があるがVercelサーバレスでのDB接続枯渇・予約投稿コア未実装のため本件要件に不適
- **自前管理画面構築案** も検討したが、初期工数60〜120時間 + 永続的な保守負荷に見合う合理性なしと判断

**リスクと緩和策**
- microCMS値上げリスク → 並行検証用にSanity Freeアカウントを保険で確保しておく
- 月20GB転送量制限 → ダッシュボード定期確認、超過時は Team プラン（¥4,900/月）へ昇格

### 3.2 技術スタック

| レイヤ | 採用技術 | 補足 |
|--------|---------|------|
| CMS | microCMS Hobby | 無料 |
| クライアント | 自前 `fetch` + `next: { tags }` ラッパ | 公式SDKはaxios内部使用でNext.jsキャッシュ統合できないため採用しない |
| バリデーション | Zod | 境界で必ず `parse` |
| HTMLサニタイズ | `isomorphic-dompurify` | リッチエディタHTMLは生文字列で返るため必須 |
| 画像最適化 | `next/image` + microCMS imgix パラメータ | `?w=` `?fm=webp` `?q=` |
| 国際化 | `next-intl 4.9`（既存） | `/[locale]/` セグメント配下 |
| ISR更新 | `revalidateTag` + microCMS Webhook | on-demand |
| プレビュー | `draftMode()` + Cookie経由の `draftKey` | microCMS固有制約に対応 |

## 4. microCMS スキーマ設計

### 4.1 API: `news`

| フィールドID | 表示名 | 型 | 必須 | 説明 |
|-------------|--------|---|------|------|
| `title` | タイトル | テキスト | ✅ | |
| `slug` | スラッグ | テキスト（半角英数ハイフンのみ） | ✅ | URL用、ユニーク |
| `locale` | 言語 | セレクト | ✅ | `ja` / `en` |
| `category` | カテゴリ | セレクト（複数） | ✅ | `notice` / `media` / `event` / `campaign` |
| `eyecatch` | アイキャッチ | 画像 | — | 推奨 16:9、1200px幅以上 |
| `body` | 本文 | リッチエディタ | — | |
| `externalLink` | 外部リンク | オブジェクト `{ label: string, url: string }` | — | PR Times等誘導用 |
| `publishedAt` | 公開日時 | microCMS標準フィールド | — | 予約投稿に使用 |

**カスタムclass**（リッチエディタ用）: `lead`（導入文）/ `caption`（キャプション）

### 4.2 多言語運用方針
- 1エンドポイント `news` に `locale` フィールドで言語を持たせる
- 取得時は `filters=locale[equals]${locale}` でフィルタ
- 日英は同じスラッグを別レコードとして登録（例: `grand-opening-2026` を ja/en で2レコード）

## 5. URL / ページ構成

| URL | 役割 | 生成方式 |
|-----|------|---------|
| `/ja/news` / `/en/news` | 一覧（最新12件、カテゴリフィルタ付き） | SSG + ISR（`revalidateTag`） |
| `/ja/news/[slug]` / `/en/news/[slug]` | 詳細 | SSG + ISR（`generateStaticParams`で全slug事前生成） |
| `/ja/about#news` | About内 05 NEWS セクション（最新3件） | SSG + ISR |
| `/api/revalidate` | Webhook受信 | Route Handler (runtime: nodejs) |
| `/api/draft/enable` | プレビュー入口 | Route Handler |
| `/api/draft/disable` | プレビュー終了 | Route Handler |
| `/api/news` | クライアントからの追加ロード用 | Route Handler |

## 6. ページUI/UX

### 6.1 ビジュアルトーン
既存Aboutページの **Legacyパレット**（黒背景 `#0A0A0A` + アクセント `#C8FF00`）に揃える。フォント・見出しスタイル・セクションヘッダー（`01` `NEWS` 番号付き）も踏襲。

### 6.2 一覧ページ
- **レイアウト**: デスクトップ3列 / タブレット2列 / モバイル1列グリッド
- **カード**: アイキャッチ画像 / 公開日（`2026.04.19` 形式） / カテゴリバッジ / タイトル（2行省略）
- **カテゴリフィルタ**: 上部チップ `[ All ][ お知らせ ][ メディア掲載 ][ イベント ][ キャンペーン ]`
  - URL反映: `/ja/news?category=media`
- **ページネーション**: 「もっと見る」ボタン（12件ずつ追加ロード）
  - 動作: クリック → `/api/news?offset=N&category=X&locale=Y` fetch → state append
  - 全件読み込み済みならボタン非表示、「以上です」表示
  - 連打防止: リクエスト中はボタン disable
  - エラー時: リトライボタン表示
  - URL状態は保持しない（リロードで先頭12件に戻る仕様）
- **空状態**: 「現在表示できるニュースはありません。」
- **アイキャッチなし記事**: カテゴリ色のグラデーションでフォールバック

### 6.3 詳細ページ
- **上部**: 「← ニュース一覧へ」戻る導線
- **ヘッダー**: カテゴリバッジ / 公開日 / タイトル / アイキャッチ画像
- **本文**: サニタイズ済みリッチエディタHTML（`prose prose-invert` 適用）
- **末尾**: 外部リンクボタン（`externalLink`があれば）
- **SNSシェア**: **なし**（今回は見送り）
- **前後記事ナビ**: **なし**（今回は見送り）

### 6.4 About 内「05 NEWS」セクション
- 既存のハードコードをCMS取得の**最新3件表示**に置換
- 表示形式は既存デザイン踏襲（左ボーダー＋タイトル＋本文抜粋＋リンク）
- 末尾に「すべてのニュースを見る →」リンクを追加
- `messages/*.json` の `news.*` キーはフェーズ5-cで削除

### 6.5 アクセシビリティ
- カード全体を `<a>` でラップ、キーボード到達可能
- アイキャッチ `alt` 属性必須（microCMS側で必須入力に設定）
- カテゴリチップは `<button aria-pressed>` でトグル状態を明示
- 日付は `<time dateTime="2026-04-19">` で機械可読
- 「もっと見る」クリック後、新規ロード分の先頭にフォーカス移動
- axe-core を E2E テストで確認

## 7. 運用フロー

### 7.1 プレビュー
1. オーナーがmicroCMS管理画面で下書き保存
2. 「画面プレビュー」ボタン押下
3. microCMSから `https://<本番ドメイン>/api/draft/enable?secret=<MICROCMS_DRAFT_SECRET>&slug={CONTENT_ID}&locale=ja&draftKey={DRAFT_KEY}` にリクエスト（`<...>` は環境変数値、`{...}` はmicroCMSが自動置換するプレースホルダ）
4. Next.js `/api/draft/enable` が
   - `secret` 検証（不一致は401）
   - `slug` 実在チェック（open redirect対策）
   - `draftMode().enable()`
   - `draftKey` を HttpOnly + SameSite=None + Secure のCookieに保存
   - 記事詳細ページにリダイレクト
5. 記事詳細ページで `draftMode().isEnabled` を判定し、Cookieから `draftKey` を読んでmicroCMSに `?draftKey=` 付きリクエスト
6. `cache: 'no-store'` で毎回最新取得、画面上部に「プレビューモード」バナー表示、`robots: noindex,nofollow` 設定
7. `/api/draft/disable` で `draftMode().disable()` + Cookieクリア

### 7.2 予約投稿
- microCMS標準機能の「公開日時指定」を使用
- 指定時刻到達でmicroCMSが自動公開 → Webhook発火 → `/api/revalidate` → `revalidateTag`

### 7.3 Webhook / on-demand revalidate
- microCMS管理画面でWebhook設定
  - URL: `https://<本番ドメイン>/api/revalidate`
  - Secret Header: `MICROCMS_WEBHOOK_SECRET`
  - イベント: 公開/更新/削除/予約公開完了
- `/api/revalidate` 実装
  - `x-microcms-signature` ヘッダで secret 検証
  - bodyを Zod で検証（`service`, `api`, `id`, `type`）
  - `api !== 'news'` ならスキップ
  - `revalidateTag('news')` でリスト系・About側を一括更新
  - `revalidateTag(\`news-${id}\`)` で該当詳細を個別更新
  - `runtime: 'nodejs'` 明示

### 7.4 画像最適化
- `next.config.ts` に `images.remotePatterns` で `images.microcms-assets.io` 追加
- 利用時は `?w=<サイズ>&fm=webp&q=75` を付与
- カード: `w=600`、詳細アイキャッチ: `w=1200`、OGP: `w=1200&h=630&fit=crop`
- LCP画像のみ `priority` 指定、その他は遅延読み込み

### 7.5 SEO
**メタデータ**
- 一覧: `title: "ニュース | THE PICKLE BANG THEORY"`, ロケール対応 description
- 詳細: `title: "${記事タイトル} | THE PICKLE BANG THEORY"`, 本文冒頭120文字を description として自動抜粋（HTMLタグ除去後）
- `alternates.languages` で日英リンク自動生成

**OGP画像**
- アイキャッチあり: `${eyecatch.url}?w=1200&h=630&fit=crop&fm=jpg` を使用
- アイキャッチなし: 既存 `src/app/[locale]/opengraph-image.tsx` 共通OGにフォールバック
- プレビューモード中: `robots: { index: false, follow: false }`

**構造化データ（JSON-LD）**
- 詳細ページに `NewsArticle` スキーマを追加（既存 `StructuredData.tsx` パターン流用）
- フィールド: `headline`, `datePublished`, `dateModified`, `author`（組織名）, `image`, `description`, `inLanguage`

**サイトマップ**
- `src/app/sitemap.ts`（既存）を拡張してニュースURL追加
- microCMSから全slug取得 → ja/en両方のURLを出力
- `changefreq: 'weekly'`, `priority: 0.7`

### 7.6 エラー/ローディング
- `/[locale]/news/loading.tsx`, `/[locale]/news/[slug]/loading.tsx` にSkeleton UI
- `/[locale]/news/error.tsx` で再試行ボタン付きフォールバック
- microCMS障害時: ビルド済み静的ページは表示継続（可用性維持）

### 7.7 監視
- Vercel Analytics（既存）で PV/滞在時間を追跡
- microCMSダッシュボードで月間転送量を週次確認
- 15GB/月到達時点でTeamプラン昇格を検討

## 8. Feature Flag

環境変数 `NEXT_PUBLIC_USE_CMS_NEWS` で新旧切替。

| 値 | 挙動 |
|---|------|
| `true` | CMS経由で表示（新実装） |
| `false` または未設定 | 旧ハードコードで表示（フォールバック） |

- About ページ「05 NEWS」セクションは flag で分岐
- `/[locale]/news` 一覧・詳細ページは flag `false` 時に `notFound()` を返す
- フェーズ5-aで `true` に切替、5-c（2週間安定後）で旧実装コードを削除

## 9. ディレクトリ / ファイル構成

```
src/
├── app/
│   ├── [locale]/
│   │   ├── news/
│   │   │   ├── page.tsx               # 一覧
│   │   │   ├── page.test.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx           # 詳細
│   │   │       ├── page.test.tsx
│   │   │       ├── loading.tsx
│   │   │       └── opengraph-image.tsx  # 動的OGP
│   │   └── about/
│   │       └── AboutContent.tsx       # 05 NEWS セクションをCMS化に修正
│   ├── api/
│   │   ├── revalidate/
│   │   │   ├── route.ts
│   │   │   └── route.test.ts
│   │   ├── draft/
│   │   │   ├── enable/
│   │   │   │   ├── route.ts
│   │   │   │   └── route.test.ts
│   │   │   └── disable/
│   │   │       ├── route.ts
│   │   │       └── route.test.ts
│   │   └── news/
│   │       ├── route.ts               # 「もっと見る」用
│   │       └── route.test.ts
│   └── sitemap.ts                     # ニュースURL追加
├── components/
│   └── news/
│       ├── NewsCard.tsx
│       ├── NewsCard.test.tsx
│       ├── NewsCardGrid.tsx
│       ├── NewsCardGrid.test.tsx
│       ├── CategoryChips.tsx
│       ├── CategoryChips.test.tsx
│       ├── LoadMoreButton.tsx
│       ├── LoadMoreButton.test.tsx
│       ├── RichEditorContent.tsx      # DOMPurifyサニタイズ
│       ├── RichEditorContent.test.tsx
│       ├── NewsArticleJsonLd.tsx
│       ├── NewsArticleJsonLd.test.tsx
│       ├── PreviewBanner.tsx
│       └── PreviewBanner.test.tsx
├── lib/
│   └── microcms/
│       ├── client.ts                  # fetchラッパ
│       ├── client.test.ts
│       ├── schema.ts                  # Zodスキーマ
│       ├── schema.test.ts
│       ├── queries.ts                 # getNewsList / getNewsDetail / getNewsSlugs
│       └── queries.test.ts
└── config/
    └── featureFlags.ts                # NEXT_PUBLIC_USE_CMS_NEWS
```

## 10. 環境変数

| 変数名 | Development | Preview | Production | 用途 |
|--------|:---:|:---:|:---:|------|
| `MICROCMS_SERVICE_DOMAIN` | ✅ | ✅ | ✅ | サービスドメイン |
| `MICROCMS_API_KEY` | ✅ (read) | ✅ (read) | ✅ (read) | コンテンツ取得 |
| `MICROCMS_WEBHOOK_SECRET` | — | ✅ | ✅ | Webhook認証 |
| `MICROCMS_DRAFT_SECRET` | ✅ | ✅ | ✅ | プレビュー入口認証 |
| `NEXT_PUBLIC_USE_CMS_NEWS` | `true` | `true` | `false`→`true` | Feature flag |

`.env.local.example` を更新し、項目名のみ記載（値は入れない）。

## 11. テスト戦略

| テスト種別 | 対象 | カバレッジ目標 | ツール |
|-----------|------|---------------|--------|
| Unit | `lib/microcms/*`, feature flag, ヘルパー | 100% | Vitest |
| Component | `components/news/*` | 100%（rendering + interaction） | Vitest + RTL |
| Integration | Route Handlers（revalidate, draft/*, news） | 100% | Vitest + MSW |
| E2E | 一覧→詳細回遊、フィルタ、もっと見る、a11y audit | 主要ジャーニー | Playwright + axe-core |

- microCMS API は **MSW** でモック（fetch/axios直接モックしない）
- Zod スキーマは正常系 + 異常系（必須フィールド欠落、型不一致）をテスト
- リッチHTMLサニタイズは `<script>` `<iframe sandbox外>` `onclick属性` 除去を検証
- 実APIへのE2EはVercel Preview環境での手動検証で代替
- **TDD必須**: Red → Green → Refactor サイクル、commitはテスト先行

## 12. ロールアウト計画（フェーズ別）

### フェーズ1：microCMS開設 & スキーマ作成
- オーナーがHobbyプラン契約 → サービスドメイン決定
- 開発者がスキーマ・カスタムclass・カテゴリ選択肢を管理画面で設定
- **既存2件の記事を開発者が代行入力**（クラファン告知・PR Times）

### フェーズ2：開発実装（`feature/news-cms-integration` ブランチ）
TDDで以下を順次実装：
1. `lib/microcms/` クライアント + Zod
2. `/api/revalidate`, `/api/draft/enable`, `/api/draft/disable`
3. `components/news/*` 各パーツ
4. `/[locale]/news/page.tsx`（一覧）
5. `/[locale]/news/[slug]/page.tsx`（詳細、JSON-LD）
6. `loading.tsx`, `error.tsx`
7. `/api/news`（もっと見る用）
8. `app/sitemap.ts` 更新
9. `AboutContent.tsx` の05 NEWSセクション修正
10. `next.config.ts` の `remotePatterns` 追加
11. Feature flag 組み込み

### フェーズ3：環境変数セットアップ
- Vercelに Preview / Production 別で登録
- `.env.local.example` 更新
- 開発者が `vercel env pull` で同期

### フェーズ4：Vercel Preview で検証
- PR発行でPreview URL生成
- microCMS側プレビュー設定をPreview URLに一時指定
- オーナーに共有し以下を確認：
  - 管理画面投稿→Preview自動反映（Webhook動作）
  - 下書きプレビュー機能
  - 日英切替表示
  - スマホ実機レイアウト

### フェーズ5：本番切替（段階的）
- **5-a**: `develop` → `main` マージ。Production環境変数で `NEXT_PUBLIC_USE_CMS_NEWS=true` に切替。本番Webhook URLをmicroCMS側に登録
- **5-b**: **2週間安定運用を確認**
- **5-c**: 旧ハードコード削除 + `messages/*.json` の `news.*` キー削除 + Feature flag コード削除

### フェーズ6：運用引き継ぎ
A4 1枚の運用マニュアル（Markdown）を作成：
- 新規記事の作り方（下書き→プレビュー→公開 / 予約投稿）
- 画像アップロード推奨サイズ（16:9、1200px幅以上）
- カテゴリの使い分け
- トラブル時の連絡先・エスカレーション手順

## 13. ロールバック計画

| 事象 | 対応 |
|------|------|
| CMS連携で不具合発生 | `NEXT_PUBLIC_USE_CMS_NEWS=false` に戻す（Vercel環境変数変更のみ、5-c前ならコード改修不要で即復旧） |
| microCMS API障害 | ビルド済み静的ページは継続表示、新規更新のみ遅延 |
| Webhook不達 | microCMS管理画面から手動再送、またはVercelダッシュボードから再デプロイ |
| セキュリティ事故（secret漏洩） | microCMSのAPI Key / Webhook Secret / Draft Secret をローテーション、Vercel環境変数更新 |

## 14. 既知のハマりポイント（実装時の注意）

1. **Next.js 16 の fetch はデフォルト非キャッシュ**：必ず `next: { tags: [...] }` か `cache: 'force-cache'` を付ける
2. **`microcms-js-sdk` は使わない**：axios内部使用で `revalidateTag` と統合できない。自前fetchラッパを書く
3. **リッチHTMLは必ずサニタイズ**：`isomorphic-dompurify` で `<script>` 除去、iframe許可時は `sandbox` 必須
4. **`setRequestLocale(locale)` 必須**：`next-intl` hooks呼び出し前に実行しないと全ページ動的レンダリング化してISR崩壊
5. **Draft Mode と draftKey は別物**：`draftMode().enable()` + `draftKey` を別Cookieに保存、`sameSite: 'none'; secure: true` 必須（iframe プレビューのため）
6. **Turbopack 環境で Node.js 専用モジュール**：`DOMPurify` などを使うRoute Handlerは `export const runtime = 'nodejs'` 明示

## 15. 今後の拡張余地（スコープ外）

本スコープでは以下は**実装しない**が、将来追加する可能性を残す：

- SNSシェアボタン
- 前後記事ナビゲーション
- 関連記事サジェスト
- RSS/Atomフィード
- コメント機能
- いいね/リアクション
- 記事下の問い合わせフォーム埋め込み
- タグ（カテゴリより細かい分類）

## 16. 参考資料

- [microCMS 料金プラン](https://microcms.io/pricing/)
- [microCMS 多言語サイトの実装方法](https://help.microcms.io/ja/knowledge/multilingual-site)
- [microCMS Webhook設定](https://document.microcms.io/manual/webhook-setting)
- [microCMS 画像API](https://document.microcms.io/image-api/introduction)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js revalidateTag API](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode)
- [next-intl App Router](https://next-intl.dev/docs/getting-started/app-router)
- [Schema.org NewsArticle](https://schema.org/NewsArticle)
