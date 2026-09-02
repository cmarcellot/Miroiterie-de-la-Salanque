import Hero from "@/components/home/Hero";
import Solutions from "@/components/home/Solutions";
import WhyUs from "@/components/home/WhyUs";
import RealisationsPreview from "@/components/home/RealisationsPreview";
import InfoBand from "@/components/home/InfoBand";
import CtaBand from "@/components/home/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Solutions />
      <WhyUs />
      <RealisationsPreview />
      <InfoBand />
      <CtaBand />
    </>
  );
}
