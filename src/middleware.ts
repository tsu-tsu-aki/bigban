import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const MAINTENANCE_BYPASS_PATHS = ["/teaser", "/_next", "/logos", "/images"];

function isMaintenanceBypassPath(pathname: string): boolean {
  return MAINTENANCE_BYPASS_PATHS.some((p) => pathname.startsWith(p));
}

function createMaintenanceResponse(request: NextRequest): NextResponse {
  const url = new URL("/ja/teaser", request.url);
  return NextResponse.rewrite(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE === "true";

  if (isMaintenance) {
    if (isMaintenanceBypassPath(pathname)) {
      return handleI18nRouting(request);
    }
    return createMaintenanceResponse(request);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|logos|.*\\..*).*)"],
};
