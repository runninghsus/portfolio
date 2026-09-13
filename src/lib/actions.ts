/**
 * Page actions the site assistant may emit inside its reply, e.g. "[[step:agentic-ai:4]]".
 * A closed grammar: the client strips the tokens from the text and executes only
 * well-formed actions whose targets exist on the page. Shared by server (prompt) and client (panel).
 */
import { PREF_VALUES, type PrefKey } from "@/lib/prefs";

export const CHAPTERS = ["huntington", "phd", "personal"] as const;
export const HIGHLIGHTS = ["resume", "linkedin", "github"] as const;

export type Action =
  | { type: "goto"; slug: string }
  | { type: "step"; slug: string; step: number }
  | { type: "expand"; slug: string }
  | { type: "filter"; chapter: (typeof CHAPTERS)[number] | "all" }
  | { type: "pref"; key: PrefKey; value: string }
  | { type: "style"; value: "reset" }
  | { type: "highlight"; target: (typeof HIGHLIGHTS)[number] }
  | { type: "tour"; value: "start" | "stop" };

const TOKEN = /\[\[([a-z]+):([a-z0-9-]+)(?::(\d{1,2}))?\]\]/g;
const SLUG = /^[a-z0-9-]{2,40}$/;
const PREF_KEYS = Object.keys(PREF_VALUES) as PrefKey[];

/** Parse a reply. `isSlug` says whether a row id exists (client: DOM lookup; server: data). */
export function extractActions(text: string, isSlug: (slug: string) => boolean): { text: string; actions: Action[] } {
  const actions: Action[] = [];
  const clean = text.replace(TOKEN, (_m, kind: string, arg: string, num?: string) => {
    if (kind === "goto" || kind === "expand") {
      if (SLUG.test(arg) && isSlug(arg)) actions.push({ type: kind, slug: arg });
    } else if (kind === "step") {
      if (SLUG.test(arg) && isSlug(arg) && num) actions.push({ type: "step", slug: arg, step: Number(num) });
    } else if (kind === "filter") {
      if (arg === "all" || (CHAPTERS as readonly string[]).includes(arg)) actions.push({ type: "filter", chapter: arg as Extract<Action, { type: "filter" }>["chapter"] });
    } else if (kind === "highlight") {
      if ((HIGHLIGHTS as readonly string[]).includes(arg)) actions.push({ type: "highlight", target: arg as (typeof HIGHLIGHTS)[number] });
    } else if (kind === "style") {
      if (arg === "reset") actions.push({ type: "style", value: "reset" });
    } else if (kind === "tour") {
      if (arg === "start" || arg === "stop") actions.push({ type: "tour", value: arg });
    } else if ((PREF_KEYS as string[]).includes(kind)) {
      const key = kind as PrefKey;
      if ((PREF_VALUES[key] as readonly string[]).includes(arg)) actions.push({ type: "pref", key, value: arg });
    }
    return "";
  });
  // anything else in double brackets is a malformed token: never show it, never run it
  const scrubbed = clean.replace(/\[\[[^\]]*\]\]/g, "");
  // hide a token that is still streaming in ("[[ste…") until it completes
  const cut = scrubbed.lastIndexOf("[[");
  const display = cut !== -1 && !scrubbed.slice(cut).includes("]]") ? scrubbed.slice(0, cut) : scrubbed;
  return { text: display.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/ {2,}/g, " ").trim(), actions };
}
