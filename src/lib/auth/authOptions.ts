import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyOtpHash, isOtpExpired, canAttemptOtpVerification } from "./otp";
import { verifyOtpSchema, emailPasswordLoginSchema } from "./validation";
import { checkDbRateLimit, resetDbRateLimit, getClientIp } from "@/lib/rateLimit";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Short maxAge: 24 hours
  },
  pages: {
    signIn: "/hi/auth/signin",
  },
  providers: [
    // 1. Google OAuth Provider with explicit dangerous linking disabled
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false, // Explicitly disabled
          }),
        ]
      : []),

    // 2. Mobile OTP Provider
    CredentialsProvider({
      id: "mobile-otp",
      name: "Mobile OTP",
      credentials: {
        phone: { label: "Mobile Number", type: "text" },
        otp: { label: "One-Time Password", type: "text" },
      },
      async authorize(credentials) {
        const parsed = verifyOtpSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid mobile number or OTP format");
        }

        const { phone, otp } = parsed.data;

        // Check active OTP record
        const record = await prisma.otpVerification.findFirst({
          where: {
            phone,
            consumedAt: null,
          },
          orderBy: { createdAt: "desc" },
        });

        if (!record) {
          throw new Error("No active OTP found. Please request a new OTP.");
        }

        if (isOtpExpired(record.expiresAt)) {
          throw new Error("OTP has expired. Please request a new OTP.");
        }

        if (!canAttemptOtpVerification(record.attempts)) {
          throw new Error("Maximum attempts exceeded. Please request a new OTP.");
        }

        const isMatch = verifyOtpHash(otp, record.otpHash);
        if (!isMatch) {
          await prisma.otpVerification.update({
            where: { id: record.id },
            data: { attempts: { increment: 1 } },
          });
          throw new Error("Incorrect OTP. Please try again.");
        }

        // Consume OTP
        await prisma.otpVerification.update({
          where: { id: record.id },
          data: { consumedAt: new Date() },
        });

        // Reset rate limits on success
        await resetDbRateLimit("OTP_PHONE", phone);

        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              phone,
              name: `Yajman ${phone.slice(-4)}`,
              role: Role.USER,
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      },
    }),

    // 3. Email & Password Provider for Administrative login
    CredentialsProvider({
      id: "email-password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = emailPasswordLoginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid email or password format");
        }

        const { email, password } = parsed.data;

        // Extract client IP from req headers
        const headersObj = new Headers();
        if (req && req.headers) {
          Object.entries(req.headers).forEach(([k, v]) => {
            if (typeof v === "string") headersObj.set(k, v);
            else if (Array.isArray(v) && v.length > 0) headersObj.set(k, v[0]);
          });
        }
        const clientIp = getClientIp(headersObj);

        // 1. Rate limit by IP (max 10 attempts per 15 minutes)
        const ipRate = await checkDbRateLimit({
          scope: "ADMIN_LOGIN_IP",
          identifier: clientIp,
          windowSeconds: 15 * 60,
          maxAllowed: 10,
        });

        if (!ipRate.allowed) {
          throw new Error(
            `Too many login attempts from this network. Retry in ${ipRate.retryAfterSeconds} seconds.`
          );
        }

        // 2. Rate limit by email (max 5 failed attempts per 15 minutes)
        const emailRate = await checkDbRateLimit({
          scope: "ADMIN_LOGIN_EMAIL",
          identifier: email,
          windowSeconds: 15 * 60,
          maxAllowed: 5,
        });

        if (!emailRate.allowed) {
          throw new Error(
            `Account locked due to consecutive failed attempts. Retry in ${emailRate.retryAfterSeconds} seconds.`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Success: clear rate limits for both email and IP
        await resetDbRateLimit("ADMIN_LOGIN_EMAIL", email);
        await resetDbRateLimit("ADMIN_LOGIN_IP", clientIp);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
