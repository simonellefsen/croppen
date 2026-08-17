#!/usr/bin/env node
/**
 * Croppen graphics pipeline
 *
 *   blender  →  krita  →  affinity  →  texturepacker  →  public/
 *
 * Expects Blender plates in art/blender/renders/. Run the Blender builder
 * first (see art/blender/build_anatomy.py) or pass --blender to invoke it.
 */
import { spawnSync } from "node:child_process";
import { mkdir, cp, access, writeFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLENDER = "/Applications/Blender.app/Contents/MacOS/Blender";
const KRITA_RUNNER = "/Applications/Krita.app/Contents/MacOS/kritarunner";
const KRITA = "/Applications/Krita.app/Contents/MacOS/krita";
const TP = "/Applications/TexturePacker.app/Contents/MacOS/TexturePacker";
const AFFINITY = "/Applications/Affinity.app/Contents/MacOS/Affinity Affinity Store";

const RENDERS = join(ROOT, "art/blender/renders");
const KRITA_OUT = join(ROOT, "art/krita/out");
const AFF_OUT = join(ROOT, "art/affinity/out");
const SPRITES = join(ROOT, "art/sprites");
const PLATES = join(ROOT, "public/plates");
const ATLAS = join(ROOT, "public/atlas");

const args = new Set(process.argv.slice(2));

function run(cmd, argv, opts = {}) {
  console.log("$", cmd, argv.join(" "));
  const r = spawnSync(cmd, argv, { stdio: "inherit", ...opts });
  if (r.status !== 0 && !opts.allowFail) {
    throw new Error(`${cmd} exited ${r.status}`);
  }
  return r.status === 0;
}

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function bestSource(name) {
  for (const dir of [AFF_OUT, KRITA_OUT, RENDERS]) {
    const p = join(dir, name);
    if (await exists(p)) return p;
  }
  return null;
}

async function blender() {
  if (!args.has("--blender")) return;
  run(BLENDER, ["-b", "--python", join(ROOT, "art/blender/build_anatomy.py")], {
    env: { ...process.env },
  });
}

async function krita() {
  await mkdir(KRITA_OUT, { recursive: true });
  const pykrita = join(process.env.HOME, "Library/Application Support/krita/pykrita");
  await mkdir(pykrita, { recursive: true });
  await cp(join(ROOT, "art/krita/finish_plates.py"), join(pykrita, "finish_plates.py"));
  const ok = run(KRITA_RUNNER, ["-s", "finish_plates"], {
    env: {
      ...process.env,
      CROPPEN_ROOT: ROOT,
      PYTHONPATH: `${join(ROOT, "art/krita")}:${join(process.env.HOME, "Library/Application Support/krita/pykrita")}:${process.env.PYTHONPATH || ""}`,
    },
    allowFail: true,
  });
  if (ok) return;
  // Fallback: Krita CLI export (no filters) so the rest of the pipeline proceeds.
  console.warn("kritarunner failed — copying plates through Krita --export");
  const files = (await readdir(RENDERS)).filter((f) => f.endsWith(".png") && !f.includes("debug"));
  for (const f of files) {
    const dest = join(KRITA_OUT, f);
    const exported = run(
      KRITA,
      [join(RENDERS, f), "--nosplash", "--export", "--export-filename", dest],
      { allowFail: true },
    );
    if (!exported) await cp(join(RENDERS, f), dest);
  }
}

async function affinity() {
  await mkdir(AFF_OUT, { recursive: true });
  const script = join(ROOT, "art/affinity/composite_plates.js");
  const destDir = join(
    process.env.HOME,
    "Library/Application Support/Affinity/user/Scripts/Croppen",
  );
  await mkdir(destDir, { recursive: true });
  await cp(script, join(destDir, "composite_plates.js"));

  // Affinity opens documents, not scripts. Offer the stacked SVG.
  const svg = join(ROOT, "art/affinity/croppen-female.svg");
  if (await exists(svg)) {
    run("open", ["-a", "Affinity", svg], { allowFail: true });
  }

  const files = (await readdir(RENDERS)).filter((f) => f.endsWith(".png") && !f.includes("debug"));
  for (const f of files) {
    const dest = join(AFF_OUT, f);
    if (await exists(dest)) continue;
    const src = (await exists(join(KRITA_OUT, f))) ? join(KRITA_OUT, f) : join(RENDERS, f);
    await cp(src, dest);
  }
}

async function pack() {
  await mkdir(SPRITES, { recursive: true });
  await mkdir(ATLAS, { recursive: true });
  await mkdir(PLATES, { recursive: true });

  const files = (await readdir(RENDERS)).filter((f) => f.endsWith(".png") && !f.includes("debug"));
  for (const f of files) {
    const src = await bestSource(f);
    if (!src) continue;
    const webp = f.replace(/\.png$/, ".webp");
    const img = sharp(src);
    const meta = await img.metadata();
    // Full-body plates stay as individual webps. Thumbs/icons go to the atlas too.
    await sharp(src)
      .webp({ quality: 86, alphaQuality: 90 })
      .toFile(join(PLATES, webp));
    if (/thumb|icon/.test(f)) {
      await sharp(src)
        .png()
        .toFile(join(SPRITES, f));
    }
    console.log("plate", webp, meta.width + "x" + meta.height);
  }

  run(
    TP,
    [
      "--format",
      "json",
      "--texture-format",
      "png",
      "--sheet",
      join(ATLAS, "ui.png"),
      "--data",
      join(ATLAS, "ui.json"),
      "--algorithm",
      "MaxRects",
      "--max-size",
      "2048",
      "--padding",
      "2",
      "--extrude",
      "1",
      "--trim-sprite-names",
      SPRITES,
    ],
    { allowFail: false },
  );
  // Also publish a webp atlas for the web app.
  if (await exists(join(ATLAS, "ui.png"))) {
    await sharp(join(ATLAS, "ui.png")).webp({ quality: 88 }).toFile(join(ATLAS, "ui.webp"));
  }
}

async function icons() {
  // Sliced bust mark from the three icon renders, falling back to the vector mark.
  const femaleSkin = await bestSource("female-icon-skin.png");
  const femaleMuscle = await bestSource("female-icon-muscles.png");
  const femaleBone = await bestSource("female-icon-skeleton.png");
  if (!femaleSkin || !femaleMuscle || !femaleBone) {
    console.warn("icon busts missing — run npm run icons for the vector mark");
    return;
  }
  const size = 512;
  const third = Math.floor(size / 3);
  const slices = await Promise.all(
    [femaleSkin, femaleMuscle, femaleBone].map((p) =>
      sharp(p).resize(size, size, { fit: "cover", position: "top" }).png().toBuffer(),
    ),
  );
  const mark = await sharp({
    create: { width: size, height: size, channels: 4, background: "#05080b" },
  })
    .composite([
      { input: await sharp(slices[0]).extract({ left: 0, top: 0, width: third, height: size }).png().toBuffer(), left: 0, top: 0 },
      { input: await sharp(slices[1]).extract({ left: third, top: 0, width: third, height: size }).png().toBuffer(), left: third, top: 0 },
      { input: await sharp(slices[2]).extract({ left: third * 2, top: 0, width: size - third * 2, height: size }).png().toBuffer(), left: third * 2, top: 0 },
    ])
    .png()
    .toBuffer();

  const out = join(ROOT, "public/icons");
  await mkdir(out, { recursive: true });
  for (const { file, dim } of [
    { file: "icon-512.png", dim: 512 },
    { file: "icon-192.png", dim: 192 },
    { file: "apple-touch-icon.png", dim: 180 },
    { file: "maskable-512.png", dim: 512 },
  ]) {
    const inset = file.startsWith("maskable") ? 0.18 : 0;
    const inner = Math.round(dim * (1 - inset));
    const pad = Math.round((dim - inner) / 2);
    await sharp({ create: { width: dim, height: dim, channels: 4, background: "#05080b" } })
      .composite([{ input: await sharp(mark).resize(inner, inner).png().toBuffer(), left: pad, top: pad }])
      .png()
      .toFile(join(out, file));
    console.log("icon", file);
  }
}

async function main() {
  await blender();
  if (!(await exists(RENDERS))) {
    throw new Error("No Blender renders at art/blender/renders — run with --blender");
  }
  await krita();
  await affinity();
  await pack();
  await icons();
  await writeFile(
    join(ROOT, "art/MANIFEST.txt"),
    `Croppen plates built ${new Date().toISOString()}
Sources: Blender 5.2 (original figure) → Krita 5.3 finish → Affinity composite → TexturePacker 8.2 atlas
Plates live in public/plates/*.webp
Atlas lives in public/atlas/ui.png + ui.json
`,
  );
  console.log("graphics pipeline done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
