import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE === "true";

export function middleware(request: NextRequest) {
  if (!isMaintenance) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname === "/teaser" || pathname.startsWith("/_next") || pathname.startsWith("/logos")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/teaser", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
