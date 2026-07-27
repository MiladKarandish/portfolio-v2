import { person } from "./profile";
import { showTamdid } from "./visibility";

/**
 * Resume content. Identity primitives (name, email, handles) come from
 * `profile.ts` so the CV and the site can never disagree; everything here is
 * the CV-specific wording. `experiences.ts` reads `resumeRoles` back out, so
 * the work history is written once and rendered twice.
 *
 * Written for international applications (EU, UK/IE, US/CA) with visa
 * sponsorship. Conventions applied deliberately:
 *   - No photo, date of birth, marital status or nationality (standard in
 *     modern tech hiring; actively discouraged in the US/UK/IE).
 *   - Single column, real headings, plain text — parses cleanly in ATS.
 *   - Bullets lead with the outcome, then the method. No "what/how/why"
 *     run-on sentences.
 *   - Reverse-chronological. Overlapping dates on the venture are intentional.
 */

export interface IResumeRole {
  title: string;
  company: string;
  companyHref?: string;
  /** One line of context — a hiring manager abroad has never heard of these companies. */
  context: string;
  location: string;
  date: string;
  bullets: string[];
  stack: string;
}

export interface IResumeSkillGroup {
  label: string;
  items: string;
}

export const profile = {
  name: person.name,
  title: person.role,
  tagline: person.tagline,
  /* The hidden variant leads on Ragham instead, and keeps the same claims that
     do not depend on the venture: the years, the domain, the rebuild, the
     backend and infrastructure range. See ./visibility.ts. */
  summary: showTamdid
    ? "Full-stack engineer with 6 years building production software for finance and logistics. Co-founder and sole engineer of a fintech product shipped end-to-end — PostgreSQL data model, transactional payment flows, Next.js application, delivery to web, PWA and Android. Concurrently frontend lead on an accounting SaaS serving 10,000+ daily active users, which I rebuilt on Next.js and TypeScript to replace a legacy Vue 2 / Nuxt 2 SPA. Strongest in TypeScript across the stack and in correctness-critical financial systems."
    : "Full-stack engineer with 6 years building production software for finance and logistics. Frontend lead on an accounting SaaS serving 10,000+ daily active users, which I rebuilt on Next.js and TypeScript to replace a legacy Vue 2 / Nuxt 2 SPA and cut over with no downtime. Designed and built the PDF reporting microservice behind its financial documents, and contributed to the Fastify/MySQL API. Strongest in TypeScript across the stack and in correctness-critical financial systems.",
  /** Stated plainly and early — screeners look for it, and hiding it wastes everyone's time. */
  relocation:
    "Open to relocation · Requires visa sponsorship (EU Blue Card / Skilled Worker / equivalent)",
};

/**
 * The header contact block, in two deliberate rows.
 *
 * Six fields do not fit on one line at any readable size, and a single wrapping
 * list strands whichever field falls off the end — "Shiraz, Iran" alone on a
 * second row, which is what it did. Two labelled groups of three wrap on
 * purpose instead: how to reach me, then where to see the work.
 *
 * Keep them at three each. Adding a fourth to either row re-creates the orphan.
 */
export const resumeContacts = [
  { label: person.email, href: `mailto:${person.email}` },
  { label: person.phone, href: person.phoneHref },
  { label: person.location, href: "" },
];

export const resumeLinks = [
  /* The portfolio is the whole point of having one — a CV that doesn't link it
     means nobody sees it. It leads the row for that reason. */
  { label: person.siteHandle, href: person.site },
  { label: person.linkedinHandle, href: person.linkedin },
  { label: person.githubHandle, href: person.github },
];

