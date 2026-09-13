import type { Action } from "@/lib/actions";
import { applyPref, resetPrefs, type PrefKey, type PrefValue } from "@/lib/prefs";

export function spotlight(el: Element | null, block: ScrollLogicalPosition = "start") {
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block });
  el.classList.remove("spotlight");
  void (el as HTMLElement).offsetWidth; // restart the animation if it is already running
  el.classList.add("spotlight");
  window.setTimeout(() => el.classList.remove("spotlight"), 2600);
}

export const HIGHLIGHT_TARGETS: Record<string, () => Element | null> = {
  resume: () => document.querySelector(".resume-btn"),
  linkedin: () => document.querySelector('a[href*="linkedin.com"]'),
  github: () => document.querySelector('.site-footer a[href*="github.com"]'),
};

export function goToStep(slug: string, step: number) {
  window.dispatchEvent(new CustomEvent("tutorial:go", { detail: { slug, step } }));
  spotlight(document.getElementById(slug)?.querySelector(".tutorial") ?? document.getElementById(slug), "center");
}

export type ActionHost = {
  onFilter: (chapter: string) => void;
  onTour: (cmd: "start" | "stop") => void;
};

/** Execute one action from the assistant. */
export function runAction(a: Action, host: ActionHost) {
  switch (a.type) {
    case "goto":
      spotlight(document.getElementById(a.slug));
      break;
    case "expand":
      document.getElementById(a.slug)?.classList.add("open");
      spotlight(document.getElementById(a.slug));
      break;
    case "step":
      goToStep(a.slug, a.step);
      break;
    case "filter":
      if (a.chapter === "all") delete document.body.dataset.filter;
      else document.body.dataset.filter = a.chapter;
      host.onFilter(a.chapter);
      if (a.chapter !== "all") document.querySelector(`.chapter[data-chapter="${a.chapter}"] .feature`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    case "pref":
      applyPref(a.key, a.value as PrefValue<PrefKey>);
      break;
    case "style":
      resetPrefs();
      break;
    case "highlight":
      spotlight(HIGHLIGHT_TARGETS[a.target]?.() ?? null, "center");
      break;
    case "tour":
      host.onTour(a.value);
      break;
  }
}
