"use client";

import { cn } from "~/lib/utils";
import { useListFormThemes } from "~/hooks/api/form";
import { Spinner } from "~/components/ui/spinner";

type FormThemePickerProps = {
  value: string | null;
  onChange: (themeId: string) => void;
  disabled?: boolean;
};

export function FormThemePicker({ value, onChange, disabled }: FormThemePickerProps) {
  const { data: themes, isLoading } = useListFormThemes();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!themes?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No themes available. Run database migrations to seed presets.
      </p>
    );
  }

  const grouped = themes.reduce<Record<string, typeof themes>>((acc, theme) => {
    const list = acc[theme.category] ?? [];
    list.push(theme);
    acc[theme.category] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {category}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((theme) => {
              const selected = value === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(theme.id)}
                  className={cn(
                    "min-h-20 rounded-xl border p-4 text-left transition-shadow hover:shadow-md active:scale-[0.98]",
                    selected ? "border-foreground ring-2 ring-foreground/20" : "border-border",
                  )}
                >
                  <div className="mb-2 flex gap-1">
                    <span
                      className="size-5 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.config.primaryColor }}
                    />
                    <span
                      className="size-5 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.config.accentColor ?? theme.config.primaryColor }}
                    />
                    <span
                      className="size-5 flex-1 rounded-md border border-black/10"
                      style={{ backgroundColor: theme.config.backgroundColor }}
                    />
                  </div>
                  <p className="text-sm font-medium">{theme.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
