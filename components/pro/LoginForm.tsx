"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ArrowRight } from "lucide-react";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/pro";
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
    // Navigation complète (pas router.push) : le cookie de session tout
    // juste posé par signIn() doit être présent dès la première requête
    // vue par le middleware, sinon il rebondit sur /pro/login et il faut
    // cliquer une seconde fois.
    window.location.href = callbackUrl;
  }

  return (
    <div
      className="pro-login-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) router.push("/");
      }}
    >
      <form
        onSubmit={onSubmit}
        className={`pro-login-card${shake ? " pro-shake" : ""}`}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
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
          className="pro-btn solid pro-login-submit"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Connexion…" : "Se connecter"}
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
