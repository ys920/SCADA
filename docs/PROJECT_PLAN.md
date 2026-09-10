# SCADA One — Product Plan & Architecture

## End goal

**SCADA One** is a browser-based SCADA/HMI platform where engineers design process screens from a reusable library, bind them to tags, and operators run those screens live — starting with a full simulation layer, then connecting to real PLCs through OPC UA.

The product quality bar:

- Feels like a real industrial tool (fast, dense, keyboard-friendly), not a marketing site
- Clear separation between **engineering** (library, tags, designer, OPC UA) and **operations** (runtime)
- Data model ready for multi-screen projects, tag sources, and future multi-user sync
- Deployable on **Vercel** for the HMI/web layer; long-running OPC UA I/O runs as a separate edge/worker service later

---

## Product surface (tabs)

| Tab | Audience | Purpose |
|-----|----------|---------|
| **Library** | Engineer | Browse / search industrial templates (tank, valve, motor, gauge, pump, PID faceplate, button, lamp, trend stub). Templates are the building blocks dropped into screens. |
| **Tags** | Engineer | Master tag list: name, path, type, engineering units, quality, live value, source (`simulation` \| `opcua`). Create, edit, filter, force-simulate. |
| **Designer** | Engineer | Create screens; place library templates; bind properties to tags; draw process connections between object ports; edit properties. |
| **Runtime** | Operator | Full-screen (or panel) live view of selected screens. Widgets animate from live tag values. No edit chrome. |
| **OPC UA** | Engineer | Configure endpoint, security mode, authentication, and node→tag mappings. Phase 1: UI + persisted config + connection status simulated. Phase 2: real client via companion service. |

---

## Domain model (backbone)

Four conceptual dictionaries drive the system (extendable later for solenoids / I/O cabinets if needed):

1. **`libraryCatalog`** — immutable product templates (type, default size, ports, bindable properties).
2. **`tags`** — runtime tag database (identity + value + quality + source + sim profile).
3. **`project.screens`** — user screens with placed instances, bindings, and connections.
4. **`opcUaConfig`** — connection + mapping setup for PLC data.

### Core types (simplified)

```ts
Tag {
  id, name, path, dataType, unit?,
  value, quality, timestamp,
  source: "simulation" | "opcua",
  sim?: { profile, periodMs, min, max, amplitude, offset, phase }
}

LibraryItem {
  id, category, name, description,
  defaultSize, ports[], bindableProps[]
}

ScreenObject {
  id, libraryItemId, x, y, w, h, rotation?,
  bindings: { prop -> tagId },
  props: Record<string, unknown>
}

Connection {
  id, from: { objectId, portId }, to: { objectId, portId }
}

Screen { id, name, width, height, objects[], connections[] }

OpcUaConfig {
  endpointUrl, securityMode, securityPolicy,
  auth: { mode, username? },
  enabled, pollIntervalMs,
  mappings: [{ nodeId, tagId }],
  status: { state, lastError?, lastOkAt? }
}
```

---

## Simulation (Phase 1 — shipping now)

- Client-side tick (~500 ms) updates every tag with `source === "simulation"`.
- Profiles: `constant`, `sine`, `ramp`, `noise`, `toggle`, `pulse`.
- Quality always `good` in sim unless user forces `bad` / `uncertain` for testing.
- Runtime and Designer both subscribe to the same tag store so preview matches runtime.

This lets design and operator UX ship before any PLC is available.

---

## OPC UA strategy (Phase 2)

| Concern | Decision |
|---------|----------|
| Browser cannot speak OPC UA binary reliably | Keep OPC UA client **out of the browser** |
| Vercel serverless is ephemeral | Real OPC UA needs a **persistent worker** (Render worker, Fly.io, or dedicated VM) |
| Web app on Vercel | Talks to I/O service via HTTPS / WebSocket; maps node values into the tag store |
| Config UI on Vercel now | Persist endpoint + mappings; show “Simulated link” until worker is wired |

Phase 1 ships the full OPC UA **configuration UX** and schema so Phase 2 is wiring, not redesign.

---

## Designer details

- **Screens**: list + create/rename/delete; one active canvas.
- **Place**: click library item (or drag) → drop onto canvas grid.
- **Select**: click object → property panel (position, size, tag bindings).
- **Connect**: enter connect mode → click output port → click input port → SVG polyline.
- **Bind**: each bindable prop (e.g. `level`, `running`, `open`) maps to a tag id.
- **Snap**: 8 px grid; optional later: align guides, multi-select, z-order.
- **Persistence**: `localStorage` for MVP; later Postgres / Blob project files.

---

## Runtime details

- Choose screen (or cycle multi-monitor layouts later).
- Widgets read live tag values through bindings.
- Alarm strip stub (phase 1.5): tags crossing hi/lo limits.
- Fullscreen toggle for operator stations.

---

## Library categories (v1)

- **Process**: Tank, Valve, Pump, Pipe elbow (visual), Motor
- **Indicators**: Digital lamp, Numeric display, Analog gauge, Bar
- **Controls**: Momentary button, Toggle switch, Setpoint entry (display-only write stub)
- **Faces**: Simple PID faceplate (PV/SP/OUT numeric)

Templates are SVG/React components registered by `libraryItemId` so new components plug in by adding one catalog entry + one renderer.

---

## Vercel deployment

- **Framework**: Next.js App Router, static-friendly client shell
- **Build**: `npm run build` / `next start` (Vercel detects automatically)
- **Env**: none required for Phase 1 (all client simulation)
- **Future env**: `OPC_UA_GATEWAY_URL`, `PROJECT_DATABASE_URL`
- **Constraints**: no native Node OPC UA modules in the Next.js serverless bundle for Phase 1

---

## Quality checklist

- [ ] All five tabs usable without backend
- [ ] Seed project with demo tags + one process screen
- [ ] Simulation visibly drives Runtime widgets
- [ ] Designer can add screen, place template, bind tag, draw connection
- [ ] OPC UA form validates and persists config
- [ ] Production build passes (`next build`)
- [ ] Mobile: tabs scroll; designer usable on tablet landscape (desktop-first)

---

## Roadmap

### Phase 1 — Foundation (this PR)
App shell, five tabs, domain store, simulation engine, seed library + demo screen, Vercel-ready Next.js app.

### Phase 1.5 — Designer depth
Undo/redo, multi-select, copy/paste, better connection routing, alarm limits on tags, project import/export JSON.

### Phase 2 — Live I/O
OPC UA gateway service, WebSocket tag stream, mapping browser, write-from-HMI with confirm.

### Phase 3 — Production HMI
Auth, multi-user projects, historian/trends, alarm management, role-based engineer vs operator.

---

## Non-goals (for now)

- Full IEC 61131 / PLC programming
- Native desktop packaging (could wrap later with Tauri)
- Hard real-time guarantees inside the browser
- Replacing plant historians (integrate later)
