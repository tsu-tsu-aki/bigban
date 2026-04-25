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
| データ取得 | 自前 `fetch` ラッパ + Next.js 16 **Cache Components** (`'use cache'` + `cacheTag` + `cacheLife`) | 公式SDK (`microcms-js-sdk`) はaxios内部使用で `cacheTag` と統合できないため採用しない |
| バリデーション | Zod | 境界で必ず `parse` |
| HTMLサニタイズ | `isomorphic-dompurify` | テキストエリア (AI生成HTML) / リッチエディタ双方を**Server Component**でサニタイズ。クライアントバンドル混入禁止 |
| 画像最適化 | `next/image` の `unoptimized` 指定 + microCMS imgix パラメータ | `?w=` `?fm=webp` `?q=` で imgix 側に最適化を委譲。Vercel Image Optimization との二重最適化を回避 |
| 国際化 | `next-intl 4.9`（既存） | `localePrefix: 'as-needed'` (ja は prefix 無し、en のみ `/en/`) |
| ISR更新 | `revalidateTag` + microCMS Webhook | on-demand。`'use cache'` 関数の `cacheTag` を無効化 |
| プレビュー | `draftMode()` + Cookie経由の `draftKey` | microCMS固有制約に対応 |
| Feature Flag | サーバ専用環境変数 `USE_CMS_NEWS` | `NEXT_PUBLIC_*` 不採用（クライアントバンドル露出回避・機能存在の情報漏洩防止） |

#### 3.2.1 サニタイズ設定マトリクス

`displayMode` 別に DOMPurify 設定を切り替える。詳細は §14 ハマりポイント3 を参照。

| 設定項目 | `displayMode = 'rich'` (リッチエディタ) | `displayMode = 'html'` (AI生成HTML) |
|---------|-----------------------------------------|--------------------------------------|
| 許可タグ | リッチエディタが出力する全タグ + class属性 | `h2,h3,h4,p,ul,ol,li,a,img,blockquote,strong,em,code,pre,figure,figcaption,br,hr` のみ |
| 禁止タグ | `script`, `iframe`, `style`, `base`, `link`, `object`, `embed`, `form` | 同左 + 上記以外すべて |
| 禁止属性 | `style`, `on*` (イベントハンドラ), `formaction` | 同左 |
| 許可URL scheme | `https:`, `mailto:`, `tel:` | 同左 |
| 許可class | `lead`, `caption`（カスタムclass、TBDで拡張） | サイト指定の独自クラスのみ（具体一覧はTBD、実装時に確定） |
| `addHook` 共通 | `<a>` に `target="_blank"` + `rel="noopener noreferrer"` 自動付与 | 同左 |

## 4. microCMS スキーマ設計

### 4.1 API: `news`

| フィールドID | 表示名 | 型 | 必須 | 説明 |
|-------------|--------|---|------|------|
| `title` | タイトル | テキスト | ✅ | |
| `slug` | スラッグ | テキスト（半角英数ハイフンのみ） | ✅ | URL用、ロケール内ユニーク。形式 `^[a-z0-9-]+$` |
| `locale` | 言語 | セレクト | ✅ | `ja` / `en` |
| `category` | カテゴリ | セレクト（複数） | ✅ | `notice` / `media` / `event` / `campaign` |
| `eyecatch` | アイキャッチ | 画像 | — | 推奨 16:9、1200px幅以上 |
| `excerpt` | 抜粋 | テキスト（160字制限） | ✅ | description / OGP / JSON-LD の供給源（§7.5）。AI が同時生成 |
| `displayMode` | 表示モード | セレクト | ✅ | `html` / `rich`。**デフォルトなし、必ず選択**。表示時にどちらの本文を使うか決定 |
| `bodyHtml` | 本文（HTML） | テキストエリア | — | **AI 生成HTMLの貼付先（実運用の主軸）**。Server Component で厳格サニタイズ後に表示 |
| `body` | 本文（リッチ） | リッチエディタ | — | **保険用**。手動入力で書きたい場合のみ使用。`displayMode=rich` で選択 |
| `externalLink` | 外部リンク | オブジェクト `{ label: string, url: string }` | — | `url` は `https://` 始まり必須 (Zod でスキーム検証)、`<a>` に `rel="noopener noreferrer"` 必須 |
| `publishedAt` | 公開日時 | microCMS標準フィールド | — | 予約投稿に使用 |

**カスタムclass**:
- リッチエディタ用: `lead`（導入文）/ `caption`（キャプション）
- AI HTML 用: 別途 TBD（サイト指定の独自クラスのみ DOMPurify ホワイトリストで許可）

