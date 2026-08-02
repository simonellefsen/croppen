"use client";

import type { ReactNode } from "react";
import { MIRROR } from "@/lib/anatomy/geometry";

/**
 * Renders its children twice — once as authored (the subject's right side,
 * which appears on the left of an anterior view) and once mirrored.
 *
 * Both copies carry the same `data-structure`, so a click on either resolves
 * to the same anatomical entry.
 */
export function Bilateral({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const props = id
    ? { "data-structure": id, className: cx("structure", className) }
    : { className };
  return (
    <>
      <g {...props}>{children}</g>
      <g {...props} transform={MIRROR}>
        {children}
      </g>
    </>
  );
}

/** A single midline structure that can be inspected. */
export function Part({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!id) return <g className={className}>{children}</g>;
  return (
    <g data-structure={id} className={cx("structure", className)}>
      {children}
    </g>
  );
}

export function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}
