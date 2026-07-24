export interface IProjectLink {
  label: string;
  href: string;
}

import { showTamdid } from "./visibility";

export interface IProject {
  id: string;
  title: string;
  /** One line under the title — what the thing is, for someone who has never heard of it. */
  tagline: string;
  role: string;
  org?: string;
  period: string;
  /** Shown as a badge when there is nothing to link to. */
  availability?: string;
  description: string;
  highlights: string[];
  techs: string[];
  links: IProjectLink[];
  featured: boolean;
}

const allProjects: IProject[] = [
  {
    id: "tamdid",
    title: "Tamdid",
    tagline: "Consumer fintech — digital wallet, peer-to-peer ledger and telecom services",
    role: "Co-founder & sole engineer",
    period: "2025 – present",
    availability: "Private source",
    description:
      "A financial app for the Iranian market: users hold a wallet balance, settle debts with contacts, top up mobile credit and buy data packages. I designed and built all of it — data model, server, interface, payment integrations, infrastructure and release process — and reached production in twelve months while working full-time elsewhere.",
    highlights: [
      "A payment engine built as a row-locked sequence — reserve, call the provider, then finalise or refund — so a double submission cannot spend the same money twice and a provider that dies mid-call cannot strand funds.",
      "A multi-currency ledger with materialised balances, held correct by CHECK constraints, partial unique indexes and a single writer inside one transaction boundary, so balance drift is structurally impossible rather than merely unlikely.",
      "An internal support panel gated by role plus an HMAC-signed, session-bound privilege step-up, with audit-log-driven throttling — tested against scripted cookie tampering and cross-session replay.",
      "One codebase delivered three ways: web, an installable PWA whose service worker is forbidden from ever caching financial data, and an Android app shipped as a Trusted Web Activity.",
    ],
    techs: ["TypeScript", "Next.js", "React", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "Docker"],
    /* Once web.tamdidapp.com is live, add:
       { label: "web.tamdidapp.com", href: "https://web.tamdidapp.com" }
       Deliberately absent until then — a dead link on the featured project is
       worse than no link. */
    links: [],
    featured: true,
  },
  {
    id: "ragham-app",
    title: "Ragham Accounting",
    tagline: "Bookkeeping SaaS for small businesses — 10,000+ daily active users",
    role: "Frontend lead",
    org: "Ragham",
    period: "2023 – present",
    availability: "Private source",
    description:
      "Ragham's flagship product: invoicing, inventory, cheque tracking, bank accounts and multi-ledger bookkeeping. I lead the frontend — roughly 47,000 lines and 2,000 commits — and migrated the whole thing off a legacy Nuxt.js codebase while it was serving its full user base.",
    highlights: [
      "Migrated a live product from Nuxt.js to Next.js and TypeScript with no downtime and no feature freeze, module by module.",
      "Cut initial load time by about 60% through pagination, lazy loading and list virtualisation on datasets that grow without bound.",
      "Reduced server load by about 30% by debouncing and aborting requests the user had already navigated away from.",
      "Shipped PWA install, Firebase Cloud Messaging web push and custom service workers, plus the Docker builds and GitHub Actions pipelines behind them.",
    ],
    techs: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Docker", "GitHub Actions", "Sentry"],
    links: [{ label: "web.raghamapp.com", href: "https://web.raghamapp.com" }],
    featured: true,
  },
  {
    id: "ragham-reports",
    title: "Report Engine",
    tagline: "PDF microservice generating the financial documents customers send their clients",
    /* "Owner" was wrong and is not a label to reintroduce: the service belongs
       to Ragham, not to me. I designed and built it and I maintain it — that is
       the claim, and it is strong enough without implying I own the IP. Same
       care applies to every `org: "Ragham"` entry here. */
    role: "Sole developer",
    org: "Ragham",
    period: "2024 – present",
    availability: "Private source",
    description:
      "A standalone Fastify service, built for Ragham, that renders right-to-left financial reports to PDF: React components rendered to HTML on the server, then printed by a headless Chrome instance. I designed and wrote it, and I maintain it — including a versioned template registry so a full visual redesign could roll out one report at a time, with a single flag to roll back. It runs behind the live product — the report button beside any list in Ragham calls this service — so seeing it work needs an account; ask me and I'll arrange a login.",
    highlights: [
      "Diagnosed a production outage caused by shared headless-browser connections outliving their maximum lifetime — a failure that had been treated as something you fix by restarting the service.",
      "Re-architected to per-job connections with a measured timeout hierarchy, ending that failure mode outright.",
      "Typed the whole API surface with TypeBox and generated OpenAPI documentation from the same schemas.",
    ],
    techs: ["TypeScript", "Fastify", "TypeBox", "React", "Puppeteer", "Docker"],
    /* Label says where it goes, not "try it" — the app is behind a login, and a
       button promising a demo that lands on a sign-in wall reads as a broken
       link. Change it back only if a demo account ever ships. */
    links: [{ label: "web.raghamapp.com", href: "https://web.raghamapp.com" }],
    featured: true,
  },
  {
    id: "separta",
    title: "Separta",
    tagline: "Ground transport for Imam Khomeini International Airport — booking, dispatch and live fleet tracking",
    role: "Frontend developer",
    org: "Pishgaman Asia",
    period: "2022 – 2023",
    description:
      "The exclusive transport platform for Tehran's main international airport — Uber-shaped, but for one very specific place. Passengers book, dispatchers assign, and everyone watches the fleet move in real time. The backend was C#/.NET; I built the client side against it.",
    highlights: [
      "Live map interfaces over WebSocket streams with React-Leaflet, keeping fleet positions and trip state continuously current for both dispatchers and passengers.",
      "One booking flow across four surfaces — mobile app, web, staffed terminal counters and self-service kiosks in the customs hall — on a hand-authored SCSS design system spanning phones to non-standard touch displays.",
      "Reshaped REST endpoints with the .NET team around what the screens actually needed, and tuned React rendering to stay responsive under a continuous stream of updates.",
    ],
    techs: ["React", "TypeScript", "SCSS", "React-Leaflet", "WebSockets", "REST"],
    links: [{ label: "separta.ir", href: "https://separta.ir/ikac" }],
    /* Promoted to the home page whenever Tamdid is hidden — the grid wants
       exactly three cards and Tamdid is normally one of them. */
    featured: !showTamdid,
  },
  {
    id: "support-panel",
    title: "Support Panel",
    tagline: "Internal tool that took recurring escalations off the engineering queue",
    role: "Builder",
    org: "Ragham",
    period: "2024",
    availability: "Internal tool",
    description:
      "Account lookup, subscription and SMS-credit operations, bulk notifications, data restore and user impersonation — the things support staff previously had to ask an engineer to do by hand.",
    highlights: [
      "Removed a standing category of interruption from the engineering team's day.",
      "Impersonation and destructive operations gated and logged, so support can act without support being able to act invisibly.",
    ],
    techs: ["React", "Vite", "TypeScript"],
    links: [],
    featured: false,
  },
  {
    id: "image-cutter",
    title: "Image Cutter",
    tagline: "A cropping tool written from scratch on HTML Canvas",
    role: "Personal project",
    period: "2022",
    description:
      "No libraries — draggable selectors, pixel coordinate maths and scaling ratios worked out by hand. Small, but it is the reason I understand what image libraries are doing on my behalf.",
    highlights: [],
    techs: ["JavaScript", "HTML Canvas", "CSS"],
    links: [
      { label: "GitHub", href: "https://github.com/MiladKarandish/image-cutter" },
      { label: "Live demo", href: "https://mil-image-cutter.vercel.app" },
    ],
    featured: false,
  },
];

export const projects: IProject[] = allProjects.filter(
  (project) => project.id !== "tamdid" || showTamdid
);

export const featuredProjects = projects.filter((project) => project.featured);
