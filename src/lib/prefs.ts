/**
 * Visitor display preferences. Each one is a data-attribute on <html> that CSS keys off,
 * remembered in localStorage and re-applied before first paint by PREFS_BOOT.
 */
export const PREF_VALUES = {
  theme: ["dark", "light", "auto"],
  textsize: ["normal", "large"],
  density: ["comfortable", "compact"],
  contrast: ["normal", "high"],
  motion: ["on", "off"],
  accent: ["red", "blue", "green"],
} as const;
export type PrefKey = keyof typeof PREF_VALUES;
export type PrefValue<K extends PrefKey> = (typeof PREF_VALUES)[K][number];
const DEFAULTS: Record<PrefKey, string> = { theme: "auto", textsize: "normal", density: "comfortable", contrast: "normal", motion: "on", accent: "red" };
const KEY = "prefs";

function read(): Partial<Record<PrefKey, string>> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Record<PrefKey, string>>;
  } catch {
    return {};
  }
}
function write(p: Partial<Record<PrefKey, string>>) {
  try {
    if (Object.keys(p).length) localStorage.setItem(KEY, JSON.stringify(p));
    else localStorage.removeItem(KEY);
  } catch {
    /* no persistence available */
  }
}

export function applyPref<K extends PrefKey>(key: K, value: PrefValue<K>) {
  const root = document.documentElement;
  const isDefault = value === DEFAULTS[key];
  if (isDefault) root.removeAttribute(`data-${key}`);
  else root.setAttribute(`data-${key}`, value);
  const p = read();
  if (isDefault) delete p[key];
  else p[key] = value;
  write(p);
  window.dispatchEvent(new CustomEvent("prefs:change", { detail: { key, value } }));
}

export function resetPrefs() {
  for (const k of Object.keys(PREF_VALUES) as PrefKey[]) document.documentElement.removeAttribute(`data-${k}`);
  write({});
  try {
    localStorage.removeItem("theme"); // legacy key from the first theme implementation
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("prefs:change", { detail: { key: "all", value: "reset" } }));
}

/** Non-default preferences currently active, for the panel's "Display: … — reset" line. */
export function activePrefs(): Partial<Record<PrefKey, string>> {
  return read();
}

/** Inline script for <body> start: re-applies saved preferences before first paint. */
export const PREFS_BOOT = `try{var p=JSON.parse(localStorage.getItem("${KEY}")||"{}");for(var k in p)document.documentElement.setAttribute("data-"+k,p[k]);var t=localStorage.getItem("theme");if(!p.theme&&(t==="dark"||t==="light"))document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
