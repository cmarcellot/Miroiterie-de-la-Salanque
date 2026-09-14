/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer embarque son propre moteur de rendu React (pour
  // générer les PDF côté serveur) : le laisser hors du bundle webpack des
  // Server Actions évite tout conflit avec l'instance React de l'app.
  serverExternalPackages: ["@react-pdf/renderer"],
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
