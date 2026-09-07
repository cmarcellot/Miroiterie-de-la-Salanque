import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = "https://www.miroiterie-salanque.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Miroiterie de la Salanque | Menuiserie & serrurerie à Perpignan",
    template: "%s | Miroiterie de la Salanque",
  },
  description:
    "30 ans d'expérience en menuiserie et serrurerie à Perpignan et dans la Salanque : fenêtres et portes-fenêtres PVC ou aluminium, portails, clôtures, pergolas, vérandas, volets roulants, portes de garage et rideaux métalliques. Produits fabriqués en France.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Miroiterie de la Salanque",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
