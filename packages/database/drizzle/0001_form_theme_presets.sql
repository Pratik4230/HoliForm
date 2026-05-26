INSERT INTO "form_themes" ("id", "name", "category", "config", "is_preset") VALUES
  ('holi-gulal', 'Holi Gulal', 'Festival', '{"primaryColor":"#db2777","backgroundColor":"#fdf2f8","textColor":"#1f2937","accentColor":"#06b6d4"}', true),
  ('startup-slate', 'Startup Slate', 'Startups', '{"primaryColor":"#4f46e5","backgroundColor":"#f8fafc","textColor":"#0f172a","accentColor":"#6366f1"}', true),
  ('ocean-tech', 'Ocean Tech', 'Tech', '{"primaryColor":"#0284c7","backgroundColor":"#ecfeff","textColor":"#0c4a6e","accentColor":"#22d3ee"}', true),
  ('sunset-event', 'Sunset Event', 'Events', '{"primaryColor":"#ea580c","backgroundColor":"#fff7ed","textColor":"#431407","accentColor":"#f59e0b"}', true),
  ('forest-community', 'Forest Community', 'Communities', '{"primaryColor":"#16a34a","backgroundColor":"#f0fdf4","textColor":"#14532d","accentColor":"#84cc16"}', true),
  ('midnight-os', 'Midnight OS', 'OS', '{"primaryColor":"#818cf8","backgroundColor":"#0f172a","textColor":"#e2e8f0","accentColor":"#38bdf8"}', true),
  ('anime-pop', 'Anime Pop', 'Anime', '{"primaryColor":"#c026d3","backgroundColor":"#faf5ff","textColor":"#3b0764","accentColor":"#f472b6"}', true)
ON CONFLICT ("id") DO NOTHING;
