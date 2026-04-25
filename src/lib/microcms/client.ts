import type { z } from "zod";

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!SERVICE_DOMAIN || !API_KEY) {
  throw new Error("MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です");
}

const BASE_URL = `https://${SERVICE_DOMAIN}.microcms.io/api/v1`;

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
  const url = new URL(`${BASE_URL}/${path}`);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  if (draftKey) url.searchParams.set("draftKey", draftKey);

  const init: RequestInit = {
    headers: { "X-MICROCMS-API-KEY": API_KEY as string },
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
