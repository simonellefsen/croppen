# Krita illustration finish for Croppen plates.
# Run:  kritarunner -s finish_plates
# Looks for CROPPEN_ROOT or defaults to this repo.

import os
import sys
from pathlib import Path

from krita import Krita, InfoObject  # type: ignore


def repo_root() -> Path:
    env = os.environ.get("CROPPEN_ROOT")
    if env:
        return Path(env)
    # art/krita/finish_plates.py → repo
    return Path(__file__).resolve().parents[2]


def apply_unsharp(app, node, w, h, amount=0.45, radius=1.6, threshold=2):
    filt = app.filter("unsharp")
    if filt is None:
        return
    info = InfoObject()
    for k, v in (("amount", amount), ("radius", radius), ("threshold", threshold)):
        try:
            info.setProperty(k, v)
        except Exception:
            pass
    filt.setParameters(info)
    filt.apply(node, 0, 0, w, h)


def apply_hsv(app, node, w, h, sat=1.06, val=1.03):
    filt = app.filter("hsvadjustment")
    if filt is None:
        return
    info = InfoObject()
    for k, v in (("h", 0), ("s", sat), ("v", val), ("type", "scale")):
        try:
            info.setProperty(k, v)
        except Exception:
            pass
    filt.setParameters(info)
    filt.apply(node, 0, 0, w, h)


def process(src: Path, dest: Path) -> None:
    app = Krita.instance()
    doc = app.openDocument(str(src))
    if doc is None:
        raise RuntimeError(f"Krita could not open {src}")
    app.activeWindow().addView(doc) if app.activeWindow() else None
    doc.waitForDone()
    node = doc.activeNode()
    w, h = doc.width(), doc.height()

    # Paper grain as a separate overlay so the 3D form stays readable.
    grain = doc.createNode("grain", "paintlayer")
    doc.rootNode().addChildNode(grain, None)
    noise = app.filter("noise") or app.filter("randompick")
    if noise is not None:
        info = InfoObject()
        try:
            info.setProperty("level", 8)
        except Exception:
            pass
        noise.setParameters(info)
        noise.apply(grain, 0, 0, w, h)
        try:
            grain.setBlendingMode("overlay")
            grain.setOpacity(40)
        except Exception:
            pass

    apply_unsharp(app, node, w, h)
    apply_hsv(app, node, w, h)

    dest.parent.mkdir(parents=True, exist_ok=True)
    doc.setBatchmode(True)
    doc.exportImage(str(dest), InfoObject())
    doc.close()
    print(f"krita {src.name} -> {dest}")


def __main__(args=None):
    root = repo_root()
    src_dir = root / "art/blender/renders"
    dest_dir = root / "art/krita/out"
    dest_dir.mkdir(parents=True, exist_ok=True)
    names = sorted(p for p in src_dir.glob("*.png") if "debug" not in p.name and "on-grey" not in p.name)
    if not names:
        print("no plates in", src_dir)
        return
    for src in names:
        process(src, dest_dir / src.name)


if __name__ == "__main__":
    __main__(sys.argv[1:])
