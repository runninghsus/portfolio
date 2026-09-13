"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { suggestions } from "@/data/bot";
import { site } from "@/data/site";

type Msg = { role: "user" | "assistant"; content: string };

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

export default function AskPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  // hand focus back to the input once a reply has finished streaming
  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [busy, open]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
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
        body: JSON.stringify({ messages: history.slice(-8) }),
        signal: ctrl.signal,
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const snapshot = acc;
        setMsgs((cur) => cur.map((m, i) => (i === cur.length - 1 ? { ...m, content: snapshot } : m)));
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

  return (
    <>
      <button type="button" className={`ask-fab${open ? " hidden-fab" : ""}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
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
                  A small assistant that answers from what&apos;s on this page — nothing more. For anything it doesn&apos;t know,{" "}
                  <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                    message Alex on LinkedIn
                  </a>
                  .
                </p>
                <div className="ask-sugg">
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

          <form className="ask-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
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
