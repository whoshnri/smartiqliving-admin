import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";

// `next/font/google` downloads every registered font while building. Google
// sometimes serves an extensionless font URL, which Next 16.3.6 cannot parse
// and makes clean Cloudflare builds fail intermittently. Keep the bundled
// Geist fonts and let the other optional display choices use their CSS stacks.
const cssFont = () => ({ variable: "" });

const inter = cssFont();
const notoSans = cssFont();
const roboto = cssFont();
const geist = GeistSans;
const outfit = cssFont();
const geistMono = GeistMono;
const dmSans = cssFont();
const nunitoSans = cssFont();
const figtree = cssFont();
const raleway = cssFont();
const publicSans = cssFont();
const jetBrainsMono = cssFont();
const notoSerif = cssFont();
const robotoSlab = cssFont();
const merriweather = cssFont();
const lora = cssFont();
const playfairDisplay = cssFont();

export const fontRegistry = {
  geist: {
    label: "Geist",
    font: geist,
  },
  inter: {
    label: "Inter",
    font: inter,
  },
  notoSans: {
    label: "Noto Sans",
    font: notoSans,
  },
  nunitoSans: {
    label: "Nunito Sans",
    font: nunitoSans,
  },
  figtree: {
    label: "Figtree",
    font: figtree,
  },
  roboto: {
    label: "Roboto",
    font: roboto,
  },
  raleway: {
    label: "Raleway",
    font: raleway,
  },
  dmSans: {
    label: "DM Sans",
    font: dmSans,
  },
  publicSans: {
    label: "Public Sans",
    font: publicSans,
  },
  outfit: {
    label: "Outfit",
    font: outfit,
  },
  geistMono: {
    label: "Geist Mono",
    font: geistMono,
  },
  geistPixelSquare: {
    label: "Geist Pixel Square",
    font: GeistPixelSquare,
  },
  jetBrainsMono: {
    label: "JetBrains Mono",
    font: jetBrainsMono,
  },
  notoSerif: {
    label: "Noto Serif",
    font: notoSerif,
  },
  robotoSlab: {
    label: "Roboto Slab",
    font: robotoSlab,
  },
  merriweather: {
    label: "Merriweather",
    font: merriweather,
  },
  lora: {
    label: "Lora",
    font: lora,
  },
  playfairDisplay: {
    label: "Playfair Display",
    font: playfairDisplay,
  },
} as const;

export type FontKey = keyof typeof fontRegistry;

export const fontKeys = Object.keys(fontRegistry) as FontKey[];

export const fontVars = [geist, geistMono, GeistPixelSquare].map((font) => font.variable).join(" ");

export const fontOptions = fontKeys.map((key) => ({
  key,
  label: fontRegistry[key].label,
}));
