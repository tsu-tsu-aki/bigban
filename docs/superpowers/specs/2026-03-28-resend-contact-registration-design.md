# Resend コンタクト登録 設計書

## 概要

ティーザーページのメール登録フォーム（EmailSignup）を Resend API と連携し、入力されたメールアドレスを Resend のコンタクトとして登録する。

## スコープ

- メールアドレスの収集（Resend コンタクト登録）のみ
- ウェルカムメール等の送信は行わない
- 重複登録はエラーを表示せず成功扱いにする

## アーキテクチャ

```
[EmailSignup (Client)] → fetch POST /api/subscribe → [Route Handler (Server)] → resend.contacts.create()
```

API キーはサーバーサイドに留まり、クライアントには露出しない。

## API Route

### `POST /api/subscribe`

**ファイル**: `src/app/api/subscribe/route.ts`

**リクエスト**:
```json
{
  "email": "user@example.com"
}
```

**レスポンス**:

| ケース | ステータス | ボディ |
|--------|-----------|--------|
| 成功 | 201 | `{ "success": true }` |
| バリデーションエラー | 400 | `{ "success": false, "error": "..." }` |
| Resend API エラー | 500 | `{ "success": false, "error": "..." }` |

**処理フロー**:
1. リクエストボディから `email` を取得
2. メール形式のバリデーション（空文字・不正形式を弾く）
3. `resend.contacts.create({ email })` を呼び出す
4. 結果に応じたレスポンスを返す

**重複登録**: Resend 側が冪等に処理するため、アプリ側では特別な処理をしない。

## EmailSignup コンポーネント改修

**ファイル**: `src/components/teaser/EmailSignup.tsx`

### 状態管理

現状の `email` + `submitted` を以下に変更:

- `email`: string — 入力値
- `status`: `"idle"` | `"submitting"` | `"success"` | `"error"` — 送信状態

### UI 状態

| status | UI |
|--------|----|
| idle | 現状通りのフォーム表示 |
| submitting | ボタンテキスト「...」、ボタン・入力を disabled |
| success | 現状通り「REGISTERED — WE'LL BE IN TOUCH.」表示 |
| error | フォーム下部にエラーメッセージ「登録に失敗しました。もう一度お試しください。」、再送信可能 |

### 処理フロー

1. フォーム送信 → status を "submitting" に
2. `POST /api/subscribe` に `{ email }` を送信
3. 成功 → status を "success" に
4. 失敗 → status を "error" に

既存のアニメーション（AnimatePresence）はそのまま維持。

## テスト戦略

### API Route テスト (`src/app/api/subscribe/route.test.ts`)

Resend SDK をモックして Route Handler を直接テスト:

- 有効なメールで 201 が返る
- 空文字・不正形式で 400 が返る
- Resend SDK エラー時に 500 が返る
- 重複登録でも成功扱い（201）

### EmailSignup テスト (`src/components/teaser/EmailSignup.test.tsx`)

fetch をモックして各状態をテスト:

- 送信 → ローディング表示 → 成功メッセージ表示
- 送信 → ローディング表示 → エラーメッセージ表示 → フォーム再入力可能
- 送信中にボタン・入力が disabled になる
- 既存テスト（空メール拒否等）は維持・改修

## ファイル構成

```
src/
  app/
    api/
      subscribe/
        route.ts            ← 新規
        route.test.ts       ← 新規
  components/
    teaser/
      EmailSignup.tsx       ← 改修
      EmailSignup.test.tsx  ← 改修
```

## パッケージ追加

- `resend` (本番依存)
