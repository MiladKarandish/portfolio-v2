import { cn } from "@/utils/className";
import Header from "@/app/_components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "w-[90dvw] max-w-6xl min-h-[96dvh] px-2 py-5 xs:p-7 xs:px-9 rounded-3xl space-y-4 bg-700 antialiased"
      )}
    >
      <Header />

      {children}
    </div>
  );
}
