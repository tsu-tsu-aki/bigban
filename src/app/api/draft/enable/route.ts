import { timingSafeEqual } from "node:crypto";

import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getNewsByContentId, getNewsDetail } from "@/lib/microcms/queries";

export const runtime = "nodejs";

type Locale = "ja" | "en";

const SLUG_RE = /^[a-z0-9-]+$/;
const CONTENT_ID_RE = /^[a-zA-Z0-9_-]+$/;

function isLocale(v: string | null): v is Locale {
  return v === "ja" || v === "en";
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function unauthorized(): Response {
  return NextResponse.json({ ok: false }, { status: 401 });
}

function checkOrigin(request: Request): boolean {
  const allowed = process.env.MICROCMS_DRAFT_ALLOWED_ORIGINS;
  if (!allowed) return true;
  const list = allowed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return list.includes(origin);
}

async function enableAndRedirect(
  draftKey: string,
  locale: Locale,
  slug: string,
): Promise<never> {
  const draft = await draftMode();
  draft.enable();

  const cookieJar = await cookies();
  const isDev = process.env.NODE_ENV === "development";
  cookieJar.set("microcms_draft_key", draftKey, {
    httpOnly: true,
    sameSite: isDev ? "lax" : "none",
    secure: true,
    path: "/",
    maxAge: 1800,
  });

  // localePrefix: 'as-needed' により ja は prefix なし、en のみ /en/...
  const path = locale === "ja" ? `/news/${slug}` : `/en/news/${slug}`;
  redirect(path);
}

export async function GET(request: Request): Promise<Response> {
  if (!checkOrigin(request)) return unauthorized();

  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") ?? "";
  const draftKey = url.searchParams.get("draftKey") ?? "";

  // 共通: secret + draftKey 検証
  const expected = process.env.MICROCMS_DRAFT_SECRET ?? "";
  if (!expected || !safeEqual(secret, expected)) {
    return unauthorized();
  }
  if (!draftKey) return unauthorized();

  // パターンA: contentId 経由 (microCMS 画面プレビュー推奨)
  // microCMS が変数置換するのは {CONTENT_ID} と {DRAFT_KEY} のみのため、
  // ID から slug/locale を逆引きしてリダイレクトする。
  const contentId = url.searchParams.get("contentId");
  if (contentId) {
    if (!CONTENT_ID_RE.test(contentId)) return unauthorized();
    const item = await getNewsByContentId({ id: contentId, draftKey });
    if (!item) return unauthorized();
    return enableAndRedirect(draftKey, item.locale, item.slug);
  }

  // パターンB: slug + locale 直接指定 (後方互換 / 手動プレビュー用)
  const slug = url.searchParams.get("slug") ?? "";
  const localeParam = url.searchParams.get("locale");

  if (!slug) return unauthorized();
  if (!SLUG_RE.test(slug)) return unauthorized();
  if (localeParam !== null && !isLocale(localeParam)) {
    return unauthorized();
  }
  const locale: Locale = isLocale(localeParam) ? localeParam : "ja";

  const item = await getNewsDetail({ locale, slug });
  if (!item) return unauthorized();
  return enableAndRedirect(draftKey, locale, slug);
}
