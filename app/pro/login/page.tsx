import type { Metadata } from "next";
import { Chivo, Manrope, Roboto_Mono } from "next/font/google";
import LoginForm from "@/components/pro/LoginForm";
import "../pro.css";

const chivo = Chivo({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-chivo",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});
const mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pro-mono",
});

export const metadata: Metadata = {
  title: "Connexion — Espace pro",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div
      className={`pro-root ${chivo.variable} ${manrope.variable} ${mono.variable}`}
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
