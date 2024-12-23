import Theme from "../_themes/Theme";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className={`flex justify-between items-center `}>
      <Theme />

      <Navbar />
    </header>
  );
};

export default Header;
