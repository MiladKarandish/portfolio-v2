import Theme from "../../themes/Theme";
import Navbar from "./Navbar";
import DownloadResume from "./DownloadResume";

const Header = () => {
  return (
    <header className={`header w-full`}>
      <DownloadResume />

      <div className={`w-full max-w-100 mx-auto`} style={{ gridArea: "navbar" }}>
        <Navbar />
      </div>

      <div className={`w-fit mx-auto`} style={{ gridArea: "theme" }}>
        <Theme />
      </div>
    </header>
  );
};

export default Header;
