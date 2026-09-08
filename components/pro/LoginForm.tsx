"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/pro";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Identifiants incorrects.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="pro-card"
        style={{ width: "100%", maxWidth: 380, padding: 32 }}
      >
        <Image
          src="/logo/mds-bleu-transparent.png"
          alt="Miroiterie de la Salanque"
          width={200}
          height={200}
          style={{ height: 72, width: "auto", margin: "0 auto" }}
        />
        <div
          className="pro-lab"
          style={{ textAlign: "center", marginTop: 16, color: "var(--cyan)" }}
        >
          Miroiterie de la Salanque
        </div>
        <h1
          style={{ textAlign: "center", fontSize: 22, marginTop: 4 }}
        >
          Espace pro
        </h1>

        <form onSubmit={onSubmit} style={{ marginTop: 24, display: "grid", gap: 12 }}>
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            placeholder="Email"
            className="pro-field"
          />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Mot de passe"
            className="pro-field"
          />
          {error && (
            <p style={{ fontSize: 13, color: "var(--danger)" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="pro-btn solid"
            style={{ justifyContent: "center", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
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
