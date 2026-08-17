# NEXUS — AI-Powered Autonomous City Recovery Platform

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](.github/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.12+-green)](backend/requirements.txt)
[![React](https://img.shields.io/badge/React-19-61dafb)](frontend/package.json)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688)](backend/app/main.py)

**NEXUS** is an AI-powered digital twin and crisis simulation platform for urban resilience. It models Washington D.C. in real-time 3D, triggers disasters, coordinates multi-agent AI recovery, and connects citizens through SOS dispatch — all in one integrated command center.

> **Persian / فارسی:** پلتفرم بازیابی شهری هوشمند با Digital Twin سه‌بعدی، شبیه‌سازی بحران، AI چندعاملی و اپ Citizen برای SOS.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Presentation](#presentation)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Modules (9 Phases)](#modules-9-phases)
- [Demo Accounts](#demo-accounts)
- [Environment Variables](#environment-variables)
- [Docker & Kubernetes](#docker--kubernetes)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| Python | 3.12+ |
| npm | 10+ |
| Docker | Optional (PostgreSQL) |
| Disk space | **2 GB+ free** |

### One-Command Startup (Windows)

```powershell
cd "d:\USA F2"
.\scripts\stop.ps1
.\scripts\start.ps1
```

| Service | URL |
|---------|-----|
| **Command Center** | http://localhost:5173/command |
| **Backend API Docs** | http://localhost:8000/docs |
| **Citizen App** | http://localhost:5174 |
| **Health Check** | http://localhost:8000/health |

### Manual Startup

```powershell
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000 --env-file .env

# Command Center
cd frontend
npm install
npm run dev

# Citizen App
cd apps/citizen
npm install
npm run dev
```

---

## Presentation

**Full presentation guide:** [PRESENTATION.md](PRESENTATION.md)  
**5-minute live demo script:** [scripts/DEMO-5MIN.md](scripts/DEMO-5MIN.md)

### Pre-Demo Checklist

1. Run `.\scripts\start.ps1` and wait for all 3 services
2. Open http://localhost:5173/command
3. Login: `commander` / `nexus123`
4. Click **5-Min Demo** (دمو ۵ دقیقه) in bottom tab bar
5. Use **Demo Lite** in Visual Wow for smooth performance

### Demo Flow (5 min)

| Time | Action |
|------|--------|
| 0:00 | Show metrics bar (100% city health) |
| 1:00 | Trigger Earthquake magnitude 7 on map |
| 2:15 | War Room → Mayor decision |
| 2:45 | SOS dispatch tab |
| 3:45 | Enable Recovery + Before/After slider |
| 4:45 | Crisis Wrapped share card |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXUS Platform                            │
├──────────────┬──────────────────────┬───────────────────────────┤
│   Frontend   │       Backend        │      Citizen App          │
│  React 19    │     FastAPI 0.115    │      React 19             │
│  Three.js    │     WebSocket /ws    │      SOS + AR Evac        │
│  Deck.gl     │     Simulation Tick  │      Shelter Finder       │
│  MapLibre    │     Multi-LLM AI     │      Family Safety        │
│  Port 5173   │     Port 8000        │      Port 5174            │
├──────────────┴──────────────────────┴───────────────────────────┤
│  PostgreSQL + PostGIS  │  Redis  │  JWT Auth  │  Alembic        │
└─────────────────────────────────────────────────────────────────┘
```

```
USA F2/
├── backend/              # FastAPI simulation engine + WebSocket + AI + Auth
│   ├── app/
│   │   ├── api/          # REST routes (simulation, ai, citizen, mega, ...)
│   │   ├── engine/       # Simulator, grid, impact matrix
│   │   ├── services/     # Live engine, LLM router, persistence
│   │   └── db/           # SQLAlchemy models + Alembic
│   └── requirements.txt
├── frontend/             # Command Center (React + Three.js 3D)
│   └── src/
│       ├── pages/        # Command, Intel, Auth, Admin
│       ├── components/   # 3D city, panels, Visual Wow
│       └── hooks/        # useSimulation (WebSocket + API)
├── apps/citizen/         # Citizen safety app (SOS, routes, shelters)
├── shared/               # Shared icons + i18n
├── infrastructure/       # Docker Compose, Kubernetes
└── scripts/              # start.ps1, stop.ps1, DEMO-5MIN.md
```

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | FastAPI, Uvicorn, SQLAlchemy, asyncpg, Alembic, python-jose, NetworkX |
| **Frontend** | React 19, Vite 6, TypeScript, Three.js, React Three Fiber, Deck.gl, MapLibre, Tailwind |
| **Citizen** | React 19, Vite, Three.js (AR Evacuation) |
| **AI** | OpenAI, Anthropic, Gemini, Groq (with rule-engine fallback) |
| **Infra** | Docker, PostgreSQL/PostGIS, Redis, Kubernetes, GitHub Actions CI |

---

## Modules (9 Phases)

### Phase 1 — Simulation Lab
- What-If scenario panel (`/api/v1/simulation/what-if`)
- Interactive cascade dependency graph
- Auto-generated crisis replay report + PDF export

### Phase 2 — Live Simulation
- Emergency vehicles on 3D map (ambulance, fire, helicopter, police)
- Citizen behavior agent metrics
- Weather overlay (rain, smoke, heat, wind)
- Satellite scan animation during active crisis

### Phase 3 — Citizen Platform
- SOS dispatch, safe route, shelter finder, family safety check
- AI citizen assistant (`/api/v1/citizen/*`)

### Phase 4 — Real AI
- Multi-LLM router (OpenAI, Anthropic, Gemini) with rule-engine fallback
- AI Copilot, Mayor briefing, Debate endpoints
- Executive briefing PDF generation

### Phase 5 — Production
- PostgreSQL + PostGIS models + Alembic migrations
- JWT auth + multi-tenant RBAC demo users
- Docker Compose (postgres, redis, backend, frontend, citizen)
- Kubernetes manifests + GitHub Actions CI

### Phase 6 — Mega AI Platform
- Federated Cities Network, AI vs Human Challenge, Social Network Simulation
- Black Box AI Recorder, Disaster Movie Generator, Drone Swarm
- AI Crisis Commander, World Disaster Knowledge Engine
- Infrastructure Failure Chain AI, AI Governor, Digital Civilization Simulator

### Phase 7 — Creative Crisis Platform
- Multiplayer War Room, 72-Hour Early Warning, Butterfly Effect
- Crisis News Network, SOS → 3D Sync, Ethical Dilemma Engine
- Voice Command Center, Pulse of the City, Crisis Podcast Generator
- Any City Digital Twin (DC, NYC, Tehran, Tokyo)

### Phase 8 — Extended Platform
- Crisis Escape Room, Disaster Roulette, Recovery Speedrun
- Adversarial AI, Oracle, Red Team Scanner
- Satellite Phone Network, OSM City Import, Refugee Flow
- Responder Certification, Resource Marketplace, Blockchain Ledger

### Phase 9 — Immersive Crisis
- DC Landmarks 3D, WMATA Metro, Live Traffic System
- Crisis Cinema Mode, Mayor Social Simulator, Diplomatic War Room
- Climate 2050, AR Evacuation, Persian AI Full Stack
- Voice Commander Bidirectional, AI News Anchor, Spectator Mode
- 2v2 Crisis, Global Leaderboard, Historical Replay, Push Notifications

---

## Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| `commander` | `nexus123` | Admin / full access |
| `analyst` | `nexus123` | Analyst |
| `citizen` | `nexus123` | Citizen |

Auth is optional in dev (`AUTH_REQUIRED=false`).

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://nexus:nexus@localhost:5432/nexus
AUTH_REQUIRED=false
JWT_SECRET=change-me-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# AI (optional — rule-engine fallback works without keys)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
OPENWEATHER_API_KEY=
```

---

## Docker & Kubernetes

### Docker Full Stack

```powershell
cd "d:\USA F2\infrastructure\docker"
docker compose up --build
```

Services: postgres, redis, backend (8000), frontend (5173), citizen (5174).

### Kubernetes

```bash
kubectl apply -f infrastructure/k8s/nexus.yaml
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/state` | Full simulation state |
| POST | `/api/v1/disaster/trigger` | Trigger disaster |
| POST | `/api/v1/simulation/what-if` | What-if scenario |
| POST | `/api/v1/ai/chat` | Multi-LLM AI chat |
| POST | `/api/v1/citizen/sos` | Citizen SOS |
| POST | `/api/v1/auth/login` | JWT login |
| GET | `/api/v1/mega/state` | Mega AI platform state |
| GET | `/api/v1/creative/state` | Creative platform state |
| GET | `/api/v1/extended/state` | Extended platform state |
| GET | `/api/v1/immersive/state` | Immersive platform state |
| WS | `/ws` | Real-time state broadcast |

Full interactive docs: http://localhost:8000/docs

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend not starting | Delete `backend\.venv`, rerun `start.ps1` |
| Port 8000/5173/5174 in use | Run `.\scripts\stop.ps1` |
| Map won't pan | Turn off **Photo Mode** in map toolbar |
| UI cluttered | Enable **Demo Lite** in Visual Wow |
| Database unavailable | Normal — runs in memory mode without Docker |
| `ENOSPC: no space left` | Free disk space (need 2 GB+) |
| Docker backend build fails | Ensure context is `../../backend` in docker-compose |
| WebSocket disconnected | Check backend on :8000; Vite proxies `/ws` |

---

## Development

```powershell
# TypeScript check
cd frontend && npm run typecheck

# Backend import test
cd backend && .\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"

# Citizen build
cd apps/citizen && npm run build
```

CI runs on push to `main` / `develop`: backend import, frontend typecheck, citizen build.

---

## License & Credits

NEXUS City Recovery Platform — Washington D.C. Digital Twin for crisis simulation and urban resilience research.

---

**Ready for presentation?** → See [PRESENTATION.md](PRESENTATION.md)

**فارسی:** برای پرزنت → [PRESENTATION.md](PRESENTATION.md) و [scripts/DEMO-5MIN.md](scripts/DEMO-5MIN.md)
