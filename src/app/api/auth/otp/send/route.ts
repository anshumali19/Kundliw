import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestOtpSchema } from "@/lib/auth/validation";
import {
  generateNumericOtp,
  hashOtp,
  OTP_VALIDITY_MINUTES,
} from "@/lib/auth/otp";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";
import { getSmsProvider } from "@/lib/sms";

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

    // 1. IP rate limiting via Database (10 requests per hour)
    const clientIp = getClientIp(request.headers);
    const ipLimit = await checkDbRateLimit({
      scope: "OTP_IP",
      identifier: clientIp,
      windowSeconds: 3600,
      maxAllowed: 10,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests from this network. Please retry in ${ipLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Phone rate limiting via Database (5 requests per hour)
    const phoneLimit = await checkDbRateLimit({
      scope: "OTP_PHONE",
      identifier: phone,
      windowSeconds: 3600,
      maxAllowed: 5,
    });

    if (!phoneLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many OTP requests for this mobile number. Please retry in ${phoneLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 3. Generate 6-digit OTP and store hash
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

    await prisma.otpVerification.create({
      data: {
        phone,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    // 4. Dispatch via configured SmsProvider (fails loudly in production if unconfigured)
    const smsProvider = getSmsProvider();
    const sendResult = await smsProvider.sendSms({
      phone,
      message: `Your Maharshi Kanad Jyotish Kendra verification code is ${otp}. Valid for 10 minutes.`,
      otp,
    });

    if (!sendResult.success) {
      console.error("OTP SMS dispatch failed:", sendResult.error);
      return NextResponse.json(
        { error: "Failed to dispatch OTP. Please try again." },
        { status: 500 }
      );
    }

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
