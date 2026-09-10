import type {
  Connection,
  OpcUaConfig,
  ProjectState,
  Screen,
  ScreenObject,
  Tag,
} from "./types";

/** Stable ids so seed screens stay consistent across resets. */
function sid(name: string) {
  return name;
}

export function createDefaultOpcUa(): OpcUaConfig {
  return {
    endpointUrl: "opc.tcp://192.168.1.10:4840",
    securityMode: "None",
    securityPolicy: "None",
    authMode: "Anonymous",
    username: "",
    password: "",
    enabled: false,
    pollIntervalMs: 500,
    mappings: [],
    status: {
      state: "disconnected",
      message: "Not connected — Phase 1 uses simulation only.",
    },
  };
}

function obj(
  id: string,
  libraryItemId: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  bindings: ScreenObject["bindings"] = [],
  props: Record<string, unknown> = {},
): ScreenObject {
  return {
    id,
    libraryItemId,
    name: label,
    x,
    y,
    width,
    height,
    rotation: 0,
    bindings,
    props: { label, ...props },
  };
}

function conn(
  id: string,
  fromObj: string,
  fromPort: string,
  toObj: string,
  toPort: string,
): Connection {
  return {
    id,
    from: { objectId: fromObj, portId: fromPort },
    to: { objectId: toObj, portId: toPort },
  };
}

