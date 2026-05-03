/**
 * SNS 埋め込みプロバイダのディスクリプタ。
 *
 * - id / idPattern / URL ビルダーは「データ」だけで完結させ、React Component は
 *   別レイヤー (components/news/embeds) で管理する (循環依存回避)
 * - サニタイザーが許可するべき provider 名・id 形式の唯一の源泉として使われる
 */
export interface EmbedProviderDescriptor {
  /** プロバイダ識別子 (例: "youtube"、小文字英数字のみ想定) */
  readonly id: string;
  /** 埋め込み ID として受理する形式 (DoS / 任意文字列インジェクション対策) */
  readonly idPattern: RegExp;
  /** クリック前に表示するサムネイル画像 URL を組み立てる */
  readonly buildThumbnailUrl: (embedId: string) => string;
  /** クリック後に iframe の src として使う URL を組み立てる */
  readonly buildIframeUrl: (embedId: string) => string;
  /** 入力 URL から埋め込み ID を抽出する (Skill が URL → トークンに変換する時に利用) */
  readonly extractIdFromUrl: (url: URL) => string | null;
}