export const resumeSkills: IResumeSkillGroup[] = [
  {
    label: "Languages",
    items: "TypeScript, JavaScript (ES6+), SQL, HTML5, CSS3 / SCSS",
  },
  {
    /* Vue sits last and carries "working knowledge" on purpose. The only Vue in
       the history is the legacy Nuxt 2 app at Ragham — maintained for a couple of
       months and read end to end to replace it — which is real but is not the
       React/Next.js depth the rest of this row claims. It stays on the list
       because the keywords are worth matching and the experience is genuine; it
       does not stand unqualified next to Next.js. Nuxt 3 / Vue 3 and the
       Composition API were never part of it, so the version numbers stay too. */
    label: "Frontend",
    items:
      "React, Next.js (App Router, Server Components, Server Actions), TanStack Query, Tailwind CSS, PWA & Service Workers, WebSockets, React-Leaflet, Vue 2 / Nuxt 2 (working knowledge)",
  },
  {
    label: "Backend",
    items:
      "Node.js, Fastify, REST API design, TypeBox / OpenAPI, server-side rendering, Puppeteer, JWT & OTP authentication",
  },
  {
    label: "Data",
    items:
      "PostgreSQL, MySQL, Drizzle ORM, schema design & migrations, transactions and row-level locking, query optimisation",
  },
  {
    label: "Infrastructure",
    items:
      "Docker (multi-stage), GitHub Actions, CI/CD, Nginx, Sentry, S3-compatible storage, Android delivery (TWA), release & versioning strategy",
  },
  {
    label: "Practices",
    items:
      "Cross-team collaboration, technical documentation, incident response, performance profiling, internationalisation (RTL / i18n), code review",
  },
];

const allRoles: IResumeRole[] = [
  {
    title: "Co-Founder & Lead Engineer",
    company: "Tamdid",
    context:
      "Consumer fintech product — digital wallet, peer-to-peer ledger and telecom services. Two-person venture; sole engineer, built alongside a full-time role.",
    location: "Iran (Remote)",
    date: "Jul 2025 – Present",
    bullets: [
      "Designed and shipped the entire product as the only engineer — data model, application, authentication, payment integrations, infrastructure and release process — reaching production in 12 months (~38,000 lines, 320 commits).",
      "Built a transactional payment engine using a row-locked reserve → external call → finalise-or-refund sequence, preventing double-spend and ensuring no funds are stranded when a payment provider fails mid-transaction.",
      "Modelled a multi-currency ledger with materialised balances, enforcing integrity via CHECK constraints, partial unique indexes and a single-writer transaction boundary so balance drift is structurally impossible.",
      "Secured an internal support tool with role gating, HMAC-signed session-bound privilege step-up and audit-log-driven brute-force throttling, validated against scripted cookie-tampering and cross-session replay attacks.",
      "Integrated payment gateway, telecom and SMS providers with cached fallbacks, and delivered one codebase to web, installable PWA and Android (Trusted Web Activity) with immutable-tag Docker releases.",
    ],
    stack:
      "TypeScript, Next.js, React, PostgreSQL, Drizzle ORM, Docker, Tailwind CSS",
  },
  {
    title: "Frontend Engineer",
    company: "Ragham",
    /* The product itself, not the LinkedIn page — a reader who clicks should
       land on the thing I built. */
    companyHref: "https://web.raghamapp.com",
    context:
      "Accounting and invoicing SaaS for small businesses, serving 10,000+ daily active users on web and Android.",
    location: "Iran (Remote)",
    date: "Dec 2023 – Present",
    bullets: [
      "Lead the frontend of the flagship application (~47,000 lines, ~2,000 commits) covering invoicing, inventory, cheque tracking, bank accounts and multi-ledger bookkeeping.",
      "Rebuilt the product on Next.js and TypeScript to replace a legacy Vue 2 / Nuxt 2 SPA — shipped feature by feature beside the live app, then cut over by redirect with no downtime — cutting initial load time ~60% via pagination, lazy loading and list virtualisation, and server load ~30% via request debouncing and abort handling.",
      "Designed, built and maintain the company's PDF reporting microservice (Fastify, TypeBox, server-rendered React, headless Chrome) generating the RTL financial documents customers send clients; designed a versioned template registry so a full redesign rolled out one report at a time with single-flag rollback.",
      "Resolved a production outage in that service caused by shared headless-browser connections exceeding their maximum lifetime; re-architected to per-job connections with a measured timeout hierarchy, ending a failure mode that previously required restarting the service.",
      "Built the internal support panel (React, Vite) — account lookup, subscription and SMS-credit operations, bulk notifications, data restore and impersonation — removing recurring escalations from the engineering queue.",
      "Contributed backend changes to the Fastify/MySQL API for features I owned on the client, including web-push delivery, cheque query joins and a cross-cutting LEFT JOIN hydration fix across nine query paths.",
      "Implemented PWA install, Firebase Cloud Messaging web push and custom service workers; maintained Docker builds and GitHub Actions pipelines against restricted network infrastructure.",
    ],
    stack:
      "TypeScript, Next.js, React, Fastify, MySQL, Docker, GitHub Actions, Tailwind CSS, Sentry",
  },
  {
    title: "Frontend Developer",
    company: "Pishgaman Asia",
    companyHref: "http://www.pishgamanasia.com",
    context:
      "Enterprise logistics and fleet-management software. Primary project: Separta, the exclusive ground-transport platform for Imam Khomeini International Airport, Tehran.",
    location: "Iran",
    date: "Oct 2022 – Nov 2023",
    bullets: [
      "Built real-time, map-based interfaces with React, TypeScript and React-Leaflet over WebSocket streams, giving dispatchers and passengers continuously updating fleet positions and trip state.",
      "Delivered booking flows across four surfaces — mobile app, web, staffed terminal counters and self-service kiosks in the customs hall — using a hand-authored SCSS design system spanning phones to non-standard touch displays.",
      "Partnered with the C#/.NET backend team to reshape REST endpoints around real screen requirements, and applied React rendering optimisations to keep the UI responsive under continuous data updates.",
      "Modernised legacy jQuery applications incrementally by introducing React and SCSS, keeping them serving users throughout.",
    ],
    stack: "React, TypeScript, SCSS, React-Leaflet, WebSockets, REST",
  },
  {
    title: "Frontend Developer",
    company: "Fortune Web Works",
    companyHref: "https://fortune-new.vercel.app",
    context:
      "Freelance partnership; I owned all technical delivery while my partner handled client acquisition.",
    location: "Remote",
    date: "May 2020 – Oct 2022",
    bullets: [
      "Delivered client web projects across HTML, CSS, JavaScript and early React, adapting to varied client requirements and establishing the fundamentals the later roles build on.",
    ],
    stack: "JavaScript, React, HTML, CSS",
  },
];

