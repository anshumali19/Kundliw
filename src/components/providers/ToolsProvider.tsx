"use client";

import { createContext, useContext, type ReactNode } from "react";

const HiddenToolsContext = createContext<string[]>([]);

/** Pages the admin has switched off (for example /kundli); menus use this to hide their links. */
export function ToolsProvider({ hidden, children }: { hidden: string[]; children: ReactNode }) {
  return <HiddenToolsContext.Provider value={hidden}>{children}</HiddenToolsContext.Provider>;
}

export function useHiddenTools() {
  const hidden = useContext(HiddenToolsContext);
  return <T extends { href: string }>(items: T[]): T[] => items.filter((i) => !hidden.includes(i.href.split("#")[0]));
}