export function createSeedTags(): Tag[] {
  const now = Date.now();
  const mk = (
    partial: Omit<Tag, "quality" | "timestamp" | "source"> &
      Partial<Pick<Tag, "quality" | "source">>,
  ): Tag => ({
    quality: "good",
    timestamp: now,
    source: "simulation",
    ...partial,
  });

  return [
    mk({
      id: "tag_tank_a",
      name: "TankA_Level",
      path: "Plant.Intake.TankA.Level",
      dataType: "float",
      unit: "%",
      value: 62,
      sim: { profile: "sine", periodMs: 14000, min: 25, max: 88, amplitude: 28, offset: 55, phase: 0 },
      hiLimit: 85,
      loLimit: 20,
    }),
    mk({
      id: "tag_tank_b",
      name: "TankB_Level",
      path: "Plant.Intake.TankB.Level",
      dataType: "float",
      unit: "%",
      value: 48,
      sim: { profile: "sine", periodMs: 16000, min: 18, max: 80, amplitude: 25, offset: 48, phase: 1.2 },
    }),
    mk({
      id: "tag_tank_c",
      name: "TankC_Level",
      path: "Plant.Mix.TankC.Level",
      dataType: "float",
      unit: "%",
      value: 55,
      sim: { profile: "ramp", periodMs: 20000, min: 10, max: 90, amplitude: 40, offset: 50, phase: 0 },
    }),
    mk({
      id: "tag_pump_run",
      name: "Pump_Running",
      path: "Plant.Intake.P01.Running",
      dataType: "bool",
      value: true,
      sim: { profile: "toggle", periodMs: 9000, min: 0, max: 1, amplitude: 1, offset: 0, phase: 0 },
    }),
    mk({
      id: "tag_pump2_run",
      name: "Pump2_Running",
      path: "Plant.Boiler.P02.Running",
      dataType: "bool",
      value: true,
      sim: { profile: "constant", periodMs: 1000, min: 0, max: 1, amplitude: 0, offset: 1, phase: 0 },
    }),
    mk({
      id: "tag_valve_open",
      name: "Valve_Open",
      path: "Plant.Intake.XV01.Open",
      dataType: "bool",
      value: true,
      sim: { profile: "pulse", periodMs: 8000, min: 0, max: 1, amplitude: 1, offset: 0, phase: 0.1 },
    }),
    mk({
      id: "tag_valve_pos",
      name: "Valve_Position",
      path: "Plant.Boiler.FV01.Pos",
      dataType: "float",
      unit: "%",
      value: 42,
      sim: { profile: "sine", periodMs: 11000, min: 15, max: 85, amplitude: 30, offset: 50, phase: 0.4 },
    }),
    mk({
      id: "tag_pressure",
      name: "Line_Pressure",
      path: "Plant.Intake.PI01.PV",
      dataType: "float",
      unit: "bar",
      value: 4.2,
      sim: { profile: "noise", periodMs: 6000, min: 2, max: 8, amplitude: 1.5, offset: 4.5, phase: 1 },
    }),
    mk({
      id: "tag_flow",
      name: "Flow_Rate",
      path: "Plant.Intake.FI01.PV",
      dataType: "float",
      unit: "m³/h",
      value: 28,
      sim: { profile: "ramp", periodMs: 15000, min: 8, max: 42, amplitude: 17, offset: 25, phase: 0 },
    }),
    mk({
      id: "tag_flow_total",
      name: "Flow_Total",
      path: "Plant.Intake.FI01.Total",
      dataType: "float",
      unit: "m³",
      value: 12480,
      sim: { profile: "ramp", periodMs: 60000, min: 12000, max: 13000, amplitude: 500, offset: 12500, phase: 0 },
    }),
    mk({
      id: "tag_motor_speed",
      name: "Motor_Speed",
      path: "Plant.Line.M01.Speed",
      dataType: "float",
      unit: "rpm",
      value: 1450,
      sim: { profile: "sine", periodMs: 9000, min: 900, max: 1750, amplitude: 350, offset: 1300, phase: 0.5 },
    }),
    mk({
      id: "tag_motor_amps",
      name: "Motor_Amps",
      path: "Plant.Line.M01.Amps",
      dataType: "float",
      unit: "A",
      value: 18,
      sim: { profile: "noise", periodMs: 5000, min: 10, max: 28, amplitude: 6, offset: 18, phase: 0.2 },
    }),
    mk({
      id: "tag_blower_run",
      name: "Blower_Running",
      path: "Plant.Air.B01.Running",
      dataType: "bool",
      value: true,
      sim: { profile: "toggle", periodMs: 12000, min: 0, max: 1, amplitude: 1, offset: 0, phase: 0 },
    }),
    mk({
      id: "tag_comp_run",
      name: "Comp_Running",
      path: "Plant.Air.K01.Running",
      dataType: "bool",
      value: true,
      sim: { profile: "constant", periodMs: 1000, min: 0, max: 1, amplitude: 0, offset: 1, phase: 0 },
    }),
    mk({
      id: "tag_comp_load",
      name: "Comp_Load",
      path: "Plant.Air.K01.Load",
      dataType: "float",
      unit: "%",
      value: 62,
      sim: { profile: "sine", periodMs: 10000, min: 35, max: 90, amplitude: 25, offset: 62, phase: 0.7 },
    }),
    mk({
      id: "tag_hex_duty",
      name: "HEX_Duty",
      path: "Plant.Boiler.HE01.Duty",
      dataType: "float",
      unit: "%",
      value: 55,
      sim: { profile: "sine", periodMs: 13000, min: 30, max: 85, amplitude: 22, offset: 55, phase: 0.3 },
    }),
    mk({
      id: "tag_filter_dp",
      name: "Filter_DP",
      path: "Plant.Intake.F01.DP",
      dataType: "float",
      unit: "bar",
      value: 0.4,
      sim: { profile: "noise", periodMs: 8000, min: 0.1, max: 1.2, amplitude: 0.3, offset: 0.5, phase: 0 },
    }),
    mk({
      id: "tag_reactor_lvl",
      name: "Reactor_Level",
      path: "Plant.Mix.R01.Level",
      dataType: "float",
      unit: "%",
      value: 60,
      sim: { profile: "sine", periodMs: 18000, min: 35, max: 78, amplitude: 18, offset: 55, phase: 0.8 },
    }),
    mk({
      id: "tag_reactor_temp",
      name: "Reactor_Temp",
      path: "Plant.Mix.R01.Temp",
      dataType: "float",
      unit: "°C",
      value: 72,
      sim: { profile: "sine", periodMs: 14000, min: 55, max: 95, amplitude: 15, offset: 75, phase: 0.2 },
    }),
    mk({
      id: "tag_agitator",
      name: "Agitator_Run",
      path: "Plant.Mix.R01.Agitator",
      dataType: "bool",
      value: true,
      sim: { profile: "toggle", periodMs: 10000, min: 0, max: 1, amplitude: 1, offset: 0, phase: 0 },
    }),
    mk({
      id: "tag_conveyor",
      name: "Conveyor_Run",
      path: "Plant.Pack.CVY01.Running",
      dataType: "bool",
      value: true,
      sim: { profile: "toggle", periodMs: 7000, min: 0, max: 1, amplitude: 1, offset: 0, phase: 0 },
    }),
    mk({
      id: "tag_pid_pv",
      name: "PIC101_PV",
      path: "Plant.Boiler.PIC101.PV",
      dataType: "float",
      unit: "%",
      value: 48,
      sim: { profile: "sine", periodMs: 10000, min: 30, max: 70, amplitude: 15, offset: 50, phase: 0 },
    }),
    mk({
      id: "tag_pid_sp",
      name: "PIC101_SP",
      path: "Plant.Boiler.PIC101.SP",
      dataType: "float",
      unit: "%",
      value: 50,
      sim: { profile: "constant", periodMs: 1000, min: 0, max: 100, amplitude: 0, offset: 50, phase: 0 },
    }),
    mk({
      id: "tag_pid_out",
      name: "PIC101_OUT",
      path: "Plant.Boiler.PIC101.OUT",
      dataType: "float",
      unit: "%",
      value: 42,
      sim: { profile: "sine", periodMs: 10000, min: 20, max: 80, amplitude: 20, offset: 45, phase: 1.2 },
    }),
    mk({
      id: "tag_temp_pv",
      name: "TIC101_PV",
      path: "Plant.Boiler.TIC101.PV",
      dataType: "float",
      unit: "°C",
      value: 118,
      sim: { profile: "sine", periodMs: 12000, min: 95, max: 140, amplitude: 18, offset: 118, phase: 0.5 },
    }),
    mk({
      id: "tag_temp_sp",
      name: "TIC101_SP",
      path: "Plant.Boiler.TIC101.SP",
      dataType: "float",
      unit: "°C",
      value: 120,
      sim: { profile: "constant", periodMs: 1000, min: 0, max: 200, amplitude: 0, offset: 120, phase: 0 },
    }),
    mk({
      id: "tag_temp_out",
      name: "TIC101_OUT",
      path: "Plant.Boiler.TIC101.OUT",
      dataType: "float",
      unit: "%",
      value: 55,
      sim: { profile: "sine", periodMs: 12000, min: 30, max: 80, amplitude: 20, offset: 55, phase: 1 },
    }),
    mk({
      id: "tag_vfd_hz",
      name: "VFD_Hz",
      path: "Plant.Line.VFD01.Hz",
      dataType: "float",
      unit: "Hz",
      value: 42,
      sim: { profile: "sine", periodMs: 9000, min: 25, max: 55, amplitude: 12, offset: 40, phase: 0.3 },
    }),
    mk({
      id: "tag_vfd_torque",
      name: "VFD_Torque",
      path: "Plant.Line.VFD01.Torque",
      dataType: "float",
      unit: "%",
      value: 60,
      sim: { profile: "noise", periodMs: 6000, min: 35, max: 85, amplitude: 15, offset: 60, phase: 0 },
    }),
    mk({
      id: "tag_hs_ready",
      name: "System_Ready",
      path: "Plant.HS.Ready",
      dataType: "bool",
      value: true,
      sim: { profile: "constant", periodMs: 1000, min: 0, max: 1, amplitude: 0, offset: 1, phase: 0 },
    }),
    mk({
      id: "tag_alarm_hi",
      name: "TankA_HiAlarm",
      path: "Plant.Intake.TankA.Hi",
      dataType: "bool",
      value: false,
      sim: { profile: "pulse", periodMs: 20000, min: 0, max: 1, amplitude: 1, offset: 0, phase: 0.8 },
    }),
    mk({
      id: "tag_mode_auto",
      name: "Mode_Auto",
      path: "Plant.HS.Auto",
      dataType: "bool",
      value: true,
      sim: { profile: "constant", periodMs: 1000, min: 0, max: 1, amplitude: 0, offset: 1, phase: 0 },
    }),
    mk({
      id: "tag_vessel_lvl",
      name: "Vessel_Level",
      path: "Plant.Boiler.V01.Level",
      dataType: "float",
      unit: "%",
      value: 52,
      sim: { profile: "sine", periodMs: 15000, min: 30, max: 75, amplitude: 18, offset: 52, phase: 0.6 },
    }),
  ];
}

