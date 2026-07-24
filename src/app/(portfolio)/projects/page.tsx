import type { Metadata } from "next";
import PageHeader from "@/app/_components/PageHeader";
import Reveal from "@/app/_components/Reveal";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A fintech product built solo, an accounting SaaS serving 10,000+ daily users, a PDF report engine, and the ground-transport platform for Tehran's international airport.",
};

const ProjectsPage = () => {
  return (
    <main id="main" className={`space-y-10`}>
      <PageHeader
        eyebrow="Selected work"
        title="Projects"
        lead="Most of what I have built belongs to the companies that paid for it, so the source is private. What follows is what each system does and what was hard about it."
      />

      <ul className={`space-y-4`}>
        {projects.map((project, index) => (
          <Reveal
            key={project.id}
            as="li"
            delay={index * 0.05}
            className={`surface surface-interactive p-5 xs:p-6`}
          >
            <div className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1`}>
              <h2 className={`text-xl font-bold xs:text-2xl`}>{project.title}</h2>

              <p className={`text-sm opacity-80`}>
                {project.org && (
                  <>
                    {project.org}
                    <span className={`px-2 opacity-50`}>|</span>
                  </>
                )}
                {project.period}
              </p>
            </div>

            <p className={`mt-1 text-base opacity-90`}>{project.tagline}</p>

            <div className={`mt-3 flex flex-wrap items-center gap-2`}>
              <span className={`chip`}>{project.role}</span>
              {project.availability && <span className={`chip opacity-70`}>{project.availability}</span>}

              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`chip`}
                >
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>

            <p className={`mt-4 text-sm opacity-85 xs:text-base`}>{project.description}</p>

            {project.highlights.length > 0 && (
              <ul className={`mt-4 space-y-2 text-sm xs:text-base`}>
                {project.highlights.map((highlight) => (
                  <li key={highlight} className={`flex gap-3`}>
                    <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-100/70`} />
                    <span className={`opacity-90`}>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            <ul className={`mt-5 flex flex-wrap gap-1.5`}>
              {project.techs.map((tech) => (
                <li key={tech} className={`chip`}>
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ul>
    </main>
  );
};

export default ProjectsPage;
