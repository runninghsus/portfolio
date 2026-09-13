"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "Download résumé" with a Cloudflare Turnstile check. With no site key configured it is a
 * plain link to /api/resume. With one, clicking runs an invisible check (a visible challenge
 * only when Cloudflare isn't sure), then posts the token to /api/resume, which streams the PDF.
 */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(s);
  });
}

function submit(token: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/resume";
  form.style.display = "none";
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "cf-turnstile-response";
  input.value = token;
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit(); // a Content-Disposition: attachment response downloads without leaving the page
  window.setTimeout(() => form.remove(), 2000);
}

export default function ResumeButton({ className = "btn primary" }: { className?: string }) {
  const [state, setState] = useState<"idle" | "checking" | "challenge" | "error">("idle");
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
    widgetRef.current = null;
  }, []);
  useEffect(() => cleanup, [cleanup]);

  if (!SITE_KEY) {
    return (
      <a href="/api/resume" className={`${className} resume-btn`}>
        Download résumé
      </a>
    );
  }

  const start = async () => {
    if (state === "checking" || state === "challenge") return;
    setState("checking");
    try {
      await loadScript();
      cleanup();
      if (!boxRef.current || !window.turnstile) throw new Error("turnstile");
      widgetRef.current = window.turnstile.render(boxRef.current, {
        sitekey: SITE_KEY,
        appearance: "interaction-only", // invisible unless Cloudflare needs the visitor to do something
        action: "resume",
        callback: (token: string) => {
          setState("idle");
          cleanup();
          submit(token);
        },
        "before-interactive-callback": () => setState("challenge"),
        "error-callback": () => setState("error"),
        "expired-callback": () => setState("idle"),
      });
    } catch {
      setState("error");
    }
  };

  return (
    <span className="resume-gate">
      <button type="button" className={`${className} resume-btn`} onClick={start} disabled={state === "checking"} aria-describedby="resume-gate-note">
        {state === "checking" ? "One moment…" : "Download résumé"}
      </button>
      <span className={`gate-box${state === "challenge" ? " show" : ""}`}>
        <span className="gate-note label" id="resume-gate-note">
          Quick check — keeps the PDF away from scrapers
        </span>
        <div ref={boxRef} />
      </span>
      {state === "error" && (
        <span className="gate-error">
          The check didn&apos;t load. Please try again, or message me on LinkedIn for the PDF.
        </span>
      )}
    </span>
  );
}