**フィールド間整合性**:
- `bodyHtml` / `body` の **どちらか1つ以上**は実質必須（公開時に空ペアならNext.js側で `notFound()`、§6.3 フォールバック規則）
- `displayMode` は両方空でも publish 可能（microCMS スキーマで強制不可）→ Next.js 側で受け止める

### 4.2 多言語運用方針
- 1エンドポイント `news` に `locale` フィールドで言語を持たせる
- 取得時は `filters=locale[equals]${locale}` でフィルタ
- **日英は両言語必須ではなく、片方のみでも運用可**
  - 両言語で出す場合: 同じスラッグを別レコードとして2件登録（例: `grand-opening-2026` を ja/en で2レコード）
  - 片言語のみ: 該当言語のレコードのみ作成（対向言語版は作らなくてよい）
- 対向言語版の有無は実行時にスラッグ存在チェックで判定し、UI/SEOを切り替える（詳細は 6.3, 7.5 を参照）

## 5. URL / ページ構成

`next-intl` の `localePrefix: 'as-needed'` 設定により、**デフォルトロケール (ja) は prefix 無し**、英語のみ `/en/` 付き。

| URL (実URL) | 役割 | 生成方式 |
|-----|------|---------|
| `/news` (ja) / `/en/news` (en) | 一覧（最新12件、カテゴリフィルタ付き、ページネーション） | SSG + Cache Components（`'use cache'` + `cacheTag('news')` + `cacheLife({ revalidate: 3600, expire: 86400 })`） |
| `/news/[slug]` (ja) / `/en/news/[slug]` (en) | 詳細 | SSG + Cache Components（`generateStaticParams` で全 (locale, slug) 事前生成、`cacheTag(\`news-${id}-${locale}\`)`） |
| `/#news` (ja) / `/en/#news` (en) | About内 05 NEWS セクション（最新3件） | About ページに同居、`cacheTag('news')` で連動更新 |
| `/api/revalidate` | Webhook受信 | Route Handler (Node.js ランタイム自動) |
| `/api/draft/enable` | プレビュー入口 | Route Handler |
| `/api/draft/disable` | プレビュー終了 | Route Handler |

**ページネーション方針変更**: 当初の「もっと見る」クライアントfetch追加ロード方式は、(1) URL状態を保持しないため SEO インデックス不可、(2) Cache Components の利点喪失、(3) `/api/news` Route Handler 増設のトレードオフ、の3点から不採用。**`/news?page=N&category=X` のサーバーサイドページネーション + `<Link>` ナビゲーション** に変更（§6.2）。これに伴い `/api/news` Route Handler は不要。

## 6. ページUI/UX

### 6.1 ビジュアルトーン
既存Aboutページの **Legacyパレット**（黒背景 `#0A0A0A` + アクセント `#C8FF00`）に揃える。フォント・見出しスタイル・セクションヘッダー（`01` `NEWS` 番号付き）も踏襲。

### 6.2 一覧ページ
- **レイアウト**: デスクトップ3列 / タブレット2列 / モバイル1列グリッド
- **カード**: アイキャッチ画像 / 公開日（`2026.04.19` 形式） / カテゴリバッジ / タイトル（2行省略）
- **カテゴリフィルタ**: 上部チップ `[ All ][ お知らせ ][ メディア掲載 ][ イベント ][ キャンペーン ]`
  - URL反映: `/news?category=media` (ja) / `/en/news?category=media` (en)
- **ページネーション (サーバーサイド)**: `/news?page=N&category=X` 形式
  - クエリパラメータ `page` (1〜∞) と `category` (列挙値) を Zod で検証、不正値は 400 ではなく 1ページ目相当にフォールバック
  - 12件/ページ。総ページ数は `getNewsList` の `totalCount` から算出
  - ナビゲーション: 前後ページボタン + ページ番号リンク（`<Link>` で `<a>` ベース、SEO対応）
  - 該当ページに記事が無い場合は `notFound()`
  - **「もっと見る」クライアントfetch方式は不採用**（理由は §5 末尾、SEO indexability 確保のため）
- **空状態**: 「現在表示できるニュースはありません。」
- **アイキャッチなし記事**: カテゴリ色のグラデーションでフォールバック
- **アクセシビリティ**: ページリンクに `rel="prev"` `rel="next"` を付与、現在ページは `aria-current="page"`

### 6.3 詳細ページ
- **上部**: 「← ニュース一覧へ」戻る導線
- **ヘッダー**: カテゴリバッジ / 公開日 / タイトル / アイキャッチ画像
- **本文**: `displayMode` に従ってサニタイズ済みHTMLを表示（後述 6.3.1）。`prose prose-invert` 適用
- **末尾**: 外部リンクボタン（`externalLink` があれば）
  - `url` は Zod で `z.string().url().refine(u => u.startsWith('https://'))` 検証
  - 検証失敗（保存ミスで `javascript:` / `http:` 等）はボタン非表示にフェイル安全
  - `<a>` タグは `rel="noopener noreferrer"` 必須、`target="_blank"`
