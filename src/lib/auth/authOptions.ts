import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyOtpHash, isOtpExpired, canAttemptOtpVerification } from "./otp";
import { verifyOtpSchema, emailPasswordLoginSchema } from "./validation";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/hi/auth/signin",
  },
  providers: [
    // 1. Google OAuth Provider (Optional in dev if env variables are not present)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // 2. Mobile OTP Credentials Provider (for Android WebView & Mobile Users)
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

        // Find the latest active OTP record for this phone
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
          // Increment attempts
          await prisma.otpVerification.update({
            where: { id: record.id },
            data: { attempts: { increment: 1 } },
          });
          throw new Error("Incorrect OTP. Please try again.");
        }

        // Mark OTP as consumed
        await prisma.otpVerification.update({
          where: { id: record.id },
          data: { consumedAt: new Date() },
        });

        // Find or create User with this phone
        let user = await prisma.user.findUnique({
          where: { phone },
        });

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

    // 3. Email & Password Provider (for Admins)
    CredentialsProvider({
      id: "email-password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = emailPasswordLoginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid email or password format");
        }

        const { email, password } = parsed.data;

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
