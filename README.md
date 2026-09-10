# SCADA One

Browser-based SCADA/HMI with **UDTs**, large simulated plant, control popups, and a **SQL historian** (Neon Postgres).

## Quick start

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL for historian
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Reset** after upgrades to load the latest seed.

## Tabs

| Tab | Purpose |
|-----|---------|
| Library | Widget templates (process, indicators, controls, faceplates, text) |
| UDTs | Equipment type definitions (PumpUDT, ValveUDT, …) |
| Tags | Live tag database (unique names from UDT instances) |
| Designer | Screens, place templates, bind tags, orthogonal pipes |
| Runtime | Live HMI — click object for control popup |
| Historian | SQL time-series query / manual flush |
| OPC UA | Endpoint + mappings (sim connect for now) |

## Plant seed (v5)

- **20 pumps** (`P_01`…`P_20`) via PumpUDT  
- **20 valves** (`XV_01`…`XV_20`) via ValveUDT  
- Plus control valves, tanks, motors, blowers, compressors, filters, HEX, conveyors, PID/temp/flow loops, VFDs, reactor, vessels, HS discretes  
- Screens: Process Train, Pump Farm (piped), Valve Gallery, Utilities & Pack, Control Loops, Live Tag Board  
- Multi-layer metallic pipes with flanges + flow animation — click **Reset** after pull to load 

## SQL Historian

- Neon Postgres table `historian_samples`  
- Auto-sample every 5s while Sim RUN (key PV/status tags)  
- API: `/api/historian/ingest`, `/query`, `/status`  
- Set `DATABASE_URL` in `.env.local` and in Vercel project settings  

## Vercel

1. Import the GitHub repo (Next.js)  
2. Add env `DATABASE_URL` (Neon connection string)  
3. Deploy  

## Extending

1. Add UDT members in `src/lib/udt.ts`  
2. Add library item in `src/lib/library-catalog.ts`  
3. Add widget renderer in `src/components/widgets/registry.tsx`  
4. Instantiate in `src/lib/seed.ts`  
