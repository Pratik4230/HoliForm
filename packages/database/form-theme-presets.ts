import type { FormThemeConfig } from "./models/formTheme";

export type FormThemePresetSeed = {
  id: string;
  name: string;
  category: string;
  config: FormThemeConfig;
};

/** Holi palette: never pair purple and blue in the same theme. */
export const FORM_THEME_PRESETS: FormThemePresetSeed[] = [
  // ── Holi festival ─────────────────────────────────────────────────────────
  {
    id: "holi-gulal",
    name: "Gulal Bloom",
    category: "Holi",
    config: {
      primaryColor: "#e91e63",
      backgroundColor: "#fff8e7",
      textColor: "#1f2937",
      accentColor: "#ff9800",
    },
  },
  {
    id: "holi-saffron",
    name: "Saffron Sky",
    category: "Holi",
    config: {
      primaryColor: "#ff5722",
      backgroundColor: "#fffde7",
      textColor: "#3e2723",
      accentColor: "#ffc107",
    },
  },
  {
    id: "holi-mehendi",
    name: "Mehendi Green",
    category: "Holi",
    config: {
      primaryColor: "#43a047",
      backgroundColor: "#f1f8e9",
      textColor: "#1b5e20",
      accentColor: "#ffb300",
    },
  },
  {
    id: "holi-rangoli",
    name: "Rangoli Peach",
    category: "Holi",
    config: {
      primaryColor: "#ff9800",
      backgroundColor: "#ffe0b2",
      textColor: "#4e342e",
      accentColor: "#e91e63",
    },
  },
  {
    id: "holi-pani",
    name: "Pani Splash",
    category: "Holi",
    config: {
      primaryColor: "#29b6f6",
      backgroundColor: "#e3f2fd",
      textColor: "#0d47a1",
      accentColor: "#ffc107",
    },
  },
  {
    id: "holi-baingani",
    name: "Baingani Gulal",
    category: "Holi",
    config: {
      primaryColor: "#9c27b0",
      backgroundColor: "#f3e5f5",
      textColor: "#4a148c",
      accentColor: "#ff4081",
    },
  },
  // ── Minimal ─────────────────────────────────────────────────────────────────
  {
    id: "minimal-white",
    name: "Clean White",
    category: "Minimal",
    config: {
      primaryColor: "#18181b",
      backgroundColor: "#ffffff",
      textColor: "#09090b",
      accentColor: "#71717a",
    },
  },
  {
    id: "minimal-slate",
    name: "Soft Slate",
    category: "Minimal",
    config: {
      primaryColor: "#334155",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      accentColor: "#64748b",
    },
  },
  {
    id: "minimal-ink",
    name: "Ink Dark",
    category: "Minimal",
    config: {
      primaryColor: "#fafafa",
      backgroundColor: "#18181b",
      textColor: "#f4f4f5",
      accentColor: "#a1a1aa",
    },
  },
];

export const DEFAULT_FORM_THEME_ID = "holi-gulal";

export const FORM_THEME_PRESET_IDS = FORM_THEME_PRESETS.map((preset) => preset.id);
