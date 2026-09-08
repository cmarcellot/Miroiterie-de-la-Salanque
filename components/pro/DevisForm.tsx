"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { VAT_RATES, computeTotals, formatEUR, type LineItem } from "@/lib/pro-enums";

type Values = {
  clientId?: string;
  date?: string; // yyyy-mm-dd
  validUntil?: string;
  depositPct?: number;
  notes?: string;
  items?: LineItem[];
};

const emptyItem = (): LineItem => ({
  label: "",
  qty: 1,
  unitPrice: 0,
  vatRate: 20,
});

export default function DevisForm({
  action,
  clients,
  values = {},
  lockClient = false,
  cancelHref,
  submitLabel = "Enregistrer",
}: {
  action: (formData: FormData) => Promise<void>;
  clients: { id: string; name: string }[];
  values?: Values;
  lockClient?: boolean;
  cancelHref: string;
  submitLabel?: string;
}) {
  const [items, setItems] = useState<LineItem[]>(
    values.items && values.items.length ? values.items : [emptyItem()]
  );
  const [pending, setPending] = useState(false);

  const totals = useMemo(() => computeTotals(items), [items]);

  function update(i: number, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    );
  }

  const field = "pro-field";
  const cell: CSSProperties = { padding: "6px 0" };

  return (
    <form
      action={async (fd) => {
        fd.set("items", JSON.stringify(items));
        setPending(true);
        try {
          await action(fd);
        } finally {
          setPending(false);
        }
      }}
      className="pro-card"
      style={{ padding: "20px 22px", display: "grid", gap: 18 }}
    >
      <div
        style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        <div>
          <label className="pro-lab">Client *</label>
          <select
            name="clientId"
            required
            defaultValue={values.clientId ?? ""}
            disabled={lockClient}
            className={field}
            style={{ marginTop: 8 }}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {lockClient && values.clientId && (
            <input type="hidden" name="clientId" value={values.clientId} />
          )}
        </div>
        <div>
          <label className="pro-lab">Date d&apos;émission</label>
          <input
            type="date"
            name="date"
            defaultValue={values.date}
            className={field}
            style={{ marginTop: 8 }}
          />
        </div>
        <div>
          <label className="pro-lab">Valable jusqu&apos;au</label>
          <input
            type="date"
            name="validUntil"
            defaultValue={values.validUntil}
            className={field}
            style={{ marginTop: 8 }}
          />
        </div>
      </div>

      <div>
        <label className="pro-lab">Lignes</label>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="pro-lab" style={{ textAlign: "left" }}>
                  Désignation
                </th>
                <th className="pro-lab" style={{ width: 70 }}>
                  Qté
                </th>
                <th className="pro-lab" style={{ width: 110 }}>
                  P.U. HT
                </th>
                <th className="pro-lab" style={{ width: 90 }}>
                  TVA
                </th>
                <th
                  className="pro-lab"
                  style={{ width: 110, textAlign: "right" }}
                >
                  Total HT
                </th>
                <th style={{ width: 34 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={{ ...cell, paddingRight: 8 }}>
                    <input
                      value={it.label}
                      onChange={(e) => update(i, { label: e.target.value })}
                      placeholder="Fourniture ou prestation"
                      className={field}
                    />
                  </td>
                  <td style={{ ...cell, paddingRight: 8 }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={it.qty}
                      onChange={(e) =>
                        update(i, { qty: Number(e.target.value) })
                      }
                      className={field}
                    />
                  </td>
                  <td style={{ ...cell, paddingRight: 8 }}>
                    <input
                      type="number"
                      step="0.01"
                      value={it.unitPrice}
                      onChange={(e) =>
                        update(i, { unitPrice: Number(e.target.value) })
                      }
                      className={field}
                    />
                  </td>
                  <td style={{ ...cell, paddingRight: 8 }}>
                    <select
                      value={it.vatRate}
                      onChange={(e) =>
                        update(i, { vatRate: Number(e.target.value) })
                      }
                      className={field}
                    >
                      {VAT_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r} %
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    style={{ ...cell, textAlign: "right" }}
                    className="pro-mono"
                  >
                    {formatEUR((it.qty || 0) * (it.unitPrice || 0))}
                  </td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setItems((p) => p.filter((_, idx) => idx !== i))
                        }
                        aria-label="Supprimer la ligne"
                        style={{ color: "var(--danger)", fontSize: 16 }}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => setItems((p) => [...p, emptyItem()])}
          className="pro-btn ghost"
          style={{ marginTop: 10, padding: "7px 14px", fontSize: 12 }}
        >
          + Ajouter une ligne
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 28,
          fontFamily: "var(--font-pro-mono)",
          fontSize: 13,
        }}
      >
        <div style={{ display: "grid", gap: 4, textAlign: "right" }}>
          <div>Total HT&nbsp;&nbsp;{formatEUR(totals.totalHT)}</div>
          <div>TVA&nbsp;&nbsp;{formatEUR(totals.totalTVA)}</div>
          <div
            style={{
              fontFamily: "var(--font-chivo)",
              fontWeight: 900,
              fontSize: 16,
              color: "var(--marine)",
            }}
          >
            Total TTC&nbsp;&nbsp;{formatEUR(totals.totalTTC)}
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gap: 12, gridTemplateColumns: "160px 1fr" }}
      >
        <div>
          <label className="pro-lab">Acompte (%)</label>
          <input
            type="number"
            name="depositPct"
            min="0"
            max="100"
            defaultValue={values.depositPct ?? 30}
            className={field}
            style={{ marginTop: 8 }}
          />
        </div>
        <div>
          <label className="pro-lab">Notes / conditions</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={values.notes}
            placeholder="Conditions de règlement, garanties, mentions particulières…"
            className={field}
            style={{ marginTop: 8, resize: "vertical" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={pending}
          className="pro-btn solid"
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <Link href={cancelHref} className="pro-btn ghost">
          Annuler
        </Link>
      </div>
    </form>
  );
}
