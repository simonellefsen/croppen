"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BodyFigure, DEFAULT_CAMERA, type Camera } from "@/components/BodyFigure";
import { Controls } from "@/components/Controls";
import { InfoPanel } from "@/components/InfoPanel";
import { Onboarding } from "@/components/Onboarding";
import { QuizBar, useQuiz } from "@/components/Quiz";
import {
  DEFAULT_APPEARANCE,
  appearanceById,
  appearanceVars,
  type Appearance,
} from "@/lib/anatomy/appearance";
import { structureById, structuresFor } from "@/lib/anatomy/structures";
import { LAYERS, type Sex, type System } from "@/lib/anatomy/types";
import { useI18n, LOCALES, localeNames } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n/strings";

const LAYER_LABEL: Record<string, { name: StringKey; sub: StringKey }> = {
  skin: { name: "layerSkin", sub: "layerSkinSub" },
  muscles: { name: "layerMuscles", sub: "layerMusclesSub" },
  organs: { name: "layerOrgans", sub: "layerOrgansSub" },
  skeleton: { name: "layerSkeleton", sub: "layerSkeletonSub" },
};

const STORE = "croppen.prefs";

/** Pulls the figure down and back so the quiz prompt has clear space above it. */
const QUIZ_CAMERA: Camera = { scale: 0.82, x: 37.8, y: 160 };

type Prefs = {
  sex: Sex;
  appearanceId: string;
  seen: boolean;
};

