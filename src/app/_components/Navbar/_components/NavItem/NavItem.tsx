"use client";

import { cn } from "@/utils/className";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { setTransform } from "./helpers";

interface Props {
  route: {
    path: string;
    name: string;
  };
}

/* `motion.create(...)`, not `motion(...)` — the call form is deprecated in
   framer-motion 12 and logs a warning on every render in dev. Must stay at
   module scope: creating it inside the component makes a new component type on
   every render, which remounts the link and kills the layout animation. */
const MotionLink = motion.create(Link);

const NavItem = ({ route: { name, path } }: Props) => {
  const pathname = usePathname();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const textX = useTransform(x, (latest) => latest * 0.5);
  const textY = useTransform(y, (latest) => latest * 0.5);

  return (
    <motion.li
      onPointerMove={(e) => {
        const item = e.currentTarget;
        setTransform(item, e, x, y);
      }}
      key={path}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y, transition: "all 1s var(--elastic-out)" }}
    >
      <MotionLink
        className={cn(
          "relative block whitespace-nowrap rounded-full py-2 px-2 xs:px-3 transition-all duration-500 ease-out"
        )}
        href={path}
        aria-current={pathname === path ? "page" : undefined}
      >
        <motion.span
          style={{ x: textX, y: textY, transition: "all 1s var(--elastic-out)" }}
          className="relative z-10 inline-block"
        >
          {name}
        </motion.span>
        {pathname === path ? (
          <motion.div
            transition={{ type: "spring" }}
            layoutId="underline"
            className="absolute w-full h-full rounded-full left-0 bottom-0 bg-600"
          ></motion.div>
        ) : null}
      </MotionLink>
    </motion.li>
  );
};

export default NavItem;
