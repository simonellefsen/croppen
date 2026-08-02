"use client";

import { useCallback, useMemo, useState } from "react";
import { structuresFor } from "@/lib/anatomy/structures";
import type { Sex, Structure } from "@/lib/anatomy/types";
import { useI18n } from "@/lib/i18n";

export const QUIZ_ROUNDS = 10;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type QuizState = ReturnType<typeof useQuiz>;

export function useQuiz(sex: Sex) {
  const pool = useMemo(
    () =>
      structuresFor(sex).filter(
        // Skip whole-body regions, which have no single place to point at.
        (s) => s.id !== "skin" && s.id !== "melanin",
      ),
    [sex],
  );

  const [deck, setDeck] = useState<Structure[]>(() =>
    shuffle(pool).slice(0, QUIZ_ROUNDS),
  );
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [verdict, setVerdict] = useState<{ ok: boolean; picked: Structure | null } | null>(
    null,
  );

  const target = round < deck.length ? deck[round] : null;
  const done = round >= deck.length;
  const score = results.filter(Boolean).length;

  const answer = useCallback(
    (picked: Structure) => {
      if (!target || verdict) return;
      const ok = picked.id === target.id;
      setVerdict({ ok, picked: ok ? null : picked });
      setResults((r) => [...r, ok]);
    },
    [target, verdict],
  );

  const next = useCallback(() => {
    setVerdict(null);
    setRound((r) => r + 1);
  }, []);

  const restart = useCallback(() => {
    setDeck(shuffle(pool).slice(0, QUIZ_ROUNDS));
    setRound(0);
    setResults([]);
    setVerdict(null);
  }, [pool]);

  return { target, round, results, verdict, score, done, answer, next, restart };
}

export function QuizBar({
  quiz,
  onExit,
}: {
  quiz: QuizState;
  onExit: () => void;
}) {
  const { t, pick } = useI18n();

  if (quiz.done) {
    const msg =
      quiz.score === QUIZ_ROUNDS
        ? "quizResultPerfect"
        : quiz.score >= QUIZ_ROUNDS * 0.7
          ? "quizResultGood"
          : "quizResultOk";
    return (
      <div className="scrim">
        <div className="dialog" role="dialog" aria-modal="true">
          <h2>{t("quizDone")}</h2>
          <p style={{ fontSize: 40, color: "var(--bone)", margin: "6px 0 4px" }}>
            {quiz.score}
            <span style={{ fontSize: 20, color: "var(--ink-faint)" }}>
              {" / "}
              {QUIZ_ROUNDS}
            </span>
          </p>
          <p>{t(msg)}</p>
          <div className="dialog-actions">
            <button className="btn primary" onClick={quiz.restart}>
              {t("quizAgain")}
            </button>
            <button className="btn" onClick={onExit}>
              {t("quizExit")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-bar">
      <div className="quiz-bar-inner">
        <div className="quiz-progress">
          {Array.from({ length: QUIZ_ROUNDS }, (_, i) => (
            <span
              key={i}
              className={
                "quiz-pip" +
                (i < quiz.results.length ? (quiz.results[i] ? " hit" : " miss") : "")
              }
            />
          ))}
        </div>
        <div className="quiz-ask">{t("quizFind")}</div>
        <p className="quiz-target">
          {quiz.target ? pick(quiz.target.name) : ""}
          {quiz.target?.latin && <em>{quiz.target.latin}</em>}
        </p>

        {quiz.verdict && (
          <div className={"quiz-verdict " + (quiz.verdict.ok ? "ok" : "no")}>
            {quiz.verdict.ok ? (
              t("quizCorrect")
            ) : (
              <>
                {t("quizWrong")}{" "}
                {quiz.verdict.picked ? pick(quiz.verdict.picked.name) : "—"}
              </>
            )}
            <div style={{ marginTop: 10 }}>
              <button className="btn primary" onClick={quiz.next}>
                {t("quizNext")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
