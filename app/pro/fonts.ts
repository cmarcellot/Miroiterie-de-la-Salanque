import "@fontsource/syne/400.css";
import "@fontsource/syne/500.css";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Typographie reprise du prototype Claude Design :
//   Syne          -> titres / valeurs  (police "Syne", cf. --pro-display dans pro.css)
//   Space Grotesk -> texte courant      (police "Space Grotesk", cf. --pro-sans)
//   Geist Mono    -> labels / montants  (--font-geist-mono -> var CSS --pro-mono)
//
// Syne et Space Grotesk étaient chargées via next/font/google, qui télécharge
// les polices depuis Google Fonts AU MOMENT DU BUILD. Ça a fait échouer le
// build Dokploy deux fois de suite avec la même erreur (bug connu et non
// résolu de Next.js : https://github.com/vercel/next.js/issues/99114 —
// Google Fonts renvoie parfois une URL de police sans extension que
// next/font ne sait pas parser). @fontsource héberge les fichiers de police
// directement dans node_modules : plus aucun réseau nécessaire au build.

/** À poser sur l'élément .pro-root pour exposer la variable de police Geist Mono. */
export const proFontVars = [GeistSans.variable, GeistMono.variable].join(" ");
