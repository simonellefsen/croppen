"use client";

import { useState } from "react";
import type { Sex } from "@/lib/anatomy/types";

/**
 * A 3D-rendered anatomical plate that sits in the same 420×1000 viewBox as
 * the SVG figure. Hit-testing stays on the vector paths; these images are
 * paint only.
 */
export function Plate({
  sex,
  name,
  blend,
}: {
  sex: Sex;
  name: string;
  blend?: "multiply" | "screen" | "overlay";
}) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <image
      href={`/plates/${sex}-${name}.webp`}
      x={0}
      y={0}
      width={420}
      height={1000}
      preserveAspectRatio="xMidYMid meet"
      pointerEvents="none"
      className={blend ? `plate plate-${blend}` : "plate"}
      onError={() => setOk(false)}
    />
  );
}
