import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { validateCsrfOrigin } from "../src/lib/auth/csrf";

describe("CSRF Origin Validation for Mutating Routes", () => {
  it("allows safe read-only methods (GET, HEAD, OPTIONS) without origin checks", () => {
    const req = new NextRequest("http://localhost:3000/api/admin/services", {
      method: "GET",
    });
    const result = validateCsrfOrigin(req);
    expect(result.isValid).toBe(true);
    expect("errorResponse" in result).toBe(false);
  });

  it("allows state-changing requests when Origin matches Host header", () => {
    const req = new NextRequest("http://localhost:3000/api/admin/services", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });
    const result = validateCsrfOrigin(req);
    expect(result.isValid).toBe(true);
  });

  it("allows state-changing requests when Referer matches Host header", () => {
    const req = new NextRequest("http://localhost:3000/api/admin/services", {
      method: "POST",
      headers: {
        host: "kanad-jyotish.in",
        referer: "https://kanad-jyotish.in/admin/services",
      },
    });
    const result = validateCsrfOrigin(req);
    expect(result.isValid).toBe(true);
  });

  it("blocks state-changing requests when Origin belongs to an unauthorized cross-site domain", () => {
    const req = new NextRequest("http://localhost:3000/api/admin/services", {
      method: "POST",
      headers: {
        host: "kanad-jyotish.in",
        origin: "https://malicious-attacker.com",
      },
    });
    const result = validateCsrfOrigin(req);
    expect(result.isValid).toBe(false);
    if (result.isValid) throw new Error("expected CSRF rejection");
    expect(result.errorResponse.status).toBe(403);
  });

  it("blocks state-changing requests when Referer belongs to an unauthorized cross-site domain", () => {
    const req = new NextRequest("http://localhost:3000/api/admin/services", {
      method: "DELETE",
      headers: {
        host: "kanad-jyotish.in",
        referer: "https://evil-site.org/attack",
      },
    });
    const result = validateCsrfOrigin(req);
    expect(result.isValid).toBe(false);
    if (result.isValid) throw new Error("expected CSRF rejection");
    expect(result.errorResponse.status).toBe(403);
  });
});
