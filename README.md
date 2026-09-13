# portfolio

Personal portfolio — production ML, agentic AI and decision systems, plus open-source ML research and a shipped iOS app.

Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v4. Statically exported, so it deploys to Vercel, GitHub Pages, or Cloudflare Pages with no server.

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

`npm run build` produces a static site in `out/`.

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
├── resume.pdf                   the résumé the hero button downloads
└── images/alex.jpg              portrait
docs/
├── resume-source.html           ← edit, then re-render to PDF (Playwright/Chromium)
├── Alexander_Hsu_Resume_2026.pdf
└── github-profile-README.md     template for github.com/runninghsus/runninghsus
```

Adding a row is one object in `src/data/projects.ts` plus a figure keyed by its slug in `src/app/page.tsx`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to vercel.com → **Add New Project** → import `runninghsus/portfolio`. Framework preset is detected as Next.js; leave the defaults.
3. Every push to `main` redeploys. Add a custom domain under Project → Settings → Domains when you have one.

## Deploy to GitHub Pages (alternative)

Because the site is a static export, GitHub Pages also works. Uncomment the workflow in `.github/workflows/pages.yml`, set `basePath: "/portfolio"` in `next.config.ts` (or use a custom domain), and enable Pages → Source: GitHub Actions in the repo settings.

## Before publishing — search for `TODO`

```bash
grep -rn "TODO" src/
```

Items marked TODO need confirmation (Huntington start year in the chapter kicker, location).