/** 1 — clean left-to-right intake train */
function screenIntake(): Screen {
  const tankA = sid("obj_intake_tanka");
  const filter = sid("obj_intake_filter");
  const pump = sid("obj_intake_pump");
  const check = sid("obj_intake_check");
  const valve = sid("obj_intake_valve");
  const tankB = sid("obj_intake_tankb");

  return {
    id: sid("scr_intake"),
    name: "01 — Raw Water Intake",
    width: 1280,
    height: 720,
    objects: [
      obj(tankA, "tank", "TK-A", 80, 200, 130, 180, [{ prop: "level", tagId: "tag_tank_a" }]),
      obj(filter, "filter", "F-01", 280, 270, 88, 72, [{ prop: "dp", tagId: "tag_filter_dp" }]),
      obj(pump, "pump", "P-01", 430, 260, 100, 84, [{ prop: "running", tagId: "tag_pump_run" }]),
      obj(check, "check-valve", "CV-01", 580, 278, 64, 56),
      obj(valve, "valve", "XV-01", 700, 268, 72, 72, [{ prop: "open", tagId: "tag_valve_open" }]),
      obj(tankB, "tank", "TK-B", 860, 200, 130, 180, [{ prop: "level", tagId: "tag_tank_b" }]),
      obj(sid("obj_intake_pi"), "gauge", "PI-01", 430, 80, 110, 110, [{ prop: "value", tagId: "tag_pressure" }], { min: 0, max: 10, unit: "bar" }),
      obj(sid("obj_intake_fi"), "numeric", "Flow", 580, 100, 150, 56, [{ prop: "value", tagId: "tag_flow" }], { decimals: 1, unit: "m³/h" }),
      obj(sid("obj_intake_ready"), "lamp", "READY", 780, 100, 64, 64, [{ prop: "on", tagId: "tag_hs_ready" }]),
      obj(sid("obj_intake_pumpface"), "pump-face", "PMP-01", 1040, 180, 180, 140, [
        { prop: "running", tagId: "tag_pump_run" },
        { prop: "flow", tagId: "tag_flow" },
        { prop: "pressure", tagId: "tag_pressure" },
      ]),
      obj(sid("obj_intake_tankface"), "tank-face", "TK-A", 1040, 360, 170, 150, [
        { prop: "level", tagId: "tag_tank_a" },
        { prop: "hi", tagId: "tag_alarm_hi" },
      ]),
    ],
    connections: [
      conn("c_intake_1", tankA, "side-out", filter, "in"),
      conn("c_intake_2", filter, "out", pump, "suction"),
      conn("c_intake_3", pump, "discharge", check, "a"),
      conn("c_intake_4", check, "b", valve, "a"),
      conn("c_intake_5", valve, "b", tankB, "in-top"),
    ],
  };
}

