import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/globals.css";
import { Nunito } from "next/font/google";
import Clarity from "@microsoft/clarity";

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
  Clarity.init("q4kcsgko00");

  return (
    <html lang="en" className={nunito.className}>
      <body className={`theme-light ${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
