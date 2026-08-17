#!/usr/bin/env python3
"""
Croppen anatomical atlas — original 3D figure.

Builds a teaching-quality anterior figure that matches the app's 420×1000
viewBox (midline x = 210, y down). Renders transparent plates for skin,
muscle, organs and skeleton, plus a lighting pass the web app multiplies
over the appearance-tinted SVG skin.

All forms are authored here. Nothing is traced from the reference book.
"""

from __future__ import annotations

import math
import os
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
HDRI = ROOT / "art/blender/hdri/blue_photo_studio_1k.hdr"
OUT = ROOT / "art/blender/renders"
BLEND = ROOT / "art/blender/croppen_anatomy.blend"

MID = 210.0
FRAME_H = 1000.0
PREVIEW = os.environ.get("CROPPEN_PREVIEW") == "1"
ONLY_SEX = os.environ.get("CROPPEN_SEX")  # female | male
ONLY_LAYER = os.environ.get("CROPPEN_LAYER")  # skin | muscles | organs | skeleton | light | icon

RES_X = 420 if PREVIEW else 840
RES_Y = 1000 if PREVIEW else 2000
SAMPLES = 24 if PREVIEW else 48


def sx(x: float) -> float:
    return float(x) - MID


def sz(y: float) -> float:
    return FRAME_H - float(y)


def mx(x: float) -> float:
    return 420.0 - float(x)


# ───────────────────────────────────────────── scene
def reset_scene() -> bpy.types.Scene:
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh)
    for curve in list(bpy.data.curves):
        bpy.data.curves.remove(curve)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)
    for col in list(bpy.data.collections):
        if col.name != "Collection":
            bpy.data.collections.remove(col)
    scene = bpy.context.scene
    scene.unit_settings.system = "NONE"
    return scene


def collection(name: str, parent: bpy.types.Collection | None = None) -> bpy.types.Collection:
    col = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(col)
    return col


def link(obj: bpy.types.Object, col: bpy.types.Collection) -> bpy.types.Object:
    col.objects.link(obj)
    return obj


# ───────────────────────────────────────────── mesh helpers
def _mesh_from_bm(name: str, bm: bmesh.types.BMesh) -> bpy.types.Mesh:
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    return mesh


def shade_smooth(obj: bpy.types.Object) -> None:
    mesh = obj.data
    if hasattr(mesh, "shade_smooth"):
        mesh.shade_smooth()
        return
    for p in mesh.polygons:
        p.use_smooth = True


def assign(obj: bpy.types.Object, mat: bpy.types.Material) -> None:
    if mat.name not in obj.data.materials:
        obj.data.materials.append(mat)


def add_obj(name: str, mesh: bpy.types.Mesh, col: bpy.types.Collection, mat=None) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, mesh)
    link(obj, col)
    shade_smooth(obj)
    if mat:
        assign(obj, mat)
    return obj


def ellipsoid(name, loc, radii, col, mat=None, segs=20) -> bpy.types.Object:
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=max(8, segs // 2), radius=1.0)
    for v in bm.verts:
        v.co.x *= radii[0]
        v.co.y *= radii[1]
        v.co.z *= radii[2]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = add_obj(name, _mesh_from_bm(name, bm), col, mat)
    obj.location = loc
    return obj


def capsule(name, a, b, radius, col, mat=None, segs=14) -> bpy.types.Object:
    a, b = Vector(a), Vector(b)
    direction = b - a
    length = direction.length
    if length < 1e-4:
        return ellipsoid(name, a, (radius, radius, radius), col, mat, segs)

    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segs,
        radius1=radius,
        radius2=radius,
        depth=length,
    )
    for sign, z in ((1.0, length / 2.0), (-1.0, -length / 2.0)):
        sphere = bmesh.new()
        bmesh.ops.create_uvsphere(sphere, u_segments=segs, v_segments=max(6, segs // 2), radius=radius)
        dead = [v for v in sphere.verts if (v.co.z * sign) < -1e-5]
        bmesh.ops.delete(sphere, geom=dead, context="VERTS")
        for v in sphere.verts:
            v.co.z += z
        mapping = {v: bm.verts.new(v.co) for v in sphere.verts}
        sphere.faces.ensure_lookup_table()
        for f in sphere.faces:
            try:
                bm.faces.new([mapping[v] for v in f.verts])
            except ValueError:
                pass
        sphere.free()

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=max(radius * 0.06, 0.02))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = add_obj(name, _mesh_from_bm(name, bm), col, mat)
    obj.rotation_euler = Vector((0.0, 0.0, 1.0)).rotation_difference(direction.normalized()).to_euler()
    obj.location = (a + b) * 0.5
    return obj


def tube(name, points, radius, col, mat=None, segs=10) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    curve.resolution_u = 8
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for i, p in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = Vector(p)
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    link(obj, col)
    if mat:
        obj.data.materials.append(mat)
    return obj


def loft(name, rings, col, mat=None) -> bpy.types.Object:
    """rings: list of list[(x,y,z)] all same length."""
    bm = bmesh.new()
    vert_rings = []
    for ring in rings:
        verts = [bm.verts.new(Vector(p)) for p in ring]
        vert_rings.append(verts)
    segs = len(vert_rings[0])
    for r0, r1 in zip(vert_rings, vert_rings[1:]):
        for i in range(segs):
            j = (i + 1) % segs
            try:
                bm.faces.new((r0[i], r0[j], r1[j], r1[i]))
            except ValueError:
                pass
    try:
        bm.faces.new(list(reversed(vert_rings[0])))
    except ValueError:
        pass
    try:
        bm.faces.new(vert_rings[-1])
    except ValueError:
        pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return add_obj(name, _mesh_from_bm(name, bm), col, mat)


def ellipse_ring(cx, cy, cz, rx, ry, segs=24):
    pts = []
    for i in range(segs):
        a = 2.0 * math.pi * i / segs
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a), cz))
    return pts


