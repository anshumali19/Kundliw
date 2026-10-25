import { describe, it, expect } from "vitest";
import { sanitizeCallbackUrl } from "@/lib/auth/safeRedirect";

/**
 * H5: the sign-in page must never hand an attacker-controlled absolute or
 * protocol-relative URL to router.push/signIn. Only same-origin path targets
 * are allowed; everything else falls back to the localized home page.
 */

const FALLBACK = "/en";

describe("H5 - sign-in callback URL sanitization", () => {
  it("uses the fallback when no callback is supplied", () => {
    expect(sanitizeCallbackUrl(null, FALLBACK)).toBe(FALLBACK);
    expect(sanitizeCallbackUrl(undefined, FALLBACK)).toBe(FALLBACK);
    expect(sanitizeCallbackUrl("", FALLBACK)).toBe(FALLBACK);
    expect(sanitizeCallbackUrl("   ", FALLBACK)).toBe(FALLBACK);
  });

  it("allows relative same-origin paths", () => {
    expect(sanitizeCallbackUrl("/en/account", FALLBACK)).toBe("/en/account");
    expect(sanitizeCallbackUrl("/hi/booking/success/order-1", FALLBACK)).toBe(
      "/hi/booking/success/order-1"
    );
    expect(
      sanitizeCallbackUrl("/en/orders?status=PAID#invoice", FALLBACK)
    ).toBe("/en/orders?status=PAID#invoice");
  });

  it.each([
    "https://evil.example",
    "http://evil.example/path",
    "//evil.example",
    "///evil.example",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/\\evil.example",
    "/\\\\evil.example",
    "\\\\evil.example",
    "https:///evil.example",
    "http://localhost:3000/en/account",
  ])("rejects the off-site target %s", (target) => {
    expect(sanitizeCallbackUrl(target, FALLBACK)).toBe(FALLBACK);
  });

  it.each(["/%2f%2fevil.example", "/%5cevil.example", "/%00evil"])(
    "rejects encoded separators and control characters in %s",
    (target) => {
      expect(sanitizeCallbackUrl(target, FALLBACK)).toBe(FALLBACK);
    }
  );

  it("rejects malformed percent encoding", () => {
    expect(sanitizeCallbackUrl("/en/%E0%A4%A", FALLBACK)).toBe(FALLBACK);
  });
});
