"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
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

  const field =
    "w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-royal focus:ring-1 focus:ring-royal";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Image
          src="/logo/mds-bleu-transparent.png"
          alt="Miroiterie de la Salanque"
          width={200}
          height={200}
          className="mx-auto h-20 w-auto"
        />
        <h1 className="mt-4 text-center text-lg font-bold text-navy">
          Espace pro
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            placeholder="Email"
            className={field}
          />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Mot de passe"
            className={field}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
