import Link from "next/link";
import Reveal from "@/app/_components/Reveal";
import { availability, focusAreas, intro, person, stats } from "@/data/profile";
import { headlineSkills } from "@/data/skills";
import { featuredProjects } from "@/data/projects";
import { experiences } from "@/data/experiences";

const currentRoles = experiences.filter((experience) => experience.current);

export default function HomePage() {
  return (
    <main id="main" className={`space-y-16`}>
      {/* ---------- Hero ---------- */}
      <section>
        <p className={`chip mb-5`}>
          <span aria-hidden="true">●</span> {availability.short}
        </p>

        <h1 className={`max-w-4xl text-3xl font-bold leading-[1.15] xs:text-5xl`}>{intro.headline}</h1>

        <div className={`mt-6 max-w-3xl space-y-4 text-base opacity-90 xs:text-lg`}>
          {intro.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <div className={`mt-8 flex flex-wrap items-center gap-3`}>
          <Link href="/projects" className={`btn btn-primary`}>
            See the work
          </Link>
          <Link href="/resume" className={`btn btn-ghost`}>
            Read the résumé
          </Link>
          <a href={`mailto:${person.email}`} className={`btn btn-ghost`}>
            Get in touch
          </a>
        </div>

        <p className={`mt-5 text-sm opacity-70`}>
          Everything above is the pitch.{" "}
          <Link href="/honest" className={`link-underline`}>
            Here is the unflattering half
          </Link>
          .
        </p>
      </section>

      {/* ---------- Numbers ---------- */}
      <Reveal>
        <section aria-label="At a glance">
          <ul className={`grid grid-cols-2 gap-3 lg:grid-cols-4`}>
            {stats.map((stat) => (
              <li key={stat.label} className={`surface p-4`}>
                <p className={`text-2xl font-bold xs:text-3xl`}>{stat.value}</p>
                <p className={`mt-1 text-xs opacity-75 xs:text-sm`}>{stat.label}</p>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* ---------- What I do ---------- */}
      <section className={`space-y-5`}>
        <Reveal>
          <h2 className={`text-2xl font-bold xs:text-3xl`}>What I&apos;m good at</h2>
        </Reveal>

        <ul className={`grid gap-3 md:grid-cols-3`}>
          {focusAreas.map((area, index) => (
            <Reveal key={area.title} as="li" delay={index * 0.08} className={`surface h-full p-5`}>
              <h3 className={`text-lg font-bold`}>{area.title}</h3>
              <p className={`mt-2 text-sm opacity-85 xs:text-base`}>{area.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- Featured work ---------- */}
      <section className={`space-y-5`}>
        <Reveal>
          <div className={`flex flex-wrap items-end justify-between gap-3`}>
            <h2 className={`text-2xl font-bold xs:text-3xl`}>Selected work</h2>
            <Link href="/projects" className={`link-underline text-sm opacity-80`}>
              All projects →
            </Link>
          </div>
        </Reveal>

        <ul className={`grid gap-3 lg:grid-cols-3`}>
          {featuredProjects.map((project, index) => (
            <Reveal
              key={project.id}
              as="li"
              delay={index * 0.08}
              className={`surface surface-interactive flex h-full flex-col p-5`}
            >
              <div className={`flex items-baseline justify-between gap-2`}>
                <h3 className={`text-lg font-bold`}>{project.title}</h3>
                {project.org && <span className={`text-xs opacity-60`}>{project.org}</span>}
              </div>

              <p className={`mt-1 text-sm opacity-85`}>{project.tagline}</p>

              <p className={`mt-3 text-sm opacity-75`}>{project.role}</p>

              <ul className={`mt-4 flex flex-wrap gap-1.5`}>
                {project.techs.slice(0, 4).map((tech) => (
                  <li key={tech} className={`chip`}>
                    {tech}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- Where I am now ---------- */}
      <section className={`space-y-5`}>
        <Reveal>
          <div className={`flex flex-wrap items-end justify-between gap-3`}>
            <h2 className={`text-2xl font-bold xs:text-3xl`}>Right now</h2>
            <Link href="/experience" className={`link-underline text-sm opacity-80`}>
              Full history →
            </Link>
          </div>
        </Reveal>

        <ul className={`grid gap-3 md:grid-cols-2`}>
          {currentRoles.map((role, index) => (
            <Reveal key={role.company} as="li" delay={index * 0.08} className={`surface h-full p-5`}>
              <div className={`flex flex-wrap items-baseline justify-between gap-2`}>
                <h3 className={`text-lg font-bold`}>{role.company}</h3>
                <span className={`text-xs opacity-70`}>{role.date}</span>
              </div>
              <p className={`mt-1 text-sm font-semibold opacity-90`}>{role.title}</p>
              <p className={`mt-3 text-sm opacity-80`}>{role.context}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- Stack ---------- */}
      <Reveal>
        <section className={`space-y-4`}>
          <h2 className={`text-2xl font-bold xs:text-3xl`}>Tools I reach for</h2>
          <ul className={`flex flex-wrap gap-2`}>
            {headlineSkills.map((skill) => (
              <li key={skill} className={`chip text-sm`}>
                {skill}
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* ---------- Close ---------- */}
      <Reveal>
        <section className={`surface-muted p-6 text-center xs:p-10`}>
          <h2 className={`text-2xl font-bold xs:text-3xl`}>Looking for someone who owns the whole thing?</h2>
          <p className={`mx-auto mt-3 max-w-2xl text-sm opacity-85 xs:text-base`}>{availability.long}</p>
          <div className={`mt-6 flex flex-wrap justify-center gap-3`}>
            <a href={`mailto:${person.email}`} className={`btn btn-primary`}>
              {person.email}
            </a>
            <Link href="/contact" className={`btn btn-ghost`}>
              Other ways to reach me
            </Link>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