- **SNSシェア**: **なし**（今回は見送り）
- **前後記事ナビ**: **なし**（今回は見送り）
- **存在しないロケールへのアクセス**: 対象スラッグが当該ロケールに存在しない場合は `notFound()`（`generateStaticParams` で当該ロケールに存在するスラッグのみ生成するため、自動的に404）

#### 6.3.1 本文表示ロジック（`NewsBodyRenderer.tsx`）

`displayMode` と本文フィールドの組み合わせで分岐。**Server Component で実装**し、サニタイズ後に React の HTML 文字列レンダリング API で出力（クライアントバンドルへの DOMPurify 混入を防止するため `"use client"` 禁止）。

**フォールバック規則**:
- `displayMode='html'` で `bodyHtml` 空 → `body`（リッチ）にフォールバックしてレンダリング、`console.warn` でログ警告
- `displayMode='rich'` で `body` 空 → `bodyHtml` にフォールバック、同様にログ警告
- 両方空 → `notFound()`

**疑似コード**:
```ts
function pickBody(item: NewsItem) {
  const selected = item.displayMode === 'html' ? item.bodyHtml : item.body;
  const fallback = item.displayMode === 'html' ? item.body : item.bodyHtml;
  const chosen = selected?.trim() || fallback?.trim();
  if (!chosen) return null;

  if (selected !== chosen) {
    console.warn(
      `[news] displayMode=${item.displayMode} but content empty; fell back. slug=${item.slug} locale=${item.locale}`,
    );
  }

  // displayMode に応じてサニタイザ設定を切替
  return sanitize(chosen, item.displayMode === 'html' ? STRICT_HTML_CONFIG : RICH_EDITOR_CONFIG);
}
```

#### 6.3.2 言語切替ボタン（NewsLanguageSwitcher）の挙動
詳細ページでは、対向言語版（同一スラッグ・別ロケール）の有無で挙動を変える：
- **対向言語版が存在** → そのページへ遷移（例: `/news/foo` ↔ `/en/news/foo`）
- **対向言語版が存在しない** → 対向言語のニュース一覧へフォールバック遷移、ボタンに `aria-label` で「この記事は日本語のみ公開（英語版一覧へ移動）」等の補足を付与
- **実装**: 詳細ページ Server Component で対向言語存在フラグを取得し props として `NewsLanguageSwitcher` (Client Component) に渡す
- **ビルド時最適化**: 全 (slug, locale) ペアを `getSlugLocaleMap()` で1回取得→Map化し、`generateStaticParams` と `generateMetadata` で共有メモ化（チームレビュー H7 対応）

### 6.4 About 内「05 NEWS」セクション
- 既存のハードコードをCMS取得の**最新3件表示**に置換
- 表示形式は既存デザイン踏襲（左ボーダー＋タイトル＋抜粋（`excerpt` フィールド）＋リンク）
- 末尾に「すべてのニュースを見る →」リンクを追加（`/news` または `/en/news`）
- `cacheTag('news')` を共有することで、Webhook による更新時に About も同時に最新化
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
4. Next.js `/api/draft/enable` が以下を**順番に**実行:
   - **a. Origin ヘッダ検証**: `https://<本番ドメイン>`、Vercel Preview、microCMS 管理画面の許可リストいずれかに一致しない場合は 403
   - **b. `secret` 検証**: `crypto.timingSafeEqual` による定長比較、不一致は 401
   - **c. `slug` 形式検証**: `^[a-z0-9-]+$` でホワイトリスト検証、不一致は 400（**Open Redirect 対策の第一防衛線**）
   - **d. `locale` 検証**: `'ja' | 'en'` のenum、不一致は 400
   - **e. `slug` 実在チェック**: microCMS API に当該ロケール・スラッグの記事が存在するか確認、不在は 400
   - **f. `draftMode().enable()` 呼出**
   - **g. `draftKey` Cookie 保存**: `HttpOnly` + `SameSite=None` + `Secure` + `maxAge: 1800`（30分）
     - 環境分岐: `process.env.VERCEL_ENV === 'preview' || production` → `SameSite=None`、ローカル開発時は `lax` に切替
   - **h. 詳細ページにリダイレクト**: 構築URL `/news/${slug}` (ja) / `/en/news/${slug}` (en) のみ。クエリ由来の任意リダイレクトは禁止
