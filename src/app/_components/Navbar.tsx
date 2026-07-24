"use client";

import NavItem from "./Navbar/_components/NavItem/NavItem";

const routes = [
  { path: "/", name: "Home" },
  { path: "/experience", name: "Experience" },
  { path: "/projects", name: "Projects" },
  { path: "/honest", name: "Honestly" },
  { path: "/contact", name: "Contact" },
];

const Navbar = () => {
  return (
    // Below xs the nav is a full-width row of its own and five items don't fit a
    // narrow phone, so it scrolls (scrollbar hidden — the pill is the affordance).
    // From xs up it shares a row with the brand and actions, where scrolling
    // would let the grid shrink it and clip the last item, so overflow goes back
    // to visible and the pill takes its natural width.
    <nav
      aria-label="Main"
      className="w-full flex items-center px-2 py-2 rounded-full bg-800 overflow-x-auto xs:overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="w-max min-w-full flex justify-between items-center text-sm xs:text-base">
        {routes.map((route) => (
          <NavItem key={route.path} route={route} />
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
