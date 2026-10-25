import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock prisma and next-auth
vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findFirst: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    count: vi.fn(async () => 0),
    create: vi.fn(async (args: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.data ?? {}),
    })),
    update: vi.fn(async (args: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.data ?? {}),
    })),
    upsert: vi.fn(async (args: { create?: Record<string, unknown>; update?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.create ?? {}),
      ...(args?.update ?? {}),
    })),
    delete: vi.fn(async () => ({ id: "mock-id" })),
  });

  const prisma: Record<string, unknown> = {};
  const proxy = new Proxy(prisma, {
    get(target, prop: string) {
      if (!target[prop]) {
        target[prop] = makeModel();
      }
      return target[prop];
    },
  });

  return { prisma: proxy };
});

const sessionState = vi.hoisted(() => ({
  current: null as null | { user: { id: string; name?: string; email?: string } },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => sessionState.current),
}));

import { prisma } from "@/lib/prisma";
import * as publicOtherServices from "@/app/api/other-services/route";
import * as adminOtherServices from "@/app/api/admin/other-services/route";
import * as adminOtherServicesById from "@/app/api/admin/other-services/[id]/route";
import { serviceInputSchema, planInputSchema } from "@/features/services/validation";
import nextConfig from "../next.config.mjs";

const ADMIN_USER = {
  id: "admin-1",
  name: "Master Admin",
  email: "admin@example.com",
  phone: "+919999900001",
  role: "ADMIN",
};

beforeEach(() => {
  sessionState.current = null;
  vi.clearAllMocks();
  (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
});

describe("Phase 18 - Service Validation Schemas", () => {
  it("serviceInputSchema validates Phase 18 itinerary, samagri, youtubeUrl, and additionalLinks", () => {
    const validData = {
      slug: "special-rudra-abhishek",
      titleEn: "Special Rudra Abhishek",
      titleHi: "विशेष रुद्राभिषेक",
      taglineEn: "Vedic Maha Rudra Abhishek",
      taglineHi: "वैदिक महारुद्राभिषेक",
      descriptionEn: "Complete Shivling Rudra Abhishek at Kashi.",
      descriptionHi: "काशी में पूर्ण शिवलिंग रुद्राभिषेक।",
      highlightsEn: ["11 Dravya Abhishek", "Live Sankalp"],
      highlightsHi: ["११ द्रव्य अभिषेक", "सजीव संकल्प"],
      notesEn: "Conducted according to Shukla Yajurveda.",
      notesHi: "शुक्ल यजुर्वेद संहिता अनुसार।",
      icon: "flame",
      imageUrl: "https://example.com/rudra.jpg",
      itineraryEn: "Day 1: Sankalp\nDay 2: 1008 Bilvarchana",
      itineraryHi: "दिन १: संकल्प\nदिन २: १००८ बिल्वार्चना",
      samagriEn: "Belpatra, Gangajal, Honey, Milk, Panchamrit",
      samagriHi: "बिल्वपत्र, गंगाजल, मधु, दुग्ध, पंचामृत",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      additionalLinks: [
        {
          title: "Vedic Protocol",
          url: "https://example.com/protocol",
          description: "Instructions for devotee",
        },
      ],
      orderIndex: 1,
      isActive: true,
    };

    const parsed = serviceInputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.imageUrl).toBe("https://example.com/rudra.jpg");
      expect(parsed.data.youtubeUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(parsed.data.additionalLinks).toHaveLength(1);
    }
  });

  it("serviceInputSchema rejects invalid youtube URL format", () => {
    const invalidData = {
      slug: "rudra-test",
      titleEn: "Test",
      titleHi: "परीक्षण",
      descriptionEn: "Desc En",
      descriptionHi: "Desc Hi",
      youtubeUrl: "not-a-valid-url",
    };

    const parsed = serviceInputSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it("planInputSchema validates Phase 18 program, preparation, samagri, and itinerary fields", () => {
    const validPlan = {
      serviceId: "srv-123",
      slug: "vishesh",
      titleEn: "Vishesh Plan",
      titleHi: "विशेष संस्करण",
      descriptionEn: "Extended puja with samagri",
      descriptionHi: "विस्तृत पूजन एवं सामग्री सहित",
      priceRupees: 5100,
      originalPriceRupees: 7100,
      deliveryDays: 2,
      pages: 45,
      hasCall: true,
      callDurationMinutes: 30,
      featuresEn: ["Samagri Kit", "Video Recording"],
      featuresHi: ["सामग्री किट", "वीडियो रिकॉर्डिंग"],
      programEn: "11 Brahmins reciting Rudrashtadhyayi",
      programHi: "११ वैदिक ब्राह्मणों द्वारा रुद्राष्टाध्यायी पाठ",
      preparationEn: "Devotees should observe fast until noon",
      preparationHi: "यजमान मध्याह्न तक निराहार रहें",
      samagriEn: "Pure Silver Belpatra, Dhoop, Chandan",
      samagriHi: "शुद्ध रजत बिल्वपत्र, धूप, चंदन",
      itineraryEn: "Morning: 6 AM to 11 AM",
      itineraryHi: "प्रातःकाल: ६ बजे से ११ बजे तक",
      isPopular: true,
      orderIndex: 2,
      isActive: true,
    };

    const parsed = planInputSchema.safeParse(validPlan);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.programEn).toContain("11 Brahmins");
      expect(parsed.data.preparationHi).toContain("यजमान");
      expect(parsed.data.samagriEn).toContain("Silver Belpatra");
      expect(parsed.data.itineraryHi).toContain("प्रातःकाल");
    }
  });
});