5. 記事詳細ページで `draftMode().isEnabled` を判定し、Cookie から `draftKey` を読んで microCMS に `?draftKey=` 付きリクエスト
6. プレビュー時は `'use cache'` 関数を**バイパス**（draftMode 中は別データ取得経路を通す）。画面上部に「プレビューモード」バナー表示、`robots: { index: false, follow: false }` 設定
7. `/api/draft/disable` で Origin 検証 → `draftMode().disable()` + Cookie クリア
8. **エラー応答**: 認証失敗系（401/403）は `{ error: 'Unauthorized' }` の汎用メッセージのみ返却。失敗詳細はサーバログのみに記録（情報漏洩防止）

### 7.2 予約投稿
- microCMS標準機能の「公開日時指定」を使用
- 指定時刻到達でmicroCMSが自動公開 → Webhook発火 → `/api/revalidate` → `revalidateTag`

### 7.3 Webhook / on-demand revalidate
- microCMS管理画面でWebhook設定
  - URL: `https://<本番ドメイン>/api/revalidate`
  - Secret: `MICROCMS_WEBHOOK_SECRET`
  - イベント: 公開/更新/削除/予約公開完了

#### 7.3.1 `/api/revalidate` 実装仕様
1. **bodyを raw として読む**: `await request.text()` で取得（HMAC計算用）
2. **署名検証 (timing-safe)**:
   - `x-microcms-signature` ヘッダ取得（microCMS仕様: `HMAC-SHA256(body, secret).digest('hex')`、prefix無しの hex 文字列）
   - `expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`
   - `crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))` で比較
   - 長さ不一致なら timingSafeEqual はエラー → catch して 401
3. **body を Zod で検証**: `z.object({ service: z.string(), api: z.string(), id: z.string(), type: z.enum(['new','edit','delete']) })`
4. **`api !== 'news'` なら早期 return** (200 OK、処理スキップ)
5. **冪等性チェック (リプレイ攻撃対策)**:
   - 同一 `(id, type, signature)` の組を Vercel KV または Upstash Redis に5分間保持
   - 既出の場合は処理スキップ (200 OK)、新規なら処理続行
6. **`revalidateTag` 実行**:
   - `revalidateTag('news')` でリスト・About を一括更新
   - `revalidateTag(\`news-${id}-ja\`)` および `news-${id}-en\`` で該当詳細を個別更新（locale が確定できないので両方発火）
7. **エラー応答**: 認証失敗時は `{ error: 'Unauthorized' }` のみ返却（情報漏洩防止）
8. **ランタイム**: Node.js (Next.js 16 デフォルト、`runtime: 'nodejs'` 明示は不要)
9. **レート制限 (DoS対策)**: Vercel Functions の同時実行数制限 + 同一IPからの異常頻度受信時はログ警告のみ（本格的な rate limit は KV ベースで TODO）

#### 7.3.2 Cache Components 統合
- ニュース取得関数 (`getNewsList`, `getNewsDetail`, `getNewsSlugs`) は `'use cache'` ディレクティブを冒頭に置き、`cacheTag(...)` と `cacheLife({ revalidate: 3600, expire: 86400 })` を併用
- `revalidateTag` は `'use cache'` 関数のタグを無効化する形で連動
- `next.config.ts` に `experimental.cacheComponents: true`（Next.js 16 安定化に応じて削除可）

### 7.4 画像最適化

**方針: imgix に最適化を委譲、Vercel Image Optimization は使わない**（チームレビュー HIGH-4 対応）。理由:
- Vercel Hobby の Image Optimization は月5,000枚制限、microCMS imgix が既に高品質な最適化を提供
- 二重最適化による品質劣化と転送量増加を回避
- microCMS の imgix は CDN エッジ配信、Cache-Control 適切

**実装**:
- `next.config.ts` の `images.remotePatterns` に `{ protocol: 'https', hostname: 'images.microcms-assets.io', pathname: '/assets/<service-id>/**' }` を**サービスIDで絞って**追加（任意の microCMS テナントを許可しない）
- `next/image` は `unoptimized` プロパティで利用、または **代替として `<img>` + `loading="lazy"` + `decoding="async"`** で imgix URL を直接指定
- imgix パラメータ: `?w=<サイズ>&fm=webp&q=75` を付与
  - カード: `w=600`
  - 詳細アイキャッチ: `w=1200`
  - OGP: `w=1200&h=630&fit=crop`
- LCP画像（詳細アイキャッチ）のみ `priority` 指定、その他は遅延読み込み

**`sizes` 属性 (チームレビュー HIGH 4 対応)**:
- カード（3列グリッド）: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- 詳細アイキャッチ: `sizes="(max-width: 768px) 100vw, (max-width: 1280px) 85vw, 1200px"`

