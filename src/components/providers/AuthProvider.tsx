"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/** Makes the signed-in state available to the header, menus and logout buttons. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
