# Croppen graphics pipeline

Original 3-D plates for the figure. Nothing here is traced from the
Walker / DK book — those photographs stay gitignored.

```
Blender 5.2   art/blender/build_anatomy.py     → art/blender/renders/
Krita 5.3     art/krita/finish_plates.py       → art/krita/out/
Affinity 3    art/affinity/croppen-*.svg       → open in Affinity
              art/affinity/composite_plates.js → Window → General → Scripts
TexturePacker art/sprites/                     → public/atlas/
sharp                                       → public/plates/*.webp
```

```bash
# Rebuild the 3-D figure (slow, Cycles on Metal) then finish and pack:
npm run graphics:full

# Re-finish and pack existing renders:
npm run graphics
```

The web app keeps the authored SVG as the hit-map (and as the
appearance-tinted skin). The plates are paint: a lighting pass multiplied
over the skin, and colour plates for muscle, organs and skeleton.

The figure is a teaching mannequin, not a clinical mesh. Proportions
match the 420×1000 viewBox (midline 210, anterior view, subject's right
on the image left).