def apply_voxel(obj: bpy.types.Object, size: float) -> None:
    mod = obj.modifiers.new("Remesh", "REMESH")
    mod.mode = "VOXEL"
    mod.voxel_size = size
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.modifier_apply(modifier=mod.name)
    except Exception:
        pass
    obj.select_set(False)
    shade_smooth(obj)


def join_objects(name: str, objs: list[bpy.types.Object], col: bpy.types.Collection) -> bpy.types.Object:
    objs = [o for o in objs if o and o.name in bpy.data.objects]
    if not objs:
        raise RuntimeError(f"nothing to join for {name}")
    if len(objs) == 1:
        objs[0].name = name
        return objs[0]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = name
    return obj


# ───────────────────────────────────────────── materials
def set_in(node, names, value) -> bool:
    for n in names:
        sock = node.inputs.get(n)
        if sock is None:
            continue
        try:
            sock.default_value = value
            return True
        except Exception:
            continue
    return False


def principled(name, color, roughness=0.45, metallic=0.0, sss=0.0, sss_radius=(1.0, 0.35, 0.2), sss_scale=0.08, spec=0.45, emission=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (420, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    col4 = (color[0], color[1], color[2], 1.0)
    set_in(bsdf, ["Base Color"], col4)
    set_in(bsdf, ["Roughness"], roughness)
    set_in(bsdf, ["Metallic"], metallic)
    set_in(bsdf, ["Specular IOR Level", "Specular"], spec)
    if sss:
        set_in(bsdf, ["Subsurface Weight", "Subsurface"], sss)
        set_in(bsdf, ["Subsurface Radius"], (*sss_radius, 1.0)[:3])
        set_in(bsdf, ["Subsurface Scale"], sss_scale)
        set_in(bsdf, ["Subsurface Color"], col4)
    if emission:
        set_in(bsdf, ["Emission Color", "Emission"], (*emission[0], 1.0))
        set_in(bsdf, ["Emission Strength"], emission[1])
    links.new(bsdf.outputs[0], out.inputs[0])
    return mat


def muscle_mat():
    mat = principled("MAT_muscle", (0.42, 0.07, 0.055), roughness=0.48, sss=0.18, spec=0.4)
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    tex = nodes.new("ShaderNodeTexWave")
    tex.location = (-520, 80)
    tex.wave_type = "BANDS"
    tex.bands_direction = "Z"
    tex.inputs["Scale"].default_value = 38.0
    tex.inputs["Distortion"].default_value = 4.5
    tex.inputs["Detail"].default_value = 4.0
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-280, 80)
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = (0.28, 0.04, 0.03, 1)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = (0.55, 0.12, 0.08, 1)
    links.new(tex.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def bone_mat():
    mat = principled("MAT_bone", (0.86, 0.80, 0.62), roughness=0.42, sss=0.12, sss_radius=(1.0, 0.7, 0.4), spec=0.38)
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-480, 40)
    noise.inputs["Scale"].default_value = 24.0
    noise.inputs["Detail"].default_value = 8.0
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-260, 40)
    ramp.color_ramp.elements[0].color = (0.72, 0.64, 0.46, 1)
    ramp.color_ramp.elements[1].color = (0.93, 0.88, 0.72, 1)
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def make_materials() -> dict[str, bpy.types.Material]:
    return {
        "skin": principled("MAT_skin", (0.78, 0.54, 0.40), roughness=0.38, sss=0.55, sss_scale=0.18, spec=0.42),
        "skin_light": principled("MAT_skin_light", (0.88, 0.84, 0.80), roughness=0.38, sss=0.6, sss_scale=0.2, spec=0.45),
        "fascia": principled("MAT_fascia", (0.18, 0.05, 0.04), roughness=0.65, sss=0.08),
        "cavity": principled("MAT_cavity", (0.045, 0.02, 0.018), roughness=0.8),
        "muscle": muscle_mat(),
        "tendon": principled("MAT_tendon", (0.78, 0.72, 0.55), roughness=0.35, spec=0.5),
        "bone": bone_mat(),
        "cartilage": principled("MAT_cartilage", (0.72, 0.78, 0.68), roughness=0.28, sss=0.25),
        "brain": principled("MAT_brain", (0.78, 0.58, 0.54), roughness=0.4, sss=0.35),
        "cerebellum": principled("MAT_cerebellum", (0.62, 0.42, 0.38), roughness=0.45, sss=0.25),
        "heart": principled("MAT_heart", (0.48, 0.07, 0.05), roughness=0.38, sss=0.22),
        "lung": principled("MAT_lung", (0.70, 0.36, 0.36), roughness=0.55, sss=0.2),
        "liver": principled("MAT_liver", (0.32, 0.12, 0.07), roughness=0.48, sss=0.15),
        "stomach": principled("MAT_stomach", (0.62, 0.36, 0.28), roughness=0.5, sss=0.18),
        "gut": principled("MAT_gut", (0.78, 0.52, 0.32), roughness=0.48, sss=0.16),
        "colon": principled("MAT_colon", (0.70, 0.46, 0.26), roughness=0.5),
        "kidney": principled("MAT_kidney", (0.38, 0.16, 0.12), roughness=0.45, sss=0.2),
        "spleen": principled("MAT_spleen", (0.32, 0.10, 0.16), roughness=0.5),
        "pancreas": principled("MAT_pancreas", (0.70, 0.52, 0.32), roughness=0.55),
        "gall": principled("MAT_gall", (0.30, 0.42, 0.10), roughness=0.25, sss=0.3),
        "bladder": principled("MAT_bladder", (0.78, 0.70, 0.42), roughness=0.4, sss=0.2),
        "pink": principled("MAT_pink", (0.62, 0.32, 0.36), roughness=0.42, sss=0.25),
        "trachea": principled("MAT_trachea", (0.72, 0.62, 0.52), roughness=0.4),
        "marrow": principled("MAT_marrow", (0.55, 0.18, 0.16), roughness=0.55, sss=0.3),
        "enamel": principled("MAT_enamel", (0.95, 0.93, 0.88), roughness=0.18, spec=0.7),
    }


