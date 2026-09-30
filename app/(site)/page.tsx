import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Solutions from "@/components/home/Solutions";
import WhyUs from "@/components/home/WhyUs";
import RealisationsPreview from "@/components/home/RealisationsPreview";
import GoogleReviews from "@/components/home/GoogleReviews";
import InfoBand from "@/components/home/InfoBand";
import CtaBand from "@/components/home/CtaBand";

// Les avis Google sont rafraîchis une fois par jour (ISR) : la page est
// régénérée même si la clé n'était pas disponible au moment du build.
export const revalidate = 86400;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Solutions />
      <WhyUs />
      <RealisationsPreview />
      <GoogleReviews />
      <InfoBand />
      <CtaBand />
    </>
  );
}
