"use client";

import React, { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.8,
        infinite: false,
        // Menus, dialogs and any box that scrolls on its own keep the browser's native wheel scrolling.
        prevent: (node: HTMLElement) => !!node.closest("[class*=\"overflow-y-auto\"], [class*=\"overflow-auto\"], [role=dialog], [data-lenis-prevent]"),
      }}
    >
      {children}
    </ReactLenis>
  );
}
