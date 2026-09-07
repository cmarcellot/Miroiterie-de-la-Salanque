export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Bientôt disponible
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
