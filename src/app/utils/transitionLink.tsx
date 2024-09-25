"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";

interface Props extends LinkProps {
  children: React.ReactNode;
  href: string;
}

const sleep = async (sleepTime: number) => {
  return new Promise((resolve) => setTimeout(resolve, sleepTime));
};

export const TransitionLink = ({ children, href, ...props }: Props) => {
  const router = useRouter();

  const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const body = document.querySelector("body");

    body?.classList.add("page-transition");

    await sleep(100);

    router.push(href);

    await sleep(100);

    body?.classList.remove("page-transition");
  };

  return (
    <Link onClick={handleTransition} href={href} {...props}>
      {children}
    </Link>
  );
};
