import type { Metadata } from "next";
import PageHeader from "@/app/_components/PageHeader";
import Reveal from "@/app/_components/Reveal";
import { experiences } from "@/data/experiences";
import { skillGroups } from "@/data/skills";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Six years of production software: a co-owned fintech product, an accounting SaaS with 10,000+ daily users, and airport logistics systems.",
};

const ExperiencePage = () => {
  return (
    <main id="main" className={`space-y-14`}>
      <PageHeader
        eyebrow="Work history"
        title="Experience"
        lead="Reverse chronological. The two current entries overlap on purpose — one is a full-time job, the other is a product I own."
      />

      <ol className={`space-y-4`}>
        {experiences.map((experience, index) => (
          <Reveal key={experience.company} as="li" delay={index * 0.05} className={`surface p-5 xs:p-6`}>
            <div className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1`}>
              <h2 className={`text-xl font-bold xs:text-2xl`}>
                {experience.title}
                <span className={`px-2 font-normal opacity-50`}>·</span>
                {experience.companyHref ? (
                  <a
                    href={experience.companyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`link-underline`}
                  >
                    {experience.company}
                  </a>
                ) : (
                  experience.company
                )}
              </h2>

              <p className={`text-sm opacity-80`}>
                {experience.date}
                <span className={`px-2 opacity-50`}>|</span>
                {experience.location}
              </p>
            </div>

            <div className={`mt-2 flex flex-wrap items-center gap-2`}>
              {experience.type && <span className={`chip`}>{experience.type}</span>}
              {experience.current && (
                <span className={`chip`}>
                  <span aria-hidden="true">●</span> Current
                </span>
              )}
            </div>

            {experience.about && <p className={`mt-4 text-sm italic opacity-75 xs:text-base`}>{experience.about}</p>}

            <ul className={`mt-4 space-y-2 text-sm xs:text-base`}>
              {experience.bullets.map((bullet) => (
                <li key={bullet} className={`flex gap-3`}>
                  <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-100/70`} />
                  <span className={`opacity-90`}>{bullet}</span>
                </li>
              ))}
            </ul>

            <ul className={`mt-5 flex flex-wrap gap-1.5`}>
              {experience.stack.split(", ").map((tech) => (
                <li key={tech} className={`chip`}>
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>

      <section className={`space-y-5`}>
        <Reveal>
          <h2 className={`text-2xl font-bold xs:text-3xl`}>Skills in detail</h2>
        </Reveal>

        <dl className={`grid gap-3 md:grid-cols-2`}>
          {skillGroups.map((group, index) => (
            <Reveal key={group.label} delay={index * 0.05} className={`surface-muted h-full p-5`}>
              <dt className={`text-sm font-bold uppercase tracking-[0.15em] opacity-80`}>{group.label}</dt>
              <dd className={`mt-3`}>
                <ul className={`flex flex-wrap gap-1.5`}>
                  {group.items.map((item) => (
                    <li key={item} className={`chip`}>
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>
    </main>
  );
};

export default ExperiencePage;
