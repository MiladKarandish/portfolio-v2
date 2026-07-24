import Link from "next/link";
import Theme from "@/themes/Theme";
import Navbar from "./Navbar";
import { person } from "@/data/profile";

const Header = () => {
  return (
    <header className={`header w-full`}>
      <Link
        href="/"
        className={`group w-fit`}
        style={{ gridArea: "brand" }}
        aria-label={`${person.name} — home`}
      >
        <span className={`block text-base font-bold leading-tight xs:text-lg`}>{person.name}</span>
        <span className={`block text-xs opacity-70 leading-tight xs:text-sm`}>{person.role}</span>
      </Link>

      {/* No max-width: the nav sizes to its own content, so adding a fifth item
          widens the pill instead of clipping the last one off the end. */}
      <div className={`w-full min-w-0`} style={{ gridArea: "navbar" }}>
        <Navbar />
      </div>

      <div className={`flex items-center justify-end gap-2`} style={{ gridArea: "actions" }}>
        <Link href="/resume" className={`btn btn-ghost text-sm whitespace-nowrap`}>
          Résumé
        </Link>
        <Theme />
      </div>
    </header>
  );
};

export default Header;
