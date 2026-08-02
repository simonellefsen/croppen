"use client";

import { APPEARANCES, type Appearance } from "@/lib/anatomy/appearance";
import type { Sex } from "@/lib/anatomy/types";
import { useI18n } from "@/lib/i18n";

export function Onboarding({
  sex,
  onSex,
  appearance,
  onAppearance,
  onDone,
}: {
  sex: Sex;
  onSex: (s: Sex) => void;
  appearance: Appearance;
  onAppearance: (a: Appearance) => void;
  onDone: () => void;
}) {
  const { t, pick } = useI18n();

  return (
    <div className="scrim">
      <div className="dialog" role="dialog" aria-modal="true" aria-label={t("introTitle")}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 10,
          }}
        >
          {t("appName")}
        </div>
        <h2>{t("introTitle")}</h2>
        <p>{t("introBody")}</p>

        <div className="group" style={{ marginBottom: 18 }}>
          <div className="group-title">{t("introPickBody")}</div>
          <div className="seg">
            {(["female", "male"] as const).map((s) => (
              <button key={s} aria-pressed={sex === s} onClick={() => onSex(s)}>
                {t(s === "female" ? "bodyFemale" : "bodyMale")}
              </button>
            ))}
          </div>
        </div>

        <div className="group">
          <div className="group-title">
            {t("introPickAppearance")}
            <em>
              {t("fitzpatrick")} {appearance.fitzpatrick}
            </em>
          </div>
          <div className="swatches">
            {APPEARANCES.map((a) => (
              <button
                key={a.id}
                className="swatch"
                style={{ background: a.skin.base }}
                aria-pressed={appearance.id === a.id}
                aria-label={pick(a.name)}
                title={pick(a.name)}
                onClick={() => onAppearance(a)}
              />
            ))}
          </div>
          <div className="swatch-name">
            <span>{pick(appearance.name)}</span>
          </div>
        </div>

        <p className="dialog-note">{t("introNote")}</p>

        <div className="dialog-actions">
          <button className="btn primary" onClick={onDone}>
            {t("introStart")}
          </button>
        </div>
      </div>
    </div>
  );
}
