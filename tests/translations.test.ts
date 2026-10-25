import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setDeepValue,
  getBaseDictionary,
  getMergedMessages,
  invalidateTranslationCache,
  saveTranslationOverride,
  deleteTranslationOverride,
  getAllTranslationsWithOverrides,
} from "@/lib/i18n/translationService";
import { prisma } from "@/lib/prisma";

// Ensure mock object structure on prisma for unit testing
if (!prisma.translationOverride) {
  (prisma as any).translationOverride = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue({ id: "mock-id" }),
    delete: vi.fn().mockResolvedValue({}),
  };
}

describe("Phase 15 - Database Translation Override Subsystem (Client Condition 2)", () => {
  beforeEach(() => {
    invalidateTranslationCache();
    vi.restoreAllMocks();
  });

  describe("setDeepValue helper", () => {
    it("sets simple root-level key on a namespace", () => {
      const obj: Record<string, any> = { nav: { home: "Home" } };
      setDeepValue(obj, "nav", "about", "About Us");
      expect(obj.nav.about).toBe("About Us");
      expect(obj.nav.home).toBe("Home");
    });

    it("creates namespace if it does not exist", () => {
      const obj: Record<string, any> = {};
      setDeepValue(obj, "footer", "copyright", "All rights reserved");
      expect(obj.footer.copyright).toBe("All rights reserved");
    });

    it("sets nested dot-separated keys properly", () => {
      const obj: Record<string, any> = { booking: { steps: { step1: "Plan" } } };
      setDeepValue(obj, "booking", "steps.step2", "Details");
      expect(obj.booking.steps.step2).toBe("Details");
      expect(obj.booking.steps.step1).toBe("Plan");
    });

    it("overrides an existing key value", () => {
      const obj: Record<string, any> = { common: { loading: "Loading..." } };
      setDeepValue(obj, "common", "loading", "Please wait...");
      expect(obj.common.loading).toBe("Please wait...");
    });
  });

  describe("getBaseDictionary", () => {
    it("loads English dictionary containing expected namespaces", async () => {
      const en = await getBaseDictionary("en");
      expect(en).toBeDefined();
      expect(en.nav).toBeDefined();
      expect(typeof en.nav.home).toBe("string");
    });

    it("loads Hindi dictionary containing expected namespaces", async () => {
      const hi = await getBaseDictionary("hi");
      expect(hi).toBeDefined();
      expect(hi.nav).toBeDefined();
      expect(typeof hi.nav.home).toBe("string");
    });

    it("returns empty object for unknown locale gracefully without crashing", async () => {
      const unknown = await getBaseDictionary("fr");
      expect(unknown).toEqual({});
    });
  });

  describe("getMergedMessages & Database Overrides", () => {
    it("returns base messages when no database overrides exist", async () => {
      vi.spyOn(prisma.translationOverride, "findMany").mockResolvedValueOnce([]);
      const messages = await getMergedMessages("en");
      expect(messages.nav).toBeDefined();
      expect(messages.nav.home).toBeDefined();
    });

    it("merges dynamic override on top of base messages", async () => {
      vi.spyOn(prisma.translationOverride, "findMany").mockResolvedValueOnce([
        {
          id: "test-override-1",
          locale: "en",
          namespace: "nav",
          key: "book_consultation",
          value: "Book Now Instant",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const messages = await getMergedMessages("en");
      expect(messages.nav.book_consultation).toBe("Book Now Instant");
    });

    it("invalidates in-memory cache when requested", async () => {
      vi.spyOn(prisma.translationOverride, "findMany").mockResolvedValueOnce([]);
      invalidateTranslationCache("en");
      const messages = await getMergedMessages("en");
      expect(messages).toBeDefined();
    });

    it("fails gracefully to base dictionary if database call throws", async () => {
      vi.spyOn(prisma.translationOverride, "findMany").mockRejectedValueOnce(
        new Error("Database connection lost")
      );

      const messages = await getMergedMessages("en");
      expect(messages.nav).toBeDefined();
      expect(typeof messages.nav.home).toBe("string");
    });
  });

  describe("getAllTranslationsWithOverrides for Admin", () => {
    it("flattens dictionaries and maps default vs overridden status", async () => {
      vi.spyOn(prisma.translationOverride, "findMany").mockResolvedValueOnce([
        {
          id: "ov-1",
          locale: "en",
          namespace: "nav",
          key: "home",
          value: "Kanad Home",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const items = await getAllTranslationsWithOverrides("en");
      expect(items.length).toBeGreaterThan(50);

      const navHome = items.find((i) => i.fullKey === "nav.home");
      expect(navHome).toBeDefined();
      expect(navHome?.namespace).toBe("nav");
      expect(navHome?.key).toBe("home");
      expect(navHome?.currentValue).toBe("Kanad Home");
      expect(navHome?.isOverridden).toBe(true);
    });
  });

  describe("saveTranslationOverride & deleteTranslationOverride", () => {
    it("upserts an override and clears translation cache", async () => {
      const upsertSpy = vi
        .spyOn(prisma.translationOverride, "upsert")
        .mockResolvedValueOnce({
          id: "override-123",
          locale: "en",
          namespace: "nav",
          key: "brand_name",
          value: "Maharshi Kanad Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await saveTranslationOverride({
        locale: "en",
        namespace: "nav",
        key: "brand_name",
        value: "Maharshi Kanad Center",
      });

      expect(result.id).toBe("override-123");
      expect(upsertSpy).toHaveBeenCalled();
    });

    it("deletes an override and clears translation cache", async () => {
      const deleteSpy = vi
        .spyOn(prisma.translationOverride, "delete")
        .mockResolvedValueOnce({} as any);

      const result = await deleteTranslationOverride({
        locale: "en",
        namespace: "nav",
        key: "brand_name",
      });

      expect(result.success).toBe(true);
      expect(deleteSpy).toHaveBeenCalled();
    });
  });
});
