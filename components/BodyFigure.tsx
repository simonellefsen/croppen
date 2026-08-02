"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Defs } from "./body/Defs";
import { Skin } from "./body/Skin";
import { Muscles } from "./body/Muscles";
import { Organs } from "./body/Organs";
import { Skeleton } from "./body/Skeleton";
import { Circulatory, Endocrine, Lymphatic, Nervous } from "./body/Systems";
import { GEOMETRY, MIRROR } from "@/lib/anatomy/geometry";
import { LAYERS, type Layer, type Sex, type System } from "@/lib/anatomy/types";
import { structuresFor } from "@/lib/anatomy/structures";
import { useI18n } from "@/lib/i18n";

/**
 * The body is 420 wide and always fills the 1000-unit height, so the only
 * thing the viewBox width controls is how much margin the labels get. It is
 * matched to the container's aspect ratio: a phone gets a tight frame, a wide
 * desktop stage gets generous margins instead of empty bars.
 */
const VB_H = 1000;
const VB_MIN_W = 470;
const VB_MAX_W = 780;
const LENS_R = 78;

export type Camera = { scale: number; x: number; y: number };
export const DEFAULT_CAMERA: Camera = { scale: 1, x: 0, y: 0 };

type Props = {
  sex: Sex;
  depth: number;
  systems: System[];
  scalpel: boolean;
  labels: boolean;
  pulse: boolean;
  selected: string | null;
  targetId?: string | null;
  /** Off during a quiz, where hovering would hand over the answer. */
  hoverLabels?: boolean;
  camera: Camera;
  onCamera: (c: Camera) => void;
  onSelect: (id: string | null) => void;
};

export function BodyFigure({
  sex,
  depth,
  systems,
  scalpel,
  labels,
  pulse,
  selected,
  targetId,
  hoverLabels = true,
  camera,
  onCamera,
  onSelect,
}: Props) {
  const { t, pick } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [vbW, setVbW] = useState(620);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    camX: number;
    camY: number;
    moved: boolean;
  } | null>(null);

  const geo = GEOMETRY[sex];
  const structures = useMemo(() => structuresFor(sex), [sex]);

  /** Screen → viewBox coordinates, accounting for the camera transform. */
  const toLocal = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
      return {
        x: (pt.x - camera.x) / camera.scale,
        y: (pt.y - camera.y) / camera.scale,
      };
    },
    [camera],
  );

  useEffect(() => {
    if (!scalpel) setLens(null);
  }, [scalpel]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!height) return;
      setVbW(clamp((width / height) * VB_H, VB_MIN_W, VB_MAX_W));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const VB = { x: 210 - vbW / 2, y: 0, w: vbW, h: VB_H };

  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      camX: camera.x,
      camY: camera.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (scalpel) {
      const p = toLocal(e.clientX, e.clientY);
      if (p) setLens(p);
    }

    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    // Screen pixels → viewBox units.
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const unitsPerPx = VB.h / rect.height;
    onCamera({
      scale: camera.scale,
      x: d.camX + dx * unitsPerPx,
      y: d.camY + dy * unitsPerPx,
    });
  };

  const handlePointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;

    const el = (e.target as Element).closest?.("[data-structure]");
    const id = el?.getAttribute("data-structure") ?? null;
    onSelect(id);
  };

  const handleWheel = (e: ReactWheelEvent<SVGSVGElement>) => {
    const p = toLocal(e.clientX, e.clientY);
    if (!p) return;
    const next = clamp(camera.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 0.6, 5);
    // Keep the point under the cursor pinned while zooming.
    onCamera({
      scale: next,
      x: camera.x + p.x * (camera.scale - next),
      y: camera.y + p.y * (camera.scale - next),
    });
  };

  const layerNodes: Record<Layer, React.ReactNode> = {
    skin: <Skin sex={sex} />,
    muscles: <Muscles sex={sex} />,
    organs: <Organs sex={sex} />,
    skeleton: <Skeleton sex={sex} />,
  };

  // Deepest first, so the current layer always paints over the ones beneath —
  // which is what makes the scalpel a simple hole rather than a second render.
  const stack = LAYERS.map((l, i) => ({ layer: l, index: i })).reverse();

  const lensActive = scalpel && lens !== null && depth < LAYERS.length - 1;
  const cutoutId = "scalpelCut";

  const labelled = useMemo(() => {
    if (!labels) return [];
    const active: string[] = [LAYERS[depth], ...systems];
    return structures.filter((s) => active.includes(s.layer));
  }, [labels, depth, systems, structures]);

  const focus = selected ?? (hoverLabels ? hovered : null);
  const focusStruct = structures.find((s) => s.id === focus);

  return (
    <svg
      ref={svgRef}
      className="figure"
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t("a11yBody")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (drag.current = null)}
      onPointerLeave={() => setLens(null)}
      onWheel={handleWheel}
      style={{ cursor: scalpel ? "crosshair" : "grab" }}
    >
      <Defs />
      <defs>
        <clipPath id="bodyClip">
          <path d={geo.silhouette.head} />
          <path d={geo.silhouette.neck} />
          <path d={geo.silhouette.torso} />
          <path d={geo.silhouetteBilateral.arm} />
          <path d={geo.silhouetteBilateral.arm} transform={MIRROR} />
          <path d={geo.silhouetteBilateral.leg} />
          <path d={geo.silhouetteBilateral.leg} transform={MIRROR} />
        </clipPath>
        {lensActive && lens && (
          <clipPath id={cutoutId} clipRule="evenodd">
            <path
              clipRule="evenodd"
              d={`M-800 -400H1220V1400H-800Z M${lens.x - LENS_R} ${lens.y}a${LENS_R} ${LENS_R} 0 1 0 ${LENS_R * 2} 0a${LENS_R} ${LENS_R} 0 1 0 ${-LENS_R * 2} 0Z`}
            />
          </clipPath>
        )}
      </defs>

      <g
        transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}
        onMouseOver={(e) => {
          const el = (e.target as Element).closest?.("[data-structure]");
          setHovered(el?.getAttribute("data-structure") ?? null);
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Dark tissue behind every layer, so a cut or a gap in the anatomy
            reads as the inside of a body rather than a hole in the page. */}
        <g clipPath="url(#bodyClip)" pointerEvents="none">
          <path d={geo.silhouette.head} fill="#1a1210" />
          <path d={geo.silhouette.neck} fill="#1a1210" />
          <path d={geo.silhouette.torso} fill="#1a1210" />
          <path d={geo.silhouetteBilateral.arm} fill="#1a1210" />
          <path d={geo.silhouetteBilateral.arm} fill="#1a1210" transform={MIRROR} />
          <path d={geo.silhouetteBilateral.leg} fill="#1a1210" />
          <path d={geo.silhouetteBilateral.leg} fill="#1a1210" transform={MIRROR} />
        </g>

        {stack.map(({ layer, index }) => {
          const isCurrent = index === depth;
          // Layers already peeled away vanish; the ones still below stay as
          // dimmed context, the way an anatomical plate keeps the skeleton
          // faintly visible behind the organs.
          const opacity =
            index < depth
              ? 0
              : isCurrent || (lensActive && index === depth + 1)
                ? 1
                : 0.4;
          return (
            <g
              key={layer}
              className="layer-fade"
              style={{
                opacity,
                pointerEvents: isCurrent || index === depth + 1 ? "auto" : "none",
              }}
              clipPath={isCurrent && lensActive ? `url(#${cutoutId})` : undefined}
            >
              {/* The skin layer *is* the silhouette, and hair is meant to fall
                  outside it — only the inner layers get trimmed. */}
              <g clipPath={layer === "skin" ? undefined : "url(#bodyClip)"}>
                {layerNodes[layer]}
              </g>
            </g>
          );
        })}

        {/* System overlays ride on top of whatever layer is exposed. */}
        <g className={systems.length && depth === 0 ? "on-skin" : undefined}>
          {systems.includes("lymphatic") && <Lymphatic />}
          {systems.includes("endocrine") && <Endocrine sex={sex} />}
          {systems.includes("nervous") && <Nervous />}
          {systems.includes("circulatory") && <Circulatory pulse={pulse} />}
        </g>

        {lensActive && lens && (
          <g pointerEvents="none">
            <circle
              cx={lens.x}
              cy={lens.y}
              r={LENS_R}
              fill="none"
              stroke="rgba(236,229,212,0.85)"
              strokeWidth={1.6 / camera.scale}
            />
            <circle
              cx={lens.x}
              cy={lens.y}
              r={LENS_R + 3}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={4 / camera.scale}
            />
          </g>
        )}

        {/* Leader-line labels, in the manner of the source plates. */}
        <g className="leader" pointerEvents="none">
          {labelled.map((s) => (
            <Leader
              key={s.id}
              x={s.at[0]}
              y={s.at[1]}
              side={s.labelSide ?? (s.at[0] < 210 ? "left" : "right")}
              text={pick(s.name)}
              scale={camera.scale}
              bounds={VB}
            />
          ))}
          {focusStruct && !labelled.some((s) => s.id === focusStruct.id) && (
            <Leader
              x={focusStruct.at[0]}
              y={focusStruct.at[1]}
              side={
                focusStruct.labelSide ?? (focusStruct.at[0] < 210 ? "left" : "right")
              }
              text={pick(focusStruct.name)}
              latin={focusStruct.latin}
              scale={camera.scale}
              bounds={VB}
            />
          )}
        </g>
      </g>

      <StructureHighlighter selected={selected} target={targetId ?? null} />
    </svg>
  );
}

