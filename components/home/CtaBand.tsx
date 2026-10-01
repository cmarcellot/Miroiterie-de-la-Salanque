import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-royal text-white">
      {/* Même photo et même traitement que WhyUs (unoptimized : voir le
          commentaire là-bas, sinon la photo devient floue). */}
      <Image
        src="/images/savoir-faire-canigou.webp"
        alt=""
        aria-hidden
        fill
        unoptimized
        className="object-cover object-[center_25%]"
      />
      <div className="absolute inset-0 bg-navy-dark/50" />
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
