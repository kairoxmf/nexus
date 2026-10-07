# AGENTS.md — notes for working in this repo (Base44)

## What this app is now
The original NEXUS app and later Horizon Properties were both replaced: this is now
**Built Right Construction**, a multi-page React marketing site (frontend only, no API needed).
The `backend/`, `apps/`, `shared/`, `scripts/`, `test/` folders and the README describe the old
project and are unused by the running site.

## Running (the only thing that matters)
```
docker compose -f docker-compose.base44.yml up -d
```
- Single `web` service: `node:22`, bind-mounts `frontend/`, runs `npm install` then
  `vite --host 0.0.0.0 --port 5173` (mapped to host **3000**).
- No database, no backend, no external secrets required (`.base44/environment.json` has none).
- Verify: `curl http://localhost:3000/` → 200 with "Built Right Construction" in the title.

## App structure (everything under `frontend/src`)
- `data/site.ts` — ALL content and types: brand/contact, nav (with dropdown children built from
  data), 8 projects (each with gallery, scope, challenge/solution, facts), 8 services,
  8 industries, team (4), 6 blog posts, jobs, benefits, stats, partners, testimonials.
  Plain TS module so it can later be swapped for API/DB data. Unsplash image URLs were
  curl-verified 200 at build time.
- `pages/` — Home, About, Services, ServiceDetail, Projects (working search/filters/sort),
  ProjectDetail (gallery + lightbox), Industries, IndustryDetail, Careers, Blog, BlogPost,
  Contact (validated quote form), Legal (privacy/terms), NotFound.
- `components/layout/` — Header (navy top info bar + sticky white nav with hover dropdowns and
  a full-screen navy mobile menu; body scroll lock, Esc to close), Footer, ScrollToTop.
- `components/home/` — Hero (staggered entrance), ServiceStrip (navy floating strip overlapping
  hero via `-mt-24`), FeaturedProjects, ServicesSection (editorial numbered rows), WhyChoose,
  IndustriesSection, TrustedBy, TeamSection, BlogSection.
- `components/common/` — CtaSection (dark cinematic banner, optional stats), StatsSection,
  ContactForm (client-side validation, loading/success/error states; simulated submit — no backend).
- `components/projects/` — ProjectCard, ProjectFilter (search + category pills + selects + sort),
  Gallery (thumbnail nav + fullscreen lightbox with Esc/arrow keys and touch swipe).
- `components/ui/` — Reveal (IntersectionObserver fade-up), SectionHeading (left + optional
  right action), PageHero, Logo (light/dark variants), CountUp, ServiceIcon (lucide key map).
- Design system: Tailwind theme in `frontend/tailwind.config.js`
  (navy `#132F52`/`#0A2038`/`#061323`, gold `#E9A51F` + `gold-dark #C7870C`) and shared CSS in
  `src/styles/global.css` (`.shell`, `.eyebrow`, `.btn*`, `.field`, `.reveal`, hero entrance,
  image zoom, reduced-motion fallbacks). Font: Manrope (Google Fonts, `index.html`).

## Quirks
- Header is NOT fixed overlay: top bar scrolls away, white nav is `sticky top-0` — inner pages
  do not need top padding to clear it (PageHero has modest pt).
- The ServiceStrip must keep enough bottom hero padding (`pb-36/40`) so it doesn't collide with
  hero CTAs — it pulls up with negative margin over the hero image.
- Nav dropdown data is built AFTER the content arrays in `site.ts` (nav block sits near the
  bottom on purpose — `const` TDZ).
- Quote form has no backend; submission is simulated with a 900ms delay → success panel.
- Careers "Apply Now" routes to `/contact` with `state.interest` used to prefill the form.
