import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import LoginForm from "@/components/pro/LoginForm";
import "../pro.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Connexion — Espace pro",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div
      className={`pro-root ${GeistSans.variable} ${GeistMono.variable} ${serif.variable}`}
    >
      <div className="pro-aura" aria-hidden>
        <i />
        <i />
      </div>
      <div className="pro-grain" aria-hidden />
      <LoginForm />
    </div>
  );
}
