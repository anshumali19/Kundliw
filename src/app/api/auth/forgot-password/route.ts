import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";
import { createResetToken, RESET_LINK_MINUTES } from "@/lib/auth/passwordReset";
import { sendNotification } from "@/lib/notifications";
import { SITE_URL, localizedPath } from "@/lib/seo";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  locale: z.enum(["hi", "en"]).default("en"),
});

/** The answer never says whether the address is registered, so it cannot be used to look people up. */
const SAME_ANSWER = { success: true };

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const { email, locale } = parsed.data;

    const [byIp, byEmail] = await Promise.all([
      checkDbRateLimit({ scope: "PWRESET_IP", identifier: getClientIp(request.headers), windowSeconds: 900, maxAllowed: 8 }),
      checkDbRateLimit({ scope: "PWRESET_EMAIL", identifier: email, windowSeconds: 3600, maxAllowed: 3 }),
    ]);
    if (!byIp.allowed || !byEmail.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });
    // Accounts that sign in with a mobile OTP or Google have no password to reset
    if (!user?.email || !user.passwordHash) return NextResponse.json(SAME_ANSWER);

    const token = await createResetToken(user.id);
    const link = `${SITE_URL}${localizedPath(locale, "/auth/reset-password")}?token=${token}`;
    const hi = locale === "hi";

    if (process.env.NODE_ENV !== "production") console.log(`[Password reset] link for ${email}: ${link}`);

    await sendNotification({
      email: user.email,
      subject: hi ? "पासवर्ड रीसेट करें - महर्षि कणाद ज्योतिष केंद्र" : "Reset your password - Maharshi Kanad Jyotish Kendra",
      message: hi
        ? `नमस्ते ${user.name || ""},\n\nआपका पासवर्ड रीसेट करने के लिए नीचे के लिंक पर जाएँ। यह लिंक ${RESET_LINK_MINUTES} मिनट तक चलेगा और एक बार ही काम करेगा।\n\n${link}\n\nयदि आपने यह अनुरोध नहीं किया है तो इस ईमेल को अनदेखा करें; आपका पासवर्ड नहीं बदलेगा।`
        : `Namaste ${user.name || ""},\n\nUse the link below to set a new password. It works for ${RESET_LINK_MINUTES} minutes and only once.\n\n${link}\n\nIf you did not ask for this, ignore this email; your password will not change.`,
    });

    return NextResponse.json(SAME_ANSWER);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
