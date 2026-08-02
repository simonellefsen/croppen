"use client";

import { GROUP_NAMES, LAYERS, type Structure } from "@/lib/anatomy/types";
import { useI18n } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n/strings";

const LAYER_NAME: Record<string, StringKey> = {
  skin: "layerSkin",
  muscles: "layerMuscles",
  organs: "layerOrgans",
  skeleton: "layerSkeleton",
  circulatory: "sysCirculatory",
  nervous: "sysNervous",
  lymphatic: "sysLymphatic",
  endocrine: "sysEndocrine",
};

export function InfoPanel({ structure }: { structure: Structure | null }) {
  const { t, pick } = useI18n();

  if (!structure) {
    return (
      <div className="info-empty">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z" />
          <path d="M5 12v2a7 7 0 0 0 14 0v-2" />
          <path d="M12 21v-2" />
        </svg>
        <b>{t("tapPrompt")}</b>
        <p>{t("tapPromptSub")}</p>
      </div>
    );
  }

  const isLayer = (LAYERS as readonly string[]).includes(structure.layer);

  return (
    <div className="info-inner">
      <div className="info-kicker">{pick(GROUP_NAMES[structure.group])}</div>
      <h2>{pick(structure.name)}</h2>
      {structure.latin && <p className="latin">{structure.latin}</p>}

      <p className="body">{pick(structure.description)}</p>

      {structure.fact && (
        <div className="factbox">
          <b>{t("didYouKnow")}</b>
          <p>{pick(structure.fact)}</p>
        </div>
      )}

      <div className="meta">
        <div className="meta-row">
          <span>{t(isLayer ? "relatedLayer" : "systems")}</span>
          <b>{t(LAYER_NAME[structure.layer])}</b>
        </div>
        <div className="meta-row">
          <span>{t("partOf")}</span>
          <b>{pick(GROUP_NAMES[structure.group])}</b>
        </div>
        {structure.latin && (
          <div className="meta-row">
            <span>{t("latin")}</span>
            <b style={{ fontStyle: "italic" }}>{structure.latin}</b>
          </div>
        )}
      </div>
    </div>
  );
}
