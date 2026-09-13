# portfolio

Personal portfolio — production ML, agentic AI and decision systems, plus open-source ML research and a shipped iOS app.

Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v4. Deployed on Vercel at https://alexanderhsu.vercel.app. The site itself is static; one serverless route (`/api/chat`) powers the "Ask about my work" assistant.

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
└── data/
    ├── site.ts                  name, links, headline, key numbers
    └── projects.ts              ← add / edit rows here
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
- `src/components/AskPanel.tsx` — the button and panel.
- `src/lib/actions.ts` + `src/lib/page-actions.ts` — the closed set of page actions the bot may emit as tokens in its reply (`[[goto:slug]]`, `[[step:slug:n]]`, `[[filter:chapter]]`, `[[theme:dark|light|auto]]`, `[[expand:slug]]`, `[[highlight:resume|linkedin|github]]`). The panel strips them from the text and runs only well-formed ones against known targets; step captions live in `src/data/steps.ts` so the prompt and the tutorials share them.

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
