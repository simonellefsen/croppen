"use client";

import { APPEARANCES, type Appearance } from "@/lib/anatomy/appearance";
import { LAYERS, SYSTEMS, type Sex, type System } from "@/lib/anatomy/types";
import { useI18n } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n/strings";

const LAYER_LABEL: Record<string, { name: StringKey; sub: StringKey }> = {
  skin: { name: "layerSkin", sub: "layerSkinSub" },
  muscles: { name: "layerMuscles", sub: "layerMusclesSub" },
  organs: { name: "layerOrgans", sub: "layerOrgansSub" },
  skeleton: { name: "layerSkeleton", sub: "layerSkeletonSub" },
};

const SYSTEM_LABEL: Record<System, { name: StringKey; sub: StringKey; color: string }> = {
  circulatory: { name: "sysCirculatory", sub: "sysCirculatorySub", color: "var(--artery)" },
  nervous: { name: "sysNervous", sub: "sysNervousSub", color: "var(--nerve)" },
  lymphatic: { name: "sysLymphatic", sub: "sysLymphaticSub", color: "var(--lymph)" },
  endocrine: { name: "sysEndocrine", sub: "sysEndocrineSub", color: "var(--endo)" },
};

type Props = {
  sex: Sex;
  onSex: (s: Sex) => void;
  appearance: Appearance;
  onAppearance: (a: Appearance) => void;
  depth: number;
  onDepth: (d: number) => void;
  systems: System[];
  onToggleSystem: (s: System) => void;
  scalpel: boolean;
  onScalpel: (v: boolean) => void;
  labels: boolean;
  onLabels: (v: boolean) => void;
  pulse: boolean;
  onPulse: (v: boolean) => void;
};

export function Controls(props: Props) {
  const { t, pick } = useI18n();

  return (
    <>
      <div className="group">
        <div className="group-title">{t("body")}</div>
        <div className="seg">
          {(["female", "male"] as const).map((s) => (
            <button
              key={s}
              aria-pressed={props.sex === s}
              onClick={() => props.onSex(s)}
            >
              {t(s === "female" ? "bodyFemale" : "bodyMale")}
            </button>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="group-title">
          {t("appearance")}
          <em>
            {t("fitzpatrick")} {props.appearance.fitzpatrick}
          </em>
        </div>
        <div className="swatches">
          {APPEARANCES.map((a) => (
            <button
              key={a.id}
              className="swatch"
              style={{ background: a.skin.base }}
              aria-pressed={props.appearance.id === a.id}
              aria-label={pick(a.name)}
              title={pick(a.name)}
              onClick={() => props.onAppearance(a)}
            />
          ))}
        </div>
        <div className="swatch-name">
          <span>{pick(props.appearance.name)}</span>
        </div>
      </div>

      <div className="group">
        <div className="group-title">
          {t("depth")}
          <em>{t("depthHint")}</em>
        </div>
        <input
          className="slider"
          type="range"
          min={0}
          max={LAYERS.length - 1}
          step={1}
          value={props.depth}
          aria-label={t("depth")}
          onChange={(e) => props.onDepth(Number(e.target.value))}
        />
        <div className="depth">
          {LAYERS.map((l, i) => (
            <button
              key={l}
              className="depth-step"
              aria-current={props.depth === i}
              onClick={() => props.onDepth(i)}
            >
              <span className="depth-num">{i + 1}</span>
              <span className="depth-label">
                {t(LAYER_LABEL[l].name)}
                <small className="depth-sub">{t(LAYER_LABEL[l].sub)}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="group-title">{t("systems")}</div>
        {SYSTEMS.map((s) => (
          <button
            key={s}
            className="toggle"
            style={{ ["--dot" as string]: SYSTEM_LABEL[s].color }}
            aria-pressed={props.systems.includes(s)}
            onClick={() => props.onToggleSystem(s)}
          >
            <span className="dot" />
            <span className="toggle-text">
              <b>{t(SYSTEM_LABEL[s].name)}</b>
              <small>{t(SYSTEM_LABEL[s].sub)}</small>
            </span>
          </button>
        ))}
        <p className="hint">{t("systemsHint")}</p>
      </div>

      <div className="group">
        <div className="group-title">{t("tools")}</div>
        <button
          className="toggle"
          style={{ ["--dot" as string]: "var(--bone)" }}
          aria-pressed={props.scalpel}
          onClick={() => props.onScalpel(!props.scalpel)}
        >
          <span className="dot" />
          <span className="toggle-text">
            <b>{t("scalpel")}</b>
            <small>{t("scalpelHint")}</small>
          </span>
        </button>
        <button
          className="toggle"
          style={{ ["--dot" as string]: "var(--accent)" }}
          aria-pressed={props.labels}
          onClick={() => props.onLabels(!props.labels)}
        >
          <span className="dot" />
          <span className="toggle-text">
            <b>{t("labels")}</b>
          </span>
        </button>
        <button
          className="toggle"
          style={{ ["--dot" as string]: "var(--artery)" }}
          aria-pressed={props.pulse}
          onClick={() => props.onPulse(!props.pulse)}
        >
          <span className="dot" />
          <span className="toggle-text">
            <b>{t("pulse")}</b>
            <small>{t("pulseHint")}</small>
          </span>
        </button>
      </div>
    </>
  );
}
