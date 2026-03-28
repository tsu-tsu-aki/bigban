# Disable Custom Cursor Animation on Touch Devices

## Summary

タッチデバイス（スマホ・タブレット）でカスタムカーソル（マウス追従の丸）を非表示にする。マウスポインタが存在しない環境では不要なUIであるため。

## Approach

**CSS-only（アプローチA）** を採用。`@media (pointer: fine)` メディアクエリでマウス操作デバイスのみにカーソルアニメーションを表示する。JSロジックには手を入れない。

### Detection Method

`pointer: fine` メディアクエリ（CSS Level 4 Media Queries）を使用。

- `pointer: fine` — マウスやトラックパッドなど精密ポインティングデバイス
- `pointer: coarse` — タッチスクリーン

画面幅ではなく入力デバイスの種類で判定するため、iPadなどのタッチデバイスでも正しく非表示になる。

## Affected Files

### `src/app/globals.css`

1. `.custom-cursor-area` を `@media (pointer: fine)` でラップ
2. `.custom-cursor` クラスを新規追加（デフォルト `display: none`、`pointer: fine` 時のみ `display: block`）

```css
/* Before */
.custom-cursor-area {
  cursor: none;
}

/* After */
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

### `src/app/teaser/page.tsx`

1. ルート `div` の `cursor-none` を削除し、`custom-cursor-area` クラスに置き換え（CSSメディアクエリで制御を統一）
2. カーソル丸の `motion.div` に `custom-cursor` クラスを追加

### `src/components/Hero.tsx`

1. カーソル丸の `motion.div` に `custom-cursor` クラスを追加

### `src/app/teaser/page.test.tsx`

1. `cursor-none` のアサーションを `custom-cursor-area` に変更
2. タッチデバイス時のカーソル非表示テストを追加（`matchMedia` モック）

## What Is NOT Changed

- `mousemove` イベントリスナー — タッチデバイスでも登録されるが、カーソル丸が `display: none` のためパフォーマンス影響は無視できるレベル
- `useState` のカーソル位置管理 — 同上
- Hero の `onMouseEnter` / `onMouseLeave` — 同上

## Testing Strategy

- Unit: `pointer: fine` / `pointer: coarse` 時の表示・非表示をテスト
- Visual: 実機またはDevToolsのデバイスエミュレーションで確認
