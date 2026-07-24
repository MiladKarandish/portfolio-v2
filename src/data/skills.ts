import { resumeSkills } from "./resume";

/** The grouped view, straight from the CV — one source, two renderings. */
export const skillGroups = resumeSkills.map((group) => ({
  label: group.label,
  items: group.items.split(", "),
}));

/** A short flat list for the landing page. Order is deliberate, not alphabetical. */
export const headlineSkills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Fastify",
  "PostgreSQL",
  "Drizzle ORM",
  "MySQL",
  "Tailwind CSS",
  "SCSS",
  "Docker",
  "GitHub Actions",
  "WebSockets",
  "PWA",
];
