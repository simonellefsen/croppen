import type { Locale } from "@/lib/i18n/strings";

/** Dissection depths, outermost first. The depth slider walks this array. */
export const LAYERS = ["skin", "muscles", "organs", "skeleton"] as const;
export type Layer = (typeof LAYERS)[number];

/** Networks that can be overlaid on top of any depth. */
export const SYSTEMS = [
  "circulatory",
  "nervous",
  "lymphatic",
  "endocrine",
] as const;
export type System = (typeof SYSTEMS)[number];

/** What an info card can belong to — used for the "Part of" line. */
export const GROUPS = [
  "integumentary",
  "muscular",
  "skeletal",
  "digestive",
  "respiratory",
  "urinary",
  "reproductive",
  "circulatory",
  "nervous",
  "lymphatic",
  "endocrine",
  "sensory",
] as const;
export type Group = (typeof GROUPS)[number];

export type Sex = "female" | "male";

export type Localized = Record<Locale, string>;

export type Structure = {
  id: string;
  /** Which dissection depth reveals it, or which overlay it belongs to. */
  layer: Layer | System;
  group: Group;
  name: Localized;
  latin?: string;
  description: Localized;
  fact?: Localized;
  /** Omit to show for both bodies. */
  sex?: Sex;
  /** Approximate centre in body viewBox units — used by the quiz and labels. */
  at: [number, number];
  /** Side the label should flag out to. */
  labelSide?: "left" | "right";
};

export const GROUP_NAMES: Record<Group, Localized> = {
  integumentary: { en: "Skin, hair and nails", da: "Hud, hår og negle" },
  muscular: { en: "Muscular system", da: "Muskelsystemet" },
  skeletal: { en: "Skeletal system", da: "Skeletsystemet" },
  digestive: { en: "Digestive system", da: "Fordøjelsessystemet" },
  respiratory: { en: "Respiratory system", da: "Åndedrætssystemet" },
  urinary: { en: "Urinary system", da: "Urinvejssystemet" },
  reproductive: { en: "Reproductive system", da: "Forplantningssystemet" },
  circulatory: { en: "Cardiovascular system", da: "Hjerte-kar systemet" },
  nervous: { en: "Nervous system", da: "Nervesystemet" },
  lymphatic: { en: "Lymphatic system", da: "Lymfesystemet" },
  endocrine: { en: "Endocrine system", da: "Det endokrine system" },
  sensory: { en: "Sense organs", da: "Sanseorganer" },
};
