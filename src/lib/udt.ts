import type { DataType, SimConfig, Tag } from "./types";

/**
 * UDT (User-Defined Type) system — PLC-style structured types for SCADA objects.
 * Each library object maps to a UDT; instantiating creates unique tags per member.
 */

export type UdtMemberRole =
  | "status"
  | "command"
  | "pv"
  | "sp"
  | "out"
  | "alarm"
  | "mode"
  | "total"
  | "meta";

export interface UdtMemberDef {
  key: string;
  label: string;
  dataType: DataType;
  unit?: string;
  role: UdtMemberRole;
  /** Default simulation when instance is created */
  sim?: Omit<SimConfig, "phase"> & { phase?: number };
  defaultValue?: boolean | number | string;
  /** Maps onto ScreenObject bindable prop when placing a widget */
  bindProp?: string;
}

export interface UdtDef {
  id: string;
  name: string;
  description: string;
  /** Library item this UDT drives (optional for abstract types) */
  libraryItemId?: string;
  members: UdtMemberDef[];
}

export interface UdtInstance {
  udtId: string;
  instanceName: string;
  area: string;
  tagIds: Record<string, string>;
  tags: Tag[];
}

function mem(
  key: string,
  label: string,
  dataType: DataType,
  role: UdtMemberRole,
  extra: Partial<UdtMemberDef> = {},
): UdtMemberDef {
  return { key, label, dataType, role, ...extra };
}

const boolToggle = (
  periodMs = 8000,
): NonNullable<UdtMemberDef["sim"]> => ({
  profile: "toggle",
  periodMs,
  min: 0,
  max: 1,
  amplitude: 1,
  offset: 0,
  phase: 0,
});

const boolConst = (on: boolean): NonNullable<UdtMemberDef["sim"]> => ({
  profile: "constant",
  periodMs: 1000,
  min: 0,
  max: 1,
  amplitude: 0,
  offset: on ? 1 : 0,
  phase: 0,
});

const floatSine = (
  min: number,
  max: number,
  periodMs = 10000,
): NonNullable<UdtMemberDef["sim"]> => ({
  profile: "sine",
  periodMs,
  min,
  max,
  amplitude: (max - min) / 2,
  offset: (max + min) / 2,
  phase: 0,
});

const floatNoise = (
  min: number,
  max: number,
  periodMs = 6000,
): NonNullable<UdtMemberDef["sim"]> => ({
  profile: "noise",
  periodMs,
  min,
  max,
  amplitude: (max - min) / 4,
  offset: (max + min) / 2,
  phase: 0,
});

const floatConst = (v: number): NonNullable<UdtMemberDef["sim"]> => ({
  profile: "constant",
  periodMs: 1000,
  min: v,
  max: v,
  amplitude: 0,
  offset: v,
  phase: 0,
});

