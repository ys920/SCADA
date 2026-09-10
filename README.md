# SCADA One

Browser-based SCADA/HMI platform: **Library**, **Tags**, **Designer**, **Runtime**, and **OPC UA** configuration.

Phase 1 ships a complete engineering + operator shell with a **simulation tag engine**. Real OPC UA I/O is designed for a companion gateway (Phase 2); the web app is ready for **Vercel**.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tabs

| Tab | What it does |
|-----|----------------|
| Library | Industrial templates (tank, valve, pump, gauges, PID faceplate, …) |
| Tags | Master tag list with live sim values and profile editors |
| Designer | Create screens, place templates, bind tags, draw connections |
| Runtime | Live operator view of screens |
| OPC UA | Endpoint + security + node→tag mappings (simulated connect for now) |

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new) — framework preset **Next.js**.
3. Build command: `npm run build` (default). No env vars required for Phase 1.

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for architecture, data model, and roadmap.

## Stack

- Next.js (App Router) + React 19 + TypeScript + Tailwind CSS 4
- Zustand (persisted project state in `localStorage`)
- Client-side simulation ticker (~500 ms)

## Extending the library

1. Add an entry in `src/lib/library-catalog.ts`
2. Add a renderer in `src/components/widgets/registry.tsx`
