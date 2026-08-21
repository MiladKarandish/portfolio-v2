import { cn } from "@/utils/className";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import WaterBackground from "@/common/components/WaterBackground";
import FishToy from "@/common/components/FishToy";
import StoneToy from "@/common/components/StoneToy";

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* A sibling of the card, not a child of it: the card is a stacking
          context, and anything fixed inside it would be clipped to its box.
          Mounted here rather than in the root layout so it stays off /resume,
          which is a print sheet. */}
      <WaterBackground />

      {/* Order is the illusion here, and it is DOM order, not z-index: the
          fish are under the surface, the stone is on it, and the card is above
          both. All three sit behind the card, so anything that leaves the
          margin passes beneath the page rather than across it. */}
      <FishToy />
      <StoneToy />

      <div
        className={cn(
          "page-card w-[92dvw] max-w-6xl min-h-[96dvh] flex flex-col px-3 py-5 xs:p-7 xs:px-9 rounded-3xl antialiased"
        )}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <Header />

        <div className={`flex-1 pt-8`}>{children}</div>

        <Footer />
      </div>
    </>
  );
}
