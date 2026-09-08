"use client";

import { useState } from "react";

export default function DeleteButton({
  action,
  confirmText,
  label = "Supprimer",
}: {
  action: () => Promise<void>;
  confirmText: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async () => {
        setPending(true);
        try {
          await action();
        } finally {
          setPending(false);
        }
      }}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="pro-btn ghost"
        style={{
          borderColor: "rgba(209,86,96,.5)",
          color: "var(--danger)",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Suppression…" : label}
      </button>
    </form>
  );
}