# ───────────────────────────────────────────── figure
def body_profile(sex: str):
    """Anterior half-width / depth rings from crown to perineum (SVG y)."""
    if sex == "female":
        return [
            # y, rx, ry (depth)
            (32, 10, 9),
            (44, 30, 28),
            (70, 42, 38),
            (100, 43, 40),
            (128, 36, 34),
            (150, 24, 22),
            (168, 20, 18),
            (188, 24, 22),
            (210, 86, 34),
            (232, 74, 46),
            (268, 70, 52),
            (308, 66, 48),
            (348, 58, 44),
            (378, 56, 42),
            (420, 70, 48),
            (452, 80, 52),
            (478, 72, 46),
            (498, 38, 30),
        ]
    return [
        (30, 11, 10),
        (44, 32, 30),
        (70, 44, 40),
        (100, 45, 42),
        (130, 36, 34),
        (150, 24, 22),
        (168, 22, 20),
        (188, 26, 24),
        (214, 100, 38),
        (240, 86, 50),
        (280, 78, 54),
        (330, 70, 50),
        (368, 64, 46),
        (410, 66, 48),
        (452, 70, 50),
        (480, 64, 44),
        (500, 36, 30),
    ]


def limb_specs(sex: str):
    if sex == "female":
        return {
            "arm": [(126, 214, 17), (118, 300, 14), (110, 390, 13), (102, 470, 12), (112, 530, 9)],
            "hand": (116, 542, 16, 8, 6),
            "leg": [(154, 470, 28), (148, 560, 24), (146, 640, 20), (150, 700, 18), (156, 800, 15), (158, 900, 12)],
            "foot": (176, 942, 22, 10, 8),
            "breast": True,
        }
    return {
        "arm": [(116, 216, 19), (106, 300, 16), (96, 390, 14), (90, 470, 13), (104, 532, 10)],
        "hand": (108, 544, 17, 8, 6),
        "leg": [(148, 470, 26), (144, 560, 23), (146, 640, 20), (150, 700, 18), (156, 800, 15), (160, 900, 12)],
        "foot": (180, 942, 22, 10, 8),
        "breast": False,
    }


