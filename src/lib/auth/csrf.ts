import { NextRequest, NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Validates request origin against Host / Forwarded-Host header for state-changing HTTP requests.
 * Protects mutation APIs (POST, PUT, DELETE, PATCH) against cross-site request forgery.
 */
export type CsrfValidationResult =
  | { isValid: true }
  | { isValid: false; errorResponse: NextResponse };

function checkOrigin(request: NextRequest): CsrfValidationResult {
  const method = request.method.toUpperCase();
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(method)) {
    return { isValid: true };
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!host) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: "CSRF check failed: missing host header." },
        { status: 403 }
      ),
    };
  }

  // If Origin header is present, check host match
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return {
          isValid: false,
          errorResponse: NextResponse.json(
            { error: "CSRF check failed: cross-origin mutation forbidden." },
            { status: 403 }
          ),
        };
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        errorResponse: NextResponse.json(
          { error: "CSRF check failed: malformed origin header." },
          { status: 403 }
        ),
      };
    }
  }

  // If Referer header is present, check host match
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return {
          isValid: false,
          errorResponse: NextResponse.json(
            { error: "CSRF check failed: cross-origin referer forbidden." },
            { status: 403 }
          ),
        };
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        errorResponse: NextResponse.json(
          { error: "CSRF check failed: malformed referer header." },
          { status: 403 }
        ),
      };
    }
  }

  return { isValid: true };
}

/**
 * Same check as above. For an administrator's change it also schedules a refresh of the saved public pages.
 * That runs after the change has been answered, so visitors see the update straight away.
 */
export function validateCsrfOrigin(request: NextRequest): CsrfValidationResult {
  const result = checkOrigin(request);
  if (result.isValid && !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase()) && request.nextUrl?.pathname.startsWith("/api/admin")) {
    try {
      after(() => revalidatePath("/", "layout"));
    } catch {
      /* outside a live request (for example in unit tests): nothing to refresh */
    }
  }
  return result;
}
