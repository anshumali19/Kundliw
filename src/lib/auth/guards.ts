import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./authOptions";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: Role;
}

/**
 * Returns currently authenticated user from session, or null if unauthenticated.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return null;
  }
  return session.user as AuthenticatedUser;
}

/**
 * Server Component / Server Action guard requiring an authenticated user.
 * Redirects to localized sign-in if unauthenticated.
 */
export async function requireUser(
  callbackUrl?: string,
  locale = "hi"
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    const signInPath = `/${locale}/auth/signin${
      callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
    }`;
    redirect(signInPath);
  }
  return user;
}

/**
 * Server Component / Server Action guard requiring ADMIN role.
 * Redirects to localized sign-in if unauthenticated or not an admin.
 */
export async function requireAdmin(
  callbackUrl?: string,
  locale = "hi"
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) {
    const signInPath = `/${locale}/auth/signin${
      callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
    }`;
    redirect(signInPath);
  }
  return user;
}

/**
 * Route handler guard for APIs requiring an authenticated user.
 * Returns either user or NextResponse (401).
 */
export async function guardApiUser(): Promise<
  { user: AuthenticatedUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required to access this resource." },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Route handler guard for APIs requiring ADMIN role.
 * Returns either user or NextResponse (401/403).
 */
export async function guardApiAdmin(): Promise<
  { user: AuthenticatedUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required to access this resource." },
        { status: 401 }
      ),
    };
  }
  if (user.role !== Role.ADMIN) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden. Administrative privileges required." },
        { status: 403 }
      ),
    };
  }
  return { user };
}
