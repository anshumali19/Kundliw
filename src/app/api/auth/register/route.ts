import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/auth/validation";
import * as bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { ensureAssociateProfile, getAssociateRules } from "@/lib/associates/service";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Stops bots from creating accounts in bulk
    const limit = await checkDbRateLimit({ scope: "REGISTER_IP", identifier: getClientIp(request.headers), windowSeconds: 3600, maxAllowed: 10 });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many sign-up attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { accountType, name, phone, email, password } = parsed.data;

    const rules = accountType === "ASSOCIATE" ? await getAssociateRules() : null;
    if (rules && !rules.enabled) {
      return NextResponse.json(
        { error: "New associate registrations are closed right now. Please contact the Kendra." },
        { status: 403 }
      );
    }

    // Check if email or phone already registered
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json(
        { error: "A user with this mobile number already exists." },
        { status: 409 }
      );
    }

    let passwordHash: string | undefined = undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        passwordHash,
        role: accountType === "ASSOCIATE" ? Role.ASSOCIATE : Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Associates start as PENDING until the admin approves them
    if (user.role === Role.ASSOCIATE) {
      const profile = await ensureAssociateProfile(user.id);
      if (rules?.autoApprove) {
        await prisma.associateProfile.update({
          where: { id: profile.id },
          data: { status: "APPROVED", reviewedAt: new Date() },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration completed successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
