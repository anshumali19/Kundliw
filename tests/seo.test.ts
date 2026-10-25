import { describe, it, expect } from "vitest";
import { localizedPath, pageAlternates, serializeJsonLd, absoluteUrl } from "@/lib/seo";

describe("SEO helpers", () => {
  it("omits the locale prefix for Hindi (default) and prefixes English", () => {
    expect(localizedPath("hi", "")).toBe("/");
    expect(localizedPath("hi", "/services")).toBe("/services");
    expect(localizedPath("en", "")).toBe("/en");
    expect(localizedPath("en", "/services")).toBe("/en/services");
  });

  it("builds canonical and hreflang alternates for both languages", () => {
    const alt = pageAlternates("en", "/faq");
    expect(alt.canonical).toBe(absoluteUrl("/en/faq"));
    expect(alt.languages).toMatchObject({
      hi: absoluteUrl("/faq"),
      en: absoluteUrl("/en/faq"),
      "x-default": absoluteUrl("/faq"),
    });
  });

  it("escapes angle brackets so structured data cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});
