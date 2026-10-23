import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestOtpSchema } from "@/lib/auth/validation";
import {
  generateNumericOtp,
  hashOtp,
  checkPhoneRateLimit,
  checkIpRateLimit,
  deliverOtp,
  OTP_VALIDITY_MINUTES,
} from "@/lib/auth/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid mobile number. Please provide a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;

    // Rate-limiting by client IP
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const ipLimit = checkIpRateLimit(clientIp);
    if (!ipLimit.isAllowed) {
      return NextResponse.json(
        {
          error: `Too many requests from this network. Please retry in ${ipLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Rate-limiting by Phone number
    const phoneLimit = checkPhoneRateLimit(phone);
    if (!phoneLimit.isAllowed) {
      return NextResponse.json(
        {
          error: `Too many OTP requests for this number. Please retry in ${phoneLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Generate secure 6-digit numeric OTP and hash
    const otp = generateNumericOtp(6);
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);

    // Invalidate prior unconsumed OTPs for this phone
    await prisma.otpVerification.updateMany({
      where: {
        phone,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    // Store hashed OTP in database
    await prisma.otpVerification.create({
      data: {
        phone,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Deliver OTP (console logged in dev only, never in production)
    deliverOtp(phone, otp);

    return NextResponse.json({
      success: true,
      message: "One-time password dispatched successfully.",
    });
  } catch (error) {
    console.error("Error in OTP send route:", error);
    return NextResponse.json(
      { error: "Failed to dispatch OTP. Please try again." },
      { status: 500 }
    );
  }
}
