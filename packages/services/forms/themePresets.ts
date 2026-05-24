import type { FormThemeConfig, FormThemePreset } from "@repo/validators/forms";

export const FORM_THEME_PRESETS: FormThemePreset[] = [
  {
    id: "holi-gulal",
    name: "Holi Gulal",
    category: "Festival",
    config: {
      primaryColor: "#db2777",
      backgroundColor: "#fdf2f8",
      textColor: "#1f2937",
      accentColor: "#06b6d4",
    },
  },
  {
    id: "startup-slate",
    name: "Startup Slate",
    category: "Startups",
    config: {
      primaryColor: "#4f46e5",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      accentColor: "#6366f1",
    },
  },
  {
    id: "ocean-tech",
    name: "Ocean Tech",
    category: "Tech",
    config: {
      primaryColor: "#0284c7",
      backgroundColor: "#ecfeff",
      textColor: "#0c4a6e",
      accentColor: "#22d3ee",
    },
  },
  {
    id: "sunset-event",
    name: "Sunset Event",
    category: "Events",
    config: {
      primaryColor: "#ea580c",
      backgroundColor: "#fff7ed",
      textColor: "#431407",
      accentColor: "#f59e0b",
    },
  },
  {
    id: "forest-community",
    name: "Forest Community",
    category: "Communities",
    config: {
      primaryColor: "#16a34a",
      backgroundColor: "#f0fdf4",
      textColor: "#14532d",
      accentColor: "#84cc16",
    },
  },
  {
    id: "midnight-os",
    name: "Midnight OS",
    category: "OS",
    config: {
      primaryColor: "#818cf8",
      backgroundColor: "#0f172a",
      textColor: "#e2e8f0",
      accentColor: "#38bdf8",
    },
  },
  {
    id: "anime-pop",
    name: "Anime Pop",
    category: "Anime",
    config: {
      primaryColor: "#c026d3",
      backgroundColor: "#faf5ff",
      textColor: "#3b0764",
      accentColor: "#f472b6",
    },
  },
];

const presetById = new Map(FORM_THEME_PRESETS.map((preset) => [preset.id, preset]));

export const DEFAULT_FORM_THEME_ID = "holi-gulal";

export function listFormThemes(): FormThemePreset[] {
  return FORM_THEME_PRESETS;
}

export function isValidThemeId(themeId: string): boolean {
  return presetById.has(themeId);
}

export function resolveFormTheme(themeId: string | null | undefined): FormThemeConfig {
  const preset = themeId ? presetById.get(themeId) : undefined;
  return preset?.config ?? presetById.get(DEFAULT_FORM_THEME_ID)!.config;
}

export function resolveFormThemePreset(
  themeId: string | null | undefined,
): FormThemePreset | null {
  if (!themeId) {
    return null;
  }
  return presetById.get(themeId) ?? null;
}
