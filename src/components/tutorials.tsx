"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Card, ArrowRight, Tile, Defs, R, INK, T, type Reveal, BsoidBody, BrainBody, VowelBody } from "./scenes";
import { PipelineBody, AgentsBody, AppsBody, BANK_H } from "./scenes-bank";
import { tutorialSteps } from "@/data/steps";

/* ------------------------------------------------------------------ */
/* Generic stepped tutorial: auto-plays, pauses on hover/focus, arrows  */
/* and dots to navigate, last step shows the whole picture.              */
/* ------------------------------------------------------------------ */

function Tutorial({ slug, interval = 4000, height = 268, children }: { slug: string; interval?: number; height?: number; children: (reveal: Reveal, step: number) => ReactNode }) {
  const { label, steps } = tutorialSteps[slug];
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false); // parked on a step by the assistant
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const sync = () => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off");
    sync();
    window.addEventListener("prefs:change", sync);
    return () => window.removeEventListener("prefs:change", sync);
  }, []);
  useEffect(() => {
    if (paused || reduced || held) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps.length), interval);
    return () => window.clearInterval(id);
  }, [paused, reduced, held, steps.length, interval]);
  // The site assistant can park a tutorial on a step: window.dispatchEvent(new CustomEvent("tutorial:go", { detail: { slug, step } }))
  useEffect(() => {
    let timer = 0;
    const onGo = (e: Event) => {
      const d = (e as CustomEvent<{ slug: string; step: number }>).detail;
      if (!d || d.slug !== slug) return;
      const n = Math.min(Math.max(Math.round(d.step) - 1, 0), steps.length - 1);
      setStep(n);
      setHeld(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setHeld(false), 20000);
    };
    window.addEventListener("tutorial:go", onGo);
    return () => {
      window.removeEventListener("tutorial:go", onGo);
      window.clearTimeout(timer);
    };
  }, [slug, steps.length]);

  const last = steps.length - 1;
  const go = (n: number) => setStep(((n % steps.length) + steps.length) % steps.length);
  const reveal: Reveal = (at) => {
    const o = step === last ? 1 : step === at ? 1 : step > at ? 0.45 : 0;
    return { opacity: o, transition: "opacity .45s ease" };
  };

  return (
    <div
      className="tutorial"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="fig" style={{ aspectRatio: `400 / ${height}` }}>
        <svg
          viewBox={`0 0 400 ${height}`}
          role="img"
          aria-label={`${label} — step ${step + 1} of ${steps.length}: ${steps[step].title}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(step + 1);
            if (e.key === "ArrowLeft") go(step - 1);
          }}
        >
          {children(reveal, step)}
        </svg>
      </div>
      <div className="tutorial-bar">
        <div className="tutorial-caption" aria-live="polite">
          <span className="tutorial-step">{step + 1}</span>
          <span>
            <b>{steps[step].title}</b>
            {steps[step].note && <span className="tutorial-note"> — {steps[step].note}</span>}
          </span>
        </div>
        <div className="tutorial-nav">
          <button type="button" onClick={() => go(step - 1)} aria-label="Previous step">
            ‹
          </button>
          <div className="tutorial-dots">
            {steps.map((st, i) => (
              <button
                key={i}
                type="button"
                className={i === step ? "on" : undefined}
                onClick={() => go(i)}
                aria-label={`Step ${i + 1}: ${st.title}`}
                aria-current={i === step ? "step" : undefined}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(step + 1)} aria-label="Next step">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B-SOiD                                                               */
/* ------------------------------------------------------------------ */
export function BsoidTutorial() {
  return (
    <Tutorial slug="b-soid">
      {(reveal) => <BsoidBody reveal={reveal} />}
    </Tutorial>
  );
}

/* ------------------------------------------------------------------ */
/* A-SOiD                                                               */
/* ------------------------------------------------------------------ */
function AsoidBody({ reveal, step }: { reveal: Reveal; step: number }) {
  const p = "ast";
  const seeds = new Set([3, 11, 22]);
  const G = 16;
  return (
    <>
      <Defs p={p} />
      <g style={reveal(0)}>
        <Card x={14} y={30} w={106} h={96} p={p}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Tile key={i} x={8 + (i % 6) * G} y={10 + Math.floor(i / 6) * G} kind={seeds.has(i) ? "seed" : "blank"} />
          ))}
        </Card>
        <text x="67" y="142" textAnchor="middle" fill={INK} {...T}>a few labels</text>
      </g>
      <g style={reveal(1)}>
        <ArrowRight x1={124} x2={142} y={78} />
        <Card x={144} y={52} w={66} h={52} p={p}>
          <g fill={R}>
            <circle cx="33" cy="12" r="4" />
            <circle cx="20" cy="27" r="4" />
            <circle cx="46" cy="27" r="4" />
            <circle cx="13" cy="42" r="3.2" fillOpacity=".7" />
            <circle cx="27" cy="42" r="3.2" fillOpacity=".7" />
            <circle cx="39" cy="42" r="3.2" fillOpacity=".7" />
            <circle cx="53" cy="42" r="3.2" fillOpacity=".7" />
          </g>
          <path d="M33 12 L20 27 M33 12 L46 27 M20 27 L13 42 M20 27 L27 42 M46 27 L39 42 M46 27 L53 42" stroke={INK} strokeOpacity=".5" strokeWidth="1.2" fill="none" />
        </Card>
        <text x="177" y="120" textAnchor="middle" fill={INK} {...T}>model</text>
        <ArrowRight x1={214} x2={232} y={78} />
      </g>
      <g style={reveal(2)}>
        <Card x={234} y={30} w={152} h={62} p={p}>
          <text x="8" y="14" fill="#161513" {...T}>confident → keep</text>
          {Array.from({ length: 16 }).map((_, i) => (
            <Tile key={i} x={8 + (i % 8) * G} y={22 + Math.floor(i / 8) * G} kind="model" />
          ))}
        </Card>
      </g>
      <g style={reveal(3)}>
        <Card x={234} y={100} w={152} h={40} p={p}>
          <text x="8" y="14" fill={R} {...T}>unsure → ask</text>
          {[0, 1, 2].map((i) => (
            <Tile key={i} x={8 + i * G} y={21} kind="ask" />
          ))}
        </Card>
        <g transform="translate(282,160)">
          <path d="M10 -16 V -4" stroke={R} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6 -4 L10 2 L14 -4" fill="none" stroke={R} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="16" r="10" fill={INK} fillOpacity=".25" />
          <circle cx="10" cy="12" r="4" fill={INK} fillOpacity=".7" />
          <path d="M2 22 a8 8 0 0 1 16 0" fill={INK} fillOpacity=".7" />
          <text x="28" y="20" fill="#161513" {...T}>expert</text>
        </g>
      </g>
      <g style={reveal(4)}>
        <path d="M280 178 H 67 V 136" fill="none" stroke={R} strokeOpacity=".8" strokeWidth="1.6" strokeDasharray="3 4" />
        <path d="M62 141 L67 134 L72 141" fill="none" stroke={R} strokeOpacity=".9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="182" y="192" textAnchor="middle" fill={R} {...T}>labels go back in → retrain</text>
      </g>
      <g style={reveal(5)}>
        <text x="14" y="222" fill="#161513" {...T}>human labels needed</text>
        <rect x="14" y="232" width="372" height="16" rx="3" fill="none" stroke={INK} strokeOpacity=".4" />
        <rect x="14" y="232" width={step >= 5 ? 44.6 : 0} height="16" rx="3" fill={R} style={{ transition: "width .8s ease" }} />
        <text x="66" y="244" fill={R} {...T}>A-SOiD · 12%</text>
        <text x="386" y="244" fill={INK} textAnchor="end" {...T}>by hand · 100%</text>
      </g>
    </>
  );
}

export function AsoidTutorial() {
  return (
    <Tutorial slug="a-soid">
      {(reveal, step) => <AsoidBody reveal={reveal} step={step} />}
    </Tutorial>
  );
}

/* ------------------------------------------------------------------ */
/* Brain chatter → behavior                                             */
/* ------------------------------------------------------------------ */
export function BrainTutorial() {
  return (
    <Tutorial slug="neural-decoding">
      {(reveal) => <BrainBody reveal={reveal} />}
    </Tutorial>
  );
}

/* ------------------------------------------------------------------ */
/* Vowel                                                                */
/* ------------------------------------------------------------------ */
export function VowelTutorial() {
  return (
    <Tutorial slug="vowel">
      {(reveal) => <VowelBody reveal={reveal} />}
    </Tutorial>
  );
}

/* ------------------------------------------------------------------ */
/* Huntington · production ML: the lifecycle, monitored at three points */
/* ------------------------------------------------------------------ */
export function PipelineTutorial() {
  return (
    <Tutorial slug="production-ml" height={BANK_H}>
      {(reveal) => <PipelineBody reveal={reveal} />}
    </Tutorial>
  );
}

/* ------------------------------------------------------------------ */
/* Huntington · agentic AI: four layers                                 */
/* ------------------------------------------------------------------ */
export function AgentsTutorial() {
  return (
    <Tutorial slug="agentic-ai" interval={4500} height={BANK_H}>
      {(reveal) => <AgentsBody reveal={reveal} />}
    </Tutorial>
  );
}

/* ------------------------------------------------------------------ */
/* Huntington · intelligent data applications                           */
/* ------------------------------------------------------------------ */
export function AppsTutorial() {
  return (
    <Tutorial slug="data-apps" height={BANK_H}>
      {(reveal) => <AppsBody reveal={reveal} />}
    </Tutorial>
  );
}