export default function Page() {
  const { t, locale, setLocale } = useI18n();

  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [seen, setSeen] = useState(true);
  const [sex, setSex] = useState<Sex>("female");
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);

  const [depth, setDepth] = useState(0);
  const [systems, setSystems] = useState<System[]>([]);
  const [scalpel, setScalpel] = useState(false);
  const [labels, setLabels] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [mode, setMode] = useState<"explore" | "quiz">("explore");
  const [sheet, setSheet] = useState<"none" | "rail" | "info">("none");
  const [installer, setInstaller] = useState<{ prompt: () => void } | null>(null);

  const quiz = useQuiz(sex);

  // ── Preferences ──
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Prefs>;
        if (p.sex === "male" || p.sex === "female") setSex(p.sex);
        if (p.appearanceId) setAppearance(appearanceById(p.appearanceId));
        setSeen(!!p.seen);
      } else {
        setSeen(false);
      }
    } catch {
      setSeen(false);
    }
    setPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      window.localStorage.setItem(
        STORE,
        JSON.stringify({ sex, appearanceId: appearance.id, seen } satisfies Prefs),
      );
    } catch {
      // Storage unavailable — preferences simply won't survive a reload.
    }
  }, [prefsLoaded, sex, appearance, seen]);

  // ── Install prompt ──
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      const ev = e as Event & { prompt: () => void };
      setInstaller({ prompt: () => ev.prompt() });
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  // ── Quiz drives the view to wherever its target lives ──
  const target = mode === "quiz" ? quiz.target : null;
  useEffect(() => {
    if (!target) return;
    const layerIndex = LAYERS.indexOf(target.layer as (typeof LAYERS)[number]);
    if (layerIndex >= 0) {
      setDepth(layerIndex);
      setSystems([]);
    } else {
      setDepth(0);
      setSystems([target.layer as System]);
    }
    setSelected(null);
  }, [target]);

  const structures = useMemo(() => structuresFor(sex), [sex]);

  const handleSelect = useCallback(
    (id: string | null) => {
      if (mode === "quiz") {
        // A tap on bare fascia or on the empty stage isn't an answer — only
        // hitting a named structure commits the round.
        const picked = id ? structureById(id) : null;
        if (picked && !quiz.verdict) quiz.answer(picked);
        return;
      }
      setSelected(id);
      if (id) setSheet("info");
    },
    [mode, quiz],
  );

  const toggleSystem = (s: System) =>
    setSystems((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );

  const selectedStructure = selected
    ? (structures.find((s) => s.id === selected) ?? null)
    : null;

  const layerKey = LAYERS[depth];

  const startQuiz = () => {
    setMode("quiz");
    quiz.restart();
    setSelected(null);
    setScalpel(false);
    setSheet("none");
    setCamera(QUIZ_CAMERA);
  };

  const exitQuiz = () => {
    setMode("explore");
    setCamera(DEFAULT_CAMERA);
  };

  return (
    <div className="app" style={appearanceVars(appearance) as React.CSSProperties}>
      <header className="topbar">
        <div className="brand">
          <h1>{t("appName")}</h1>
          <span>{t("tagline")}</span>
        </div>
        <div className="topbar-spacer" />

        <div className="mode">
          <button aria-pressed={mode === "explore"} onClick={exitQuiz}>
            {t("modeExplore")}
          </button>
          <button aria-pressed={mode === "quiz"} onClick={startQuiz}>
            {t("modeQuiz")}
          </button>
        </div>

        <div className="lang">
          {LOCALES.map((l) => (
            <button
              key={l}
              aria-pressed={locale === l}
              onClick={() => setLocale(l)}
              title={localeNames[l]}
            >
              {l}
            </button>
          ))}
        </div>

        {installer && (
          <button
            className="chip"
            onClick={() => {
              installer.prompt();
              setInstaller(null);
            }}
          >
            {t("install")}
          </button>
        )}

        <button
          className="icon-btn rail-toggle"
          aria-label={t("tools")}
          onClick={() => setSheet(sheet === "rail" ? "none" : "rail")}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </button>
      </header>

      <aside className="rail" data-open={sheet === "rail"}>
        <span className="sheet-handle" onClick={() => setSheet("none")} />
        <Controls
          sex={sex}
          onSex={setSex}
          appearance={appearance}
          onAppearance={setAppearance}
          depth={depth}
          onDepth={setDepth}
          systems={systems}
          onToggleSystem={toggleSystem}
          scalpel={scalpel}
          onScalpel={setScalpel}
          labels={labels}
          onLabels={setLabels}
          pulse={pulse}
          onPulse={setPulse}
        />
        <p className="hint">{t("sourceNote")}</p>
      </aside>

      <main className="stage">
        <BodyFigure
          sex={sex}
          depth={depth}
          systems={systems}
          scalpel={scalpel && mode === "explore"}
          labels={labels}
          pulse={pulse}
          // Once a round is answered, name the structure that was being asked
          // for — right or wrong, that is the moment the answer is useful.
          selected={mode === "quiz" ? (quiz.verdict ? (target?.id ?? null) : null) : selected}
          targetId={quiz.verdict && !quiz.verdict.ok ? (target?.id ?? null) : null}
          hoverLabels={mode === "explore"}
          camera={camera}
          onCamera={setCamera}
          onSelect={handleSelect}
        />

        {mode === "explore" && (
          <div className="stage-caption">
            <b>{t(LAYER_LABEL[layerKey].name)}</b>
            <small>{t(LAYER_LABEL[layerKey].sub)}</small>
          </div>
        )}

        {mode === "quiz" && <QuizBar quiz={quiz} onExit={exitQuiz} />}

        <div className="zoom-tools">
          <button
            aria-label="+"
            onClick={() =>
              setCamera((c) => zoomAt(c, Math.min(c.scale * 1.35, 5)))
            }
          >
            +
          </button>
          <button
            aria-label="−"
            onClick={() =>
              setCamera((c) => zoomAt(c, Math.max(c.scale / 1.35, 0.6)))
            }
          >
            −
          </button>
          <button
            aria-label={t("reset")}
            title={t("reset")}
            onClick={() => setCamera(DEFAULT_CAMERA)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>

        {mode === "explore" && (
          <div className="stage-hud">
            <button
              className="chip"
              aria-pressed={scalpel}
              onClick={() => setScalpel(!scalpel)}
            >
              <Scalpel /> {t("scalpel")}
            </button>
            <button
              className="chip"
              aria-pressed={labels}
              onClick={() => setLabels(!labels)}
            >
              {t("labels")}
            </button>
            {depth < LAYERS.length - 1 && (
              <button className="chip" onClick={() => setDepth(depth + 1)}>
                ↓ {t(LAYER_LABEL[LAYERS[depth + 1]].name)}
              </button>
            )}
            {depth > 0 && (
              <button className="chip" onClick={() => setDepth(depth - 1)}>
                ↑ {t(LAYER_LABEL[LAYERS[depth - 1]].name)}
              </button>
            )}
          </div>
        )}
      </main>

      <aside className="info" data-open={sheet === "info"}>
        <span className="sheet-handle" onClick={() => setSheet("none")} />
        <InfoPanel structure={selectedStructure} />
      </aside>

      {prefsLoaded && !seen && (
        <Onboarding
          sex={sex}
          onSex={setSex}
          appearance={appearance}
          onAppearance={setAppearance}
          onDone={() => setSeen(true)}
        />
      )}
    </div>
  );
}

/** Zooms about the centre of the frame. */
function zoomAt(c: Camera, next: number): Camera {
  const cx = 210;
  const cy = 500;
  return {
    scale: next,
    x: c.x + cx * (c.scale - next),
    y: c.y + cy * (c.scale - next),
  };
}

function Scalpel() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M14 4 20 10 9 21H4v-5L14 4Z" />
      <path d="M12 6l6 6" />
    </svg>
  );
}
