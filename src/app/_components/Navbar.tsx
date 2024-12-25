import { AnimatePresence } from "framer-motion";
import NavItem from "./Navbar/_components/NavItem/NavItem";

const routes = [
  {
    path: "/",
    name: "Home",
  },
  {
    path: "/experience",
    name: "Experience",
  },
  {
    path: "/projects",
    name: "Projects",
  },
  {
    path: "/contact",
    name: "Contact",
  },
];

const Navbar = () => {
  return (
    <nav className="w-full flex justify-between items-center px-2 py-3 rounded-full bg-800">
      <ul className="w-full flex justify-between">
        <AnimatePresence>
          {routes.map((route) => (
            <NavItem key={route.path} route={route} />
          ))}
        </AnimatePresence>
      </ul>
    </nav>
  );
};

export default Navbar;
