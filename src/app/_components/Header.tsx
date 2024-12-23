import Link from "next/link";
import Theme from "../_themes/Theme";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className={`header w-full`}>
      <Link href="/" className={`min-w-fit mx-auto`} style={{ gridArea: "logo" }}>
        M K
      </Link>

      <div className={`w-full max-w-[25rem] mx-auto`} style={{ gridArea: "navbar" }}>
        <Navbar />
      </div>

      <div className={`w-fit mx-auto`} style={{ gridArea: "theme" }}>
        <Theme />
      </div>
    </header>
  );
};

export default Header;