/* Everything downstream reads this, including `experiences.ts` and the CV, so
   dropping the role here removes it from every surface at once. */
export const resumeRoles: IResumeRole[] = allRoles.filter(
  (role) => role.company !== "Tamdid" || showTamdid
);

/**
 * There is deliberately NO education section.
 *
 * A CV never explains what is missing. An "Education" heading with nothing
 * credible under it draws the eye straight to the gap; omitting the section
 * lets six years of shipped production work answer the question instead.
 * Nobody rejects a senior engineer for the absence of a heading — they reject
 * one for a heading that reads as an apology.
 *
 * Where it genuinely matters (visa paperwork, application forms with a
 * required field), it is answered there, factually, and the qualifying route
 * is professional experience rather than a degree. See the notes in
 * ~/Documents/resume/visa-routes.md.
 */

/**
 * `level` is printed verbatim into the PDF, so it must always read as a finished
 * statement — never an editing note in brackets. It shipped once as
 * "[Professional working proficiency — adjust, or add an IELTS score…]" and that
 * bracketed text rendered straight into the CV.
 *
 * "Professional working proficiency" is the standard register for this and is
 * the honest one: enough English to work, review and write documentation in,
 * without claiming native fluency. If you sit an IELTS/TOEFL, replace it with
 * the band — a measured score outranks any self-assessment on a visa file.
 */
export const languages = [
  { name: "Persian", level: "Native" },
  { name: "English", level: "Professional working proficiency" },
];
