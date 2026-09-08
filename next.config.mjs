/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
