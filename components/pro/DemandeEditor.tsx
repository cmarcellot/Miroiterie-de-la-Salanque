"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MESSAGE_STATUSES,
  MESSAGE_STATUS_LABELS,
  type MessageStatus,
} from "@/lib/models/Message";

export default function DemandeEditor({
  id,
  status: initialStatus,
  notes: initialNotes,
}: {
  id: string;
  status: MessageStatus;
  notes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<MessageStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const dirty = status !== initialStatus || notes !== initialNotes;

  async function save() {
    setState("saving");
    try {
      const res = await fetch(`/api/pro/demandes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!res.ok) throw new Error();
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <label className="text-sm font-semibold uppercase text-slate-500">
          Statut
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MessageStatus)}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {MESSAGE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MESSAGE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold uppercase text-slate-500">
          Notes internes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Suivi, relances, éléments du dossier…"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={save}
        disabled={!dirty || state === "saving"}
        className="btn-primary w-full justify-center disabled:opacity-50"
      >
        {state === "saving"
          ? "Enregistrement…"
          : state === "saved"
            ? "Enregistré ✓"
            : "Enregistrer"}
      </button>
      {state === "error" && (
        <p className="text-sm text-red-600">Erreur, réessayez.</p>
      )}
    </div>
  );
}
