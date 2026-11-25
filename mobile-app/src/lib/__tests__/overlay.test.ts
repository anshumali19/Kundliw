import { DEFAULT_TICKER, chatPhone, tickerColors, tickerText } from "../overlay";

describe("bottom strip", () => {
  it("is yellow with maroon text unless the admin picked colour codes", () => {
    const standard = tickerColors("", "");
    expect(tickerColors("var(--secondary)", "var(--on-secondary)")).toEqual(standard);
    expect(tickerColors("#800000", "#fff")).toEqual(standard); // an old maroon setting also gives the standard strip
    expect(tickerColors("blue", "white")).toEqual(standard); // names the phone cannot resolve
    expect(tickerColors("#112233", "#FFFFFF")).toEqual({ bg: "#112233", fg: "#FFFFFF" });
    expect(tickerColors("#112233", "nonsense").fg).toBe(standard.fg);
  });

  it("runs the notices in the chosen language, apart by a dot, and welcomes when there are none", () => {
    const items = [
      { textEn: "Offer one", textHi: "ऑफर एक" },
      { textEn: "Offer two", textHi: "" },
    ];
    expect(tickerText(items, "en")).toBe("Offer one   •   Offer two");
    expect(tickerText(items, "hi")).toBe("ऑफर एक   •   Offer two");
    expect(tickerText([], "en")).toBe(DEFAULT_TICKER.textEn);
    expect(tickerText([], "hi")).toBe(DEFAULT_TICKER.textHi);
  });
});

describe("chat number", () => {
  it("takes the last 10 digits of what was typed and refuses anything shorter", () => {
    expect(chatPhone("98279 91224")).toBe("9827991224");
    expect(chatPhone("+91-9827991224")).toBe("9827991224");
    expect(chatPhone("12345")).toBe("");
    expect(chatPhone("")).toBe("");
  });
});
