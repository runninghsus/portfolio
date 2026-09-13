"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { suggestions, hints } from "@/data/bot";
import { site } from "@/data/site";
import { groups } from "@/data/projects";
import { tour } from "@/data/tour";
import { extractActions } from "@/lib/actions";
import { runAction, spotlight, goToStep, HIGHLIGHT_TARGETS, type ActionHost } from "@/lib/page-actions";
import { activePrefs, resetPrefs } from "@/lib/prefs";

type Msg = { role: "user" | "assistant"; content: string };
type Context = { row?: string; rowTitle?: string; step?: number; stepTitle?: string; filter?: string };

const PREF_LABEL: Record<string, Record<string, string>> = {
  theme: { dark: "dark", light: "light" },
  textsize: { large: "large text" },
  density: { compact: "compact" },
  contrast: { high: "high contrast" },
  motion: { off: "animation off" },
  accent: { blue: "blue accent", green: "green accent" },
};

/** Renders the assistant's plain text, turning [label](#anchor) into in-page links. */
function renderText(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((#[a-z0-9-]+|https?:\/\/[^\s)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const href = m[2];
    out.push(
      <a key={m.index} href={href} className="text-link" target={href.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer">
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** The row whose card fills the most of the viewport (by visible height), if any is meaningfully in view. */
function visibleRow(): string | undefined {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if (!vh) return undefined;
  let best: string | undefined;
  let bestFrac = 0.15;
  for (const el of document.querySelectorAll<HTMLElement>(".feature[id]")) {
    const r = el.getBoundingClientRect();
    if (r.height <= 0) continue; // hidden by a filter
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    const frac = visible / Math.min(r.height, vh);
    if (frac > bestFrac) {
      best = el.id;
      bestFrac = frac;
    }
  }
  return best;
}

/** Which row is in view, and which step its schematic is on — sent with each question. */
function readContext(filter: string, row: string | undefined): Context {
  if (!row) return { filter };
  const el = document.getElementById(row);
  const stepEl = el?.querySelector(".tutorial-step");
  const titleEl = el?.querySelector(".tutorial-caption b");
  return {
    row,
    rowTitle: el?.querySelector("h3")?.textContent ?? undefined,
    step: stepEl ? Number(stepEl.textContent) : undefined,
    stepTitle: titleEl?.textContent ?? undefined,
    filter,
  };
}

/** Tracks the in-view row reactively (for the hint and placeholder); re-measured on scroll, resize and filter changes. */
function useViewContext(filter: string): Context {
  const [row, setRow] = useState<string | undefined>();
  useEffect(() => {
    let timer = 0;
    const update = () => {
      timer = 0;
      setRow(visibleRow());
    };
    const schedule = () => {
      if (!timer) timer = window.setTimeout(update, 120); // a timer, not rAF: keeps working in background tabs
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearTimeout(timer);
    };
  }, [filter]);
  return row ? readContext(filter, row) : { filter };
}

export default function AskPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [tourAt, setTourAt] = useState<number | null>(null);
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [hint, setHint] = useState<{ slug: string; text: string } | null>(null);
  const doneRef = useRef(0); // actions already executed for the reply being streamed
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hintedRef = useRef<Set<string>>(new Set());
  const ctx = useViewContext(filter);

  /* ---- tour ---------------------------------------------------------- */
  const showStop = useCallback((i: number) => {
    const s = tour[i];
    if (!s) return;
    const g = s.go;
    if (g.kind === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      spotlight(document.querySelector(".keyfacts"), "nearest");
    } else if (g.kind === "selector") spotlight(document.querySelector(g.selector), "center");
    else if (g.kind === "row") spotlight(document.getElementById(g.slug));
    else if (g.kind === "step") goToStep(g.slug, g.step);
    else if (g.kind === "highlight") spotlight(HIGHLIGHT_TARGETS[g.target]?.() ?? null, "center");
  }, []);
  const startTour = useCallback(() => {
    setOpen(false);
    setTourAt(0);
    showStop(0);
  }, [showStop]);
  const stopTour = useCallback(() => setTourAt(null), []);
  const stepTour = useCallback(
    (d: number) => {
      setTourAt((cur) => {
        if (cur === null) return cur;
        const n = cur + d;
        if (n < 0 || n >= tour.length) return n >= tour.length ? null : cur;
        showStop(n);
        return n;
      });
    },
    [showStop],
  );
  useEffect(() => {
    if (tourAt === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") stepTour(1);
      else if (e.key === "ArrowLeft") stepTour(-1);
      else if (e.key === "Escape") stopTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourAt, stepTour, stopTour]);

  const host: ActionHost = { onFilter: setFilter, onTour: (cmd) => (cmd === "start" ? startTour() : stopTour()) };

  /* ---- prefs line ----------------------------------------------------- */
  useEffect(() => {
    const sync = () => setPrefs(activePrefs() as Record<string, string>);
    sync();
    window.addEventListener("prefs:change", sync);
    return () => window.removeEventListener("prefs:change", sync);
  }, []);
  const prefWords = Object.entries(prefs)
    .map(([k, v]) => PREF_LABEL[k]?.[v])
    .filter(Boolean) as string[];

  /* ---- gentle hint when a visitor lingers on a row ---------------------- */
  useEffect(() => {
    if (open || tourAt !== null || !ctx.row || hintedRef.current.has(ctx.row) || hintedRef.current.size >= 3) return;
    const slug = ctx.row;
    const text = hints[slug];
    if (!text) return;
    const t = window.setTimeout(() => {
      hintedRef.current.add(slug);
      setHint({ slug, text });
      window.setTimeout(() => setHint((h) => (h?.slug === slug ? null : h)), 9000);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [ctx.row, open, tourAt]);

  /* ---- panel plumbing --------------------------------------------------- */
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);
  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [busy, open]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setHint(null);
    const history: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-8), context: readContext(filter, visibleRow()) }),
        signal: ctrl.signal,
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      doneRef.current = 0;
      const isSlug = (slug: string) => !!document.getElementById(slug);
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const { text, actions } = extractActions(acc, isSlug);
        for (const a of actions.slice(doneRef.current)) runAction(a, host);
        doneRef.current = actions.length;
        setMsgs((cur) => cur.map((m, i) => (i === cur.length - 1 ? { ...m, content: text } : m)));
      }
      if (!acc) throw new Error("empty");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMsgs((cur) =>
          cur.map((m, i) => (i === cur.length - 1 ? { ...m, content: "Something went wrong on my side. Everything I'd say is on this page, and Alex is reachable on LinkedIn." } : m)),
        );
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  const filterName = groups.find((g) => g.id === filter)?.heading;
  const stop = tourAt !== null ? tour[tourAt] : null;

  return (
    <>
      {filter !== "all" && tourAt === null && (
        <div className="filter-pill" role="status">
          Showing {filterName} only
          <button type="button" onClick={() => runAction({ type: "filter", chapter: "all" }, host)}>
            Show all
          </button>
        </div>
      )}

      {stop && (
        <div className="tour-bar" role="dialog" aria-label="Guided tour" aria-live="polite">
          <div className="tour-text">
            <span className="label tour-count">
              Tour · {tourAt! + 1} of {tour.length}
            </span>
            <b>{stop.title}</b>
            <p>{stop.text}</p>
          </div>
          <div className="tour-nav">
            <button type="button" onClick={() => stepTour(-1)} disabled={tourAt === 0} aria-label="Previous stop">
              ‹
            </button>
            <button type="button" className="btn primary" onClick={() => stepTour(1)}>
              {tourAt === tour.length - 1 ? "Finish" : "Next"}
            </button>
            <button type="button" className="tour-end" onClick={stopTour}>
              End tour
            </button>
          </div>
        </div>
      )}

      {hint && !open && tourAt === null && (
        <button type="button" className="ask-hint" onClick={() => { setOpen(true); void ask(hint.text); }}>
          <span className="label">Ask</span> {hint.text}
        </button>
      )}

      <button type="button" className={`ask-fab${open || tourAt !== null ? " hidden-fab" : ""}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <span className="ask-dot" aria-hidden="true" />
        Ask about my work
      </button>

      {open && (
        <section className="ask-panel" role="dialog" aria-label="Ask about Alex's work" aria-modal="false">
          <header className="ask-head">
            <div>
              <b>Ask about my work</b>
              <span className="ask-sub label">answers only from this site</span>
            </div>
            <button type="button" className="ask-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </header>

          <div className="ask-msgs" ref={listRef} aria-live="polite">
            {msgs.length === 0 && (
              <div className="ask-intro">
                <p>
                  Answers only from what&apos;s on this page — and can scroll you to the right spot, step through a diagram, or change how the page looks. For anything it doesn&apos;t know,{" "}
                  <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                    message Alex on LinkedIn
                  </a>
                  .
                </p>
                <div className="ask-sugg">
                  <button type="button" className="ask-tour" onClick={startTour}>
                    Take the two-minute tour
                  </button>
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => void ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`ask-msg ${m.role}`}>
                {m.role === "assistant" && !m.content ? <span className="ask-typing" aria-label="Thinking">···</span> : renderText(m.content)}
              </div>
            ))}
          </div>

          {prefWords.length > 0 && (
            <div className="ask-prefs">
              Display: {prefWords.join(" · ")}
              <button type="button" onClick={resetPrefs}>
                reset
              </button>
            </div>
          )}

          <form className="ask-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ctx.rowTitle ? "Ask about this section, or anything else…" : "Ask a question…"}
              maxLength={600}
              aria-label="Your question"
              disabled={busy}
            />
            <button type="submit" className="btn primary" disabled={busy || !input.trim()}>
              Ask
            </button>
          </form>
        </section>
      )}
    </>
  );
}
