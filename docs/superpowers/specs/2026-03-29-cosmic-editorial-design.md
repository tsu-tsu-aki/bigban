# COSMIC EDITORIAL デザインリニューアル仕様書

## 概要

ホームLPのカラーパレットとライティングをティザーページの雰囲気に寄せる。エディトリアルなレイアウト（非対称グリッド、タイポグラフィ階層、写真ファースト）はそのまま維持し、色とアンビエント効果のみを変更する。

## カラー変更

### globals.css の @theme 変数

| トークン | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| `--color-off-white` | `#F5F2EE` | `#141414` | オフホワイトセクション廃止、全面ダーク化 |
| `--color-accent` | `#C8FF00` | `#F6FF54` | ティザーのアクセントカラーに統一 |
| `--color-text-dark` | `#1A1A1A` | `#E6E6E6` | ライトセクション廃止に伴いライト系テキストに |

`--color-deep-black` (#0A0A0A) と `--color-text-gray` (#8A8A8A) は変更なし。

### テキストカラーの反転

元オフホワイト背景セクション（Concept, Services偶数行, Access）で使用されていた `text-text-dark` を `text-off-white` または `text-[#E6E6E6]` に変更する。CSS変数 `--color-off-white` が `#141414` になるため、`bg-off-white` は自動的にダーク背景になる。

## アンビエント効果の追加

### ヒーロー — ブルーアンビエントグロウ

ティザーと同じパターンの放射状ブルーグロウを追加：

```html
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute top-[20%] left-[30%] w-[600px] h-[600px] rounded-full blur-[200px]"
       style={{ background: 'rgba(48,110,195,0.06)' }} />
</div>
```

- 位置: ヒーローセクションの左上寄り（見出しの背後）
- opacity: 0.06（ティザーと同等、控えめ）
- サイズ: 600px、blur-[200px]

### ファウンダー — ブルーライティング

既存のダークグラデーション背景にブルーのアンビエントを重ねる：

```html
<div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[150px]"
     style={{ background: 'rgba(17,49,123,0.08)' }} />
```

### セクション区切り — ブルーグラデーションライン

セクション間の区切りに、ティザーで使用しているブルーグラデーションラインを追加：

```css
background: linear-gradient(90deg, transparent, #306EC3, transparent);
```

適用箇所:
- HomeFooter の上部セパレーター（既存の `bg-accent` を置き換え）
- HomePricing の料金セクション上部
- HomeFounder のプレスセクション上部ボーダー

## コンポーネント別変更一覧

### globals.css
- `@theme` 内の3変数を変更

### HomeConcept.tsx
- `bg-off-white` → CSS変数変更で自動適用（#141414に）
- `text-text-dark` → `text-[#E6E6E6]` に変更
- 写真プレースホルダーのグラデーションをブルートーンに調整

### HomeServices.tsx
- 偶数行（Service 02, 04）の `bg-off-white` → 自動適用
- 偶数行の `text-text-dark` → `text-[#E6E6E6]` に変更
- 偶数行の `text-text-dark/70` → `text-[#E6E6E6]/70` に変更
- 偶数行の画像プレースホルダーグラデーションをダークトーンに統一

### HomeAccess.tsx
- `bg-off-white` → 自動適用
- `text-text-dark` → `text-[#E6E6E6]` に変更
- メールリンク hover → `hover:text-accent`（変更なし、ただしアクセントカラーが#F6FF54に）
- 駅名の `font-semibold` → テキストカラーも `text-[#E6E6E6]` に

### HomeHero.tsx
- ブルーアンビエントグロウの div を追加（absolute, pointer-events-none）

### HomeFounder.tsx
- ブルーアンビエントグロウを重ねる

### HomeFooter.tsx
- 上部セパレーター: `bg-accent` → ブルーグラデーションラインに変更

### HomePricing.tsx
- 料金グリッド上部にブルーグラデーションラインを追加

### HomeNavigation.tsx
- 変更なし（カラートークン経由で自動反映）

### HomeKeyNumbers.tsx
- 変更なし（元からダーク背景）

### HomeFacility.tsx
- 変更なし（元からダーク背景）

### HomeContact.tsx
- 変更なし（元からダーク背景）

## テスト

- カラークラス名が変わるテスト（bg-off-white の背景テスト等）はCSS変数が変わっても `bg-off-white` クラス名自体は変わらないため、テスト修正は最小限
- `text-text-dark` → `text-[#E6E6E6]` の変更はテストで className を検証している箇所があれば修正
- アンビエント要素の追加は既存テストに影響しない（pointer-events-none の装飾要素）
- フッターセパレーターのクラス変更はテストで `bg-accent` を検証しているため修正が必要

## 変更しないもの

- レイアウト（非対称グリッド、2カラム構成等）
- タイポグラフィ（フォント、サイズ、ウェイト）
- アニメーション（スクロールリビール、パララックス等）
- ロゴ（白版を維持、ネオン版はティザー限定）
- フォーム機能（Contact API）
- JP/ENトグル
