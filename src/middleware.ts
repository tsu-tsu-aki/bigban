import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const MAINTENANCE_BYPASS_PATHS = ["/teaser", "/_next", "/logos", "/images"];

const BOT_USER_AGENTS = [
  "googlebot", "bingbot", "yandexbot", "duckduckbot",
  "baiduspider", "slurp", "facebot", "ia_archiver",
];

function isMaintenanceBypassPath(pathname: string): boolean {
  return MAINTENANCE_BYPASS_PATHS.some((p) => pathname.startsWith(p));
}

function isBot(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function createBotMaintenanceResponse(): NextResponse {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Service Temporarily Unavailable</title></head>
<body><h1>503 Service Temporarily Unavailable</h1><p>This site is under maintenance. Please try again later.</p></body>
</html>`;

  return new NextResponse(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "86400",
    },
  });
}

function createUserMaintenanceResponse(request: NextRequest): NextResponse {
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
    if (isBot(request)) {
      return createBotMaintenanceResponse();
    }
    return createUserMaintenanceResponse(request);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|logos|.*\\..*).*)"],
};