/** 2 — mixing skid with reactor */
function screenMixing(): Screen {
  const ta = sid("obj_mix_ta");
  const tb = sid("obj_mix_tb");
  const va = sid("obj_mix_va");
  const vb = sid("obj_mix_vb");
  const reactor = sid("obj_mix_r");
  const outv = sid("obj_mix_outv");
  const tc = sid("obj_mix_tc");

  return {
    id: sid("scr_mixing"),
    name: "02 — Mixing Skid",
    width: 1280,
    height: 720,
    objects: [
      obj(ta, "tank", "RAW-A", 80, 80, 110, 150, [{ prop: "level", tagId: "tag_tank_a" }]),
      obj(tb, "tank", "RAW-B", 80, 360, 110, 150, [{ prop: "level", tagId: "tag_tank_b" }]),
      obj(va, "control-valve", "FV-A", 280, 120, 80, 96, [{ prop: "position", tagId: "tag_valve_pos" }]),
      obj(vb, "control-valve", "FV-B", 280, 400, 80, 96, [{ prop: "position", tagId: "tag_pid_out" }]),
      obj(reactor, "reactor", "R-101", 480, 220, 140, 170, [
        { prop: "level", tagId: "tag_reactor_lvl" },
        { prop: "temp", tagId: "tag_reactor_temp" },
        { prop: "agitating", tagId: "tag_agitator" },
      ]),
      obj(outv, "valve", "XV-OUT", 720, 280, 72, 72, [{ prop: "open", tagId: "tag_valve_open" }]),
      obj(tc, "tank", "PROD", 880, 220, 120, 170, [{ prop: "level", tagId: "tag_tank_c" }]),
      obj(sid("obj_mix_tempface"), "temp-face", "TIC-101", 1080, 120, 170, 130, [
        { prop: "pv", tagId: "tag_reactor_temp" },
        { prop: "sp", tagId: "tag_temp_sp" },
        { prop: "out", tagId: "tag_temp_out" },
      ], { unit: "°C" }),
      obj(sid("obj_mix_selector"), "selector", "MODE", 1080, 290, 120, 52, [{ prop: "auto", tagId: "tag_mode_auto" }]),
      obj(sid("obj_mix_alarm"), "alarm-banner", "ALARM", 1080, 380, 170, 48, [{ prop: "active", tagId: "tag_alarm_hi" }], { message: "Reactor Hi Temp" }),
    ],
    connections: [
      conn("c_mix_1", ta, "side-out", va, "a"),
      conn("c_mix_2", va, "b", reactor, "in-top"),
      conn("c_mix_3", tb, "side-out", vb, "a"),
      conn("c_mix_4", vb, "b", reactor, "jacket"),
      conn("c_mix_5", reactor, "out-bottom", outv, "a"),
      conn("c_mix_6", outv, "b", tc, "side-out"),
    ],
  };
}

