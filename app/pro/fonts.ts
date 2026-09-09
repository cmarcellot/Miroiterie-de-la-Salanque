import { Syne, Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Typographie reprise du prototype Claude Design :
//   Syne          -> titres / valeurs  (--font-syne  -> var CSS --pro-display)
//   Space Grotesk -> texte courant      (--font-space -> var CSS --pro-sans)
//   Geist Mono    -> labels / montants  (--font-geist-mono -> var CSS --pro-mono)

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

/** À poser sur l'élément .pro-root pour exposer toutes les variables de police. */
export const proFontVars = [
  GeistSans.variable,
  GeistMono.variable,
  syne.variable,
  space.variable,
].join(" ");
