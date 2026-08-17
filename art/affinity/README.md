# Affinity (Croppen)

Affinity 3 opens **documents** (SVG, PNG, PDF, `.affinity`). It does **not**
open `.js` files — that is what produced “The file type is not supported.”

## Open the plates

```
File → Open → art/affinity/croppen-female.svg
File → Open → art/affinity/croppen-male.svg
```

Each file is an 840×2000 stack with the plates **embedded** (Affinity
drops linked `href` PNGs on import, which is why the first version was
only a black rectangle). Layers: skeleton, organs, muscles, skin, lighting.
Toggle visibility to grade or retouch, then export PNG into `art/affinity/out/`.

Regenerate after a new Blender render:

```
node art/affinity/build_svg.mjs
```

## Run the script

`composite_plates.js` is a **Scripts panel** script, not a document.

1. Affinity → **Window → General → Scripts**
2. Create a category if the panel is empty (**Create New Category**, e.g. Croppen)
3. The script is installed at
   `~/Library/Application Support/Affinity/user/Scripts/Croppen/composite_plates.js`
4. Click **Croppen — export plates**

If a document is open it exports that. If nothing is open it loads the
rendered plates and writes PNGs to `art/affinity/out/`.
