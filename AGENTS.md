# Horizon Properties — Real Estate Website

## Overview
Premium real estate agency website built with React 19, Vite 6, Tailwind CSS 3, and react-router-dom 7. The frontend lives in `frontend/` and replaces the previous NEXUS Digital Twin app.

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite 6 (dev server on port 5173, mapped to host 3000)
- **Styling:** Tailwind CSS 3 + custom CSS design system (`src/styles/horizon.css`, `src/styles/horizon-components.css`)
- **Routing:** react-router-dom 7
- **Icons:** lucide-react
- **Fonts:** Archivo (display/headings) + Inter (body), loaded from Google Fonts

## Design System
- **Colors:** Deep Navy `#0A192F`, Ivory `#FDFCF8`, Champagne `#C5A059`, Ink `#050B14`, Architectural Gray `#E5E2DA`
- **Typography:** Archivo for headings (700-800 weight), Inter for body (400-500 weight)
- **Buttons:** Sharp-cornered "architectural rectangles" (2px radius), not pills
- **Spacing:** Generous section padding (clamp 80-160px), 1280px max container width

## Architecture
```
frontend/src/
  App.tsx                    — Routes (/, /properties, /properties/:id, /contact)
  main.tsx                   — Entry point (BrowserRouter + ErrorBoundary)
  data/
    properties.ts            — 8 properties with full data + filter helpers
    content.ts               — Services, team, why-choose, hero/about images
  hooks/
    useScrollReveal.ts       — IntersectionObserver-based fade-up animation
    useFavorites.ts          — localStorage-backed favorites
  components/horizon/
    Header.tsx               — Sticky header, transparent→solid on scroll, mobile menu
    Footer.tsx               — 4-column footer with newsletter signup
    Button.tsx               — Reusable button (5 variants)
    PropertyCard.tsx         — Reusable property card with favorite button
    PropertyCarousel.tsx     — Drag/swipe carousel with nav arrows
    PropertyFilters.tsx      — Search + location/type/price/beds/baths/sort filters
    PropertyGallery.tsx      — Image gallery with thumbnails + fullscreen viewer
    ScrollReveal.tsx         — Wrapper for scroll-triggered animations
    ServiceIcon.tsx          — Icon mapper for services
    HeroSection.tsx          — Full-bleed hero
    AboutSection.tsx         — Asymmetric image composition
    FeaturedPropertiesSection.tsx
    ServicesSection.tsx      — 6 services on navy background
    WhyChooseSection.tsx     — Stats + descriptions
    TeamSection.tsx         — 4 team members
    CTASection.tsx           — Call to action
  pages/horizon/
    HomePage.tsx             — Composes all sections
    PropertiesPage.tsx       — Filterable property grid
    PropertyDetailPage.tsx   — Gallery, specs, agent sidebar, similar properties
    ContactPage.tsx          — Contact form + info
```

## Development
```bash
docker compose -f docker-compose.base44.yml up -d
# App at http://localhost:3000
```

## Key Decisions
- The app is frontend-only with mock data in `data/properties.ts`, structured for future backend connection
- Images use Unsplash photo URLs (verified working IDs)
- Vite config conditionally enables `allowedHosts` only when `BASE44_PREVIEW_MODE=1`
- The previous NEXUS app's complex providers (i18n, auth, nexus context) are not used; main.tsx is simplified to BrowserRouter + ErrorBoundary only
