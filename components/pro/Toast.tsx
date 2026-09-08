"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

/**
 * Affiche un toast flottant quand `?ok=1` (ou la valeur `param`) est présent
 * dans l'URL, puis nettoie l'URL et se masque au bout de `duration` ms.
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
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (search.get(param) !== "1") return;
    setVisible(true);

    // Nettoie l'URL sans recharger
    const next = new URLSearchParams(search.toString());
    next.delete(param);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
