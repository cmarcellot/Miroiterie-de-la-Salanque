"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

/**
 * Affiche un toast flottant dès que le paramètre `param` apparaît dans l'URL
 * (le serveur redirige vers `?ok=<timestamp>` après une sauvegarde).
 * Nettoie l'URL sans re-render et se masque au bout de `duration` ms.
 */
function ToastInner({
  message,
  param = "ok",
  duration = 3200,
}: {
  message: string;
  param?: string;
  duration?: number;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);
  const token = search.get(param);

  useEffect(() => {
    if (!token) return;
    setVisible(true);
    try {
      window.history.replaceState(null, "", pathname);
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [token, pathname, duration]);

  if (!visible) return null;

  return (
    <div className="pro-toast" role="status">
      <span className="pro-toast-ic">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      {message}
    </div>
  );
}

export default function Toast(props: {
  message: string;
  param?: string;
  duration?: number;
}) {
  return (
    <Suspense>
      <ToastInner {...props} />
    </Suspense>
  );
}
