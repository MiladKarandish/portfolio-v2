import { cn } from "@/utils/className";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "w-[92dvw] max-w-6xl min-h-[96dvh] flex flex-col px-3 py-5 xs:p-7 xs:px-9 rounded-3xl bg-700 antialiased"
      )}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Header />

      <div className={`flex-1 pt-8`}>{children}</div>

      <Footer />
    </div>
  );
}