def build_skin(sex: str, cols: dict, mats: dict) -> bpy.types.Object:
    """Connected mannequin via the Skin modifier — one watertight volume."""
    f = 1.0 if sex == "female" else 1.0
    # (key, svg_x, svg_y, radius_x, radius_depth)
    if sex == "female":
        nodes = [
            ("crown", 210, 36, 26, 24),
            ("head", 210, 88, 48, 44),
            ("chin", 210, 146, 28, 26),
            ("neck", 210, 176, 24, 22),
            ("sternum", 210, 228, 52, 36),
            ("chest", 210, 288, 64, 46),
            ("waist", 210, 368, 50, 38),
            ("pelvis", 210, 448, 68, 44),
            ("crotch", 210, 492, 22, 18),
            ("sh_r", 128, 218, 24, 20),
            ("el_r", 112, 360, 16, 14),
            ("wr_r", 104, 490, 13, 11),
            ("hd_r", 114, 542, 16, 9),
            ("hp_r", 154, 470, 32, 26),
            ("kn_r", 150, 682, 20, 16),
            ("an_r", 158, 900, 14, 12),
            ("ft_r", 176, 944, 22, 10),
        ]
        breasts = True
    else:
        nodes = [
            ("crown", 210, 34, 27, 25),
            ("head", 210, 88, 50, 46),
            ("chin", 210, 146, 28, 26),
            ("neck", 210, 174, 26, 24),
            ("sternum", 210, 228, 58, 38),
            ("chest", 210, 286, 70, 50),
            ("waist", 210, 366, 52, 40),
            ("pelvis", 210, 448, 62, 42),
            ("crotch", 210, 492, 22, 18),
            ("sh_r", 116, 220, 26, 22),
            ("el_r", 100, 360, 17, 15),
            ("wr_r", 92, 490, 14, 12),
            ("hd_r", 106, 544, 17, 9),
            ("hp_r", 148, 470, 30, 24),
            ("kn_r", 150, 682, 20, 16),
            ("an_r", 160, 900, 14, 12),
            ("ft_r", 180, 944, 22, 10),
        ]
        breasts = False

    edges = [
        ("crown", "head"),
        ("head", "chin"),
        ("chin", "neck"),
        ("neck", "sternum"),
        ("sternum", "chest"),
        ("chest", "waist"),
        ("waist", "pelvis"),
        ("pelvis", "crotch"),
        ("sternum", "sh_r"),
        ("sh_r", "el_r"),
        ("el_r", "wr_r"),
        ("wr_r", "hd_r"),
        ("pelvis", "hp_r"),
        ("hp_r", "kn_r"),
        ("kn_r", "an_r"),
        ("an_r", "ft_r"),
    ]

    bm = bmesh.new()
    bm_verts = {}
    radii = []
    for key, x, y, rx, ry in nodes:
        v = bm.verts.new((sx(x), 0.0, sz(y)))
        bm_verts[key] = v
        radii.append((rx, ry))
        # mirror limbs
        if key.endswith("_r"):
            mk = key[:-2] + "_l"
            v2 = bm.verts.new((sx(mx(x)), 0.0, sz(y)))
            bm_verts[mk] = v2
            radii.append((rx, ry))
    if breasts:
        bm_verts["br_r"] = bm.verts.new((sx(176), 14.0, sz(278)))
        radii.append((18, 16))
        bm_verts["br_l"] = bm.verts.new((sx(244), 14.0, sz(278)))
        radii.append((18, 16))
        edges += [("chest", "br_r"), ("chest", "br_l")]
    # ears
    ear_x = 166 if sex == "female" else 164
    bm_verts["ear_r"] = bm.verts.new((sx(ear_x), 12.0, sz(104)))
    radii.append((6, 8))
    bm_verts["ear_l"] = bm.verts.new((sx(mx(ear_x)), 12.0, sz(104)))
    radii.append((6, 8))
    edges += [("head", "ear_r"), ("head", "ear_l")]

    for a, b in edges:
        try:
            bm.edges.new((bm_verts[a], bm_verts[b]))
        except ValueError:
            pass
        if a.endswith("_r") and b.endswith("_r"):
            try:
                bm.edges.new((bm_verts[a[:-2] + "_l"], bm_verts[b[:-2] + "_l"]))
            except ValueError:
                pass
    # Torso-to-limb roots are mixed (no _r suffix on the torso end).
    for torso, limb in (("sternum", "sh_l"), ("pelvis", "hp_l")):
        if torso in bm_verts and limb in bm_verts:
            try:
                bm.edges.new((bm_verts[torso], bm_verts[limb]))
            except ValueError:
                pass

    mesh = bpy.data.meshes.new(f"{sex}_skin")
    bm.to_mesh(mesh)
    bm.free()
    obj = add_obj(f"{sex}_skin", mesh, cols["skin"], mats["skin"])

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    skin = obj.modifiers.new("Skin", "SKIN")
    skin.use_smooth_shade = True
    skin.branch_smoothing = 1.0

    bpy.ops.object.mode_set(mode="EDIT")
    ebm = bmesh.from_edit_mesh(obj.data)
    sl = ebm.verts.layers.skin.verify()
    ebm.verts.ensure_lookup_table()
    for i, v in enumerate(ebm.verts):
        rx, ry = radii[i] if i < len(radii) else (12.0, 12.0)
        v[sl].radius = (float(rx), float(ry))
        v[sl].use_root = False
        v[sl].use_loose = False
    # Single root at the pelvis (index 7 in `nodes`) so the envelope is one piece.
    if len(ebm.verts) > 7:
        ebm.verts[7][sl].use_root = True
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode="OBJECT")

    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2

    bpy.ops.object.modifier_apply(modifier=skin.name)
    bpy.ops.object.modifier_apply(modifier=sub.name)
    assign(obj, mats["skin"])
    shade_smooth(obj)
    print(f"  skin {sex}: verts={len(obj.data.vertices)} dim={tuple(round(v,1) for v in obj.dimensions)}")
    return obj


def scaled_copy(src: bpy.types.Object, name: str, factor: float, col, mat) -> bpy.types.Object:
    obj = src.copy()
    obj.data = src.data.copy()
    obj.name = name
    obj.scale = (factor, factor, factor)
    obj.location = (src.location.x, src.location.y, src.location.z)
    link(obj, col)
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def build_muscles(sex: str, cols, mats):
    mcol = cols["muscles"]
    mat = mats["muscle"]
    ten = mats["tendon"]

    def add_cap(tag, x1, y1, x2, y2, r, depth=8.0, both=True, material=None):
        mm = material or mat
        for side in ((1, -1) if both else (1,)):
            xa = x1 if side > 0 else mx(x1)
            xb = x2 if side > 0 else mx(x2)
            capsule(f"{sex}_{tag}{side}", (sx(xa), depth, sz(y1)), (sx(xb), depth, sz(y2)), r, mcol, mm)

    # neck / trunk
    add_cap("scm", 188, 152, 198, 198, 6.2, 10)
    add_cap("trap", 202, 190, 148, 218, 7.5, 4)
    add_cap("pec", 206, 214, 156, 268, 16, 18)
    add_cap("pec2", 200, 230, 170, 300, 12, 16)
    add_cap("serr", 150, 274, 168, 336, 5.5, 14)
    add_cap("rectus", 196, 322, 196, 468, 11.5, 16)
    add_cap("oblique", 170, 292, 160, 430, 12, 14)
    # arm
    add_cap("delt", 160, 206, 118, 292, 15, 16)
    add_cap("biceps", 124, 250, 128, 374, 10, 14)
    add_cap("triceps", 110, 260, 112, 382, 8.5, 2)
    add_cap("fore", 112, 386, 106, 498, 11, 10)
    add_cap("tend_arm", 108, 498, 116, 544, 2.4, 8, material=ten)
    # hip / leg
    add_cap("glute", 150, 424, 148, 500, 16, 6)
    add_cap("vast_l", 138, 486, 150, 674, 13.5, 12)
    add_cap("rect_f", 160, 480, 176, 674, 12.5, 16)
    add_cap("vast_m", 184, 568, 200, 678, 9.5, 14)
    add_cap("adduct", 198, 478, 202, 604, 10, 10)
    add_cap("sart", 152, 464, 194, 672, 5.2, 18)
    add_cap("gas_l", 144, 700, 156, 842, 12, 12)
    add_cap("gas_m", 182, 700, 172, 842, 11.5, 14)
    add_cap("ach", 164, 846, 164, 908, 5.5, 8, material=ten)
    add_cap("tib", 158, 700, 164, 884, 8, 16)
    # face sheet
    ellipsoid(f"{sex}_face_m", (0, 18, sz(90)), (36, 10, 42), mcol, mat, 16)


