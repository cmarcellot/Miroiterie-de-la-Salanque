"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Inbox,
  ReceiptText,
  FileText,
  Check,
  HardHat,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem, NotificationType } from "@/lib/notifications";

const TYPE_META: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  lead: { icon: Inbox, color: "var(--acier)" },
  late: { icon: ReceiptText, color: "var(--danger)" },
  pending: { icon: FileText, color: "var(--warn)" },
  signed: { icon: Check, color: "var(--ok)" },
  chantier: { icon: HardHat, color: "var(--acier)" },
};

/** Types qui méritent le petit point rouge sur la cloche — même logique que le proto. */
const PRIORITY_TYPES: NotificationType[] = ["lead", "late"];

export default function Notifications({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const count = items.length;
  const priorityCount = items.filter((it) => PRIORITY_TYPES.includes(it.type)).length;

  function go(item: NotificationItem) {
    router.push(item.href);
    setOpen(false);
  }

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="pro-pill"
        style={{
          width: 38,
          height: 38,
          padding: 0,
          justifyContent: "center",
          position: "relative",
        }}
        title="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="h-4 w-4" strokeWidth={1.7} />
        {priorityCount > 0 && <span className="pro-notif-pip" />}
      </button>

      {open && (
        <div className="pro-notif-dropdown">
          <div className="pro-notif-head">
            <div className="pro-lab" style={{ fontSize: 15, fontFamily: "var(--pro-display)" }}>
              Notifications
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
              {count === 0
                ? "Tout est à jour."
                : `${count} élément${count > 1 ? "s" : ""} à voir.`}
            </div>
          </div>
          <div className="pro-notif-body">
            {count === 0 ? (
              <div className="pro-notif-empty">
                <CheckCheck className="h-6 w-6" style={{ opacity: 0.4 }} />
                <div style={{ marginTop: 8 }}>Aucune nouvelle notification.</div>
              </div>
            ) : (
              items.map((it) => {
                const meta = TYPE_META[it.type];
                const Icon = meta.icon;
                return (
                  <button
                    key={it.id}
                    type="button"
                    className="pro-notif-item"
                    onClick={() => go(it)}
                  >
                    <span
                      className="ico"
                      style={{
                        background: `color-mix(in oklab, ${meta.color} 14%, #fff)`,
                        color: meta.color,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="tx">
                      <span className="nm">{it.title}</span>
                      <span className="sb">{it.sub}</span>
                    </span>
                    <span className="tm">{it.time}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
