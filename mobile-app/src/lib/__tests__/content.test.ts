import { imageUri, offerValue, paragraphs, parseInline, plainText, safeExternal } from "../content";

const money = (p: number) => `Rs${p / 100}`;

describe("content helpers", () => {
  it("puts the website address in front of pictures saved on the site only", () => {
    expect(imageUri("/api/storage/a.jpg")).toMatch(/\/api\/storage\/a\.jpg$/);
    expect(imageUri("/api/storage/a.jpg")).toMatch(/^https?:\/\//);
    expect(imageUri("https://example.com/x.png")).toBe("https://example.com/x.png");
    expect(imageUri(null)).toBeUndefined();
  });

  it("opens only web, phone and mail addresses", () => {
    expect(safeExternal("https://example.com")).toBe("https://example.com");
    expect(safeExternal("tel:+919827991224")).toBe("tel:+919827991224");
    expect(safeExternal("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(safeExternal("javascript:alert(1)")).toBeNull();
    expect(safeExternal("//evil.com")).toBeNull();
    expect(safeExternal("")).toBeNull();
  });

  it("reads bold text and links, and keeps unsafe links as plain text", () => {
    const parts = parseInline("Hello **world** and [site](https://example.com) and [bad](javascript:x)");
    expect(parts.map((p) => p.type)).toEqual(["text", "bold", "text", "link", "text", "text"]);
    expect(parts[3]).toMatchObject({ type: "link", href: "https://example.com", text: "site" });
  });

  it("splits paragraphs on blank lines", () => {
    expect(paragraphs("one\n\ntwo\r\n\r\n\r\nthree")).toEqual(["one", "two", "three"]);
  });

  it("describes flat and percentage offers", () => {
    const base = { id: "1", code: "C", titleEn: "", titleHi: "", minOrderValuePaise: 0, autoApply: false, validUntil: null };
    expect(offerValue({ ...base, discountType: "FLAT", discountValuePaise: 50000, maxDiscountPaise: null }, money, "off", "up to")).toBe("Rs500 off");
    expect(offerValue({ ...base, discountType: "PERCENTAGE", discountValuePaise: 25, maxDiscountPaise: 100000 }, money, "off", "up to")).toBe("25% off (up to Rs1000)");
  });

  it("removes the markup from a preview", () => {
    expect(plainText("A **bold** [link](https://x.com) text")).toBe("A bold link text");
  });
});
