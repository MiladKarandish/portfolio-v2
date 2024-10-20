import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/globals.css";
// import { TransitionLink } from "./utils/transitionLink";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`theme-dark ${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* <header>
          <nav>
            <ul>
              <li>
                <TransitionLink href="/">Home</TransitionLink>
              </li>
              <li>
                <TransitionLink href="/resume">Resume</TransitionLink>
              </li>
            </ul>
          </nav>
        </header> */}
        {children}
      </body>
    </html>
  );
}
