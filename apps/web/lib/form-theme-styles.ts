import type { CSSProperties } from "react";
import type { FormThemeConfig, FormThemePreset } from "@repo/validators/forms";

const DEFAULT_FORM_THEME_ID = "holi-gulal";

export function themeToCssVariables(theme: FormThemeConfig): CSSProperties {
  return {
    "--form-primary": theme.primaryColor,
    "--form-bg": theme.backgroundColor,
    "--form-text": theme.textColor,
    "--form-accent": theme.accentColor ?? theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
  } as CSSProperties;
}

export function resolveThemeFromPresets(
  themeId: string | null | undefined,
  presets: FormThemePreset[],
): FormThemeConfig | undefined {
  if (presets.length === 0) {
    return undefined;
  }

  const preset =
    presets.find((item) => item.id === themeId) ??
    presets.find((item) => item.id === DEFAULT_FORM_THEME_ID) ??
    presets[0];

  return preset?.config;
}