**本文中画像 (AI HTML 内)**:
- AI 運用側で microCMS Management API へアップロード → `images.microcms-assets.io` 配下のURLを `<img src>` に埋め込む規約
- AI 運用ガイド (`docs/operations/ai-news-prompt.md`) で「画像URLは microCMS アセットのみ」を明文化
- 本サイトでは DOMPurify の `addHook('uponSanitizeAttribute', ...)` で `<img src>` のホスト名を `images.microcms-assets.io` に**強制ホワイトリスト**、それ以外の `src` は属性ごと除去

### 7.5 SEO
**メタデータ**
- 一覧: `title: "ニュース | THE PICKLE BANG THEORY"`, ロケール対応 description
- 詳細: `title: "${記事タイトル} | THE PICKLE BANG THEORY"`, **`excerpt` フィールド（必須・160字）を description として使用**（本文の機械抽出は不採用、SEO品質確保のため AI が同時生成・人手チェックされた抜粋を信頼）
- `alternates.languages`:
  - 対向言語版が **存在する** 場合のみ該当URLを登録（hreflang整合性確保）
  - **存在しない** 場合は `alternates.canonical` に当該URLのみ設定し、対向言語キーは出力しない
- 一覧ページは両ロケール常に存在するため `alternates.languages` 両方を出力
- `localePrefix: 'as-needed'` のため URL 構築時は: ja は `${SITE_URL}/news/${slug}`、en は `${SITE_URL}/en/news/${slug}`

**OGP画像**
- アイキャッチあり: `metadata.openGraph.images` に `${eyecatch.url}?w=1200&h=630&fit=crop&fm=jpg` を直接指定（`opengraph-image.tsx` 動的生成は不要、ImageResponse のエッジ関数コスト回避）
- アイキャッチなし: 既存 `src/app/[locale]/opengraph-image.tsx` 共通OGにフォールバック
- プレビューモード中: `robots: { index: false, follow: false }`

**構造化データ（JSON-LD）**
- 詳細ページに `NewsArticle` スキーマを追加（既存 `StructuredData.tsx` パターン流用）
- 必須フィールド: `headline`(110字以内), `image`, `datePublished`, `dateModified`, `author`(@type=Organization), `publisher`(@type=Organization + `logo.ImageObject`), `description`(`excerpt` から), `inLanguage`, `mainEntityOfPage`

**サイトマップ**
- `src/app/sitemap.ts`（既存）を拡張してニュースURL追加
- microCMSから全レコード取得し、**各レコードの `locale` に対応するURLのみ出力**（片言語のみのレコードはそのロケールのURLだけ追加）
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

サーバ専用環境変数 `USE_CMS_NEWS` で新旧切替（チームレビュー M1 / Sec M-1 対応）。`NEXT_PUBLIC_*` プレフィックスは**使用禁止**（クライアントバンドル露出と機能存在の情報漏洩防止）。

| 値 | 挙動 |
|---|------|
| `true` | CMS経由で表示（新実装） |
| `false` または未設定 | 旧ハードコードで表示（フォールバック） |

- About ページ「05 NEWS」セクションは Server Component 内で flag を評価し分岐
- `/news` 一覧・詳細ページは flag `false` 時に `notFound()` を返す
- フラグ値は **build-time inline** されるため、変更後は **再デプロイ必須**（Vercel 環境変数変更だけでは反映されない）
- フェーズ5-aで `true` に切替、5-c（2週間安定後）で旧実装コードを削除

## 9. ディレクトリ / ファイル構成

