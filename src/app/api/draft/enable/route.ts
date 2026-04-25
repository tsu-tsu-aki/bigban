import { timingSafeEqual } from "node:crypto";

import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getNewsDetail } from "@/lib/microcms/queries";

export const runtime = "nodejs";

type Locale = "ja" | "en";

const SLUG_RE = /^[a-z0-9-]+$/;

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

export async function GET(request: Request): Promise<Response> {
  if (!checkOrigin(request)) return unauthorized();

  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") ?? "";
  const slug = url.searchParams.get("slug") ?? "";
  const draftKey = url.searchParams.get("draftKey") ?? "";
  const localeParam = url.searchParams.get("locale");

  const expected = process.env.MICROCMS_DRAFT_SECRET ?? "";
  if (!expected || !safeEqual(secret, expected)) {
    return unauthorized();
  }

  if (!slug || !draftKey) return unauthorized();
  if (!SLUG_RE.test(slug)) return unauthorized();

  if (localeParam !== null && !isLocale(localeParam)) {
    return unauthorized();
  }
  const locale: Locale = isLocale(localeParam) ? localeParam : "ja";

  const item = await getNewsDetail({ locale, slug });
  if (!item) return unauthorized();

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
