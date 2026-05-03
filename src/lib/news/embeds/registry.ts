import { INSTAGRAM_PROVIDER } from "./instagram";
import type { EmbedProviderDescriptor } from "./types";
import { YOUTUBE_PROVIDER } from "./youtube";

/**
 * プロバイダの登録テーブル。
 * 新プロバイダ追加時はここに 1 行追加するだけ。
 */
const PROVIDERS = [YOUTUBE_PROVIDER, INSTAGRAM_PROVIDER] as const;

const PROVIDER_MAP: ReadonlyMap<string, EmbedProviderDescriptor> = new Map(
  PROVIDERS.map((p) => [p.id, p]),
);

/** 登録済みプロバイダ ID 一覧 (テスト・サニタイザー検証用) */
export const EMBED_PROVIDER_IDS: readonly string[] = PROVIDERS.map((p) => p.id);

export function getEmbedProvider(id: string): EmbedProviderDescriptor | undefined {
  return PROVIDER_MAP.get(id);
}

/**
 * サニタイザーが `<a class="embed" data-embed-provider="..." data-embed-id="...">`
 * の属性を保持してよいかの最終判定。
 *
 * - provider が未登録なら不可
 * - provider 既知でも id が pattern に合わなければ不可
 */
export function isValidEmbedAttributes(
  provider: string,
  embedId: string,
): boolean {
  const p = PROVIDER_MAP.get(provider);
  if (!p) return false;
  return p.idPattern.test(embedId);
}
