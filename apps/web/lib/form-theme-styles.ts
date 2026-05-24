import type { CSSProperties } from "react";
import type { FormThemeConfig } from "@repo/validators/forms";

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