```
src/
├── app/
│   ├── [locale]/
│   │   ├── news/
│   │   │   ├── page.tsx               # 一覧 (Server Component, 'use cache')
│   │   │   ├── page.test.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx           # 詳細 (Server Component, 'use cache')
│   │   │       └── page.test.tsx
│   │   │       └── loading.tsx
│   │   └── about/
│   │       └── AboutContent.tsx       # 05 NEWS セクションをCMS化に修正
│   ├── api/
│   │   ├── revalidate/
│   │   │   ├── route.ts
│   │   │   └── route.test.ts
│   │   └── draft/
│   │       ├── enable/
│   │       │   ├── route.ts
│   │       │   └── route.test.ts
│   │       └── disable/
│   │           ├── route.ts
│   │           └── route.test.ts
│   │   # /api/news Route Handler は廃止（サーバーサイドページネーションに変更）
│   └── sitemap.ts                     # ニュースURL追加 ('use cache' 化)
├── components/
│   └── news/
│       ├── NewsCard.tsx                # Server Component
│       ├── NewsCard.test.tsx
│       ├── NewsCardGrid.tsx            # Server Component
│       ├── NewsCardGrid.test.tsx
│       ├── CategoryChips.tsx           # 'use client' (URL ナビ用)
│       ├── CategoryChips.test.tsx
│       ├── NewsPagination.tsx          # Server Component (前後/番号リンク)
│       ├── NewsPagination.test.tsx
│       ├── NewsBodyRenderer.tsx        # Server Component, displayMode 分岐 + DOMPurify
│       ├── NewsBodyRenderer.test.tsx
│       ├── NewsArticleJsonLd.tsx       # Server Component
│       ├── NewsArticleJsonLd.test.tsx
│       ├── NewsLanguageSwitcher.tsx    # 'use client' (router.push 用)
│       ├── NewsLanguageSwitcher.test.tsx
│       ├── PreviewBanner.tsx
│       └── PreviewBanner.test.tsx
├── lib/
│   ├── microcms/
│   │   ├── client.ts                  # fetchラッパ + 'use cache'
│   │   ├── client.test.ts
│   │   ├── schema.ts                  # Zodスキーマ
│   │   ├── schema.test.ts
│   │   └── queries/                   # 機能別分割
│   │       ├── list.ts                # getNewsList
│   │       ├── list.test.ts
│   │       ├── detail.ts              # getNewsDetail
│   │       ├── detail.test.ts
│   │       └── slugs.ts               # getNewsSlugs / getSlugLocaleMap
│   │           └── slugs.test.ts
│   └── news/
│       ├── sanitize.ts                # STRICT_HTML_CONFIG / RICH_EDITOR_CONFIG + addHook
│       └── sanitize.test.ts
└── config/
    └── featureFlags.ts                # USE_CMS_NEWS (サーバ専用)
```

注: `RichEditorContent.tsx` → `NewsBodyRenderer.tsx` にリネーム（displayMode 両モード扱うため意味的に拡張）。

## 10. 環境変数

| 変数名 | Development | Preview | Production | 用途 |
|--------|:---:|:---:|:---:|------|
| `MICROCMS_SERVICE_DOMAIN` | ✅ | ✅ | ✅ | サービスドメイン |
| `MICROCMS_API_KEY` | ✅ (read) | ✅ (read) | ✅ (read) | コンテンツ取得用（read 権限のみ。Management 書き込みは AI 運用側のみ保有、本サイトには付与しない） |
| `MICROCMS_WEBHOOK_SECRET` | — | ✅ | ✅ | Webhook 署名検証 |
| `MICROCMS_DRAFT_SECRET` | ✅ (dummy可) | ✅ | ✅ | プレビュー入口認証 |
| `MICROCMS_DRAFT_ALLOWED_ORIGINS` | ✅ | ✅ | ✅ | Draft Mode 入口の Origin 許可リスト（カンマ区切り） |
| `USE_CMS_NEWS` | `true` | `true` | `false`→`true` | Feature flag（**サーバ専用**、`NEXT_PUBLIC_*` 不可） |
| `KV_*` または `UPSTASH_REDIS_*` | — | ✅ (任意) | ✅ | Webhook 冪等性チェック用 (Vercel KV または Upstash Redis) |

`.env.local.example` を更新し、項目名のみ記載（値は入れない）。**環境変数変更後は必ず再デプロイ** (build-time inline のため)。

## 11. テスト戦略

| テスト種別 | 対象 | カバレッジ目標 | ツール |
|-----------|------|---------------|--------|
| Unit | `lib/microcms/*`, `lib/news/sanitize.ts`, feature flag, ヘルパー | 100% | Vitest |
| Component | `components/news/*` | 100%（rendering + interaction） | Vitest + RTL |
| Integration | Route Handlers（`/api/revalidate`, `/api/draft/enable`, `/api/draft/disable`） | 100% | Vitest + MSW |
| E2E | 一覧→詳細回遊、フィルタ、ページネーション、言語切替、a11y audit | 主要ジャーニー | Playwright + axe-core |
| Lighthouse CI | 一覧・詳細ページ | LCP ≤ 2500ms / INP ≤ 200ms / CLS ≤ 0.1 / Performance ≥ 90 | `@lhci/cli` |

**テスト要件詳細**:
- microCMS API は **MSW** でモック（fetch/axios直接モックしない）
- Zod スキーマは正常系 + 異常系（必須フィールド欠落、型不一致、`displayMode` 列挙外）をテスト
- サニタイズテスト (`STRICT_HTML_CONFIG` / `RICH_EDITOR_CONFIG` 両方):
  - `<script>`, `<iframe>`, `<style>`, `<base>`, `onclick` 属性, `style` 属性, `javascript:` URI の除去
  - `<a>` への `rel="noopener noreferrer"` + `target="_blank"` 自動付与
  - `<img src>` の microCMS アセット以外のホスト除去
  - 許可クラス保持の検証
