# Resend Contacts Integration Design

**Date:** 2026-03-28
**Branch:** `feature/email-service-integration`
**Status:** Approved

## Overview

ティザーページの EmailSignup フォームから送信されたメールアドレスを、Resend Contacts API に登録する。
Resend 管理画面で Segment を作成すれば、後から一括配信も可能。

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (Client)                               │
│                                                 │
│  EmailSignup.tsx                                │
│    ├─ email state (入力値)                       │
│    ├─ status: 'idle'|'loading'|'success'|'error'│
│    └─ handleSubmit()                            │
│         → fetch('/api/subscribe', { email })    │
└──────────────────┬──────────────────────────────┘
                   │ POST (JSON)
                   ▼
┌─────────────────────────────────────────────────┐
│  Server (Route Handler)                         │
│                                                 │
│  src/app/api/subscribe/route.ts                 │
│    1. JSON パース                                │
│    2. メールアドレスバリデーション（正規表現）      │
│    3. resend.contacts.create({ email })          │
│    4. レスポンス返却                              │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│  Resend Contacts API                            │
│    - コンタクト作成（重複時はupsert）              │
│    - 管理画面で Segment 作成→一括配信可能         │
└─────────────────────────────────────────────────┘
```

## File Changes

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/app/api/subscribe/route.ts` | POST handler: validation → Resend API call |
| Create | `src/app/api/subscribe/route.test.ts` | Route Handler tests |
| Create | `src/lib/resend.ts` | Resend client instance factory |
| Create | `src/lib/resend.test.ts` | Client factory tests |
| Modify | `src/components/teaser/EmailSignup.tsx` | Add fetch call + loading/error/success states |
| Modify | `src/components/teaser/EmailSignup.test.tsx` | Add API integration tests |
| Create | `.env.local` | `RESEND_API_KEY=re_xxxxxxxxx` |
| Modify | `.env` | Add `RESEND_API_KEY=` template entry |

## Dependencies

- `resend` npm package (new dependency)

## Route Handler: `POST /api/subscribe`

### Request/Response Spec

```
POST /api/subscribe
Content-Type: application/json

Request:  { "email": "user@example.com" }

Success:  200 { "id": "<contact_id>" }
Invalid:  400 { "error": "Invalid email address" }
BadJSON:  400 { "error": "Invalid request body" }
RateLimit:429 { "error": "Too many requests" }
Server:   500 { "error": "Internal server error" }
```

### Processing Flow

1. `request.json()` を try-catch でパース（不正 JSON は 400）
2. `email` フィールドの存在チェック + 正規表現バリデーション
3. `resend.contacts.create({ email, unsubscribed: false })` を呼び出し
4. Resend SDK の `error` をチェック:
   - `rate_limit_exceeded` → 429
   - `validation_error` → 400
   - その他 → 500
5. 成功時は `{ id: data.id }` を 200 で返却

### Validation

- サーバー側で正規表現によるメールバリデーション実施（クライアントの `type="email"` に依存しない）
- Zod 等のライブラリは未導入。入力が email 1 フィールドのみのため正規表現で十分

### Duplicate Contacts

- Resend API が upsert 動作するため、特別な処理不要。200 を返す

### Segment Config

- `export const dynamic = 'force-dynamic'` を設定

## Resend Client: `src/lib/resend.ts`

```typescript
import { Resend } from 'resend';

export function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}
```

### Design Decisions

- シングルトンではなく関数呼び出しで生成。テスト時にモック差し替えしやすい
- 環境変数の欠落を実行時に即座に検出

## EmailSignup Component Changes

### State Machine

```
idle → loading → success
              → error → idle (retry)
```

| State | UI |
|-------|----|
| `idle` | メール入力フォーム + 送信ボタン |
| `loading` | 入力・ボタン無効化 + ボタンテキスト「送信中...」 |
| `success` | 確認メッセージ「REGISTERED — WE'LL BE IN TOUCH.」 |
| `error` | フォーム維持 + エラーメッセージ表示 + リトライ可能 |

### handleSubmit Flow

1. status を `loading` に設定
2. `fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })`
3. レスポンスのステータスコードを確認:
   - 200 → status を `success` に
   - 400 → 「メールアドレスを確認してください」
   - 429 → 「しばらくしてからお試しください」
   - 500 → 「エラーが発生しました。もう一度お試しください」
4. catch（ネットワークエラー）→ 汎用エラーメッセージ

### Accessibility Improvements

- 確認メッセージとエラーメッセージに `aria-live="polite"` を追加
- ボタンの loading 中に `aria-disabled="true"` を設定

### Animation

- 既存の `AnimatePresence mode="wait"` によるフェードイン/アウトをそのまま活用
- error 状態はフォーム内にインラインで表示（フォーム自体の切り替えは発生しない）

## Environment Variables

### `.env.local` (gitignored)

```
RESEND_API_KEY=re_xxxxxxxxx
```

### `.env` (committed, template)

```
NEXT_PUBLIC_MAINTENANCE=false
RESEND_API_KEY=
```

### Middleware Impact

- 現在の `middleware.ts` の matcher は `api` パスを除外済み → `/api/subscribe` はメンテナンスモードの影響を受けない。変更不要

### Vercel Deployment

- Vercel 管理画面の Environment Variables に `RESEND_API_KEY` を手動設定

## Error Handling

| Layer | Error Type | Response |
|-------|-----------|----------|
| Client | Network error | fetch catch → generic error message |
| Client | HTTP 400 | 「メールアドレスを確認してください」 |
| Client | HTTP 429 | 「しばらくしてからお試しください」 |
| Client | HTTP 500 | 「エラーが発生しました。もう一度お試しください」 |
| Route Handler | JSON parse failure | 400 |
| Route Handler | Validation failure | 400 |
| Route Handler | Resend `rate_limit_exceeded` | 429 |
| Route Handler | Resend `validation_error` | 400 |
| Route Handler | Resend other error | 500 |
| Route Handler | Unexpected exception | try-catch → 500 |
| Resend API | Duplicate contact | upsert → success (200) |

### Security

- エラーレスポンスに Resend の内部エラー詳細は含めない。ユーザー向けの汎用メッセージのみ返却
- API Key はサーバー側のみ。クライアントバンドルに含まれない

## Testing Strategy

### Route Handler Tests (`route.test.ts`)

- `resend` パッケージを `vi.mock` でモック
- テストケース:
  1. 有効なメールで 200 返却
  2. 不正な JSON で 400 返却
  3. メール未指定で 400 返却
  4. 不正なメール形式で 400 返却
  5. Resend rate_limit_exceeded で 429 返却
  6. Resend validation_error で 400 返却
  7. Resend その他エラーで 500 返却
  8. 予期しない例外で 500 返却

### Resend Client Tests (`resend.test.ts`)

- `RESEND_API_KEY` 未設定時にエラーを投げる
- 正常時に Resend インスタンスを返す

### EmailSignup Tests (`EmailSignup.test.tsx`)

- `global.fetch` を `vi.fn()` でモック
- テストケース:
  1. 送信成功 → 確認メッセージ表示
  2. 送信中 → ボタン無効化 + ローディング表示
  3. API エラー (400) → エラーメッセージ表示、フォーム維持
  4. API エラー (429) → レート制限メッセージ表示
  5. API エラー (500) → 汎用エラーメッセージ表示
  6. ネットワークエラー → 汎用エラーメッセージ表示
  7. エラー後にリトライ → 再送信可能
  8. 空メール送信 → 送信されない（既存テスト維持）
