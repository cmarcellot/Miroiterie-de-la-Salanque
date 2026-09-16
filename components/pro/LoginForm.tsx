"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

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
      className="pro-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) router.push("/");
      }}
    >
      <form
        onSubmit={onSubmit}
        className={`pro-modal${shake ? " pro-shake" : ""}`}
        style={{ maxWidth: 400 }}
      >
        <Link href="/" aria-label="Fermer" className="pro-modal-close">
          <X className="h-4 w-4" />
        </Link>

        <div style={{ textAlign: "center" }}>
          <Image
            src="/logo/mds-bleu-transparent.png"
            alt="Miroiterie de la Salanque"
            width={200}
            height={200}
            style={{ height: 56, width: "auto", margin: "0 auto" }}
          />
        </div>

        <div className="pro-modal-head" style={{ textAlign: "center" }}>
          <div className="pro-lab">Espace pro</div>
          <h2>Accès réservé.</h2>
          <p>
            Entrez votre mot de passe pour accéder à votre tableau de bord,
            vos devis et vos factures.
          </p>
        </div>

        <div>
          <label className="pro-lbl" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••••"
            className="pro-field"
            style={{ marginTop: 8 }}
            onChange={() => setError("")}
          />
          {error && (
            <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 8 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="pro-btn solid"
            style={{
              justifyContent: "center",
              width: "100%",
              marginTop: 16,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </div>
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
