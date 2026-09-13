"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CHANTIER_STATUSES, CHANTIER_STATUS_LABELS } from "@/lib/pro-enums";

export default function ChantierStatusSelect({
  status,
  onChange,
}: {
  status: string;
  onChange: (status: string) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className="pro-lab"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      Statut
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value;
          startTransition(async () => {
            await onChange(v);
            router.refresh();
          });
        }}
        className="pro-field"
        style={{ width: "auto", padding: "6px 10px" }}
      >
        {CHANTIER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CHANTIER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
