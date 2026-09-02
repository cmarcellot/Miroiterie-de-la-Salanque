import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Miroiterie de la Salanque",
    template: "%s | Miroiterie de la Salanque",
  },
  description:
    "Miroiterie de la Salanque — pose et fabrication de vitrages, miroirs, vérandas et menuiseries aluminium dans les Pyrénées-Orientales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
