import type { MetadataRoute } from "next";

const base = "https://www.miroiteriedelasalanque.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "", priority: 1, changeFrequency: "monthly" },
    { path: "/menuiseries", priority: 0.9, changeFrequency: "monthly" },
    { path: "/realisations", priority: 0.8, changeFrequency: "monthly" },
    { path: "/entreprise", priority: 0.6, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/devis", priority: 0.8, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
