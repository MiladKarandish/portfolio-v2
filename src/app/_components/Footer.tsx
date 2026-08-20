import Link from "next/link";
import CobwebToy from "@/common/components/CobwebToy";
import HoopToy from "@/common/components/HoopToy";
import { availability, person } from "@/data/profile";

const Footer = () => {
  return (
    <footer className={`mt-10 pt-5 border-t border-white/10 text-sm`}>
      <div className={`flex flex-wrap items-center justify-between gap-3`}>
        <p className={`opacity-70`}>
          © {new Date().getFullYear()} {person.name} · {availability.short}
        </p>

        <nav aria-label="Elsewhere" className={`flex flex-wrap items-center gap-x-4 gap-y-1`}>
          <a href={`mailto:${person.email}`} className={`link-underline`}>
            Email
          </a>
          <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className={`link-underline`}>
            LinkedIn
          </a>
          <a href={person.github} target="_blank" rel="noopener noreferrer" className={`link-underline`}>
            GitHub
          </a>
          <Link href="/resume" className={`link-underline`}>
            Résumé
          </Link>
        </nav>
      </div>

      {/* Both render nothing at all on touch or for reduced-motion visitors, so
          there is no empty box to reserve room for — and the row survives
          either of them being absent. */}
      <div className={`footer-toys`}>
        <CobwebToy />
        <HoopToy />
      </div>
    </footer>
  );
};

export default Footer;
