"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X, ArrowRight } from "lucide-react";
import { proFontVars } from "@/app/pro/fonts";
import "@/app/login-modal.css";

/**
 * Carte de connexion partagée par le vrai modal (déclenché depuis "Espace
 * pro" sur la vitrine, sans navigation) et par /pro/login (secours pour un
 * accès direct/lien profond, où le middleware redirige sans page vitrine
 * à afficher derrière).
 */
export default function LoginModalCard({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      password: data.get("password"),
      redirect: false,
    });
    if (res?.error) {
      setLoading(false);
      setError("Mot de passe incorrect.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onSuccess();
  }

  return (
    <div
      className={`pro-login-overlay ${proFontVars}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        className={`pro-login-card${shake ? " pro-shake" : ""}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="pro-login-close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="pro-login-lab">Espace pro</div>
        <h2>
          Accès <em>réservé.</em>
        </h2>
        <p className="pro-login-sub">
          Entrez votre mot de passe pour accéder à votre tableau de bord, vos
          devis et vos factures.
        </p>

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="••••••••••"
          onChange={() => setError("")}
        />
        {error && <div className="pro-login-err">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="pro-login-submit"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Connexion…" : "Se connecter"}
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>
    </div>
  );
}
