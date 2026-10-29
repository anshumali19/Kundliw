import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const expectedPassword = process.env.DEMO_ACCESS_PASSWORD;

    if (!expectedPassword || expectedPassword.trim() === "") {
      // If gate is not active, permit immediately
      return NextResponse.json({ success: true, message: "Demo gate not active" });
    }

    const limit = await checkDbRateLimit({ scope: "DEMOGATE_IP", identifier: getClientIp(req.headers), windowSeconds: 900, maxAllowed: 10 });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const given = Buffer.from(String(password ?? ""));
    const want = Buffer.from(expectedPassword);
    if (given.length !== want.length || !timingSafeEqual(given, want)) {
      return NextResponse.json(
        { success: false, error: "Invalid demo password" },
        { status: 401 }
      );
    }

    // Correct password: set cookie demo_access
    const response = NextResponse.json({ success: true });
    response.cookies.set("demo_access", expectedPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
