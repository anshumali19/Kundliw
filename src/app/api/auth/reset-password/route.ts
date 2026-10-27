import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";
import { consumeResetToken, findUserIdByResetToken } from "@/lib/auth/passwordReset";

const schema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const BAD_LINK = "This link is not valid any more. Please ask for a new one.";

export async function POST(request: NextRequest) {
  try {
    const rate = await checkDbRateLimit({ scope: "PWRESET_USE_IP", identifier: getClientIp(request.headers), windowSeconds: 900, maxAllowed: 10 });
    if (!rate.allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request." }, { status: 400 });
    }

    const userId = await findUserIdByResetToken(parsed.data.token);
    if (!userId) return NextResponse.json({ error: BAD_LINK }, { status: 400 });

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
    });
    await consumeResetToken(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
