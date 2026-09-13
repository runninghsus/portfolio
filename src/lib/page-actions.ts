import type { Action } from "@/lib/actions";
import { applyTheme } from "@/lib/theme";

function spotlight(el: Element | null, block: ScrollLogicalPosition = "start") {
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block });
  el.classList.remove("spotlight");
  void (el as HTMLElement).offsetWidth; // restart the animation if it is already running
  el.classList.add("spotlight");
  window.setTimeout(() => el.classList.remove("spotlight"), 2600);
}

const HIGHLIGHT_TARGETS: Record<string, () => Element | null> = {
  resume: () => document.querySelector(".resume-btn"),
  linkedin: () => document.querySelector('a[href*="linkedin.com"]'),
  github: () => document.querySelector('.site-footer a[href*="github.com"]'),
};

/** Execute one action from the assistant. `onFilter` lets the panel show its "showing X only" pill. */
export function runAction(a: Action, onFilter: (chapter: string) => void) {
  switch (a.type) {
    case "goto":
      spotlight(document.getElementById(a.slug));
      break;
    case "expand":
      document.getElementById(a.slug)?.classList.add("open");
      spotlight(document.getElementById(a.slug));
      break;
    case "step":
      window.dispatchEvent(new CustomEvent("tutorial:go", { detail: { slug: a.slug, step: a.step } }));
      spotlight(document.getElementById(a.slug)?.querySelector(".tutorial") ?? document.getElementById(a.slug), "center");
      break;
    case "filter":
      if (a.chapter === "all") delete document.body.dataset.filter;
      else document.body.dataset.filter = a.chapter;
      onFilter(a.chapter);
      if (a.chapter !== "all") {
        const first = document.querySelector(`.chapter[data-chapter="${a.chapter}"] .feature`);
        first?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      break;
    case "theme":
      applyTheme(a.mode);
      break;
    case "highlight":
      spotlight(HIGHLIGHT_TARGETS[a.target]?.() ?? null, "center");
      break;
  }
}
