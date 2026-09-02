import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-royal text-white">
      <svg
        viewBox="0 0 1200 160"
        className="absolute bottom-0 left-0 w-full text-white/10"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 160 L200 50 L340 120 L500 30 L680 130 L880 55 L1050 125 L1200 70 L1200 160 Z" />
      </svg>
      <div className="container-mds relative flex flex-col items-center gap-6 py-14 text-center lg:flex-row lg:justify-between lg:text-left">
        <div>
          <h2 className="text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
            Un projet de menuiserie ?
          </h2>
          <p className="mt-2 max-w-xl text-white/85">
            Fenêtres, portail, clôture, pergola, porte de garage… Parlons de
            votre projet, nous vous accompagnons.
          </p>
        </div>
        <Link href="/devis" className="btn-white shrink-0">
          Demander un devis <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