def build_organs(sex: str, cols, mats):
    ocol = cols["organs"]
    ellipsoid(f"{sex}_brain", (0, 8, sz(82)), (38, 32, 40), ocol, mats["brain"], 22)
    ellipsoid(f"{sex}_cerebellum", (0, -10, sz(126)), (22, 16, 10), ocol, mats["cerebellum"], 14)
    capsule(f"{sex}_esoph", (0, -6, sz(150)), (0, -4, sz(310)), 3.2, ocol, mats["pink"])
    ellipsoid(f"{sex}_trachea", (0, 6, sz(190)), (7, 6, 36), ocol, mats["trachea"], 12)
    # lungs — subject's right is image left
    ellipsoid(f"{sex}_lung_r", (sx(176), 6, sz(278)), (26, 22, 48), ocol, mats["lung"], 18)
    ellipsoid(f"{sex}_lung_l", (sx(242), 6, sz(276)), (24, 20, 46), ocol, mats["lung"], 18)
    ellipsoid(f"{sex}_heart", (sx(218), 16, sz(300)), (18, 14, 22), ocol, mats["heart"], 16)
    ellipsoid(f"{sex}_liver", (sx(182), 10, sz(360)), (34, 20, 22), ocol, mats["liver"], 16)
    ellipsoid(f"{sex}_gall", (sx(188), 18, sz(384)), (8, 6, 6), ocol, mats["gall"], 10)
    ellipsoid(f"{sex}_stomach", (sx(238), 12, sz(368)), (20, 14, 22), ocol, mats["stomach"], 14)
    ellipsoid(f"{sex}_spleen", (sx(268), 4, sz(358)), (12, 8, 16), ocol, mats["spleen"], 12)
    ellipsoid(f"{sex}_pancreas", (sx(228), 2, sz(388)), (26, 6, 6), ocol, mats["pancreas"], 10)
    for side, x in ((1, 180), (-1, 240)):
        ellipsoid(f"{sex}_kidney{side}", (sx(x), -8, sz(390)), (10, 8, 16), ocol, mats["kidney"], 12)
        tube(f"{sex}_ureter{side}", [(sx(x), -6, sz(410)), (sx(210 + (x - 210) * 0.4), -4, sz(440)), (0, 4, sz(458))], 1.6, ocol, mats["pink"])
    # intestines as coiled tube
    coils = []
    for i in range(7):
        t = i / 6
        coils.append((math.sin(i * 1.7) * 22, 8 + (i % 2) * 4, sz(410 + t * 58)))
    tube(f"{sex}_small", coils, 6.5, ocol, mats["gut"])
    colon = [
        (sx(164), 6, sz(470)),
        (sx(160), 6, sz(430)),
        (sx(162), 8, sz(396)),
        (sx(210), 8, sz(390)),
        (sx(258), 8, sz(396)),
        (sx(258), 6, sz(440)),
        (sx(250), 6, sz(476)),
        (sx(226), 6, sz(486)),
    ]
    tube(f"{sex}_colon", colon, 7.5, ocol, mats["colon"])
    ellipsoid(f"{sex}_bladder", (0, 10, sz(466)), (16, 10, 12), ocol, mats["bladder"], 12)
    if sex == "female":
        ellipsoid(f"{sex}_uterus", (0, 8, sz(446)), (14, 8, 12), ocol, mats["pink"], 12)
        for side, x in ((1, 168), (-1, 252)):
            ellipsoid(f"{sex}_ovary{side}", (sx(x), 6, sz(436)), (7, 5, 5), ocol, mats["pink"], 10)
    else:
        ellipsoid(f"{sex}_prostate", (0, 6, sz(470)), (11, 7, 8), ocol, mats["pink"], 10)
        for side, x in ((1, 200), (-1, 220)):
            ellipsoid(f"{sex}_testis{side}", (sx(x), 12, sz(492)), (9, 8, 12), ocol, mats["pink"], 10)
    # diaphragm arch
    tube(
        f"{sex}_diaphragm",
        [(sx(150), 4, sz(332)), (sx(180), 10, sz(308)), (0, 12, sz(304)), (sx(240), 10, sz(308)), (sx(270), 4, sz(332))],
        3.2,
        ocol,
        mats["muscle"],
    )