/** Catalog of UDTs — one per major equipment / faceplate class */
export const UDT_CATALOG: UdtDef[] = [
  {
    id: "PumpUDT",
    name: "Pump",
    description: "Centrifugal pump with run/fault/flow/pressure.",
    libraryItemId: "pump",
    members: [
      mem("Running", "Running", "bool", "status", { bindProp: "running", sim: boolToggle(9000), defaultValue: false }),
      mem("Auto", "Auto mode", "bool", "mode", { sim: boolConst(true), defaultValue: true }),
      mem("StartCmd", "Start command", "bool", "command", { defaultValue: false, sim: boolConst(false) }),
      mem("StopCmd", "Stop command", "bool", "command", { defaultValue: false, sim: boolConst(false) }),
      mem("Fault", "Fault", "bool", "alarm", { sim: boolConst(false), defaultValue: false }),
      mem("Flow", "Flow", "float", "pv", { unit: "m³/h", bindProp: "flow", sim: floatSine(5, 45, 12000) }),
      mem("Pressure", "Discharge pressure", "float", "pv", { unit: "bar", bindProp: "pressure", sim: floatNoise(1.5, 8, 7000) }),
      mem("Amps", "Motor amps", "float", "pv", { unit: "A", sim: floatNoise(8, 32, 5000) }),
    ],
  },
  {
    id: "ValveUDT",
    name: "On/Off Valve",
    description: "Discrete valve with open/close feedback.",
    libraryItemId: "valve",
    members: [
      mem("Open", "Open FB", "bool", "status", { bindProp: "open", sim: boolToggle(11000), defaultValue: false }),
      mem("Closed", "Closed FB", "bool", "status", { sim: boolConst(true), defaultValue: true }),
      mem("OpenCmd", "Open command", "bool", "command", { defaultValue: false, sim: boolConst(false) }),
      mem("CloseCmd", "Close command", "bool", "command", { defaultValue: false, sim: boolConst(false) }),
      mem("Fault", "Fault", "bool", "alarm", { sim: boolConst(false), defaultValue: false }),
      mem("Position", "Position", "float", "pv", { unit: "%", bindProp: "position", sim: floatSine(0, 100, 14000) }),
    ],
  },
  {
    id: "ControlValveUDT",
    name: "Control Valve",
    description: "Modulating valve with position SP/PV.",
    libraryItemId: "control-valve",
    members: [
      mem("PosPV", "Position PV", "float", "pv", { unit: "%", bindProp: "position", sim: floatSine(10, 90, 10000) }),
      mem("PosSP", "Position SP", "float", "sp", { unit: "%", sim: floatConst(50), defaultValue: 50 }),
      mem("Fault", "Fault", "bool", "alarm", { sim: boolConst(false), defaultValue: false }),
    ],
  },
  {
    id: "TankUDT",
    name: "Tank",
    description: "Level tank with Hi/Lo alarms.",
    libraryItemId: "tank",
    members: [
      mem("Level", "Level", "float", "pv", { unit: "%", bindProp: "level", sim: floatSine(15, 90, 15000) }),
      mem("HiAlarm", "High alarm", "bool", "alarm", { bindProp: "hi", sim: boolConst(false) }),
      mem("LoAlarm", "Low alarm", "bool", "alarm", { bindProp: "lo", sim: boolConst(false) }),
      mem("Volume", "Volume", "float", "pv", { unit: "m³", sim: floatSine(20, 180, 15000) }),
    ],
  },
  {
    id: "MotorUDT",
    name: "Motor",
    description: "Motor / drive status.",
    libraryItemId: "motor",
    members: [
      mem("Running", "Running", "bool", "status", { bindProp: "running", sim: boolToggle(10000) }),
      mem("Speed", "Speed", "float", "pv", { unit: "rpm", bindProp: "speed", sim: floatSine(800, 1800, 9000) }),
      mem("Amps", "Amps", "float", "pv", { unit: "A", bindProp: "amps", sim: floatNoise(10, 40, 5000) }),
      mem("Fault", "Fault", "bool", "alarm", { bindProp: "fault", sim: boolConst(false) }),
      mem("StartCmd", "Start", "bool", "command", { defaultValue: false, sim: boolConst(false) }),
      mem("StopCmd", "Stop", "bool", "command", { defaultValue: false, sim: boolConst(false) }),
    ],
  },
  {
    id: "VfdUDT",
    name: "VFD",
    description: "Variable frequency drive.",
    libraryItemId: "vfd-face",
    members: [
      mem("Running", "Running", "bool", "status", { bindProp: "running", sim: boolToggle(12000) }),
      mem("Hz", "Frequency", "float", "pv", { unit: "Hz", bindProp: "hz", sim: floatSine(20, 55, 9000) }),
      mem("Amps", "Amps", "float", "pv", { unit: "A", bindProp: "amps", sim: floatNoise(8, 35, 5000) }),
      mem("Torque", "Torque", "float", "pv", { unit: "%", bindProp: "torque", sim: floatNoise(30, 90, 7000) }),
      mem("SpeedSP", "Speed SP", "float", "sp", { unit: "%", sim: floatConst(60), defaultValue: 60 }),
    ],
  },
  {
    id: "PidUDT",
    name: "PID Loop",
    description: "PID controller faceplate points.",
    libraryItemId: "pid-face",
    members: [
      mem("PV", "Process value", "float", "pv", { unit: "%", bindProp: "pv", sim: floatSine(30, 70, 10000) }),
      mem("SP", "Setpoint", "float", "sp", { unit: "%", bindProp: "sp", sim: floatConst(50), defaultValue: 50 }),
      mem("OUT", "Output", "float", "out", { unit: "%", bindProp: "out", sim: floatSine(20, 80, 10000) }),
      mem("Auto", "Auto", "bool", "mode", { sim: boolConst(true), defaultValue: true }),
    ],
  },
  {
    id: "TempLoopUDT",
    name: "Temperature Loop",
    description: "Temperature PID.",
    libraryItemId: "temp-face",
    members: [
      mem("PV", "PV", "float", "pv", { unit: "°C", bindProp: "pv", sim: floatSine(60, 140, 12000) }),
      mem("SP", "SP", "float", "sp", { unit: "°C", bindProp: "sp", sim: floatConst(120), defaultValue: 120 }),
      mem("OUT", "OUT", "float", "out", { unit: "%", bindProp: "out", sim: floatSine(25, 85, 12000) }),
    ],
  },
  {
    id: "FlowUDT",
    name: "Flow Meter",
    description: "Flow rate and totalizer.",
    libraryItemId: "flow-face",
    members: [
      mem("Rate", "Rate", "float", "pv", { unit: "m³/h", bindProp: "rate", sim: floatSine(5, 50, 11000) }),
      mem("Total", "Total", "float", "total", { unit: "m³", bindProp: "total", sim: floatSine(10000, 20000, 60000) }),
    ],
  },
  {
    id: "BlowerUDT",
    name: "Blower",
    description: "Air blower.",
    libraryItemId: "blower",
    members: [
      mem("Running", "Running", "bool", "status", { bindProp: "running", sim: boolToggle(13000) }),
      mem("Fault", "Fault", "bool", "alarm", { sim: boolConst(false) }),
      mem("Amps", "Amps", "float", "pv", { unit: "A", sim: floatNoise(5, 25, 6000) }),
    ],
  },
  {
    id: "CompressorUDT",
    name: "Compressor",
    description: "Gas compressor.",
    libraryItemId: "compressor",
    members: [
      mem("Running", "Running", "bool", "status", { bindProp: "running", sim: boolConst(true) }),
      mem("Load", "Load", "float", "pv", { unit: "%", bindProp: "load", sim: floatSine(30, 90, 10000) }),
      mem("Fault", "Fault", "bool", "alarm", { sim: boolConst(false) }),
    ],
  },
  {
    id: "HeatExchangerUDT",
    name: "Heat Exchanger",
    description: "Shell-and-tube exchanger.",
    libraryItemId: "heat-exchanger",
    members: [
      mem("Duty", "Duty", "float", "pv", { unit: "%", bindProp: "duty", sim: floatSine(25, 90, 13000) }),
      mem("HotOutTemp", "Hot out temp", "float", "pv", { unit: "°C", sim: floatNoise(40, 95, 8000) }),
      mem("ColdOutTemp", "Cold out temp", "float", "pv", { unit: "°C", sim: floatNoise(15, 45, 8000) }),
    ],
  },
  {
    id: "FilterUDT",
    name: "Filter",
    description: "Inline filter differential pressure.",
    libraryItemId: "filter",
    members: [
      mem("DP", "Differential pressure", "float", "pv", { unit: "bar", bindProp: "dp", sim: floatNoise(0.1, 1.5, 9000) }),
      mem("HiDP", "High DP alarm", "bool", "alarm", { sim: boolConst(false) }),
    ],
  },
  {
    id: "ReactorUDT",
    name: "Reactor",
    description: "Stirred reactor.",
    libraryItemId: "reactor",
    members: [
      mem("Level", "Level", "float", "pv", { unit: "%", bindProp: "level", sim: floatSine(30, 80, 16000) }),
      mem("Temp", "Temperature", "float", "pv", { unit: "°C", bindProp: "temp", sim: floatSine(50, 100, 14000) }),
      mem("Agitating", "Agitator", "bool", "status", { bindProp: "agitating", sim: boolToggle(10000) }),
    ],
  },
  {
    id: "ConveyorUDT",
    name: "Conveyor",
    description: "Belt conveyor.",
    libraryItemId: "conveyor",
    members: [
      mem("Running", "Running", "bool", "status", { bindProp: "running", sim: boolToggle(7000) }),
      mem("Fault", "Fault", "bool", "alarm", { sim: boolConst(false) }),
    ],
  },
  {
    id: "VesselUDT",
    name: "Vessel",
    description: "Horizontal pressure vessel.",
    libraryItemId: "vessel",
    members: [
      mem("Level", "Level", "float", "pv", { unit: "%", bindProp: "level", sim: floatSine(25, 75, 14000) }),
      mem("Pressure", "Pressure", "float", "pv", { unit: "bar", sim: floatNoise(2, 9, 7000) }),
    ],
  },
  {
    id: "DiscreteUDT",
    name: "Discrete Point",
    description: "Generic bool for lamps/buttons/selectors.",
    members: [
      mem("State", "State", "bool", "status", { bindProp: "state", sim: boolToggle(8000) }),
      mem("Cmd", "Command", "bool", "command", { defaultValue: false, sim: boolConst(false) }),
    ],
  },
];

