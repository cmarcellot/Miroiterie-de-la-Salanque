"use client";

import { useState } from "react";
import { ArrowRight } from "./icons";

type Status = "idle" | "sending" | "ok" | "error";

export default function ContactForm({
  source = "contact",
}: {
  source?: "contact" | "devis";
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800">
        <p className="font-semibold">Message envoyé.</p>
        <p className="mt-1 text-sm">
          Merci, nous revenons vers vous au plus vite.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-royal focus:ring-1 focus:ring-royal";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Nom *" className={field} />
        <input
          type="email"
          name="email"
          required
          placeholder="Email *"
          className={field}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="phone" placeholder="Téléphone" className={field} />
        <input name="subject" placeholder="Sujet" className={field} />
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Votre message *"
        className={field}
      />
      {status === "error" && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary disabled:opacity-60"
      >
        {status === "sending" ? "Envoi…" : "Envoyer"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
