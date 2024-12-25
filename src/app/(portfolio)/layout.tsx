import { cn } from "@/utils/className";
import Header from "@/app/_components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={cn("w-[90dvw] max-w-6xl h-[95dvh] px-2 py-5 xs:p-10 rounded-3xl bg-700")}>
      <Header />

      {children}
    </div>
  );
}
