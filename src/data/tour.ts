/**
 * The guided tour: scripted stops the assistant (or the "tour" chip) walks a visitor through.
 * Each stop moves the page and shows a short narration. No model call is involved.
 */
export type TourStop = {
  title: string;
  text: string;
  /** what to do on the page when this stop is shown */
  go: { kind: "top" } | { kind: "selector"; selector: string } | { kind: "row"; slug: string } | { kind: "step"; slug: string; step: number } | { kind: "highlight"; target: "resume" | "linkedin" | "github" };
};

export const tour: TourStop[] = [
  {
    title: "Who this is",
    text: "Alex leads production ML and agentic AI work in commercial banking, after a Ph.D. building open-source ML tools used by 100+ labs. The four numbers here are the shape of the work: validation, agents, scale, adoption.",
    go: { kind: "top" },
  },
  {
    title: "Three chapters",
    text: "Huntington National Bank (now), Carnegie Mellon (the Ph.D.), and a shipped iOS app. Each card jumps to one piece of work; each piece of work has its own schematic.",
    go: { kind: "selector", selector: ".overview" },
  },
  {
    title: "Production ML, monitored at three points",
    text: "Likelihood models across 30+ products feed one ranking layer. The part to notice is the monitor band: data quality, model quality and decision usefulness are three different failures, so they get three different checks.",
    go: { kind: "step", slug: "production-ml", step: 5 },
  },
  {
    title: "Agents that verify before they trust",
    text: "Specialist agents, a discussion layer with a human in it, an orchestrator that reconciles, and a verification layer that checks conclusions against source data. Being scaled to hundreds of bankers.",
    go: { kind: "step", slug: "agentic-ai", step: 4 },
  },
  {
    title: "From messy data to decisions",
    text: "Resolve inconsistent records, calculate context-specific signals, let the user change an input and watch the answer change, then act — in the tool, not a deck.",
    go: { kind: "step", slug: "data-apps", step: 3 },
  },
  {
    title: "Open-source ML with 100+ labs behind it",
    text: "B-SOiD finds behaviors in pose data without a single human label. Nature Communications, 2021; a no-code app that labs without programmers run.",
    go: { kind: "step", slug: "b-soid", step: 3 },
  },
  {
    title: "Expert-guided learning",
    text: "A-SOiD asks the expert only about the frames it is unsure of — the same human-in-the-loop idea as the agent work, five years earlier. Nature Methods, 2024.",
    go: { kind: "step", slug: "a-soid", step: 4 },
  },
  {
    title: "Reading behavior from the brain",
    text: "160 TB of synchronized video and neural recordings, decoded into what the animal is doing from the neural signal alone.",
    go: { kind: "step", slug: "neural-decoding", step: 3 },
  },
  {
    title: "A shipped product",
    text: "Vowel for Weddings: a native iOS app with a grounded assistant that hands off to the host when it doesn't know — first used at Alex's own wedding by 30+ guests.",
    go: { kind: "step", slug: "vowel", step: 3 },
  },
  {
    title: "That's the tour",
    text: "The one-page résumé is behind the button at the top, and LinkedIn is the way to reach Alex. Ask me anything about what you saw.",
    go: { kind: "highlight", target: "resume" },
  },
];
