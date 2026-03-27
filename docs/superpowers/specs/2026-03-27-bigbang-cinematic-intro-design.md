# ティザーページ シネマティックイントロ設計

## 概要

ティザーページに「真っ暗な宇宙 → 爆発（ビッグバン） → ロゴ惑星登場」のシネマティックイントロアニメーションを追加する。ブランド名「THE PICKLE BANG THEORY」のビッグバンを視覚的に体験させ、ページを開くたびにブランドの世界観に引き込む演出。

## 要件

- ページロード時に自動再生（毎回フル再生、スキップなし）
- 演出完了後、既存ティザーコンテンツ（カウントダウン、メール登録等）がフェードインで表示
- Canvas 2D 版と WebGL 版の2つのレンダリングエンジンを実装し、切り替えスイッチで比較可能にする
- 爆発パターン3種（physics / neon / minimal）を切り替え可能
- 尺3種（short 3-5s / medium 5-8s / long 8-12s）を切り替え可能
- モバイルでもデスクトップと同等の演出を提供（パフォーマンス調整あり）

## アニメーションシーケンス

### Phase 1: 暗黒（真っ暗な宇宙）

- 完全な黒画面からスタート
- 微かな星がランダムに瞬く
- 静寂感・期待感を演出
- ごく僅かなカメラドリフト

### Phase 2: 集束（エネルギー集中）

- 星が画面中心に引き寄せられる
- 中心に光点が出現し徐々に明るくなる
- ブルー系（#306EC3）のグロウが強まる
- 加速感のあるイージング

### Phase 3: 爆発（ビッグバン）

- 画面中心からパーティクルが放射状に飛散
- 衝撃波リングが拡大
- 画面全体がフラッシュ
- **3つの爆発スタイルを実装（後述）**
- **3つの尺パターンを実装**

### Phase 4: 誕生（ロゴ惑星登場）

- 爆発の中心からロゴが出現
- ブルーグロウのオーラを纏う
- スケール 0→1 で惑星的に現れる
- 残留パーティクルが周囲を漂う

### Phase 5: 展開（コンテンツ表示）

- ロゴが最終位置（画面上部中央）に移動
- カウントダウン、タグライン、メール登録がフェードイン
- キーファクト行、フッターが表示
- 既存ティザーレイアウトへシームレスに遷移

## 爆発パターン

### physics（リアル宇宙物理系）

- 衝撃波リングが同心円状に拡大
- 白〜淡ブルーの粒子が放射状に飛散
- 粒子は速度減衰＋微かな重力影響
- 残留ダストがゆっくり漂う
- 参考イメージ: インターステラー、2001年宇宙の旅

### neon（エネルギッシュ・ネオン系）

- ブランドカラー（#F6FF54 イエロー + #306EC3 ブルー）で発光
- ネオンの光線が放射状にストリーク
- グロウエフェクト強め、コントラスト高
- パーティクルもネオンカラーで発光
- 現ティザーのトーンを爆発に拡張

### minimal（ミニマル・抽象系）

- 白い粒子がシンプルに集まって弾ける
- 色はモノクロ（白〜グレー）のみ
- 粒子数は少なめ、余白を活かす
- クリーンでアート寄りの表現

## コンポーネント構成

```
src/app/teaser/
  page.tsx                    — オーケストレーター（フェーズ管理、切り替えUI統合）

src/components/teaser/
  BigBangCanvas.tsx           — Canvas 2D版の宇宙→爆発→ロゴ演出
  BigBangWebGL.tsx            — WebGL (React Three Fiber)版の演出
  TeaserContent.tsx           — 既存のカウントダウン・メール登録等（page.tsxから抽出）
  EngineSwitch.tsx            — エンジン / 爆発パターン / 尺の切り替えUI

src/hooks/
  useCountdown.ts             — カウントダウンフック（page.tsxから抽出）
  useAnimationPhase.ts        — フェーズ状態管理（dark → converge → explode → logo → content）
```

## 共通インターフェース

Canvas版とWebGL版は同一の Props インターフェースを共有する。page.tsx でエンジンを切り替えるだけで、爆発パターン・尺を自由に組み合わせ可能。

