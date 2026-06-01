const MODE_KEY = "app_mode";

export type AppMode = "demo" | "auth";

export function setAppMode(mode: AppMode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function getAppMode(): AppMode {
  const stored = localStorage.getItem(MODE_KEY) as AppMode | null;

  if (stored) return stored;

  // fallback to env
  return import.meta.env.VITE_APP_MODE === "demo" ? "demo" : "auth";
}

export function isDemoMode(): boolean {
  return getAppMode() === "demo";
}

export function clearAppMode() {
  localStorage.removeItem(MODE_KEY);
}
