"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function ClientRow({
  id,
  initials,
  name,
  typeLabel,
  phone,
  email,
  city,
  devisCount,
}: {
  id: string;
  initials: string;
  name: string;
  typeLabel: string;
  phone: string;
  email: string;
  city: string;
  devisCount: number;
}) {
  const router = useRouter();
  const href = `/pro/clients/${id}`;

  return (
    <tr
      className="clickable"
      onClick={() => router.push(href)}
    >
      <td>
        <div className="pro-namecell">
          <span className="pro-avatar">{initials}</span>
          <div>
            <Link
              href={href}
              className="nm"
              onClick={(e) => e.stopPropagation()}
            >
              {name}
            </Link>
            <div className="sb">{phone || email || "—"}</div>
          </div>
        </div>
      </td>
      <td style={{ color: "var(--ink-3)" }}>{typeLabel}</td>
      <td style={{ color: "var(--ink-3)" }}>{city || "—"}</td>
      <td>
        {devisCount > 0 ? (
          <span className="pro-tag">
            <FileText className="h-3 w-3" />
            {devisCount}
          </span>
        ) : (
          <span className="pro-tag muted">—</span>
        )}
      </td>
    </tr>
  );
}
