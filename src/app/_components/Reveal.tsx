"use client";

import { motion, useReducedMotion } from "framer-motion";

type Element = "div" | "li" | "section" | "article";

interface Props {
  children: React.ReactNode;
  /** Seconds of stagger, for lists that should arrive one after another. */
  delay?: number;
  /** Must be `li` inside a list — a wrapper div between ul and li is invalid HTML. */
  as?: Element;
  className?: string;
  /** For deep-linkable sections; pair it with `scroll-mt-*` so the header doesn't cover the target. */
  id?: string;
}

/**
 * Fades content in as it enters the viewport, once. Users who asked for
 * reduced motion get the content with no animation at all rather than a
 * shorter version of the same movement.
 */
const Reveal = ({ children, delay = 0, as = "div", className, id }: Props) => {
  const reduced = useReducedMotion();
  const Tag = as;
  const MotionTag = motion[as];

  if (reduced)
    return (
      <Tag className={className} id={id}>
        {children}
      </Tag>
    );

  return (
    <MotionTag
      className={className}
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </MotionTag>
  );
};

export default Reveal;
