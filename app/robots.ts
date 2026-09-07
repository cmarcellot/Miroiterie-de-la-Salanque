import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/pro", "/api"] },
    sitemap: "https://www.miroiterie-salanque.fr/sitemap.xml",
  };
}
