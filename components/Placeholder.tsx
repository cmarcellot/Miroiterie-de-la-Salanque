/**
 * Placeholder visuel en attendant les vraies photos.
 * Remplacer par <Image src="/img/..." .../> une fois les photos fournies.
 */
export default function Placeholder({
  label,
  className = "",
  ratio = "aspect-[4/3]",
}: {
  label: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      className={`relative ${ratio} w-full overflow-hidden bg-gradient-to-br from-navy/10 via-slate-100 to-navy/5 ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(#14315b_1px,transparent_1px),linear-gradient(90deg,#14315b_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded bg-white/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
          Photo — {label}
        </span>
      </div>
    </div>
  );
}