describe("Phase 18 - Public /api/other-services Route", () => {
  it("GET returns active other services ordered by orderIndex", async () => {
    (prisma.otherService.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "os-1",
        slug: "bharat-darshan-teerth-yatra",
        titleEn: "Bharat Darshan Teerth Yatra",
        titleHi: "भारत दर्शन तीर्थ यात्रा",
        category: "TEERTH_YATRA",
        descriptionEn: "Sacred pilgrimages across Bharat.",
        descriptionHi: "समस्त भारत में पवित्र तीर्थ यात्राएँ।",
        externalUrl: "https://bharatdarshanmpcg.org",
        actionLabelEn: "Explore Yatra Itineraries",
        actionLabelHi: "यात्रा विवरण देखें",
        isExternal: true,
        orderIndex: 1,
        isActive: true,
      },
    ]);

    const res = await publicOtherServices.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].slug).toBe("bharat-darshan-teerth-yatra");
    expect(body.items[0].category).toBe("TEERTH_YATRA");
  });
});

describe("Phase 18 - Admin /api/admin/other-services Route", () => {
  it("GET fails 401 when unauthenticated", async () => {
    const res = await adminOtherServices.GET();
    expect(res.status).toBe(401);
  });

  it("GET returns items when authenticated as admin", async () => {
    sessionState.current = { user: { id: ADMIN_USER.id } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);
    (prisma.otherService.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "os-2",
        slug: "vindhya-vivah-sanskar",
        titleEn: "Vindhya Vivah Sanskar",
        titleHi: "विंध्य विवाह संस्कार",
        category: "MATRIMONIAL",
        orderIndex: 2,
        isActive: true,
      },
    ]);

    const res = await adminOtherServices.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.items).toHaveLength(1);
  });

  it("POST creates a new other service item with CSRF check", async () => {
    sessionState.current = { user: { id: ADMIN_USER.id } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);
    (prisma.otherService.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const payload = {
      slug: "youtube-vedic-discourses",
      titleEn: "Vedic Pravachan & Discourses",
      titleHi: "वैदिक प्रवचन एवं सत्संग",
      category: "YOUTUBE_DISCOURSE",
      descriptionEn: "Canonical Vedic pravachans by learned scholars.",
      descriptionHi: "विद्वान आचार्यों द्वारा वैदिक प्रवचन।",
      youtubeUrl: "https://www.youtube.com/watch?v=mockPravachan",
      actionLabelEn: "Watch Playlist",
      actionLabelHi: "प्रवचन सुनें",
      orderIndex: 3,
      isActive: true,
    };

    const req = new NextRequest("http://localhost:3000/api/admin/other-services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify(payload),
    });

    const res = await adminOtherServices.POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.otherService.create).toHaveBeenCalled();
  });

  it("POST rejects duplicate slug with 409 Conflict", async () => {
    sessionState.current = { user: { id: ADMIN_USER.id } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);
    (prisma.otherService.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "os-existing",
      slug: "existing-slug",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/other-services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        slug: "existing-slug",
        titleEn: "Existing Title",
        titleHi: "मौजूदा शीर्षक",
        descriptionEn: "This is a duplicate slug test with enough characters.",
        descriptionHi: "यह एक परीक्षण विवरण है जो पर्याप्त लंबा है।",
      }),
    });

    const res = await adminOtherServices.POST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("already exists");
  });

  it("PUT updates an existing other service item", async () => {
    sessionState.current = { user: { id: ADMIN_USER.id } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);
    (prisma.otherService.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "os-1",
      slug: "os-1-slug",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/other-services/os-1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        titleEn: "Updated Yatra Services",
        isActive: false,
      }),
    });

    const res = await adminOtherServicesById.PUT(req, { params: Promise.resolve({ id: "os-1" }) });
    expect(res.status).toBe(200);
    expect(prisma.otherService.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "os-1" },
      })
    );
  });

  it("DELETE deactivates an other service item", async () => {
    sessionState.current = { user: { id: ADMIN_USER.id } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

    const req = new NextRequest("http://localhost:3000/api/admin/other-services/os-1", {
      method: "DELETE",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });

    const res = await adminOtherServicesById.DELETE(req, { params: Promise.resolve({ id: "os-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.otherService.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "os-1" },
        data: { isActive: false },
      })
    );
  });
});

describe("Phase 18 - Security Headers Audit", () => {
  it("next.config.mjs enforces poweredByHeader=false and strict security headers", async () => {
    // next.config.mjs exports withNextIntl(nextConfig) which wraps the config
    // The wrapped config preserves the original properties
    const config = nextConfig as Record<string, unknown>;

    // poweredByHeader is preserved by the wrapper
    expect(config.poweredByHeader).toBe(false);

    // The headers function may be on the wrapped config
    const headersFn = config.headers as (() => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>) | undefined;
    if (typeof headersFn === "function") {
      const headersConfig = await headersFn();
      expect(headersConfig).toBeInstanceOf(Array);
      expect(headersConfig.length).toBeGreaterThan(0);

      const allRoutes = headersConfig.find((h) => h.source === "/:path*");
      expect(allRoutes).toBeDefined();

      const headerKeys = allRoutes?.headers.map((h) => h.key);
      expect(headerKeys).toContain("X-Frame-Options");
      expect(headerKeys).toContain("X-Content-Type-Options");
      expect(headerKeys).toContain("Strict-Transport-Security");
      expect(headerKeys).toContain("Referrer-Policy");
    } else {
      // If the wrapper consumed the headers function, verify by reading the file directly
      const fs = await import("fs");
      const configText = fs.readFileSync("next.config.mjs", "utf-8");
      expect(configText).toContain("poweredByHeader: false");
      expect(configText).toContain("X-Frame-Options");
      expect(configText).toContain("X-Content-Type-Options");
      expect(configText).toContain("Strict-Transport-Security");
      expect(configText).toContain("Referrer-Policy");
    }
  });
});