- `NewsBodyRenderer` テスト: `displayMode='html'` / `'rich'` / フォールバック / 両方空 → `notFound` の各分岐
- `NewsLanguageSwitcher` テスト: 対向言語存在 / 不在 / aria-label / キーボード操作
- 実APIへのE2EはVercel Preview環境での手動検証で代替
- **TDD必須**: Red → Green → Refactor サイクル、commitはテスト先行
- **`setRequestLocale` 検証**: 各ページの SSR レスポンスヘッダで静的化を確認するE2Eケースを追加（チームレビュー Perf C-1 対応）

**Lighthouse CI 予算 (`lighthouserc.json`)**:
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "interaction-to-next-paint": ["error", {"maxNumericValue": 200}],
        "categories:performance": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

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
- **多言語運用ルール**: 日本語のみ・英語のみでも投稿可。両言語で出したい場合は同じ slug で2レコード作成する旨を明記
- トラブル時の連絡先・エスカレーション手順

## 13. ロールバック計画

| 事象 | 対応 |
|------|------|
| CMS連携で不具合発生 | `NEXT_PUBLIC_USE_CMS_NEWS=false` に戻す（Vercel環境変数変更のみ、5-c前ならコード改修不要で即復旧） |
| microCMS API障害 | ビルド済み静的ページは継続表示、新規更新のみ遅延 |
| Webhook不達 | microCMS管理画面から手動再送、またはVercelダッシュボードから再デプロイ |
| セキュリティ事故（secret漏洩） | microCMSのAPI Key / Webhook Secret / Draft Secret をローテーション、Vercel環境変数更新 |

## 14. 既知のハマりポイント（実装時の注意）

1. **Next.js 16 Cache Components が正式モデル**: 旧来の `fetch` の `next: { tags: [...] }` だけでは関数全体がキャッシュされない（`generateStaticParams` 経由の SSG ルートのみ静的化）。**`'use cache'` ディレクティブ + `cacheTag()` + `cacheLife()` の組み合わせを採用**。`revalidateTag` は引き続き有効でこれらのタグを無効化する。`next.config.ts` に `experimental.cacheComponents: true`（Next.js 16 安定化済みなら不要、要確認）。

2. **`microcms-js-sdk` は使わない**: axios 内部使用で Cache Components の `cacheTag` と統合できない。自前 fetch ラッパを書く。

3. **HTMLサニタイズ詳細仕様** (`isomorphic-dompurify`):
   - **必ず Server Component 内で実行**（クライアントバンドル混入禁止、約30KB gzip 削減）
   - `displayMode='html'` (AI HTML) と `displayMode='rich'` (リッチエディタ) で別 `setConfig`
   - 共通禁止: `script, iframe, style, base, link, object, embed, form` タグ + `style, on*, formaction` 属性 + `javascript:`/`data:` URI
   - **AI HTML モード追加禁止**: 上記許可タグ以外すべて禁止
   - **許可属性に `class` を含める**（`lead`/`caption` 等のカスタムクラス保護のため、リッチエディタ出力にも必要）
   - **`addHook('afterSanitizeAttributes')`** で `<a>` に `target="_blank"` + `rel="noopener noreferrer"` を強制
   - **`addHook('uponSanitizeAttribute')`** で `<img src>` のホスト名が `images.microcms-assets.io` でなければ src 属性を除去
   - SSR 環境で DOMPurify が DOM 取得できないと**サニタイズが無効化されて素通りする**ので、`isomorphic-dompurify` の自動 JSDOM バインドが効いていることをテストで検証

4. **`setRequestLocale(locale)` 必須かつ位置に注意**:
   - `next-intl` hooks 呼出前に実行しないと全ページ動的レンダリング化してISR崩壊
   - **`'use cache'` 関数の中では呼べない**（dynamic API 扱い）→ `page.tsx` 最上位で同期的に呼ぶ
   - データ層 (`getNewsList` 等) には `locale` を引数として明示的に渡す
   - **実装ステップにチェック項目として明記、E2E でレスポンスヘッダの静的化を検証**

5. **Draft Mode と draftKey は別物**:
   - `draftMode().enable()` + `draftKey` を別Cookieに保存
   - `SameSite=None; Secure` は本番(HTTPS) と Vercel Preview のみ。**ローカル開発時は `lax` に切替**（HTTP 環境で None だと Cookie が落ちる）
   - `maxAge: 1800`（30分）で自動失効、ブラウザを共有しても他人にプレビュー権限が残らない
   - `'use cache'` 関数は draftMode 中は**バイパス**する（別経路でデータ取得）

6. **Next.js 16 ランタイム**: Node.js がデフォルト。`runtime: 'nodejs'` の明示は不要（むしろ冗長）。Edge Runtime は Vercel 公式が非推奨化、Fluid Compute 前提で Node.js のまま `crypto.timingSafeEqual` 等を使える。

