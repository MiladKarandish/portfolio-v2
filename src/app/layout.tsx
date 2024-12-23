import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/globals.css";
import { Nunito } from "next/font/google";
import { cn } from "./utils/className";
import Header from "./_components/Header";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

const geistSans = localFont({
  src: "../assets/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../assets/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Milad Karandish",
  description: "Milad Karandish Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.className}>
      <body
        className={`theme-light ${geistSans.variable} ${geistMono.variable} antialiased flex justify-center items-center`}
      >
        <div className={cn("w-[90dvw] max-w-6xl h-[95dvh] px-2 py-5 xs:p-10 rounded-3xl bg-700")}>
          <Header />

          {children}
        </div>
      </body>
    </html>
  );
}
