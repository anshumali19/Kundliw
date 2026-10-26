import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock prisma and next-auth
vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findFirst: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
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
import * as publicFaq from "@/app/api/faq/route";
import * as adminFaq from "@/app/api/admin/faq/route";
import * as adminFaqById from "@/app/api/admin/faq/[id]/route";
import * as publicFounder from "@/app/api/founder/route";
import * as adminFounder from "@/app/api/admin/founder/route";
import * as adminGallery from "@/app/api/admin/gallery/route";
import * as adminGalleryById from "@/app/api/admin/gallery/[id]/route";

const ADMIN_USER = {
  id: "admin-1",
  name: "Admin",
  email: "admin@example.com",
  phone: "+919999900001",
  role: "ADMIN",
};

beforeEach(() => {
  sessionState.current = null;
  vi.clearAllMocks();
  (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
});

describe("Phase 17 - FAQ System", () => {
  it("public GET /api/faq returns active FAQ items", async () => {
    (prisma.faqItem.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "faq-1",
        questionEn: "How are Kundlis calculated?",
        questionHi: "कुण्डली गणना कैसे होती है?",
        answerEn: "Using Drik Ganita and Lahiri Ayanamsha.",
        answerHi: "दृश्य गणित एवं लाहिड़ी अयनांश द्वारा।",
        category: "KUNDLI",
        orderIndex: 1,
        isActive: true,
      },
    ]);

    const req = new NextRequest("http://localhost:3000/api/faq");
    const res = await publicFaq.GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].category).toBe("KUNDLI");
  });

  it("public GET /api/faq filters by category parameter", async () => {
    const req = new NextRequest("http://localhost:3000/api/faq?category=puja");
    await publicFaq.GET(req);
    expect(prisma.faqItem.findMany).toHaveBeenCalledWith({
      where: { isActive: true, category: "PUJA" },
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "desc" }],
    });
  });

  it("admin POST /api/admin/faq creates a new FAQ with validation", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

    const validPayload = {
      questionEn: "What is Drik Ganita?",
      questionHi: "दृग्गणित क्या है?",
      answerEn: "Modern astronomical calculations.",
      answerHi: "प्रत्यक्ष खगोलीय वेध एवं गणित।",
      category: "GENERAL",
      orderIndex: 2,
      isActive: true,
    };

    const req = new NextRequest("http://localhost:3000/api/admin/faq", {
      method: "POST",
      headers: { host: "localhost:3000", "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const res = await adminFaq.POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.faqItem.create).toHaveBeenCalledWith({
      data: validPayload,
    });
  });

  it("admin PUT /api/admin/faq/[id] updates an FAQ item", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

    const req = new NextRequest("http://localhost:3000/api/admin/faq/faq-1", {
      method: "PUT",
      headers: { host: "localhost:3000", "content-type": "application/json" },
      body: JSON.stringify({ questionEn: "Updated Question" }),
    });

    const res = await adminFaqById.PUT(req, { params: Promise.resolve({ id: "faq-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.faqItem.update).toHaveBeenCalledWith({
      where: { id: "faq-1" },
      data: { questionEn: "Updated Question" },
    });
  });

  it("admin DELETE /api/admin/faq/[id] deletes an FAQ item", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

    const req = new NextRequest("http://localhost:3000/api/admin/faq/faq-1", {
      method: "DELETE",
      headers: { host: "localhost:3000" },
    });

    const res = await adminFaqById.DELETE(req, { params: Promise.resolve({ id: "faq-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.faqItem.delete).toHaveBeenCalledWith({
      where: { id: "faq-1" },
    });
  });
});

describe("Phase 17 - Founder Profile CMS", () => {
  it("public GET /api/founder returns founder profile", async () => {
    (prisma.founderProfile.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "default",
      nameEn: "Founder Name",
      nameHi: "संस्थापक का नाम",
      designationEn: "Founder & Chief Astrologer",
      designationHi: "संस्थापक एवं मुख्य ज्योतिषाचार्य",
      roleEn: "Vedanga Jyotish Lineage",
      roleHi: "काशी वेदांग ज्योतिष परंपरा",
      bioEn: "40+ years experience",
      bioHi: "४० वर्षों का अनुभव",
      youtubeUrl: "https://youtube.com/watch?v=123",
      isActive: true,
    });

    const res = await publicFounder.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.profile.nameEn).toBe("Founder Name");
  });

  it("admin PUT /api/admin/founder updates founder profile and additional links", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

    const payload = {
      nameEn: "Founder Name",
      nameHi: "संस्थापक का नाम",
      designationEn: "Senior Daivajna",
      designationHi: "वरिष्ठ दैवज्ञ",
      bioEn: "Comprehensive biographical narrative over four decades in Varanasi.",
      bioHi: "काशी की पावन धरा पर चार दशकों से समर्पित सेवा एवं साधना।",
      youtubeUrl: "https://youtube.com/watch?v=test",
      additionalLinks: [
        {
          labelEn: "Sister Portal",
          labelHi: "सहयोगी पोर्टल",
          url: "https://vindhyavivahsanskar.com",
        },
      ],
      footerNoteEn: "Traditional Dakshina code applies.",
      footerNoteHi: "पारंपरिक दक्षिणा संहिता लागू है।",
      isActive: true,
    };

    const req = new NextRequest("http://localhost:3000/api/admin/founder", {
      method: "PUT",
      headers: { host: "localhost:3000", "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await adminFounder.PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.founderProfile.upsert).toHaveBeenCalled();
  });
});

describe("Phase 17 - Media Gallery Video & Links (#11)", () => {
  it("admin POST /api/admin/gallery accepts videoUrl, mediaType, and externalLink", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

    const galleryData = {
      titleEn: "Ganga Aarti Lecture",
      titleHi: "गंगा आरती व्याख्यान",
      imageUrl: "/images/gallery-1.jpg",
      videoUrl: "https://youtube.com/watch?v=ganga",
      mediaType: "YOUTUBE",
      externalLink: "https://kanadjyotishkendra.vercel.app/services",
      orderIndex: 5,
    };

    const req = new NextRequest("http://localhost:3000/api/admin/gallery", {
      method: "POST",
      headers: { host: "localhost:3000", "content-type": "application/json" },
      body: JSON.stringify(galleryData),
    });

    const res = await adminGallery.POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    // New gallery items are active unless the admin switches them off.
    expect(prisma.mediaGalleryItem.create).toHaveBeenCalledWith({
      data: { ...galleryData, isActive: true },
    });
  });

  it("admin PUT /api/admin/gallery/[id] updates mediaType and externalLink", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

    const updateData = {
      mediaType: "YOUTUBE" as const,
      videoUrl: "https://youtube.com/watch?v=updated",
    };

    const req = new NextRequest("http://localhost:3000/api/admin/gallery/gal-1", {
      method: "PUT",
      headers: { host: "localhost:3000", "content-type": "application/json" },
      body: JSON.stringify(updateData),
    });

    const res = await adminGalleryById.PUT(req, { params: Promise.resolve({ id: "gal-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.mediaGalleryItem.update).toHaveBeenCalledWith({
      where: { id: "gal-1" },
      data: updateData,
    });
  });
});
