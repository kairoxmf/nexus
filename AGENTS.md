# AGENTS.md — notes for working in this repo (Base44)

## What this app is now
The original NEXUS crisis-platform app was replaced by the user's request: this is now
**Horizon Properties**, a single-page React real-estate website (frontend only, no API needed).
The `backend/`, `apps/`, `shared/`, `scripts/`, `test/` folders and the README describe the old
project and are unused by the running site.

## Running (the only thing that matters)
```
docker compose -f docker-compose.base44.yml up -d
```
- Single `web` service: `node:22`, bind-mounts `frontend/`, runs `npm install` then
  `vite --host 0.0.0.0 --port 5173` (mapped to host **3000**).
- No database, no backend, no external secrets required (`.base44/environment.json` has none).
- Verify: `curl http://localhost:3000/` → 200 with "Horizon Properties" in the HTML.

## App structure (everything under `frontend/src`)
- `data/site.ts` — ALL content: properties (8), team (4), services, stats, nav links,
  contact info, Unsplash image URLs (each URL was curl-verified 200 at import time).
  Property data is a plain TS module so it can later be swapped for API/DB data.
- `pages/` — Home, Properties (search + filters), PropertyDetail (gallery, schedule form),
  About, Services, Team, Contact, NotFound.
- `components/home|properties|team|layout|ui` — reusable sections; `PropertyCard`,
  `Gallery`, `Reveal` (IntersectionObserver fade-up), `PageHero`, `SectionHeading`, `Logo`.
- `context/FavoritesContext.tsx` — favorites persisted in localStorage.
- Design system: Tailwind theme colors in `frontend/tailwind.config.js`
  (navy `#16324F`/`#0C1F35`, gold `#C8A15C`, ivory/mist backgrounds) + shared CSS
  (buttons, reveal animation, carousel snapping, fields) in `src/styles/global.css`.
  Font: Manrope (Google Fonts, loaded in `index.html`).

## Quirks
- The featured-properties carousel is hand-rolled: a CSS scroll-snap track with
  mouse-drag via pointer events (`is-dragging` class disables snap while dragging;
  click capture suppresses link clicks after a real drag).
- Header is fixed; it is transparent only over the Home hero and solid navy elsewhere —
  inner pages use `PageHero` (pt-32+) so content clears the fixed header.
- Carousel track side padding must match the `.shell` padding math
  (`max(1.25rem, calc((100vw - 80rem)/2 + 2.5rem))`) or cards won't align with the page grid.
