import type { Metadata } from "next";
import { proFontVars } from "../fonts";
import LoginForm from "@/components/pro/LoginForm";
import "../pro.css";

export const metadata: Metadata = {
  title: "Connexion — Espace pro",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className={`pro-root ${proFontVars}`}>
      <div className="pro-aura" aria-hidden>
        <i />
        <i />
      </div>
      <div className="pro-grain" aria-hidden />
      <LoginForm />
    </div>
  );
}
