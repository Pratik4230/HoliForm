import type { ListFormThemesOutput } from "@repo/validators/forms";

import { FORM_THEME_PRESETS, listFormThemes as listPresets } from "./themePresets";

export { FORM_THEME_PRESETS, DEFAULT_FORM_THEME_ID, isValidThemeId, resolveFormTheme } from "./themePresets";

export function listFormThemes(): ListFormThemesOutput {
  return listPresets();
}
