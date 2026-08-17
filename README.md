# Croppen

An interactive, installable web app for exploring human anatomy layer by layer —
skin, muscle, organs and bone — in Danish and English.

Inspired by the layered anatomical plates in Richard Walker's *Kroppen*
(Forlaget Globe, 2006; originally *Body — an amazing tour of human anatomy*,
Dorling Kindersley). **All artwork in this app is original vector work.** No
image from the book is reproduced or redistributed; the reference photographs
used while drawing are gitignored and never committed.

## What it does

- **Dissection depth.** Four stops — skin → muscles → organs → skeleton. Layers
  are stacked in physical order, so peeling one back exposes what is genuinely
  underneath, with the deeper ones left faintly visible as context.
- **Scalpel.** Drag a circular window across the body to see one layer deeper
  without leaving the current one. It is implemented as an actual hole cut in
  the current layer, so what shows through is the real layer beneath.
- **Body systems.** Circulatory, nervous, lymphatic and endocrine networks can
  be overlaid on top of whichever layer is exposed.
- **Tap to learn.** Every structure carries a bilingual name, its Latin term, a
  description and a "did you know" fact, and flags itself on the figure with a
  leader-line label in the manner of the source plates.
- **Quiz.** Ten rounds of "find this structure" on the same figure, scored.
- **Two bodies, six appearances.** Male and female figures; appearance presets
  spanning Fitzpatrick phototypes I–VI. Only the skin, hair and iris change —
  every layer beneath the epidermis is drawn identically for all of them, which
  is one of the things the app sets out to teach.
- **Offline.** A service worker precaches the shell; the app carries no data
  beyond its own bundle, so it works fully offline once loaded.

## Language

Danish and English. The locale is picked from the browser's language
preferences on first load, falling back to English, and can be changed in the
top bar. The choice is remembered.

## Stack

Next.js 16 (App Router) exported as a fully static bundle — no server runtime.
The figure is still an authored SVG hit-map (so every structure stays
clickable, and the scalpel is still a real hole). Dimensional plates —
skin lighting, muscle, organs, skeleton — are original 3-D renders that
sit in the same 420×1000 viewBox. They are built by a local graphics
pipeline, not taken from the book.

```
app/                  shell, layout, global styles
components/
  BodyFigure.tsx      the SVG stage: layer stack, scalpel, labels, zoom/pan
  body/               one component per anatomical layer, plus shared defs
  Controls.tsx        depth ladder, system toggles, appearance picker
  InfoPanel.tsx       structure detail card
  Quiz.tsx            quiz state and prompt bar
lib/
  anatomy/            geometry, structure content, appearance presets
  i18n/               locale detection and bilingual UI strings
art/                  Blender / Krita / Affinity / TexturePacker sources
public/plates/        rendered layer plates (webp)
public/atlas/         packed thumbs and icon busts
scripts/              icon generation and graphics pipeline
```

Rebuild the plates after changing `art/blender/build_anatomy.py`:

```bash
npm run graphics:full    # Blender → Krita → Affinity → TexturePacker → public/
npm run graphics         # skip Blender; re-finish and pack existing renders
```

### Bilateral drawing

The figure is an anterior view, so **the subject's right side is drawn on the
left of the image** — which is why, for example, the liver sits at x < 210.
Bilateral structures are authored once for the subject's right and mirrored by
the `Bilateral` component; both copies carry the same `data-structure`, so a
click on either resolves to the same entry.

## Development

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build      # static export to ./out
npm run typecheck  # tsc --noEmit
npm run icons      # regenerate public/icons from scripts/generate-icons.mjs
```

App icons are committed, so a deploy never has to run `sharp`.

## Deployment

Deployed on Vercel as a static export. Pushes to `main` deploy automatically
once the project is linked; `npx vercel --prod` deploys from a working copy.

## Note on scope

The anatomy here is accurate in arrangement and proportion but deliberately
stylised — it is a teaching illustration, not a clinical reference, and it is
not a substitute for medical advice.