/** 3 — boiler / heat loop */
function screenBoiler(): Screen {
  const pump = sid("obj_boil_pump");
  const hex = sid("obj_boil_hex");
  const fv = sid("obj_boil_fv");
  const vessel = sid("obj_boil_vessel");
  const xv = sid("obj_boil_xv");

  return {
    id: sid("scr_boiler"),
    name: "03 — Boiler Loop",
    width: 1280,
    height: 720,
    objects: [
      obj(pump, "pump", "P-02", 100, 300, 100, 84, [{ prop: "running", tagId: "tag_pump2_run" }]),
      obj(hex, "heat-exchanger", "HE-01", 320, 280, 150, 110, [{ prop: "duty", tagId: "tag_hex_duty" }]),
      obj(fv, "control-valve", "FV-01", 560, 290, 80, 96, [{ prop: "position", tagId: "tag_valve_pos" }]),
      obj(vessel, "vessel", "DRUM-01", 740, 300, 180, 90, [{ prop: "level", tagId: "tag_vessel_lvl" }]),
      obj(xv, "valve", "XV-RET", 100, 480, 72, 72, [{ prop: "open", tagId: "tag_valve_open" }]),
      obj(sid("obj_boil_pi"), "gauge", "PI-201", 740, 120, 110, 110, [{ prop: "value", tagId: "tag_pressure" }], { min: 0, max: 10, unit: "bar" }),
      obj(sid("obj_boil_spark"), "sparkline", "Duty Trend", 320, 120, 160, 64, [{ prop: "value", tagId: "tag_hex_duty" }], { min: 0, max: 100 }),
      obj(sid("obj_boil_pid"), "pid-face", "PIC-101", 1040, 120, 170, 120, [
        { prop: "pv", tagId: "tag_pid_pv" },
        { prop: "sp", tagId: "tag_pid_sp" },
        { prop: "out", tagId: "tag_pid_out" },
      ]),
      obj(sid("obj_boil_tic"), "temp-face", "TIC-101", 1040, 280, 170, 130, [
        { prop: "pv", tagId: "tag_temp_pv" },
        { prop: "sp", tagId: "tag_temp_sp" },
        { prop: "out", tagId: "tag_temp_out" },
      ], { unit: "°C" }),
      obj(sid("obj_boil_valveface"), "valve-face", "FV-01", 1040, 450, 170, 130, [
        { prop: "open", tagId: "tag_valve_open" },
        { prop: "position", tagId: "tag_valve_pos" },
      ]),
      obj(sid("obj_boil_sp"), "setpoint", "SP", 560, 120, 130, 64, [{ prop: "value", tagId: "tag_pid_sp" }], { unit: "%" }),
    ],
    connections: [
      conn("c_boil_1", pump, "discharge", hex, "hot-in"),
      conn("c_boil_2", hex, "hot-out", fv, "a"),
      conn("c_boil_3", fv, "b", vessel, "in"),
      conn("c_boil_4", vessel, "out", xv, "b"),
      conn("c_boil_5", xv, "a", pump, "suction"),
    ],
  };
}