export function getUdt(id: string): UdtDef | undefined {
  return UDT_CATALOG.find((u) => u.id === id);
}

export function getUdtForLibraryItem(libraryItemId: string): UdtDef | undefined {
  return UDT_CATALOG.find((u) => u.libraryItemId === libraryItemId);
}

function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

/**
 * Instantiate a UDT into unique tags.
 * Tag naming: `{area}.{instanceName}.{Member}`
 * Tag id: `tag_{area}_{instance}_{member}` (sanitized)
 */
export function instantiateUdt(
  udtId: string,
  instanceName: string,
  area = "Plant",
  phaseOffset = 0,
): UdtInstance {
  const udt = getUdt(udtId);
  if (!udt) throw new Error(`Unknown UDT: ${udtId}`);

  const tagIds: Record<string, string> = {};
  const tags: Tag[] = [];
  const now = Date.now();
  const safeArea = area.replace(/[^A-Za-z0-9_]/g, "_");
  const safeInst = instanceName.replace(/[^A-Za-z0-9_]/g, "_");

  for (const [i, m] of udt.members.entries()) {
    const id = `tag_${safeArea}_${safeInst}_${m.key}`.toLowerCase();
    tagIds[m.key] = id;
    const sim = m.sim
      ? { ...m.sim, phase: (m.sim.phase ?? 0) + phaseOffset + i * 0.17 }
      : undefined;
    let value: boolean | number | string =
      m.defaultValue ??
      (m.dataType === "bool" ? false : m.dataType === "string" ? "" : 0);
    if (sim?.profile === "constant") {
      value = m.dataType === "bool" ? sim.offset >= 0.5 : sim.offset;
    }
    tags.push({
      id,
      name: `${instanceName}_${m.key}`,
      path: `${area}.${instanceName}.${m.key}`,
      dataType: m.dataType,
      unit: m.unit,
      description: `${udt.name} ${instanceName} — ${m.label}`,
      value,
      quality: "good",
      timestamp: now,
      source: "simulation",
      sim,
    });
  }

  return { udtId, instanceName, area, tagIds, tags };
}

/** Build bindings map from UDT instance → widget bindable props */
export function bindingsFromUdt(
  instance: UdtInstance,
): { prop: string; tagId: string }[] {
  const udt = getUdt(instance.udtId);
  if (!udt) return [];
  return udt.members
    .filter((m) => m.bindProp && instance.tagIds[m.key])
    .map((m) => ({ prop: m.bindProp!, tagId: instance.tagIds[m.key] }));
}

/** Create N numbered equipment instances of a UDT */
export function instantiateSeries(
  udtId: string,
  prefix: string,
  count: number,
  area: string,
  start = 1,
): UdtInstance[] {
  const out: UdtInstance[] = [];
  for (let i = 0; i < count; i++) {
    const n = start + i;
    const name = `${prefix}_${pad(n)}`;
    out.push(instantiateUdt(udtId, name, area, i * 0.4));
  }
  return out;
}
