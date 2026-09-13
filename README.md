# portfolio

Personal portfolio — production ML, agentic AI and decision systems, plus open-source ML research and a shipped iOS app.

Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v4. Deployed on Vercel at https://alexander-hsu.com. The site itself is static; one serverless route (`/api/chat`) powers the "Ask about my work" assistant.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

`npm run dev` hot-reloads: edits to anything under `src/` or `public/` appear in the browser within a second, no restart needed. Only `next.config.ts`, `package.json`, and `.env*` require stopping and re-running the command.

If edits made by another program (a sync tool, a remote editor) are not picked up, use the polling watcher instead:

```bash
npm run dev:poll
```

`npm run build` builds the site (static pages plus the `/api/chat` function).

## Where things live

```
src/
├── app/
│   ├── page.tsx                 the whole site: hero, key numbers, chapter overview, feature rows
│   ├── layout.tsx               font, metadata, footer
│   └── globals.css              design tokens (light + dark) and all styles
├── components/
│   ├── FeatureRow.tsx           one full-width row: text + figure
│   ├── JumpCards.tsx            chapter overview strip under the hero
│   ├── KeyFacts.tsx             the four key numbers
│   ├── tutorials.tsx            stepped schematics (auto-play, arrows, dots)
│   ├── scenes.tsx               SVG scenes: B-SOiD, brain decoding, Vowel
│   └── scenes-bank.tsx          SVG scenes: production ML, agents, applications
├── lib/
│   ├── actions.ts               the closed grammar of page actions the assistant may emit
│   ├── page-actions.ts          how each action moves the page (spotlight, step, filter, prefs)
│   ├── prefs.ts                 display preferences (theme, text size, density, contrast, motion, accent)
│   └── chat-prompt.ts           system prompt built from the site data
└── data/
    ├── site.ts                  name, links, headline, key numbers
    ├── projects.ts              ← add / edit rows here
    ├── steps.ts                 schematic step captions (shared by tutorials and the assistant)
    ├── tour.ts                  the guided tour, stop by stop
    └── bot.ts                   public facts, suggestions, refusals and per-row hints for the assistant
public/
└── images/alex.jpg              portrait
private/
└── resume.pdf                   the résumé, served by /api/resume (not a static file)
docs/
├── resume-source.html           ← edit, then re-render to private/resume.pdf (Playwright/Chromium)
├── private/                     fully quantified application résumé (git-ignored)
└── github-profile-README.md     template for github.com/runninghsus/runninghsus
```

Adding a row is one object in `src/data/projects.ts` plus a figure keyed by its slug in `src/app/page.tsx`.

## The assistant ("Ask about my work")

A small grounded chatbot in the bottom-right corner. It answers only from the page data (`src/data/projects.ts`, `src/data/site.ts`) plus the public facts in `src/data/bot.ts`, refuses confidential topics, and points to LinkedIn for anything it doesn't know.

- `src/app/api/chat/route.ts` — calls the Claude API and streams the reply; validates input, caps turns and length, rate-limits per IP.
- `src/lib/chat-prompt.ts` — builds the system prompt from the site data, so the bot can never know more than the page.
- `src/components/AskPanel.tsx` — the launcher, speech bubble and panel.
- `src/components/Avatar.tsx` — the launcher itself: a die-cut sticker of Alex in a doctoral tam, drawn as SVG. CSS in `globals.css` blinks the eyes, moves the mouth while a reply streams (`talking`) and nods with a tassel swing on greeting (`wave`); all of it stops under reduced-motion or the assistant's `motion: off`. The avatar can be dragged anywhere (it snaps to the nearest edge and remembers its spot in `localStorage`); on desktop the open panel can be dragged by its header.
- `src/lib/actions.ts` + `src/lib/page-actions.ts` — the closed set of page actions the bot may emit as tokens in its reply: `[[goto:slug]]`, `[[step:slug:n]]`, `[[expand:slug]]`, `[[filter:chapter|all]]`, `[[highlight:resume|linkedin|github]]`, `[[tour:start|stop]]`, the display preferences (`[[theme:dark|light|auto]]`, `[[textsize:normal|large]]`, `[[density:comfortable|compact]]`, `[[contrast:normal|high]]`, `[[motion:on|off]]`, `[[accent:red|blue|green]]`) and `[[style:reset]]`. The panel strips them from the text and runs only well-formed ones against known targets; step captions live in `src/data/steps.ts` so the prompt and the tutorials share them.
- **Speech bubble** — 1.6 s after load the avatar offers the tour ("Start the tour" / "Not now"), once per browser session. After that it shows one preset question at a time, rotating every 8 s (paused on hover); tapping it asks the question. Lingering on a row for 8 s puts that row's question (`hints` in `src/data/bot.ts`) in the bubble instead, at most three times per visit. Dismissing the bubble, or opening the panel, keeps it quiet for the rest of the session.
- **Preset questions** — `suggestions` in `src/data/bot.ts`. Three show at a time ("More ideas" rotates through the rest) before the first question, and they stay one tap away afterwards behind the panel's "Suggestions" toggle; "Start over" clears the conversation. Scrolling to a row always works: if the page is filtered to another chapter, the filter is dropped first.
- **Guided tour** — `src/data/tour.ts` lists the stops (a row, a schematic step, or a highlight). Visitors start it from the chip in the panel, or the bot starts it with `[[tour:start]]`; a bar at the bottom of the page steps through with Next / ← → / Esc.
- **Display preferences** — `src/lib/prefs.ts` writes `data-*` attributes on `<html>` (persisted in `localStorage`, restored before first paint by the inline boot script in `layout.tsx`); `globals.css` styles them. A "Display: … reset" line in the panel shows what is active. `motion: off` also stops the schematics from auto-playing.
- **Context awareness** — each question is sent with which row is on screen and which step its schematic is on (`context` in the request body); the route appends it to the message as a bracketed line so "this diagram" resolves without asking. The same context feeds the bubble's row-specific questions.

Configuration (Vercel → Settings → Environment Variables, or `.env.local` for development; see `.env.example`):

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Without it the panel shows a polite "not switched on yet" message. |
| `CHAT_MODEL` | no | Defaults to `claude-haiku-4-5`. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | recommended | Shared per-IP and global daily limits across function instances (`CHAT_DAILY_PER_IP`, `CHAT_DAILY_GLOBAL`). |

Also set a monthly spend limit in the Anthropic console as the final backstop. To add facts the bot may state (location, work authorization, notice period), edit `facts` in `src/data/bot.ts`.

## The résumé download

`public/` no longer contains the PDF. `private/resume.pdf` is served by `src/app/api/resume/route.ts` with `Content-Disposition: attachment`. When `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set, the hero button runs a Cloudflare Turnstile check first (invisible unless Cloudflare needs an interaction) and posts the token to the route, which verifies it before sending the file; direct GETs are refused. Without the keys the button is a plain link and the route serves the file, so nothing breaks before setup.

## Deploy

Vercel is connected to `main`: every push builds and deploys automatically. A custom domain can be added under the project's Domains page; then update `url` in `src/data/site.ts` and the résumé header.

## Before publishing — search for `TODO`

```bash
grep -rn "TODO" src/
```

Items marked TODO need confirmation (Huntington start year in the chapter kicker, location).