/** 4 — packaging / drive line */
function screenPackaging(): Screen {
  const blower = sid("obj_pack_blower");
  const filter = sid("obj_pack_filter");
  const comp = sid("obj_pack_comp");
  const cvy1 = sid("obj_pack_cvy1");
  const cvy2 = sid("obj_pack_cvy2");

  return {
    id: sid("scr_pack"),
    name: "04 — Packaging Line",
    width: 1280,
    height: 720,
    objects: [
      obj(blower, "blower", "B-01", 80, 120, 100, 88, [{ prop: "running", tagId: "tag_blower_run" }]),
      obj(filter, "filter", "F-AIR", 260, 130, 88, 72, [{ prop: "dp", tagId: "tag_filter_dp" }]),
      obj(comp, "compressor", "K-01", 430, 120, 110, 90, [
        { prop: "running", tagId: "tag_comp_run" },
        { prop: "load", tagId: "tag_comp_load" },
      ]),
      obj(cvy1, "conveyor", "CVY-01", 80, 360, 220, 56, [{ prop: "running", tagId: "tag_conveyor" }]),
      obj(cvy2, "conveyor", "CVY-02", 360, 360, 220, 56, [{ prop: "running", tagId: "tag_pump_run" }]),
      obj(sid("obj_pack_motor"), "motor", "M-01", 660, 340, 110, 80, [
        { prop: "running", tagId: "tag_conveyor" },
        { prop: "speed", tagId: "tag_motor_speed" },
      ]),
      obj(sid("obj_pack_lamp1"), "lamp", "RUN", 820, 120, 64, 64, [{ prop: "on", tagId: "tag_conveyor" }], { colorOn: "#3ddc97" }),
      obj(sid("obj_pack_lamp2"), "lamp", "AIR", 920, 120, 64, 64, [{ prop: "on", tagId: "tag_blower_run" }], { colorOn: "#f0b429" }),
      obj(sid("obj_pack_btn"), "button", "START", 820, 220, 96, 48),
      obj(sid("obj_pack_toggle"), "toggle", "AUTO", 940, 220, 88, 48, [{ prop: "state", tagId: "tag_mode_auto" }]),
      obj(sid("obj_pack_motorface"), "motor-face", "MTR-01", 1040, 100, 180, 140, [
        { prop: "running", tagId: "tag_conveyor" },
        { prop: "speed", tagId: "tag_motor_speed" },
        { prop: "amps", tagId: "tag_motor_amps" },
      ]),
      obj(sid("obj_pack_vfd"), "vfd-face", "VFD-01", 1040, 280, 180, 150, [
        { prop: "running", tagId: "tag_conveyor" },
        { prop: "hz", tagId: "tag_vfd_hz" },
        { prop: "amps", tagId: "tag_motor_amps" },
        { prop: "torque", tagId: "tag_vfd_torque" },
      ]),
      obj(sid("obj_pack_bar"), "bar", "LOAD", 660, 120, 48, 140, [{ prop: "value", tagId: "tag_comp_load" }]),
    ],
    connections: [
      conn("c_pack_1", blower, "out", filter, "in"),
      conn("c_pack_2", filter, "out", comp, "in"),
      conn("c_pack_3", cvy1, "out", cvy2, "in"),
    ],
  };
}

