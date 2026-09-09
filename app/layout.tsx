import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = "https://www.miroiteriedelasalanque.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Menuisier à Perpignan et dans la Salanque | Miroiterie de la Salanque",
    template: "%s | Miroiterie de la Salanque",
  },
  description:
    "Menuisier à Perpignan et dans la Salanque (66) : fenêtres et portes-fenêtres alu ou PVC, portails, portillons, clôtures, pergolas, vérandas, volets roulants, portes de garage et rideaux métalliques. Réparation et dépannage. 30 ans d'expérience, fabriqué en France.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Miroiterie de la Salanque",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
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
