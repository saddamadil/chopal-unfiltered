import AdSlot from "@/components/AdSlot";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const dynamic = "force-dynamic";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <AdSlot position="header" />
      <AdSlot position="desktop-banner" />
      <AdSlot position="mobile-banner" />
      {children}
      <Footer />
    </>
  );
}
