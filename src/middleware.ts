import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 施設オープン: 2026-04-18
// サイト公開は前日18時（プレオープン告知のため）
const LAUNCH_DATE = new Date("2026-04-17T18:00:00+09:00");

function isBeforeLaunch(): boolean {
  if (process.env.NEXT_PUBLIC_MAINTENANCE === "true") return true;
  return new Date() < LAUNCH_DATE;
}

export function middleware(request: NextRequest) {
  if (!isBeforeLaunch()) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname === "/teaser" || pathname.startsWith("/_next") || pathname.startsWith("/logos")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/teaser", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
