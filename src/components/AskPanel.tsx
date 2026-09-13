"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Avatar from "@/components/Avatar";
import { suggestions, hints } from "@/data/bot";
import { site } from "@/data/site";
import { groups } from "@/data/projects";
import { tour } from "@/data/tour";
import { extractActions } from "@/lib/actions";
import { runAction, spotlight, goToStep, setFilter as setPageFilter, HIGHLIGHT_TARGETS, type ActionHost } from "@/lib/page-actions";
import { activePrefs, resetPrefs } from "@/lib/prefs";

type Msg = { role: "user" | "assistant"; content: string };
type Context = { row?: string; rowTitle?: string; step?: number; stepTitle?: string; filter?: string };
type Side = "left" | "right";
type Bubble = { kind: "tour" } | { kind: "q"; text: string; slug?: string };

const PREF_LABEL: Record<string, Record<string, string>> = {
  theme: { dark: "dark", light: "light" },
  textsize: { large: "large text" },
  density: { compact: "compact" },
  contrast: { high: "high contrast" },
  motion: { off: "animation off" },
  accent: { blue: "blue accent", green: "green accent" },
};

const MARGIN = 16;
const PHONE = 560;
const BUBBLE_EVERY = 8000;
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), Math.max(lo, hi));

/** Small storage helpers: never throw (private mode, blocked storage). */
function readStore(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function writeStore(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {
    /* ignore */
  }
}

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

/** Tracks the in-view row reactively (for the bubble hints and placeholder); re-measured on scroll, resize and filter changes. */
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

/** Viewport size, updated on resize (0×0 before mount). */
function useViewport() {
  const [vp, setVp] = useState({ vw: 0, vh: 0 });
  useEffect(() => {
    // clientWidth excludes a vertical scrollbar, which is what fixed-position math needs
    const read = () => setVp({ vw: document.documentElement.clientWidth || window.innerWidth, vh: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    document.addEventListener("visibilitychange", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
      document.removeEventListener("visibilitychange", read);
    };
  }, []);
  return vp;
}

export default function AskPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [tourAt, setTourAt] = useState<number | null>(null);
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [showSugg, setShowSugg] = useState(false);
  const [suggPage, setSuggPage] = useState(0); // presets rotate three at a time
  const doneRef = useRef(0); // actions already executed for the reply being streamed
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hintedRef = useRef<Set<string>>(new Set());
  const ctx = useViewContext(filter);
  const { vw, vh } = useViewport();
  const phone = vw > 0 && vw <= PHONE;

  /* ---- the avatar: where it sits, and dragging it ------------------------ */
  const size = phone ? 68 : 88;
  const [side, setSide] = useState<Side>("right");
  const [yf, setYf] = useState<number | null>(null); // vertical position as a fraction of the viewport height
  const [free, setFree] = useState<{ x: number; y: number } | null>(null); // live position while dragging
  const dragRef = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    if (!vh) return;
    if (yf !== null) return;
    const saved = readStore("local", "ask.avatar");
    if (saved) {
      try {
        const p = JSON.parse(saved) as { side?: Side; yf?: number };
        if (p.side === "left" || p.side === "right") setSide(p.side);
        if (typeof p.yf === "number" && p.yf >= 0 && p.yf <= 1) {
          setYf(p.yf);
          return;
        }
      } catch {
        /* fall through to the default */
      }
    }
    setYf((vh - size - 20) / vh);
  }, [vh, size, yf]);
  const avTop = yf === null ? vh : clamp(Math.round(yf * vh), MARGIN, vh - size - MARGIN);
  const avLeft = side === "left" ? MARGIN : vw - size - MARGIN;

  const onAvatarDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    dragRef.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onAvatarMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    setFree({ x: clamp(d.ox + dx, 0, vw - size), y: clamp(d.oy + dy, 0, vh - size) });
  };
  const onAvatarUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    if (!d.moved) return;
    suppressClick.current = true;
    window.setTimeout(() => (suppressClick.current = false), 300);
    const x = clamp(d.ox + (e.clientX - d.sx), 0, vw - size);
    const y = clamp(d.oy + (e.clientY - d.sy), MARGIN, vh - size - MARGIN);
    const nextSide: Side = x + size / 2 < vw / 2 ? "left" : "right";
    const nextYf = y / vh;
    setSide(nextSide);
    setYf(nextYf);
    setFree(null);
    setPanelPos(null);
    writeStore("local", "ask.avatar", JSON.stringify({ side: nextSide, yf: Number(nextYf.toFixed(4)) }));
  };

  /* ---- the panel: anchored to the avatar, draggable by its header on desktop ---- */
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);
  const pdragRef = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; w: number; h: number } | null>(null);
  useEffect(() => setPanelPos(null), [vw, vh]);
  const onHeadDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (phone || (e.target as HTMLElement).closest("button")) return;
    const r = panelRef.current?.getBoundingClientRect();
    if (!r) return;
    pdragRef.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, w: r.width, h: r.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHeadMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = pdragRef.current;
    if (!d || d.id !== e.pointerId) return;
    setPanelPos({ x: clamp(d.ox + (e.clientX - d.sx), 8, vw - d.w - 8), y: clamp(d.oy + (e.clientY - d.sy), 8, vh - d.h - 8) });
  };
  const onHeadUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (pdragRef.current?.id === e.pointerId) pdragRef.current = null;
  };
  const panelH = Math.min(600, vh - 40);
  const panelStyle: CSSProperties | undefined = phone
    ? undefined
    : panelPos
      ? { left: panelPos.x, top: panelPos.y, right: "auto", bottom: "auto" }
      : {
          top: clamp(avTop + size - panelH, 20, vh - panelH - 20),
          bottom: "auto",
          ...(side === "left" ? { left: 20, right: "auto" } : { right: 20 }),
        };

  /* ---- tour ---------------------------------------------------------- */
  const [tourTalk, setTourTalk] = useState(false);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [quiet, setQuiet] = useState(true); // true until mounted, then whatever the session says
  const [tourOffered, setTourOffered] = useState(true);
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
    writeStore("session", "ask.tourOffered", "1");
    setTourOffered(true);
    setPageFilter("all"); // the tour visits every chapter
    setOpen(false);
    setShowSugg(false);
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
  useEffect(() => {
    if (tourAt === null) return;
    setTourTalk(true);
    const t = window.setTimeout(() => setTourTalk(false), 1400);
    return () => window.clearTimeout(t);
  }, [tourAt]);

  const host: ActionHost = { onTour: (cmd) => (cmd === "start" ? startTour() : stopTour()) };

  /* ---- chapter filter: owned by the page (<body data-filter>), mirrored here for the pill and context ---- */
  useEffect(() => {
    const sync = (e: Event) => setFilter((e as CustomEvent<string>).detail || "all");
    window.addEventListener("filter:change", sync);
    return () => window.removeEventListener("filter:change", sync);
  }, []);

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

  /* ---- the speech bubble: tour offer first, then one rotating question at a time ---- */
  const [paused, setPaused] = useState(false);
  const [talk, setTalk] = useState(false);
  const [wave, setWave] = useState(false);
  const idxRef = useRef(0); // which preset the bubble is on
  const introducedRef = useRef(false);
  const bubbleRef = useRef<Bubble | null>(null);
  bubbleRef.current = bubble;
  useEffect(() => {
    setQuiet(readStore("session", "ask.quiet") === "1");
    setTourOffered(readStore("session", "ask.tourOffered") === "1");
  }, []);
  const bubbleAllowed = !open && tourAt === null && !quiet && yf !== null;
  // first appearance: a greeting with the tour offer (once per visit), otherwise straight to the questions
  useEffect(() => {
    if (!bubbleAllowed) {
      setBubble(null);
      introducedRef.current = false;
      return;
    }
    if (introducedRef.current) return;
    const t = window.setTimeout(() => {
      introducedRef.current = true;
      idxRef.current = 0;
      setBubble(tourOffered ? { kind: "q", text: suggestions[0] } : { kind: "tour" });
      setWave(true);
      window.setTimeout(() => setWave(false), 1500);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [bubbleAllowed, tourOffered]);
  // rotate through the presets (pauses while hovered)
  useEffect(() => {
    if (!bubble || bubble.kind !== "q" || paused || !bubbleAllowed) return;
    const t = window.setTimeout(() => {
      idxRef.current += 1;
      setBubble({ kind: "q", text: suggestions[idxRef.current % suggestions.length] });
    }, BUBBLE_EVERY);
    return () => window.clearTimeout(t);
  }, [bubble, paused, bubbleAllowed]);
  // a short word from the avatar whenever the bubble changes
  const bubbleKey = bubble ? (bubble.kind === "tour" ? "tour" : bubble.text) : "";
  useEffect(() => {
    if (!bubbleKey) return;
    setTalk(true);
    const t = window.setTimeout(() => setTalk(false), 1100);
    return () => window.clearTimeout(t);
  }, [bubbleKey]);
  // linger on a row → that row's question takes the next slot (once per row, at most three per visit)
  useEffect(() => {
    if (!bubbleAllowed || !ctx.row || hintedRef.current.has(ctx.row) || hintedRef.current.size >= 3) return;
    const slug = ctx.row;
    const text = hints[slug];
    if (!text) return;
    const t = window.setTimeout(() => {
      if (bubbleRef.current?.kind !== "q") return;
      hintedRef.current.add(slug);
      setBubble({ kind: "q", text, slug });
    }, 8000);
    return () => window.clearTimeout(t);
  }, [ctx.row, bubbleAllowed]);

  const dismissTour = () => {
    writeStore("session", "ask.tourOffered", "1");
    setTourOffered(true);
    idxRef.current = 0;
    setBubble({ kind: "q", text: suggestions[0] });
  };
  const hush = () => {
    writeStore("session", "ask.quiet", "1");
    setQuiet(true);
    setBubble(null);
  };
  const openPanel = () => {
    hush();
    setOpen(true);
  };

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
    setShowSugg(false);
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
  function startOver() {
    abortRef.current?.abort();
    setMsgs([]);
    setInput("");
    setShowSugg(false);
  }
  function askFromBubble(text: string) {
    setOpen(true);
    hush();
    void ask(text);
  }

  const PER_PAGE = 3;
  const suggPages = Math.max(1, Math.ceil(suggestions.length / PER_PAGE));
  const shownSuggestions = Array.from({ length: Math.min(PER_PAGE, suggestions.length) }, (_, i) => suggestions[(suggPage * PER_PAGE + i) % suggestions.length]);
  const nextSuggestions = () => setSuggPage((p) => (p + 1) % suggPages);
  const presets = (
    <>
      <button type="button" className="ask-tour" onClick={startTour}>
        Take the two-minute tour
      </button>
      {shownSuggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            nextSuggestions(); // fresh ideas next time
            void ask(s);
          }}
        >
          {s}
        </button>
      ))}
      {suggPages > 1 && (
        <button type="button" className="ask-more" onClick={nextSuggestions} aria-label="Show other suggested questions">
          More ideas
        </button>
      )}
    </>
  );

  const filterName = groups.find((g) => g.id === filter)?.heading;
  const stop = tourAt !== null ? tour[tourAt] : null;
  const showAvatar = yf !== null && !open && tourAt === null;
  const avatarStyle: CSSProperties = free ? { left: free.x, top: free.y } : { left: avLeft, top: avTop };
  const bubbleStyle: CSSProperties = {
    top: avTop + size * 0.6,
    ...(side === "right" ? { right: vw - avLeft + 14 } : { left: avLeft + size + 14 }),
    maxWidth: Math.min(300, vw - size - 3 * MARGIN - 14),
  };

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
          <Avatar size={44} talking={tourTalk} className="tour-av" />
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

      {showAvatar && bubble && !free && (
        <div
          className={`ask-bubble from-${side}`}
          style={bubbleStyle}
          role="status"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {bubble.kind === "tour" ? (
            <>
              <span className="bubble-text">Hi, I&apos;m Alex&apos;s site assistant. Want the two-minute tour?</span>
              <span className="bubble-actions">
                <button type="button" className="bubble-start" onClick={startTour}>
                  Start the tour
                </button>
                <button type="button" className="bubble-later" onClick={dismissTour}>
                  Not now
                </button>
              </span>
            </>
          ) : (
            <button type="button" className="bubble-q" onClick={() => askFromBubble(bubble.text)}>
              <span className="label">Ask</span> {bubble.text}
            </button>
          )}
          <button type="button" className="bubble-x" onClick={bubble.kind === "tour" ? dismissTour : hush} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {showAvatar && (
        <button
          type="button"
          className={`ask-avatar${free ? " dragging" : ""}`}
          style={avatarStyle}
          onPointerDown={onAvatarDown}
          onPointerMove={onAvatarMove}
          onPointerUp={onAvatarUp}
          onPointerCancel={onAvatarUp}
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            openPanel();
          }}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Ask about my work"
          title="Ask about my work — drag me anywhere"
        >
          <span className="ask-disc">
            <Avatar size={size} talking={talk} wave={wave} />
          </span>
          <span className="ask-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16v11H9l-5 4z" />
            </svg>
          </span>
        </button>
      )}

      {open && (
        <section className="ask-panel" role="dialog" aria-label="Ask about Alex's work" aria-modal="false" ref={panelRef} style={panelStyle}>
          <header className={`ask-head${phone ? "" : " draggable"}`} onPointerDown={onHeadDown} onPointerMove={onHeadMove} onPointerUp={onHeadUp} onPointerCancel={onHeadUp}>
            <Avatar size={36} talking={busy} className="head-av" />
            <div className="head-text">
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
                <div className="ask-sugg">{presets}</div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`ask-msg ${m.role}`}>
                {m.role === "assistant" && !m.content ? <span className="ask-typing" aria-label="Thinking">···</span> : renderText(m.content)}
              </div>
            ))}
          </div>

          {showSugg && msgs.length > 0 && (
            <div className="ask-sugg compact" id="ask-presets">
              {presets}
            </div>
          )}

          {(msgs.length > 0 || prefWords.length > 0) && (
            <div className="ask-tools">
              {msgs.length > 0 && (
                <>
                  <button type="button" onClick={() => setShowSugg((v) => !v)} aria-expanded={showSugg} aria-controls="ask-presets">
                    {showSugg ? "Hide suggestions" : "Suggestions"}
                  </button>
                  <button type="button" onClick={startOver}>
                    Start over
                  </button>
                </>
              )}
              {prefWords.length > 0 && (
                <span className="ask-prefs">
                  Display: {prefWords.join(" · ")}
                  <button type="button" onClick={resetPrefs}>
                    reset
                  </button>
                </span>
              )}
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
