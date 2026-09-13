/**
 * Page actions the site assistant may emit inside its reply, e.g. "[[step:agentic-ai:4]]".
 * A closed grammar: the client strips the tokens from the text and executes only
 * well-formed actions whose targets exist on the page. Shared by server (prompt) and client (panel).
 */
export const CHAPTERS = ["huntington", "phd", "personal"] as const;
export const THEMES = ["dark", "light", "auto"] as const;
export const HIGHLIGHTS = ["resume", "linkedin", "github"] as const;

export type Action =
  | { type: "goto"; slug: string }
  | { type: "step"; slug: string; step: number }
  | { type: "expand"; slug: string }
  | { type: "filter"; chapter: (typeof CHAPTERS)[number] | "all" }
  | { type: "theme"; mode: (typeof THEMES)[number] }
  | { type: "highlight"; target: (typeof HIGHLIGHTS)[number] };

const TOKEN = /\[\[([a-z]+):([a-z0-9-]+)(?::(\d{1,2}))?\]\]/g;
const SLUG = /^[a-z0-9-]{2,40}$/;

/** Parse a reply. `isSlug` says whether a row id exists (client: DOM lookup; server: data). */
export function extractActions(text: string, isSlug: (slug: string) => boolean): { text: string; actions: Action[] } {
  const actions: Action[] = [];
  const clean = text.replace(TOKEN, (_m, kind: string, arg: string, num?: string) => {
    switch (kind) {
      case "goto":
      case "expand":
        if (SLUG.test(arg) && isSlug(arg)) actions.push({ type: kind, slug: arg });
        break;
      case "step":
        if (SLUG.test(arg) && isSlug(arg) && num) actions.push({ type: "step", slug: arg, step: Number(num) });
        break;
      case "filter":
        if (arg === "all" || (CHAPTERS as readonly string[]).includes(arg)) actions.push({ type: "filter", chapter: arg as Action extends { chapter: infer C } ? C : never });
        break;
      case "theme":
        if ((THEMES as readonly string[]).includes(arg)) actions.push({ type: "theme", mode: arg as (typeof THEMES)[number] });
        break;
      case "highlight":
        if ((HIGHLIGHTS as readonly string[]).includes(arg)) actions.push({ type: "highlight", target: arg as (typeof HIGHLIGHTS)[number] });
        break;
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
