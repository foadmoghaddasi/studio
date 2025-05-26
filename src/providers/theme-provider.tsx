"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function useTheme() {
  const context = React.useContext(NextThemesProvider);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  // Directly return what next-themes' useTheme returns
  // This might require using next-themes' useTheme hook directly in components instead of this custom hook
  // For simplicity, let's assume components will import `useTheme` from `next-themes` directly.
  // This provider component is mostly for setting up the NextThemesProvider.
  // If a custom hook is strictly needed to re-export, it should call `useTheme` from `next-themes`.
  return context; 
}