function Leader({
  x,
  y,
  side,
  text,
  latin,
  scale,
  bounds,
}: {
  x: number;
  y: number;
  side: "left" | "right";
  text: string;
  latin?: string;
  scale: number;
  bounds: { x: number; w: number };
}) {
  const dir = side === "left" ? -1 : 1;
  const elbowX = x + dir * 26;
  const elbowY = y - 16;
  const endX = side === "left" ? bounds.x + 8 : bounds.x + bounds.w - 8;
  const fs = 11 / Math.max(scale, 1);

  return (
    <g>
      <line x1={x} y1={y} x2={elbowX} y2={elbowY} />
      <line x1={elbowX} y1={elbowY} x2={endX} y2={elbowY} />
      <circle cx={x} cy={y} r={2.4 / Math.max(scale, 1)} />
      <text
        x={endX}
        y={elbowY - 5}
        textAnchor={side === "left" ? "start" : "end"}
        style={{ fontSize: fs }}
      >
        {text}
      </text>
      {latin && (
        <text
          className="latin"
          x={endX}
          y={elbowY + 9}
          textAnchor={side === "left" ? "start" : "end"}
          style={{ fontSize: (fs * 9) / 11 }}
        >
          {latin}
        </text>
      )}
    </g>
  );
}

/**
 * Applies selection and quiz-target classes imperatively. Every structure is
 * drawn twice (left and right), so this is markedly cheaper than threading the
 * selected id down through every layer component.
 */
function StructureHighlighter({
  selected,
  target,
}: {
  selected: string | null;
  target: string | null;
}) {
  useEffect(() => {
    const nodes = document.querySelectorAll<SVGGElement>("[data-structure]");
    nodes.forEach((n) => {
      const id = n.getAttribute("data-structure");
      n.classList.toggle("is-selected", !!selected && id === selected);
      n.classList.toggle("is-target", !!target && id === target);
    });
  });
  return null;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
