"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALES,
  dictionaries,
  type Locale,
  type StringKey,
} from "./strings";

const STORAGE_KEY = "croppen.locale";

/**
 * Picks the best locale from the browser's ordered language preferences.
 * Anything we don't ship falls back to English.
 */
export function detectLocale(
  languages: readonly string[] = typeof navigator === "undefined"
    ? []
    : navigator.languages?.length
      ? navigator.languages
      : [navigator.language],
): Locale {
  for (const tag of languages) {
    const primary = tag.toLowerCase().split("-")[0];
    const match = LOCALES.find((l) => l === primary);
    if (match) return match;
  }
  return "en";
}

type I18nValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: StringKey) => string;
  /** Picks the right field from a bilingual content record. */
  pick: <T>(record: Record<Locale, T>) => T;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Render deterministically on the server, then reconcile to the real
  // preference after hydration so static export and the client agree.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next =
      stored && (LOCALES as readonly string[]).includes(stored)
        ? (stored as Locale)
        : detectLocale();
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled — the choice just won't persist.
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      setLocale,
      t: (key) => dict[key] ?? dictionaries.en[key] ?? key,
      pick: (record) => record[locale] ?? record.en,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export { LOCALES, localeNames } from "./strings";
export type { Locale, StringKey } from "./strings";
