import type { LibraryItem } from "./types";

/**
 * Product template catalog. Add a new component by:
 * 1) appending an entry here
 * 2) adding a renderer in components/widgets/registry.tsx
 */
export const LIBRARY_CATALOG: LibraryItem[] = [
  {
    id: "tank",
    category: "process",
    name: "Tank",
    description: "Vertical process tank with animated level fill.",
    defaultWidth: 120,
    defaultHeight: 160,
    ports: [
      { id: "in-top", name: "Inlet", side: "top", offset: 0.5, direction: "in" },
      {
        id: "out-bottom",
        name: "Outlet",
        side: "bottom",
        offset: 0.5,
        direction: "out",
      },
    ],
    bindableProps: [
      {
        key: "level",
        label: "Level",
        dataType: "float",
        description: "0–100 % fill",
      },
    ],
    defaultProps: { label: "TANK-01", capacity: 100 },
  },
  {
    id: "valve",
    category: "process",
    name: "Valve",
    description: "On/off or analog valve with open fraction.",
    defaultWidth: 72,
    defaultHeight: 72,
    ports: [
      { id: "a", name: "A", side: "left", offset: 0.5, direction: "bidirectional" },
      { id: "b", name: "B", side: "right", offset: 0.5, direction: "bidirectional" },
    ],
    bindableProps: [
      { key: "open", label: "Open", dataType: "bool" },
      { key: "position", label: "Position %", dataType: "float" },
    ],
    defaultProps: { label: "XV-01" },
  },
  {
    id: "pump",
    category: "process",
    name: "Pump",
    description: "Centrifugal pump with running status.",
    defaultWidth: 96,
    defaultHeight: 80,
    ports: [
      { id: "suction", name: "Suction", side: "left", offset: 0.5, direction: "in" },
      {
        id: "discharge",
        name: "Discharge",
        side: "right",
        offset: 0.5,
        direction: "out",
      },
    ],
    bindableProps: [{ key: "running", label: "Running", dataType: "bool" }],
    defaultProps: { label: "P-01" },
  },
  {
    id: "motor",
    category: "process",
    name: "Motor",
    description: "Motor / drive status block.",
    defaultWidth: 100,
    defaultHeight: 72,
    ports: [],
    bindableProps: [
      { key: "running", label: "Running", dataType: "bool" },
      { key: "speed", label: "Speed", dataType: "float" },
    ],
    defaultProps: { label: "M-01" },
  },
  {
    id: "gauge",
    category: "indicators",
    name: "Analog Gauge",
    description: "Circular gauge for pressure, flow, or level.",
    defaultWidth: 110,
    defaultHeight: 110,
    ports: [],
    bindableProps: [{ key: "value", label: "Value", dataType: "float" }],
    defaultProps: { label: "PI-01", min: 0, max: 100, unit: "bar" },
  },
  {
    id: "numeric",
    category: "indicators",
    name: "Numeric Display",
    description: "Large process value readout.",
    defaultWidth: 140,
    defaultHeight: 56,
    ports: [],
    bindableProps: [{ key: "value", label: "Value", dataType: "float" }],
    defaultProps: { label: "PV", decimals: 1, unit: "" },
  },
  {
    id: "lamp",
    category: "indicators",
    name: "Status Lamp",
    description: "Boolean status indicator.",
    defaultWidth: 64,
    defaultHeight: 64,
    ports: [],
    bindableProps: [{ key: "on", label: "On", dataType: "bool" }],
    defaultProps: { label: "HS", colorOn: "#3ddc97", colorOff: "#2a3340" },
  },
  {
    id: "bar",
    category: "indicators",
    name: "Bar Graph",
    description: "Vertical bar for level or analog.",
    defaultWidth: 48,
    defaultHeight: 140,
    ports: [],
    bindableProps: [{ key: "value", label: "Value", dataType: "float" }],
    defaultProps: { label: "LI", min: 0, max: 100 },
  },
  {
    id: "button",
    category: "controls",
    name: "Push Button",
    description: "Momentary / toggle control (sim write).",
    defaultWidth: 96,
    defaultHeight: 48,
    ports: [],
    bindableProps: [{ key: "pressed", label: "Pressed", dataType: "bool" }],
    defaultProps: { label: "START", mode: "momentary" },
  },
  {
    id: "toggle",
    category: "controls",
    name: "Toggle Switch",
    description: "Maintained boolean control.",
    defaultWidth: 88,
    defaultHeight: 48,
    ports: [],
    bindableProps: [{ key: "state", label: "State", dataType: "bool" }],
    defaultProps: { label: "AUTO" },
  },
  {
    id: "pid-face",
    category: "faces",
    name: "PID Faceplate",
    description: "Compact PV / SP / OUT faceplate.",
    defaultWidth: 160,
    defaultHeight: 120,
    ports: [],
    bindableProps: [
      { key: "pv", label: "PV", dataType: "float" },
      { key: "sp", label: "SP", dataType: "float" },
      { key: "out", label: "OUT", dataType: "float" },
    ],
    defaultProps: { label: "PIC-101", unit: "%" },
  },
];

export function getLibraryItem(id: string): LibraryItem | undefined {
  return LIBRARY_CATALOG.find((item) => item.id === id);
}

export const CATEGORY_LABELS: Record<LibraryItem["category"], string> = {
  process: "Process",
  indicators: "Indicators",
  controls: "Controls",
  faces: "Faceplates",
};
