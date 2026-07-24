import type { Metadata } from "next";
import PageHeader from "@/app/_components/PageHeader";
import Reveal from "@/app/_components/Reveal";
import ContactForm from "./_components/ContactForm";
import { availability, contactLinks, person } from "@/data/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${person.name} — full-stack engineer, open to relocation and requiring visa sponsorship.`,
};

/** Brand colour behind each icon, so the list scans by shape as well as label. */
const accentByName: Record<string, string> = {
  Email: "bg-orange-500",
  LinkedIn: "bg-sky-600",
  Github: "bg-neutral-900",
  Phone: "bg-emerald-600",
  Location: "bg-violet-600",
};

const ContactPage = () => {
  return (
    <main id="main" className={`space-y-10`}>
      <PageHeader
        eyebrow="Say hello"
        title="Contact"
        lead={availability.long}
      />

      <div className={`grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-6`}>
        <Reveal className={`surface p-5 xs:p-6`}>
          <h2 className={`text-xl font-bold`}>Send me a message</h2>
          <p className={`mt-1 mb-5 text-sm opacity-75`}>
            It goes straight to my inbox, and I reply to everything that is not a mailing list.
          </p>

          <ContactForm />
        </Reveal>

        <Reveal delay={0.08} className={`surface p-5 xs:p-6`}>
          <h2 className={`text-xl font-bold`}>Or find me here</h2>
          <p className={`mt-1 mb-5 text-sm opacity-75`}>
            Email is fastest. I am in {person.location}, UTC+3:30.
          </p>

          <ul className={`space-y-2.5`}>
            {contactLinks.map(({ name, icon, title, href, aria }) => (
              <li key={name}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={aria}
                  className={`surface-muted surface-interactive group flex items-center gap-4 p-3`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg text-white ${
                      accentByName[name] ?? "bg-gray-600"
                    }`}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>

                  <span className={`min-w-0 flex-1`}>
                    <span className={`block font-semibold`}>{name}</span>
                    <span className={`block truncate text-sm opacity-75`}>{title}</span>
                  </span>

                  <span
                    aria-hidden="true"
                    className={`opacity-0 transition-opacity group-hover:opacity-100`}
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </main>
  );
};

export default ContactPage;
