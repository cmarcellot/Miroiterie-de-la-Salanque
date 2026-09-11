"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckIcon, solutionIcons } from "./icons";
import { solutions, site } from "@/lib/site";

type Commune = { nom: string; codesPostaux: string[] };

type ProjectOption = { id: string; label: string; icon: string | null };

const PROJECT_OPTIONS: ProjectOption[] = [
  ...solutions.map((s) => ({ id: s.id, label: s.title, icon: s.icon as string })),
  { id: "plusieurs", label: "Plusieurs produits / autre", icon: null },
];

const TIMING_OPTIONS = ["Au plus vite", "Sous 3 mois", "Sous 6 mois", "Pas pressé"];

type Data = {
  product: string;
  dimensions: string;
  timing: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  city: string;
  message: string;
};

const emptyData: Data = {
  product: "",
  dimensions: "",
  timing: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  zip: "",
  city: "",
  message: "",
};

const STEP_COUNT = 4;

const field =
  "w-full rounded-md border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-royal focus:bg-white focus:ring-1 focus:ring-royal";

export default function QuoteWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(emptyData);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Data>(k: K, v: Data[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const projectLabel =
    PROJECT_OPTIONS.find((o) => o.id === data.product)?.label || "";

  async function submitRequest() {
    setSending(true);
    setError("");
    const subject = projectLabel ? `Devis — ${projectLabel}` : "Demande de devis";
    const message = [
      projectLabel && `Type de projet : ${projectLabel}`,
      data.dimensions && `Détails du chantier : ${data.dimensions}`,
      data.timing && `Échéance souhaitée : ${data.timing}`,
      data.message && `\n${data.message}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone,
          zip: data.zip,
          city: data.city,
          subject,
          message: message || "Demande de devis envoyée depuis le site.",
          source: "devis",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setStep(STEP_COUNT);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSending(false);
    }
  }

  function next() {
    if (step === STEP_COUNT - 1) {
      submitRequest();
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_COUNT));
  }
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canContinue =
    (step === 0 && data.product) ||
    step === 1 ||
    (step === 2 && data.firstName && data.lastName && data.email) ||
    step === 3;

  return (
    <section className="container-mds py-16">
      <div className="grid gap-12 rounded-3xl bg-navy px-6 py-12 text-white sm:px-10 sm:py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:p-16">
        <div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Demande de devis
          </div>
          <h1 className="mb-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Un devis clair, gratuit, sans engagement.
          </h1>
          <p className="mb-7 max-w-sm text-white/70">
            Décrivez votre projet en quelques étapes. Nous reprenons contact
            sous 48h ouvrées pour planifier une visite gratuite et chiffrer
            précisément.
          </p>
          <ul className="flex flex-col gap-3.5 text-sm text-white/80">
            {[
              "Décrivez votre projet en 4 étapes simples",
              "Nous vous rappelons sous 48h ouvrées",
              "Visite gratuite et devis détaillé sous 7 jours",
              "Pas d'acompte tant que rien n'est signé",
            ].map((t, i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="pt-0.5 font-mono text-xs text-white/50">
                  0{i + 1}
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 text-slate-800 sm:p-8">
          {step < STEP_COUNT && (
            <div className="mb-1 flex gap-2">
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < step ? "bg-royal" : i === step ? "bg-navy" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          )}

          {step === 0 && (
            <>
              <StepLabel n={1} />
              <StepTitle>Quel type de projet ?</StepTitle>
              <div className="grid grid-cols-2 gap-2.5">
                {PROJECT_OPTIONS.map((opt) => {
                  const Icon = opt.icon ? solutionIcons[opt.icon] : null;
                  const selected = data.product === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set("product", opt.id)}
                      className={`flex flex-col items-start gap-1.5 rounded-md border px-3.5 py-3 text-left transition ${
                        selected
                          ? "border-royal bg-royal/5"
                          : "border-slate-200 hover:border-navy"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 text-royal" />}
                      <span className="text-sm font-medium text-slate-800">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <StepLabel n={2} />
              <StepTitle>Quelques détails sur le chantier.</StepTitle>
              <textarea
                className={`${field} min-h-[88px] resize-y`}
                placeholder="Nombre de pièces, dimensions approximatives, contraintes particulières…"
                value={data.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
              />
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Échéance souhaitée
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {TIMING_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("timing", opt)}
                    className={`rounded-md border px-3.5 py-3 text-left text-sm font-medium transition ${
                      data.timing === opt
                        ? "border-royal bg-royal/5 text-slate-800"
                        : "border-slate-200 text-slate-700 hover:border-navy"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <StepLabel n={3} />
              <StepTitle>Vos coordonnées.</StepTitle>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  className={field}
                  placeholder="Prénom *"
                  value={data.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
                <input
                  className={field}
                  placeholder="Nom *"
                  value={data.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="email"
                  className={field}
                  placeholder="Email *"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <input
                  className={field}
                  placeholder="Téléphone"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <ZipCityFields
                zip={data.zip}
                city={data.city}
                onChange={(zip, city) => {
                  set("zip", zip);
                  set("city", city);
                }}
              />
            </>
          )}

          {step === 3 && (
            <>
              <StepLabel n={4} />
              <StepTitle>Un dernier mot ?</StepTitle>
              <textarea
                className={`${field} min-h-[88px] resize-y`}
                placeholder="Ajoutez tout ce qui peut nous aider à mieux chiffrer (optionnel)."
                value={data.message}
                onChange={(e) => set("message", e.target.value)}
              />
              <p className="text-xs leading-relaxed text-slate-400">
                En envoyant ce formulaire vous acceptez que vos données soient
                utilisées pour traiter votre demande. Pas de spam — réponse
                sous 48h ouvrées.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </>
          )}

          {step === STEP_COUNT && (
            <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-royal text-white">
                <CheckIcon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">
                Demande envoyée.
              </h3>
              <p className="text-sm text-slate-500">
                Nous vous rappelons sous 48h ouvrées.
                <br />
                D&apos;ici là, vous pouvez nous joindre au{" "}
                <strong className="text-slate-800">{site.phone}</strong>.
              </p>
            </div>
          )}

          {step < STEP_COUNT && (
            <div className="mt-1 flex items-center justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="text-sm text-slate-500 hover:text-navy"
                >
                  ← Retour
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={next}
                disabled={!canContinue || sending}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending
                  ? "Envoi…"
                  : step === STEP_COUNT - 1
                    ? "Envoyer ma demande"
                    : "Continuer"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StepLabel({ n }: { n: number }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-400">
      Étape {n} sur {STEP_COUNT}
    </div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="-mt-1 mb-1 text-2xl font-bold leading-tight text-slate-900">
      {children}
    </h2>
  );
}

/** Code postal + ville, liés par l'API geo.api.gouv.fr (communes françaises, gratuite, sans clé). */
function ZipCityFields({
  zip,
  city,
  onChange,
}: {
  zip: string;
  city: string;
  onChange: (zip: string, city: string) => void;
}) {
  const [results, setResults] = useState<Commune[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<"zip" | "city" | null>(null);
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

  useEffect(() => {
    if (!active) return;
    const q = active === "zip" ? zip.trim() : city.trim();
    const isZip = active === "zip";
    if (isZip ? q.length !== 5 : q.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const url = isZip
      ? `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(q)}&fields=nom,codesPostaux&limit=10`
      : `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&fields=nom,codesPostaux&boost=population&limit=7`;
    const t = setTimeout(() => {
      fetch(url, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : []))
        .then((list: Commune[]) => {
          setResults(Array.isArray(list) ? list : []);
          setOpen(true);
        })
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [zip, city, active]);

  function pick(c: Commune, cp?: string) {
    onChange(cp || c.codesPostaux[0] || zip, c.nom);
    setOpen(false);
    setResults([]);
    setActive(null);
  }

  return (
    <div ref={boxRef} className="relative grid grid-cols-[120px_1fr] gap-2.5">
      <input
        value={zip}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5), city)}
        onFocus={() => setActive("zip")}
        placeholder="Code postal"
        inputMode="numeric"
        autoComplete="off"
        className={field}
      />
      <input
        value={city}
        onChange={(e) => onChange(zip, e.target.value)}
        onFocus={() => setActive("city")}
        placeholder="Ville (ou tapez le nom)"
        autoComplete="off"
        className={field}
      />

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">
          {results.flatMap((c) =>
            (active === "zip" ? [zip] : c.codesPostaux.slice(0, 3)).map((cp) => (
              <li key={`${c.nom}-${cp}`}>
                <button
                  type="button"
                  onClick={() => pick(c, cp)}
                  className="flex w-full items-center justify-between gap-3 rounded px-2.5 py-2 text-left text-sm hover:bg-slate-100"
                >
                  <span className="text-slate-800">{c.nom}</span>
                  <span className="font-mono text-xs text-slate-400">{cp}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