def build_skeleton(sex: str, cols, mats):
    scol = cols["skeleton"]
    bone = mats["bone"]
    cart = mats["cartilage"]
    p = 1.1 if sex == "female" else 1.0
    shoulder = 0 if sex == "female" else -10

    ellipsoid(f"{sex}_skull", (0, 0, sz(86)), (40, 36, 50), scol, bone, 22)
    ellipsoid(f"{sex}_jaw", (0, 8, sz(140)), (22, 16, 16), scol, bone, 12)
    for i, dx in enumerate(range(-14, 15, 5)):
        ellipsoid(f"{sex}_tooth{i}", (dx * 0.9, 18, sz(136)), (1.8, 2.2, 3.2), scol, mats["enamel"], 8)

    # spine
    for i in range(24):
        y = 162 + i * 11.2
        w = 7.5 + i * 0.32
        ellipsoid(f"{sex}_vert{i}", (0, -6, sz(y)), (w, 6.5, 5.2), scol, bone, 10)
    ellipsoid(f"{sex}_sacrum", (0, -4, sz(448)), (16, 8, 22), scol, bone, 12)

    # ribs
    for n in range(12):
        y_post = 216 + n * 10.2
        hw = 30 + 30 * math.sin(((n + 0.9) / 13.5) * math.pi)
        y_lat = y_post + 16 + n * 2
        y_ant = y_post + 30 + n * 3
        x_ant = 202 if n < 7 else (200 - (n - 6) * 5 if n < 10 else 210 - hw + 16)
        for side in (1, -1):
            x0 = 210
            x1 = 210 - hw if side > 0 else 210 + hw
            x2 = x_ant if side > 0 else mx(x_ant)
            tube(
                f"{sex}_rib{n}_{side}",
                [
                    (sx(x0) * 0.15, -16, sz(y_post)),
                    (sx(x1), -4, sz(y_lat)),
                    (sx(x2), 10, sz(y_ant)),
                ],
                2.5,
                scol,
                bone if n < 10 else bone,
            )
            if n < 7:
                tube(
                    f"{sex}_cart{n}_{side}",
                    [(sx(x2), 10, sz(y_ant)), (sx(206 if side > 0 else 214), 12, sz(y_ant - 10))],
                    2.0,
                    scol,
                    cart,
                )

    # sternum / clavicle / scapula
    capsule(f"{sex}_sternum", (0, 14, sz(214)), (0, 14, sz(324)), 6.5, scol, bone)
    for side in (1, -1):
        cx1 = 199
        cx2 = 150 + shoulder
        xx1 = cx1 if side > 0 else mx(cx1)
        xx2 = cx2 if side > 0 else mx(cx2)
        capsule(f"{sex}_clav{side}", (sx(xx1), 16, sz(212)), (sx(xx2), 10, sz(214)), 4.2, scol, bone)
        scx = 152 + shoulder
        sxx = scx if side > 0 else mx(scx)
        ellipsoid(f"{sex}_scap{side}", (sx(sxx), -14, sz(242)), (8, 4, 18), scol, bone, 10)

        # arm bones
        hx = 148 + shoulder
        hxx = hx if side > 0 else mx(hx)
        ellipsoid(f"{sex}_hum_head{side}", (sx(hxx), 8, sz(230)), (12, 10, 12), scol, bone, 12)
        capsule(f"{sex}_humerus{side}", (sx(hxx), 6, sz(242)), (sx(134 if side > 0 else mx(134)), 6, sz(388)), 6.2, scol, bone)
        capsule(f"{sex}_radius{side}", (sx(128 if side > 0 else mx(128)), 8, sz(400)), (sx(114 if side > 0 else mx(114)), 8, sz(486)), 4.0, scol, bone)
        capsule(f"{sex}_ulna{side}", (sx(144 if side > 0 else mx(144)), 4, sz(400)), (sx(132 if side > 0 else mx(132)), 4, sz(486)), 3.6, scol, bone)
        # hand
        for i, (x, y) in enumerate(((118, 498), (126, 496), (134, 497), (120, 506), (128, 505), (136, 506))):
            xx = x if side > 0 else mx(x)
            ellipsoid(f"{sex}_carpal{side}_{i}", (sx(xx), 8, sz(y)), (4, 3, 3.2), scol, bone, 8)
        for i, (x1, y1, x2, y2) in enumerate(((113, 512, 106, 534), (120, 512, 116, 540), (127, 512, 125, 542), (134, 512, 133, 538))):
            xa, xb = (x1 if side > 0 else mx(x1)), (x2 if side > 0 else mx(x2))
            capsule(f"{sex}_meta{side}_{i}", (sx(xa), 8, sz(y1)), (sx(xb), 8, sz(y2)), 2.2, scol, bone)

        # pelvis / legs
        iliac_x = 152 - 10 * p
        ixx = iliac_x if side > 0 else mx(iliac_x)
        ellipsoid(f"{sex}_ilium{side}", (sx(ixx + 8 * side), 2, sz(430)), (22 * p, 8, 28), scol, bone, 12)
        sock_x = 152 - 6 * p
        sxx = sock_x if side > 0 else mx(sock_x)
        ellipsoid(f"{sex}_head_fem{side}", (sx(sxx), 8, sz(470)), (10.5, 10, 10.5), scol, bone, 12)
        capsule(f"{sex}_femur{side}", (sx(sxx + 8 * (1 if side > 0 else -1)), 6, sz(500)), (sx(172 if side > 0 else mx(172)), 6, sz(660)), 8.5, scol, bone)
        ellipsoid(f"{sex}_patella{side}", (sx(172 if side > 0 else mx(172)), 16, sz(682)), (11, 5, 9), scol, bone, 10)
        capsule(f"{sex}_tibia{side}", (sx(168 if side > 0 else mx(168)), 8, sz(700)), (sx(172 if side > 0 else mx(172)), 8, sz(890)), 6.4, scol, bone)
        capsule(f"{sex}_fibula{side}", (sx(150 if side > 0 else mx(150)), 2, sz(710)), (sx(148 if side > 0 else mx(148)), 2, sz(884)), 3.4, scol, bone)
        ellipsoid(f"{sex}_calc{side}", (sx(156 if side > 0 else mx(156)), 8, sz(922)), (12, 10, 10), scol, bone, 10)
        ellipsoid(f"{sex}_forefoot{side}", (sx(178 if side > 0 else mx(178)), 10, sz(946)), (16, 8, 7), scol, bone, 10)

    # marrow window — a cutaway cylinder of marrow inside the left-image femur
    ellipsoid(f"{sex}_marrow", (sx(168), 10, sz(600)), (5, 5, 36), scol, mats["marrow"], 10)


