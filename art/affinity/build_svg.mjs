#!/usr/bin/env node
/**
 * Build Affinity-openable stacked SVGs with the plates *embedded*.
 * Linked hrefs are dropped on import (that's the empty black rectangle).
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const RENDERS = join(ROOT, "art/blender/renders");
const OUT = join(ROOT, "art/affinity");

const LAYERS = [
  { id: "skeleton", suffix: "skeleton" },
  { id: "organs", suffix: "organs" },
  { id: "muscles", suffix: "muscles" },
  { id: "skin", suffix: "skin" },
  // Lighting is a multiply pass for the web app's SVG skin, not a beauty
  // layer. Hidden on import so it does not crush the stack to charcoal.
  { id: "lighting", suffix: "skin-light", blend: "multiply", opacity: 0.55, hidden: true },
];

async function dataUri(file) {
  const buf = await readFile(file);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function build(sex) {
  const images = [];
  for (const layer of LAYERS) {
    const file = join(RENDERS, `${sex}-${layer.suffix}.png`);
    const uri = await dataUri(file);
    const style = [
      layer.blend ? `mix-blend-mode:${layer.blend}` : "",
      layer.opacity != null ? `opacity:${layer.opacity}` : "",
    ]
      .filter(Boolean)
      .join(";");
    const styleAttr = style ? ` style="${style}"` : "";
    const hideAttr = layer.hidden ? ` display="none"` : "";
    images.push(
      `  <g id="${layer.id}"${hideAttr}>
    <image id="${layer.id}-img" width="840" height="2000" x="0" y="0" preserveAspectRatio="xMidYMid meet"${styleAttr} href="${uri}"/>
  </g>`,
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="840px" height="2000px" viewBox="0 0 840 2000">
  <title>Croppen ${sex} plates</title>
  <rect id="backdrop" width="840" height="2000" fill="#05080b"/>
${images.join("\n")}
</svg>
`;
  const dest = join(OUT, `croppen-${sex}.svg`);
  await writeFile(dest, svg);
  console.log("wrote", dest, `${(Buffer.byteLength(svg) / 1024 / 1024).toFixed(1)} MB`);
}

await build("female");
await build("male");
