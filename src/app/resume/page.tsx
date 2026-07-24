import type { Metadata } from "next";
import {
  languages,
  profile,
  resumeContacts,
  resumeLinks,
  resumeRoles,
  resumeSkills,
} from "@/data/resume";
import ResumeToolbar from "./_components/ResumeToolbar";

export const metadata: Metadata = {
  title: "Résumé",
  description: `${profile.name} — ${profile.title}. ${profile.tagline}.`,
};

/**
 * Print target is A4. Save as PDF with margins "Default" and background
 * graphics off — the layout is plain single-column text so it parses cleanly
 * in applicant tracking systems.
 */
const Resume = () => {
  return (
    <div className="w-full">
      <ResumeToolbar />

      <div className="resume-sheet">
        {/* ---------- Header ---------- */}
        <header className="resume-header">
          <h1>{profile.name}</h1>
          <p className="resume-title">
            {profile.title} <span aria-hidden="true">—</span> {profile.tagline}
          </p>

          {/* Two rows of three, not one wrapping row of six — see the note on
              `resumeContacts`. Reach me, then see the work. */}
          <ul className="resume-contacts">
            {resumeContacts.map((contact) => (
              <li key={contact.label}>
                {contact.href ? <a href={contact.href}>{contact.label}</a> : contact.label}
              </li>
            ))}
          </ul>

          <ul className="resume-contacts resume-links">
            {resumeLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <p className="resume-relocation">{profile.relocation}</p>
        </header>

        {/* ---------- Summary ---------- */}
        <section className="resume-section">
          <h2>Summary</h2>
          <p className="resume-summary">{profile.summary}</p>
        </section>

        {/* ---------- Skills ---------- */}
        <section className="resume-section">
          <h2>Technical Skills</h2>
          <dl className="resume-skills">
            {resumeSkills.map((group) => (
              <div key={group.label} className="resume-skill-row">
                <dt>{group.label}</dt>
                <dd>{group.items}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- Experience ---------- */}
        <section className="resume-section">
          <h2>Work Experience</h2>

          {resumeRoles.map((role) => (
            <article key={role.company} className="resume-role">
              <div className="resume-role-head">
                <h3>
                  {role.title} <span className="resume-sep">·</span>{" "}
                  {role.companyHref ? <a href={role.companyHref}>{role.company}</a> : role.company}
                </h3>
                <p className="resume-meta">
                  {role.location} <span aria-hidden="true">|</span> {role.date}
                </p>
              </div>

              <p className="resume-context">{role.context}</p>

              <ul className="resume-bullets">
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>

              <p className="resume-stack">
                <span>Stack:</span> {role.stack}
              </p>
            </article>
          ))}
        </section>

        {/* ---------- Languages ----------
            No education section by design — see the note in src/data/resume.ts. */}
        <section className="resume-section resume-section-last">
          <h2>Languages</h2>
          <ul className="resume-languages">
            {languages.map((language) => (
              <li key={language.name}>
                <strong>{language.name}</strong> — {language.level}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Resume;