7. **Next.js 16 の `params` Promise 化**: `[locale]` `[slug]` 動的セグメントは `params: Promise<{...}>`。**`await params` 必須**。テストでも非同期コンポーネント取り扱いに注意。

8. **`generateStaticParams` と `dynamicParams`**: デフォルト `true`。新規 slug 公開時は **初回アクセスで SSR** → 以降キャッシュ化。`generateStaticParams` は build 時 snapshot 扱いと割り切る（Webhook の `revalidateTag` で更新カバー）。

9. **microCMS の `richEditorV2` HTML には class 属性が含まれる**: DOMPurify デフォルトで剥がす属性があるため `ALLOWED_ATTR: ['class', ...]` 明示が必要。剥がれると `lead`/`caption` カスタムスタイルが消える。

10. **`localePrefix: 'as-needed'` の URL 構築**: ja は `/news/${slug}`、en は `/en/news/${slug}`。設計書 §5・§7.5 の URL 例はこの形式に統一済み。`alternates.languages` でも同じ構築を使う。

## 15. 今後の拡張余地（スコープ外）

本スコープでは以下は**実装しない**が、将来追加する可能性を残す：

- SNSシェアボタン
- 前後記事ナビゲーション
- 関連記事サジェスト
- RSS/Atomフィード
- コメント機能
- いいね/リアクション
- 記事下の問い合わせフォーム埋め込み
- タグ（カテゴリより細かい分類）— microCMS スキーマ作成時に `tags` フィールドを空のセレクト複数として**先行定義**しておくと将来追加が容易（採用検討事項）
- 累積60件超でクライアント仮想スクロール (`react-window` 等) への移行

## 16. 参考資料

- [microCMS 料金プラン](https://microcms.io/pricing/)
- [microCMS 多言語サイトの実装方法](https://help.microcms.io/ja/knowledge/multilingual-site)
- [microCMS Webhook設定](https://document.microcms.io/manual/webhook-setting)
- [microCMS 画像API](https://document.microcms.io/image-api/introduction)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js Cache Components](https://nextjs.org/docs/app/getting-started/caching)
- [Next.js cacheTag API](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Next.js cacheLife API](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [Next.js revalidateTag API](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode)
- [next-intl App Router](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl localePrefix as-needed](https://next-intl.dev/docs/routing#always-or-as-needed)
- [DOMPurify Hooks API](https://github.com/cure53/DOMPurify#hooks)
- [Schema.org NewsArticle](https://schema.org/NewsArticle)

---

## 17. AI 運用境界

本設計書は **microCMS 内のデータをどう Web サイトに表示するか** に集中している。AI が API 経由で microCMS にコンテンツを登録する**上流ワークフロー**は本設計書のスコープ外であり、別ドキュメントで管理する：

| ドキュメント | 内容 |
|------------|------|
| `docs/operations/ai-news-prompt.md` | AI ニュース生成のシステムプロンプト（許可/禁止HTMLタグ・クラス、excerpt生成ルール、多言語一括生成テンプレート） |
| (将来) `docs/operations/ai-news-pipeline.md` | AI agent ↔ microCMS Management API の統合手順、認証情報管理、エラーハンドリング、画像アップロードフロー |

### 17.1 サイト側で前提とする AI 運用ルール（守るべき契約）

1. **画像ホスト**: AI が `<img src>` に書き込む URL は `https://images.microcms-assets.io/assets/<service-id>/...` 配下のみ。それ以外は本サイトの DOMPurify が src 属性を除去する。AI agent は事前に Management API で画像をアップロードしてからURL埋め込みすること。
2. **HTML タグ範囲**: §3.2.1 サニタイズマトリクスの `displayMode='html'` 列に従う。逸脱したタグは表示時に除去される。
3. **`displayMode` 設定**: AI agent は通常 `displayMode='html'` をセットし `bodyHtml` に出力。`body`（リッチ）は人手介入時の保険として空のまま。
4. **多言語**: 同一 `slug` で `locale='ja'` と `locale='en'` の2レコードを作成（片言語のみでも OK）。slug は両言語で揃える。
5. **`excerpt`**: 必須。160字以内。HTML タグは含めない（プレーンテキスト）。
6. **`title`**: 110字以内（JSON-LD `headline` の制約）。

### 17.2 サイトの責務範囲
- microCMS から取得したデータを **信頼せず必ず境界バリデーション (Zod)** + **サニタイズ**を実施
- 不正データ（XSS、不正URL、空コンテンツ）に対しても**フェイル安全**な動作を保証（`notFound()` または属性除去）
- AI 運用が変更されても、サイト側の境界防御は変わらない設計を維持
