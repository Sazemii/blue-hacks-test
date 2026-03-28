"use client";

import { createContext, useContext } from "react";

export type Theme = "dark" | "light";

export const ThemeContext = createContext<Theme>("dark");

export function useTheme() {
  return useContext(ThemeContext);
}
