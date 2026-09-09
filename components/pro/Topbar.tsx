import { Bell, Search } from "lucide-react";

export default function Topbar({
  email,
  name,
  pending,
}: {
  email?: string | null;
  name?: string | null;
  pending: number;
}) {
  const display = name || email || "Compte";
  const initials = display
    .replace(/@.*/, "")
    .split(/[.\s_-]+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="pro-top">
      <div className="pro-search">
        <Search />
        <input placeholder="Rechercher une demande, un contact…" disabled />
      </div>
      <div style={{ flex: 1 }} />

      {pending > 0 && (
        <div className="pro-pill">
          <span className="dot" />
          {pending} demande{pending > 1 ? "s" : ""} en attente
        </div>
      )}

      <span
        className="pro-pill"
        style={{ width: 38, height: 38, padding: 0, justifyContent: "center" }}
        aria-hidden
      >
        <Bell className="h-4 w-4" strokeWidth={1.7} />
      </span>

      <div className="pro-me">
        <div className="av">{initials || "·"}</div>
        <div className="t">
          {name || "Gérant"}
          <span>{email}</span>
        </div>
      </div>
    </div>
  );
}