```typescript
type AnimationPhase = "dark" | "converge" | "explode" | "logo" | "content"
type ExplosionStyle = "physics" | "neon" | "minimal"
type Duration = "short" | "medium" | "long"

interface BigBangEngineProps {
  config: {
    explosionStyle: ExplosionStyle
    duration: Duration
  }
  onPhaseChange: (phase: AnimationPhase) => void
  logoSrc: string
}
```

## データフロー

1. `useAnimationPhase` がフェーズ状態と設定を管理
2. `page.tsx` がエンジン選択を管理し、選択されたエンジンコンポーネントに props を渡す
3. `BigBangCanvas` または `BigBangWebGL` がアニメーションを実行し、`onPhaseChange` でフェーズ遷移を通知
4. フェーズが `"content"` になったら `TeaserContent` をフェードインで表示

## 切り替えUI（EngineSwitch）

開発・比較用のコントロールパネル。画面右下に常駐。

- **ENGINE**: Canvas / WebGL トグル
- **EXPLOSION**: physics / neon / minimal 選択
- **DURATION**: short / medium / long 選択
- **REPLAY**: アニメーション再生ボタン

本番リリース時はこのUIを非表示にする（環境変数 or ビルドフラグで制御）。

## パフォーマンス要件

| 指標 | デスクトップ | モバイル |
|------|-------------|---------|
| フレームレート | 60fps | 30fps 最低保証 |
| Canvas パーティクル上限 | 2,000 | 画面サイズに応じて削減 |
| WebGL パーティクル上限 | 5,000 | 画面サイズに応じて削減 |
| JS バンドル増分 | Canvas: ~0KB / WebGL: dynamic import | 同左 |
| devicePixelRatio | 制限なし | 上限 2 |
| LCP | < 2.5s | < 2.5s |

- 低スペック端末検知: fps 監視で自動品質調整（パーティクル数削減）

## Canvas 2D エンジン詳細

- `requestAnimationFrame` ループによる描画
- パーティクルクラス: position, velocity, life, color, size
- 擬似3D: サイズ＋透明度で奥行き表現
- 衝撃波: 拡大する円弧 + フェードアウト
- フラッシュ: `globalCompositeOperation = "lighter"`
- ロゴ描画: `drawImage` で Canvas に直接合成

## WebGL (R3F) エンジン詳細

- React Three Fiber + drei
- dynamic import で遅延読み込み（バンドルサイズ抑制）
- Points / InstancedMesh でパーティクル描画
- カスタムシェーダー: 衝撃波、グロウ
- OrthographicCamera（2.5D 的な構図）
- ロゴ: テクスチャ付き Plane として配置
- WebGL 未対応時: Canvas 版に自動フォールバック

## アクセシビリティ

- `prefers-reduced-motion` 対応: アニメーションスキップ → 星空背景にロゴが静かにフェードイン
- Canvas / WebGL 要素に `role="img"` + `aria-label` 設定
- 演出中もフォーカス管理は維持（Tab キーでメール入力等に移動可能）
- フラッシュ演出: WCAG 2.3.1 準拠（3回/秒を超えない）

## テスト戦略

### Unit テスト（Vitest）

- `useAnimationPhase`: フェーズ遷移ロジック（dark→converge→explode→logo→content）
- `useCountdown`: カウントダウン計算
- パーティクルクラス: 物理演算（位置更新、速度減衰、寿命管理）
- config バリデーション（不正な組み合わせの拒否）
- `EngineSwitch`: 切り替え操作と状態更新

### Integration テスト（React Testing Library）

- `TeaserContent`: 既存UI要素（カウントダウン、メール登録、キーファクト）の描画
- `EmailSignup`: フォーム送信フローと確認メッセージ表示
- `page.tsx`: エンジン切り替え時のコンポーネント入れ替え
- `prefers-reduced-motion` 時のフォールバック動作
- WebGL 未対応時の Canvas フォールバック

### E2E テスト（Playwright）

- 演出完了後にコンテンツが正しく表示されることの確認
- 3ブラウザ（Chromium, Firefox, WebKit）× 3ビューポート（1440px, 768px, 375px）
- axe-core アクセシビリティ監査
- パフォーマンス: LCP < 2.5s
