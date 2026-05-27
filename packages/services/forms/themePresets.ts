import type { FormThemeConfig, FormThemePreset } from "@repo/validators/forms";
import {
  DEFAULT_FORM_THEME_ID,
  FORM_THEME_PRESETS as DB_FORM_THEME_PRESETS,
} from "@repo/database/form-theme-presets";

export const FORM_THEME_PRESETS: FormThemePreset[] = DB_FORM_THEME_PRESETS;

const presetById = new Map(FORM_THEME_PRESETS.map((preset) => [preset.id, preset]));

export { DEFAULT_FORM_THEME_ID };

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
