import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/app/_components/PageHeader";
import Reveal from "@/app/_components/Reveal";
import { honestClose, honestIntro, honestSections } from "@/data/honest";
import { person } from "@/data/profile";

export const metadata: Metadata = {
  title: "Honestly",
  description:
    "How I work with AI agents, where my confidence and my English actually sit, and why I'm relocating. The things a portfolio usually leaves out.",
  /**
   * Reachable by anyone on the site, not by anyone searching a name. This is
   * context for someone already considering me — out of context, as the first
   * result for "Milad Karandish", it is the wrong introduction. Also kept out
   * of `sitemap.ts`; the two go together, so don't re-add one without the other.
   */
  robots: { index: false, follow: true },
};

const HonestPage = () => {
  return (
    <main id="main" className={`space-y-10`}>
      <PageHeader title={honestIntro.title} lead={honestIntro.lead} />

      {/* A numbered rail rather than cards — this reads as one continuous
          statement, and boxing each admission separately makes it look like a
          list of defects. */}
      <ol className={`space-y-4`}>
        {honestSections.map((section, index) => (
          <Reveal
            key={section.id}
            as="li"
            delay={index * 0.05}
            id={section.id}
            className={`surface p-5 scroll-mt-24 xs:p-6`}
          >
            <div className={`flex items-baseline gap-3`}>
              <span aria-hidden="true" className={`text-sm font-bold opacity-40`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className={`text-xl font-bold xs:text-2xl`}>{section.title}</h2>
            </div>

            <div className={`mt-3 space-y-3 text-sm opacity-90 xs:text-base`}>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <section className={`surface-muted p-6 text-center xs:p-10`}>
          <h2 className={`text-2xl font-bold xs:text-3xl`}>{honestClose.title}</h2>
          <p className={`mx-auto mt-3 max-w-2xl text-sm opacity-85 xs:text-base`}>{honestClose.body}</p>

          <div className={`mt-6 flex flex-wrap justify-center gap-3`}>
            <Link href="/projects" className={`btn btn-primary`}>
              See the work
            </Link>
            <a href={`mailto:${person.email}`} className={`btn btn-ghost`}>
              {person.email}
            </a>
          </div>
        </section>
      </Reveal>
    </main>
  );
};

export default HonestPage;
