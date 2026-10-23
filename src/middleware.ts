import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API and static files pass untouched
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Admin route protection: check if pathname contains /admin
  const isAdminRoute =
    pathname.includes("/admin") && !pathname.includes("/admin/login");

  if (isAdminRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      const locale = pathname.startsWith("/en") ? "en" : "hi";
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
