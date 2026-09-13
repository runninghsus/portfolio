/** Theme preference: "dark" | "light" beat the system setting via data-theme; "auto" clears it. */
export type ThemeMode = "dark" | "light" | "auto";
const KEY = "theme";

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  try {
    if (mode === "auto") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable: the choice just won't persist */
  }
}

/** Inline script for <body> start: re-applies a saved choice before first paint. */
export const THEME_BOOT = `try{var t=localStorage.getItem("${KEY}");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
