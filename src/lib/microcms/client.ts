import type { z } from "zod";

// 注: env チェックはモジュールロード時ではなく fetch 呼び出し時に遅延実行する。
// モジュールロード時に throw すると、microCMS 環境変数が無いビルド環境
// (CI の static page data collection 時など) で全ビルドが失敗してしまう。
function getMicrocmsConfig(): { serviceDomain: string; apiKey: string } {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;
  if (!serviceDomain || !apiKey) {
    throw new Error("MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です");
  }
  return { serviceDomain, apiKey };
}

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
  const { serviceDomain, apiKey } = getMicrocmsConfig();
  const baseUrl = `https://${serviceDomain}.microcms.io/api/v1`;
  const url = new URL(`${baseUrl}/${path}`);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  if (draftKey) url.searchParams.set("draftKey", draftKey);

  const init: RequestInit = {
    headers: { "X-MICROCMS-API-KEY": apiKey },
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
