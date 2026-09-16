import GlobalSearch from "@/components/pro/GlobalSearch";
import Notifications from "@/components/pro/Notifications";
import type { NotificationItem } from "@/lib/notifications";

export default function Topbar({
  email,
  name,
  pending,
  notifications,
}: {
  email?: string | null;
  name?: string | null;
  pending: number;
  notifications: NotificationItem[];
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
      <GlobalSearch />
      <div style={{ flex: 1 }} />

      {pending > 0 && (
        <div className="pro-pill">
          <span className="dot" />
          {pending} demande{pending > 1 ? "s" : ""} en attente
        </div>
      )}

      <Notifications items={notifications} />

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
