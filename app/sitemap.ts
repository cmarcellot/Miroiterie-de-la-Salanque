import type { MetadataRoute } from "next";

const base = "https://www.miroiterie-salanque.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/menuiseries",
    "/fermetures-protections",
    "/realisations",
    "/entreprise",
    "/contact",
    "/devis",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
  }));
}
