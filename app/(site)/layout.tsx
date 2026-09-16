import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import EspaceProProvider from "@/components/EspaceProProvider";
import { localBusinessJsonLd } from "@/lib/structured-data";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EspaceProProvider>
      <div className="flex min-h-screen flex-col">
        <JsonLd data={localBusinessJsonLd()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </EspaceProProvider>
  );
}