/** 5 — faceplate overview wall + mini process */
function screenOverview(): Screen {
  const tank = sid("obj_ov_tank");
  const pump = sid("obj_ov_pump");
  const valve = sid("obj_ov_valve");
  const vessel = sid("obj_ov_vessel");

  return {
    id: sid("scr_overview"),
    name: "05 — Faceplate Overview",
    width: 1280,
    height: 720,
    objects: [
      // Mini process strip across the top — aligned horizontally
      obj(tank, "tank", "TK-01", 60, 40, 100, 140, [{ prop: "level", tagId: "tag_tank_a" }]),
      obj(pump, "pump", "P-01", 240, 80, 96, 80, [{ prop: "running", tagId: "tag_pump_run" }]),
      obj(valve, "control-valve", "FV-01", 400, 70, 80, 96, [{ prop: "position", tagId: "tag_valve_pos" }]),
      obj(vessel, "vessel", "V-01", 560, 90, 180, 80, [{ prop: "level", tagId: "tag_vessel_lvl" }]),
      obj(sid("obj_ov_flow"), "flow-face", "FIC-01", 800, 40, 170, 120, [
        { prop: "rate", tagId: "tag_flow" },
        { prop: "total", tagId: "tag_flow_total" },
      ]),
      obj(sid("obj_ov_ready"), "lamp", "OK", 1020, 60, 64, 64, [{ prop: "on", tagId: "tag_hs_ready" }]),

      // Faceplate wall
      obj(sid("obj_ov_pid"), "pid-face", "PIC-101", 60, 260, 170, 120, [
        { prop: "pv", tagId: "tag_pid_pv" },
        { prop: "sp", tagId: "tag_pid_sp" },
        { prop: "out", tagId: "tag_pid_out" },
      ]),
      obj(sid("obj_ov_temp"), "temp-face", "TIC-101", 260, 260, 170, 130, [
        { prop: "pv", tagId: "tag_temp_pv" },
        { prop: "sp", tagId: "tag_temp_sp" },
        { prop: "out", tagId: "tag_temp_out" },
      ], { unit: "°C" }),
      obj(sid("obj_ov_motor"), "motor-face", "MTR-101", 460, 260, 180, 140, [
        { prop: "running", tagId: "tag_pump_run" },
        { prop: "speed", tagId: "tag_motor_speed" },
        { prop: "amps", tagId: "tag_motor_amps" },
      ]),
      obj(sid("obj_ov_pump"), "pump-face", "PMP-101", 670, 260, 180, 140, [
        { prop: "running", tagId: "tag_pump_run" },
        { prop: "flow", tagId: "tag_flow" },
        { prop: "pressure", tagId: "tag_pressure" },
      ]),
      obj(sid("obj_ov_valve"), "valve-face", "VLV-101", 880, 260, 170, 130, [
        { prop: "open", tagId: "tag_valve_open" },
        { prop: "position", tagId: "tag_valve_pos" },
      ]),
      obj(sid("obj_ov_tankface"), "tank-face", "TK-101", 1080, 260, 170, 150, [
        { prop: "level", tagId: "tag_tank_a" },
        { prop: "hi", tagId: "tag_alarm_hi" },
      ]),
      obj(sid("obj_ov_vfd"), "vfd-face", "VFD-101", 60, 460, 180, 150, [
        { prop: "running", tagId: "tag_conveyor" },
        { prop: "hz", tagId: "tag_vfd_hz" },
        { prop: "amps", tagId: "tag_motor_amps" },
        { prop: "torque", tagId: "tag_vfd_torque" },
      ]),
      obj(sid("obj_ov_spark"), "sparkline", "PV Trend", 280, 500, 180, 64, [{ prop: "value", tagId: "tag_pid_pv" }]),
      obj(sid("obj_ov_alarm"), "alarm-banner", "PLANT", 500, 510, 220, 48, [{ prop: "active", tagId: "tag_alarm_hi" }], { message: "High tank level" }),
      obj(sid("obj_ov_mode"), "selector", "MODE", 760, 510, 120, 52, [{ prop: "auto", tagId: "tag_mode_auto" }]),
    ],
    connections: [
      conn("c_ov_1", tank, "side-out", pump, "suction"),
      conn("c_ov_2", pump, "discharge", valve, "a"),
      conn("c_ov_3", valve, "b", vessel, "in"),
    ],
  };
}

export function createDemoScreens(): Screen[] {
  return [
    screenIntake(),
    screenMixing(),
    screenBoiler(),
    screenPackaging(),
    screenOverview(),
  ];
}

export function createInitialProject(): ProjectState {
  const screens = createDemoScreens();
  return {
    name: "SCADA One Demo",
    version: 2,
    tags: createSeedTags(),
    screens,
    activeScreenId: screens[0].id,
    runtimeScreenId: screens[0].id,
    opcUa: createDefaultOpcUa(),
    selectedObjectId: null,
    connectFrom: null,
    designerMode: "select",
    simRunning: true,
    simTickMs: 500,
  };
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
