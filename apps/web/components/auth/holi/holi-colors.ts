/** Holi gulal palette — purple and blue used separately, never paired. */
export const HOLI = {
  pink: "#e91e63",
  hotPink: "#ff4081",
  magenta: "#f50057",
  yellow: "#ffc107",
  gold: "#ffb300",
  green: "#43a047",
  lime: "#7cb342",
  orange: "#ff5722",
  tangerine: "#ff9800",
  red: "#e53935",
  blue: "#29b6f6",
  purple: "#9c27b0",
  cream: "#fff8e7",
  peach: "#ffe0b2",
} as const;

export const SPLASH_COLORS = [
  HOLI.pink,
  HOLI.yellow,
  HOLI.green,
  HOLI.orange,
  HOLI.red,
  HOLI.hotPink,
  HOLI.lime,
  HOLI.purple,
  HOLI.blue,
  HOLI.tangerine,
] as const;
