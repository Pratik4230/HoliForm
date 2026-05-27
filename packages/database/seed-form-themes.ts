import { and, eq, isNotNull, notInArray } from "drizzle-orm";
import { formThemesTable } from "./models/formTheme";
import { formsTable } from "./models/form";
import {
  DEFAULT_FORM_THEME_ID,
  FORM_THEME_PRESET_IDS,
  FORM_THEME_PRESETS,
} from "./form-theme-presets";
import db from "./index";

/** Sync preset rows: remap stale form themes, remove old presets, upsert current set. */
export async function ensureFormThemePresets(): Promise<void> {
  await db
    .update(formsTable)
    .set({ themeId: DEFAULT_FORM_THEME_ID })
    .where(
      and(
        isNotNull(formsTable.themeId),
        notInArray(formsTable.themeId, FORM_THEME_PRESET_IDS),
      ),
    );

  await db
    .delete(formThemesTable)
    .where(
      and(
        eq(formThemesTable.isPreset, true),
        notInArray(formThemesTable.id, FORM_THEME_PRESET_IDS),
      ),
    );

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
      .onConflictDoUpdate({
        target: formThemesTable.id,
        set: {
          name: preset.name,
          category: preset.category,
          config: preset.config,
          isPreset: true,
        },
      });
  }
}