# ───────────────────────────────────────────── camera / lights
def setup_world():
    world = bpy.data.worlds.new("CroppenWorld") if "CroppenWorld" not in bpy.data.worlds else bpy.data.worlds["CroppenWorld"]
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.01, 0.012, 0.016, 1)
    bg.inputs["Strength"].default_value = 0.15
    if HDRI.exists():
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(str(HDRI))
        mix = nt.nodes.new("ShaderNodeMixShader")
        bg2 = nt.nodes.new("ShaderNodeBackground")
        bg2.inputs["Strength"].default_value = 0.35
        nt.links.new(env.outputs["Color"], bg2.inputs["Color"])
        # hold the HDRI very quiet so plates stay illustration-like
        mix.inputs["Fac"].default_value = 0.35
        nt.links.new(bg.outputs["Background"], mix.inputs[1])
        nt.links.new(bg2.outputs["Background"], mix.inputs[2])
        nt.links.new(mix.outputs[0], out.inputs["Surface"])
    else:
        nt.links.new(bg.outputs["Background"], out.inputs["Surface"])


def _aim_front(obj: bpy.types.Object, target_z: float) -> None:
    """Sit on +Y, look at the figure, flip X so subject's right is image-left."""
    obj.location = (0.0, 900.0, target_z)
    # (90, 0, 180) looks at the origin with the crown at the top of the frame.
    obj.rotation_euler = (math.radians(90.0), 0.0, math.radians(180.0))
    # Do not scale the camera: a negative scale empties EEVEE/Cycles frames.
    obj.scale = (1.0, 1.0, 1.0)


def setup_camera() -> bpy.types.Object:
    cam = bpy.data.cameras.new("CroppenCam")
    cam.type = "ORTHO"
    cam.ortho_scale = FRAME_H
    cam.sensor_fit = "VERTICAL"
    cam.clip_start = 1
    cam.clip_end = 4000
    obj = bpy.data.objects.new("CroppenCam", cam)
    _aim_front(obj, 500.0)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.scene.camera = obj
    return obj


def setup_bust_camera() -> bpy.types.Object:
    cam = bpy.data.cameras.new("BustCam")
    cam.type = "ORTHO"
    cam.ortho_scale = 360
    cam.sensor_fit = "VERTICAL"
    obj = bpy.data.objects.new("BustCam", cam)
    _aim_front(obj, sz(170))
    bpy.context.scene.collection.objects.link(obj)
    return obj


def area(name, loc, rot, size, energy, color, col):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.size = size
    data.color = color
    data.spread = math.radians(150)
    obj = bpy.data.objects.new(name, data)
    obj.location = loc
    obj.rotation_euler = rot
    link(obj, col)
    return obj


def setup_lights():
    col = collection("CROPPEN_LIGHTS")
    # Key — upper left (image left = subject's right)
    area("Key", (-220, 520, 780), (math.radians(55), 0, math.radians(-20)), 280, 420000, (1.0, 0.97, 0.93), col)
    # Fill
    area("Fill", (280, 480, 620), (math.radians(62), 0, math.radians(24)), 340, 180000, (0.88, 0.92, 1.0), col)
    # Rim — behind the figure so the silhouette lifts off the dark plate
    area("Rim", (120, -280, 720), (math.radians(70), 0, math.radians(160)), 200, 360000, (1.0, 0.96, 0.9), col)
    # Top bounce
    area("Top", (0, 200, 1180), (math.radians(10), 0, 0), 520, 120000, (1.0, 0.98, 0.96), col)
    return col


def setup_render(scene: bpy.types.Scene):
    scene.render.resolution_x = RES_X
    scene.render.resolution_y = RES_Y
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 15
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = 0.55

    # EEVEE produces empty frames in `blender -b` on this Mac. Always use Cycles.
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
    scene.cycles.device = "GPU"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        print("Cycles devices:", [(d.name, d.type, d.use) for d in prefs.devices])
    except Exception as exc:
        print("Metal setup failed, CPU Cycles:", exc)
        scene.cycles.device = "CPU"


# ───────────────────────────────────────────── visibility / render
_LAYER_SUFFIXES = ("_SKIN", "_FASCIA", "_MUSCLES", "_CAVITY", "_ORGANS", "_SKELETON")


def hide_all_figures():
    for col in bpy.data.collections:
        if col.name.startswith("CROPPEN_F") or col.name.startswith("CROPPEN_M"):
            # Parent must stay render-visible; only leaf layers are toggled.
            col.hide_render = False
            col.hide_viewport = False
        if col.name.endswith(_LAYER_SUFFIXES):
            col.hide_render = True
            col.hide_viewport = True
            for obj in col.objects:
                obj.hide_render = True


