import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, checkDbRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  phone: z.string().trim().min(10, "Valid 10-digit phone number is required").max(20, "Phone number must not exceed 20 characters"),
  email: z.string().trim().email("Invalid email address").max(120, "Email must not exceed 120 characters").optional().or(z.literal("")),
  subject: z.string().trim().max(200, "Subject must not exceed 200 characters").optional(),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(3000, "Message must not exceed 3000 characters"),
  source: z.enum(["CONTACT_PAGE", "CHATBOT_TICKET", "CHATBOT_LEAD", "SERVICE_MODAL"]).default("CONTACT_PAGE"),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Rate limit: 5 inquiries per IP per 10 minutes (600 seconds)
  const rl = await checkDbRateLimit({
    scope: "ENQUIRY",
    identifier: ip,
    windowSeconds: 600,
    maxAllowed: 5,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many enquiries submitted. Please wait a few minutes before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form details", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const created = await prisma.contactEnquiry.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        source: parsed.data.source,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: created.id,
      message: "Enquiry submitted successfully. Kendra team will contact you within 24 hours.",
    });
  } catch (error) {
    console.error("[API Contact Enquiry POST] Error:", error);
    return NextResponse.json(
      { error: "Internal error submitting enquiry. Please contact directly via helpline." },
      { status: 500 }
    );
  }
}
