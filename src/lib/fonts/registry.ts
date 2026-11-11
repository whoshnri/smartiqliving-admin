import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

// These ship from the installed Geist package, so builds never need to fetch
// a font from Google. Keeping a single display family also prevents a stale
// preference cookie from selecting an unavailable font fallback.
export const fontRegistry = {
  geist: {
    label: "Geist",
    font: GeistSans,
  },
} as const;

export type FontKey = keyof typeof fontRegistry;

export const fontKeys = Object.keys(fontRegistry) as FontKey[];

export const fontVars = [GeistSans, GeistMono].map((font) => font.variable).join(" ");

export const fontOptions = fontKeys.map((key) => ({
  key,
  label: fontRegistry[key].label,
}));
