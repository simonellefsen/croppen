#!/usr/bin/env node
/**
 * Renders the app icons.
 *
 * Prefers the 3D bust slices from art/blender/renders (skin | muscle | bone).
 * Falls back to the original vector mark if those plates are missing.
 *   npm run icons
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "icons");
const RENDERS = join(ROOT, "art/blender/renders");

/**
 * A bust sliced into the app's three headline layers — skin, muscle, bone —
 * so the mark says "dissection" rather than "target" at small sizes.
 */
const mark = (inset) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#05080b"/>
  <g transform="translate(256 256) scale(${1.2 * (1 - inset)}) translate(-256 -198)">
    <defs>
      <clipPath id="bust">
        <path d="M256 60c46 0 78 34 78 80 0 30-10 52-24 66 34 10 62 24 82 42 24 22 38 52 44 88H76c6-36 20-66 44-88 20-18 48-32 82-42-14-14-24-36-24-66 0-46 32-80 78-80Z"/>
      </clipPath>
    </defs>
    <g clip-path="url(#bust)">
      <rect x="64" y="40" width="64" height="440" fill="#c3906a"/>
      <rect x="128" y="40" width="64" height="440" fill="#e2b489"/>
      <rect x="192" y="40" width="64" height="440" fill="#cf5644"/>
      <rect x="256" y="40" width="64" height="440" fill="#b8392a"/>
      <rect x="320" y="40" width="64" height="440" fill="#efe7cf"/>
      <rect x="384" y="40" width="64" height="440" fill="#d6cbaa"/>
      <g stroke="#05080b" stroke-width="7" opacity="0.85">
        <path d="M192 40v440M320 40v440"/>
      </g>
    </g>
    <path d="M256 60c46 0 78 34 78 80 0 30-10 52-24 66 34 10 62 24 82 42 24 22 38 52 44 88H76c6-36 20-66 44-88 20-18 48-32 82-42-14-14-24-36-24-66 0-46 32-80 78-80Z"
          fill="none" stroke="#05080b" stroke-width="10"/>
  </g>
</svg>`;

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function threeSliceMark() {
  const files = ["female-icon-skin.png", "female-icon-muscles.png", "female-icon-skeleton.png"].map(
    (f) => join(RENDERS, f),
  );
  if (!(await Promise.all(files.map(exists))).every(Boolean)) return null;
  const size = 512;
  const third = Math.floor(size / 3);
  const strips = [];
  for (const file of files) {
    const resized = await sharp(file).resize(size, size, { fit: "cover", position: "top" }).png().toBuffer();
    strips.push(await sharp(resized).extract({ left: third, top: 0, width: third, height: size }).png().toBuffer());
  }
  return sharp({
    create: { width: size, height: size, channels: 4, background: "#05080b" },
  })
    .composite([
      { input: strips[0], left: 0, top: 0 },
      { input: strips[1], left: third, top: 0 },
      { input: strips[2], left: third * 2, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const sliced = await threeSliceMark();

  const jobs = [
    { file: "icon-192.png", size: 192, inset: 0.06 },
    { file: "icon-512.png", size: 512, inset: 0.06 },
    { file: "apple-touch-icon.png", size: 180, inset: 0.06 },
    // Maskable icons are cropped to a safe circle, so pull the art in further.
    { file: "maskable-512.png", size: 512, inset: 0.22 },
  ];

  for (const { file, size, inset } of jobs) {
    let png;
    if (sliced) {
      const inner = Math.round(size * (1 - inset));
      const pad = Math.round((size - inner) / 2);
      png = await sharp({
        create: { width: size, height: size, channels: 4, background: "#05080b" },
      })
        .composite([{ input: await sharp(sliced).resize(inner, inner).png().toBuffer(), left: pad, top: pad }])
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else {
      png = await sharp(Buffer.from(mark(inset)))
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer();
    }
    await writeFile(join(OUT, file), png);
    console.log(`icons/${file}  ${size}×${size}  ${(png.length / 1024).toFixed(1)} kB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
