import { FaGithub, FaLinkedinIn, FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { showTamdid } from "./visibility";

/**
 * Identity primitives — the one place a name, address or handle is written down.
 * `resume.ts` imports from here, so the CV and the site can never disagree.
 */
export const person = {
  name: "Milad Karandish",
  firstName: "Milad",
  role: "Full-Stack Engineer",
  tagline: "TypeScript · React / Next.js · Node.js · PostgreSQL",
  location: "Shiraz, Iran",
  email: "miladkaarandish@gmail.com",
  phone: "+98 936 682 0123",
  phoneHref: "tel:+989366820123",
  github: "https://github.com/MiladKarandish",
  githubHandle: "github.com/MiladKarandish",
  linkedin: "https://www.linkedin.com/in/milad-karandish",
  linkedinHandle: "linkedin.com/in/milad-karandish",
  telegram: "https://t.me/miladkarandish",
  mapHref: "https://maps.app.goo.gl/dWDfQpdb9SjYH2QJ9",
  site: "https://miladkarandish.vercel.app",
  /* Printed on the CV, so it is the bare host — no scheme, no trailing slash.
     If a custom domain ever replaces the vercel.app one, change both fields
     and the CV, sitemap, robots.txt and OG tags all follow. */
  siteHandle: "miladkarandish.vercel.app",
};

/** Stated up front rather than discovered in round three. */
export const availability = {
  short: "Open to relocation · Visa sponsorship required",
  long: "Open to relocating for the right team in the EU, UK, Ireland or Canada. I need visa sponsorship — Highly Skilled Migrant, EU Blue Card, Skilled Worker or equivalent.",
};

export const intro = {
  /** Landing headline — short enough to read in one glance. */
  headline: "I build production software that has to be right the first time.",
  /** Two short paragraphs; the site's only long-form prose. */
  body: [
    showTamdid
      ? "Six years of shipping — most of it on systems where a rounding error is somebody's money. I lead the frontend of an accounting product used by more than 10,000 people a day, and I co-founded and single-handedly built a consumer fintech app from an empty database to a released Android package."
      : "Six years of shipping — most of it on systems where a rounding error is somebody's money. I lead the frontend of an accounting product used by more than 10,000 people a day, and I rebuilt it on a new framework without taking the old one down once.",
    "I like the parts other people avoid: transaction boundaries, double-spend windows, what happens when the payment provider times out halfway through. I write TypeScript everywhere and I own things end to end — schema, server, interface, pipeline, release.",
  ],
};

export const stats = [
  { value: "6 yrs", label: "Shipping production software" },
  { value: "10K+", label: "Daily active users on the flagship product" },
  /* The solo-venture stat is the one that identifies it. Replaced with the
     rebuild, which is the next-strongest number I can stand behind. */
  showTamdid
    ? { value: "1", label: "Fintech product built solo, end to end" }
    : { value: "~60%", label: "Faster initial load after the rebuild" },
  { value: "4", label: "Delivery surfaces: web, PWA, Android, kiosk" },
];

/** Three sentences that answer "what is he actually good at". */
export const focusAreas = [
  {
    title: "End-to-end ownership",
    body: showTamdid
      ? "Schema, server, interface, CI and release process. I have taken a product from an empty PostgreSQL database to a signed Android package on my own, and I prefer working where that whole line is visible."
      : "Schema, server, interface, CI and release process. I have designed a database, written the service on top of it, built the interface and maintained the pipeline that ships it, and I prefer working where that whole line is visible.",
  },
  {
    title: "Correctness-critical systems",
    body: "Money, ledgers and reconciliation. Row-level locking, transaction boundaries, idempotent payment flows, and data models where the invalid state is unrepresentable rather than merely unlikely.",
  },
  {
    title: "Performance at real scale",
    body: "Moving a live product onto a new framework without downtime, cutting load time on datasets that keep growing, and finding the actual cause of a production outage instead of restarting the service.",
  },
];

export interface IContactLink {
  name: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  aria: string;
}

export const contactLinks: IContactLink[] = [
  {
    name: "Email",
    title: person.email,
    href: `mailto:${person.email}`,
    aria: "Send an email",
    icon: <MdEmail />,
  },
  {
    name: "LinkedIn",
    title: person.linkedinHandle,
    href: person.linkedin,
    aria: "Open LinkedIn profile",
    icon: <FaLinkedinIn />,
  },
  {
    name: "Github",
    title: person.githubHandle,
    href: person.github,
    aria: "Open GitHub profile",
    icon: <FaGithub />,
  },
  {
    name: "Phone",
    title: person.phone,
    href: person.phoneHref,
    aria: "Call phone number",
    icon: <FaPhoneAlt />,
  },
  {
    name: "Location",
    title: person.location,
    href: person.mapHref,
    aria: "See my location",
    icon: <FaLocationDot />,
  },
];
