import type { Localized } from "./types";

/**
 * Appearance presets vary only what melanin actually varies: the skin ramp,
 * hair and iris. Every layer below the epidermis is drawn identically for all
 * of them — which is itself one of the things the app is trying to teach.
 */
export type Appearance = {
  id: string;
  name: Localized;
  /** Fitzpatrick phototype, the scale dermatologists use for UV response. */
  fitzpatrick: string;
  skin: {
    base: string;
    shade: string;
    deep: string;
    light: string;
  };
  hair: string;
  iris: string;
  lip: string;
};

export const APPEARANCES: Appearance[] = [
  {
    id: "north-european",
    name: { en: "Northern European", da: "Nordeuropæisk" },
    fitzpatrick: "I–II",
    skin: {
      light: "#fbe3d4",
      base: "#f2cdb6",
      shade: "#dba98f",
      deep: "#b98168",
    },
    hair: "#c9a063",
    iris: "#5b87a8",
    lip: "#d4907f",
  },
  {
    id: "mediterranean",
    name: { en: "Mediterranean", da: "Middelhavsområdet" },
    fitzpatrick: "III",
    skin: {
      light: "#f2d0ab",
      base: "#e2b489",
      shade: "#c3906a",
      deep: "#9d6c4c",
    },
    hair: "#4a3527",
    iris: "#6b5334",
    lip: "#bd7a67",
  },
  {
    id: "east-asian",
    name: { en: "East Asian", da: "Østasiatisk" },
    fitzpatrick: "III–IV",
    skin: {
      light: "#f6dcb6",
      base: "#e8c294",
      shade: "#cb9e74",
      deep: "#a67851",
    },
    hair: "#1c1614",
    iris: "#3d2a1e",
    lip: "#c07f6d",
  },
  {
    id: "middle-eastern",
    name: { en: "Middle Eastern", da: "Mellemøstlig" },
    fitzpatrick: "IV",
    skin: {
      light: "#e5bd90",
      base: "#cf9f70",
      shade: "#ad7d53",
      deep: "#875c39",
    },
    hair: "#2a1d16",
    iris: "#4a3220",
    lip: "#a96b57",
  },
  {
    id: "south-asian",
    name: { en: "South Asian", da: "Sydasiatisk" },
    fitzpatrick: "IV–V",
    skin: {
      light: "#d7a475",
      base: "#bd8757",
      shade: "#99673f",
      deep: "#734a2b",
    },
    hair: "#1a1210",
    iris: "#3a2418",
    lip: "#96593f",
  },
  {
    id: "west-african",
    name: { en: "West African", da: "Vestafrikansk" },
    fitzpatrick: "VI",
    skin: {
      light: "#8c5b39",
      base: "#6f4327",
      shade: "#55311b",
      deep: "#3b2113",
    },
    hair: "#120c0a",
    iris: "#2c1a11",
    lip: "#6d3d2b",
  },
];

export const DEFAULT_APPEARANCE = APPEARANCES[1];

export function appearanceById(id: string): Appearance {
  return APPEARANCES.find((a) => a.id === id) ?? DEFAULT_APPEARANCE;
}

/** Maps an appearance onto the CSS custom properties the SVG reads. */
export function appearanceVars(a: Appearance): Record<string, string> {
  return {
    "--skin-light": a.skin.light,
    "--skin-base": a.skin.base,
    "--skin-shade": a.skin.shade,
    "--skin-deep": a.skin.deep,
    "--hair": a.hair,
    "--iris": a.iris,
    "--lip": a.lip,
  };
}
