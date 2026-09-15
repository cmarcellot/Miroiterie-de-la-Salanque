/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfkit charge ses polices standard (.afm) via des chemins relatifs à
  // son propre dossier ; le laisser hors du bundle webpack (require natif)
  // évite que ces fichiers ne soient introuvables au runtime.
  serverExternalPackages: ["pdfkit"],
  async redirects() {
    return [
      {
        // Redirige l'apex (et tout autre host) vers www.
        source: "/:path*",
        has: [{ type: "host", value: "miroiteriedelasalanque.fr" }],
        destination: "https://www.miroiteriedelasalanque.fr/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
