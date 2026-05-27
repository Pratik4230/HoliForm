-- Remap forms on removed preset ids, then drop legacy presets.
UPDATE "forms"
SET "theme_id" = 'holi-gulal'
WHERE "theme_id" IS NOT NULL
  AND "theme_id" NOT IN (
    'holi-gulal',
    'holi-saffron',
    'holi-mehendi',
    'holi-rangoli',
    'holi-pani',
    'holi-baingani',
    'minimal-white',
    'minimal-slate',
    'minimal-ink'
  );

DELETE FROM "form_themes"
WHERE "is_preset" = true
  AND "id" NOT IN (
    'holi-gulal',
    'holi-saffron',
    'holi-mehendi',
    'holi-rangoli',
    'holi-pani',
    'holi-baingani',
    'minimal-white',
    'minimal-slate',
    'minimal-ink'
  );

INSERT INTO "form_themes" ("id", "name", "category", "config", "is_preset") VALUES
  ('holi-gulal', 'Gulal Bloom', 'Holi', '{"primaryColor":"#e91e63","backgroundColor":"#fff8e7","textColor":"#1f2937","accentColor":"#ff9800"}', true),
  ('holi-saffron', 'Saffron Sky', 'Holi', '{"primaryColor":"#ff5722","backgroundColor":"#fffde7","textColor":"#3e2723","accentColor":"#ffc107"}', true),
  ('holi-mehendi', 'Mehendi Green', 'Holi', '{"primaryColor":"#43a047","backgroundColor":"#f1f8e9","textColor":"#1b5e20","accentColor":"#ffb300"}', true),
  ('holi-rangoli', 'Rangoli Peach', 'Holi', '{"primaryColor":"#ff9800","backgroundColor":"#ffe0b2","textColor":"#4e342e","accentColor":"#e91e63"}', true),
  ('holi-pani', 'Pani Splash', 'Holi', '{"primaryColor":"#29b6f6","backgroundColor":"#e3f2fd","textColor":"#0d47a1","accentColor":"#ffc107"}', true),
  ('holi-baingani', 'Baingani Gulal', 'Holi', '{"primaryColor":"#9c27b0","backgroundColor":"#f3e5f5","textColor":"#4a148c","accentColor":"#ff4081"}', true),
  ('minimal-white', 'Clean White', 'Minimal', '{"primaryColor":"#18181b","backgroundColor":"#ffffff","textColor":"#09090b","accentColor":"#71717a"}', true),
  ('minimal-slate', 'Soft Slate', 'Minimal', '{"primaryColor":"#334155","backgroundColor":"#f8fafc","textColor":"#0f172a","accentColor":"#64748b"}', true),
  ('minimal-ink', 'Ink Dark', 'Minimal', '{"primaryColor":"#fafafa","backgroundColor":"#18181b","textColor":"#f4f4f5","accentColor":"#a1a1aa"}', true)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "category" = EXCLUDED."category",
  "config" = EXCLUDED."config",
  "is_preset" = EXCLUDED."is_preset";
