import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    "25 ans d'expérience en menuiserie et serrurerie à Perpignan et dans la Salanque : fenêtres et portes-fenêtres PVC ou aluminium, portails, clôtures, pergolas, vérandas, volets roulants et portes de garage. Produits fabriqués en France.",
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
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