def show(col: bpy.types.Collection, yes: bool = True):
    col.hide_render = not yes
    col.hide_viewport = not yes
    parent = None
    # Walk up via users — keep the sex root visible.
    for other in bpy.data.collections:
        if col.name in [c.name for c in other.children]:
            other.hide_render = False
            other.hide_viewport = False
    for obj in col.objects:
        obj.hide_render = not yes


def override_material(col: bpy.types.Collection, mat: bpy.types.Material | None, store: dict):
    for obj in col.objects:
        if obj.type != "MESH":
            continue
        store[obj.name] = [s.material for s in obj.material_slots]
        if mat:
            if obj.data.materials:
                obj.data.materials[0] = mat
            else:
                obj.data.materials.append(mat)


def restore_material(col: bpy.types.Collection, store: dict):
    for obj in col.objects:
        mats = store.get(obj.name)
        if not mats:
            continue
        for i, m in enumerate(mats):
            if i < len(obj.data.materials) and m:
                obj.data.materials[i] = m


def render_to(path: Path, camera=None, res=None):
    scene = bpy.context.scene
    path.parent.mkdir(parents=True, exist_ok=True)
    if camera:
        scene.camera = camera
    if res:
        scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.filepath = str(path)
    print(f"RENDER {path.name}  {scene.render.resolution_x}x{scene.render.resolution_y}  {scene.render.engine}")
    bpy.ops.render.render(write_still=True)
    print("  wrote", path, "bytes", path.stat().st_size if path.exists() else 0)


def render_layers(sex: str, cols: dict, mats: dict, cam, bust):
    layers = {
        "skin": [cols["skin"]],
        "muscles": [cols["fascia"], cols["muscles"]],
        "organs": [cols["organs"], cols["skeleton"]],
        "skeleton": [cols["skeleton"]],
    }
    wanted = [ONLY_LAYER] if ONLY_LAYER in layers or ONLY_LAYER in {"light", "icon"} else None

    if wanted is None or ONLY_LAYER in layers:
        for layer, show_cols in layers.items():
            if wanted and layer not in wanted:
                continue
            hide_all_figures()
            for c in show_cols:
                show(c, True)
            # organs keep skeleton very dark as context
            if layer == "organs":
                for obj in cols["skeleton"].objects:
                    obj.color = (1, 1, 1, 0.25)
            render_to(OUT / f"{sex}-{layer}.png", camera=cam, res=(RES_X, RES_Y))

    if wanted is None or ONLY_LAYER == "light":
        hide_all_figures()
        show(cols["skin"], True)
        store = {}
        override_material(cols["skin"], mats["skin_light"], store)
        render_to(OUT / f"{sex}-skin-light.png", camera=cam, res=(RES_X, RES_Y))
        restore_material(cols["skin"], store)

    if wanted is None or ONLY_LAYER == "icon":
        for tag, show_cols in (
            ("icon-skin", [cols["skin"]]),
            ("icon-muscles", [cols["fascia"], cols["muscles"]]),
            ("icon-skeleton", [cols["skeleton"]]),
        ):
            hide_all_figures()
            for c in show_cols:
                show(c, True)
            render_to(OUT / f"{sex}-{tag}.png", camera=bust, res=(512, 512))

        # thumbs — upper body crop via bust camera, slightly taller
        bust.data.ortho_scale = 420
        for tag, show_cols in (
            ("thumb-skin", [cols["skin"]]),
            ("thumb-muscles", [cols["fascia"], cols["muscles"]]),
            ("thumb-organs", [cols["organs"], cols["skeleton"]]),
            ("thumb-skeleton", [cols["skeleton"]]),
        ):
            hide_all_figures()
            for c in show_cols:
                show(c, True)
            render_to(OUT / f"{sex}-{tag}.png", camera=bust, res=(256, 320))
        bust.data.ortho_scale = 360
        bpy.context.scene.camera = cam


def build_sex(sex: str, mats):
    root = collection(f"CROPPEN_{sex.upper()}")
    cols = {
        "skin": collection(f"{sex}_SKIN", root),
        "fascia": collection(f"{sex}_FASCIA", root),
        "muscles": collection(f"{sex}_MUSCLES", root),
        "cavity": collection(f"{sex}_CAVITY", root),
        "organs": collection(f"{sex}_ORGANS", root),
        "skeleton": collection(f"{sex}_SKELETON", root),
    }
    skin = build_skin(sex, cols, mats)
    fascia = scaled_copy(skin, f"{sex}_fascia", 0.965, cols["fascia"], mats["fascia"])
    cavity = scaled_copy(skin, f"{sex}_cavity", 0.90, cols["cavity"], mats["cavity"])
    build_muscles(sex, cols, mats)
    build_organs(sex, cols, mats)
    build_skeleton(sex, cols, mats)
    return cols, skin, fascia, cavity


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    scene = reset_scene()
    setup_world()
    setup_render(scene)
    cam = setup_camera()
    bust = setup_bust_camera()
    setup_lights()
    mats = make_materials()

    sexes = [ONLY_SEX] if ONLY_SEX in {"female", "male"} else ["female", "male"]
    built = {}
    for sex in sexes:
        print("BUILD", sex)
        built[sex] = build_sex(sex, mats)

    for sex in sexes:
        print("RENDER", sex)
        render_layers(sex, built[sex][0], mats, cam, bust)

    try:
        bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
        print("saved", BLEND)
    except Exception as exc:
        print("save failed", exc)

    print("DONE")


if __name__ == "__main__":
    main()
