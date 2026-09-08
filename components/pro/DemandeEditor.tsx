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
    <div
      className="pro-card"
      style={{ padding: "16px 20px", display: "grid", gap: 16 }}
    >
      <div>
        <label className="pro-lab">Statut</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MessageStatus)}
          className="pro-field"
          style={{ marginTop: 8 }}
        >
          {MESSAGE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MESSAGE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="pro-lab">Notes internes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={7}
          placeholder="Suivi, relances, éléments du dossier…"
          className="pro-field"
          style={{ marginTop: 8, resize: "vertical" }}
        />
      </div>

      <button
        onClick={save}
        disabled={!dirty || state === "saving"}
        className="pro-btn solid"
        style={{
          justifyContent: "center",
          opacity: !dirty || state === "saving" ? 0.5 : 1,
        }}
      >
        {state === "saving"
          ? "Enregistrement…"
          : state === "saved"
            ? "Enregistré ✓"
            : "Enregistrer"}
      </button>
      {state === "error" && (
        <p style={{ fontSize: 13, color: "var(--danger)" }}>
          Erreur, réessayez.
        </p>
      )}
    </div>
  );
}
