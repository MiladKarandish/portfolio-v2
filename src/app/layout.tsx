import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import MicrosoftClarity from "./_components/Analytics/Clarity";
import { person } from "@/data/profile";
import * as themes from "@/themes";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? person.site;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${person.name} — ${person.role}`,
    template: `%s · ${person.name}`,
  },
  description:
    "Full-stack engineer with six years in production finance and logistics software. TypeScript, React/Next.js, Node.js and PostgreSQL. Open to relocation.",
  authors: [{ name: person.name, url: siteUrl }],
  creator: person.name,
  keywords: [
    person.name,
    "Full-Stack Engineer",
    "Frontend Engineer",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Portfolio",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: person.name,
    title: `${person.name} — ${person.role}`,
    description:
      "Six years building production software where correctness matters. Fintech, accounting and logistics systems in TypeScript.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${person.name} — ${person.role}`,
    description: "Full-stack engineer. TypeScript, React/Next.js, Node.js, PostgreSQL.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#c15817",
  colorScheme: "dark",
};

/**
 * Applies the stored theme before first paint. The palettes are serialised at
 * build time, so this stays in sync with `src/themes` automatically. Without
 * it the page renders in the default palette and then jumps once React
 * hydrates — the flash is small but it is the first thing a visitor sees.
 */
const themeScript = `(function(){try{
var p=${JSON.stringify(Object.fromEntries(Object.values(themes).map((t) => [t.value, t])))};
var t=localStorage.getItem('theme');var s=p[t||'fox']||p.fox;var r=document.documentElement;
for(var k in s.bg){r.style.setProperty('--bg-'+k,'rgba('+s.bg[k]+')');}
for(var k in s.text){r.style.setProperty('--text-'+k,'rgba('+s.text[k]+')');}
if(s.accent){for(var k in s.accent){r.style.setProperty('--accent-'+k,'rgba('+s.accent[k]+')');}}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.className} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`theme-light ${geistSans.variable} ${geistMono.variable}`}>
        <MicrosoftClarity />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
