import { formThemesTable, type FormThemeConfig } from "./models/formTheme";
import db from "./index";

const FORM_THEME_PRESETS: Array<{
  id: string;
  name: string;
  category: string;
  config: FormThemeConfig;
}> = [
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

/** Inserts preset rows required by `forms.theme_id` FK (idempotent). */
export async function ensureFormThemePresets(): Promise<void> {
  for (const preset of FORM_THEME_PRESETS) {
    await db
      .insert(formThemesTable)
      .values({
        id: preset.id,
        name: preset.name,
        category: preset.category,
        config: preset.config,
        isPreset: true,
      })
      .onConflictDoNothing();
  }
}
