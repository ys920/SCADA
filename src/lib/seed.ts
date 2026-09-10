import type {
  Connection,
  OpcUaConfig,
  ProjectState,
  Screen,
  ScreenObject,
  Tag,
} from "./types";
import {
  bindingsFromUdt,
  instantiateSeries,
  instantiateUdt,
  type UdtInstance,
} from "./udt";

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

function fromInst(
  inst: UdtInstance,
  libraryItemId: string,
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  extraProps: Record<string, unknown> = {},
): ScreenObject {
  return obj(
    id,
    libraryItemId,
    inst.instanceName,
    x,
    y,
    w,
    h,
    bindingsFromUdt(inst),
    extraProps,
  );
}

/** Build the full simulated plant from UDT instances */
export function buildPlant() {
  const pumps = instantiateSeries("PumpUDT", "P", 20, "Plant.Pumps", 1);
  const valves = instantiateSeries("ValveUDT", "XV", 20, "Plant.Valves", 1);
  const controlValves = instantiateSeries(
    "ControlValveUDT",
    "FV",
    8,
    "Plant.Valves",
    1,
  );
  const tanks = instantiateSeries("TankUDT", "TK", 8, "Plant.Tanks", 1);
  const motors = instantiateSeries("MotorUDT", "M", 6, "Plant.Motors", 1);
  const blowers = instantiateSeries("BlowerUDT", "B", 4, "Plant.Air", 1);
  const compressors = instantiateSeries(
    "CompressorUDT",
    "K",
    2,
    "Plant.Air",
    1,
  );
  const filters = instantiateSeries("FilterUDT", "F", 4, "Plant.Filters", 1);
  const hexes = instantiateSeries("HeatExchangerUDT", "HE", 3, "Plant.HEX", 1);
  const conveyors = instantiateSeries(
    "ConveyorUDT",
    "CVY",
    4,
    "Plant.Pack",
    1,
  );
  const pids = instantiateSeries("PidUDT", "PIC", 4, "Plant.Loops", 1);
  const temps = instantiateSeries("TempLoopUDT", "TIC", 3, "Plant.Loops", 1);
  const flows = instantiateSeries("FlowUDT", "FIC", 4, "Plant.Loops", 1);
  const vfds = instantiateSeries("VfdUDT", "VFD", 4, "Plant.Drives", 1);
  const reactors = [
    instantiateUdt("ReactorUDT", "R_01", "Plant.React", 0.2),
  ];
  const vessels = instantiateSeries("VesselUDT", "V", 3, "Plant.Vessels", 1);
  const discretes = [
    instantiateUdt("DiscreteUDT", "HS_Ready", "Plant.HS", 0),
    instantiateUdt("DiscreteUDT", "HS_Auto", "Plant.HS", 0.5),
    instantiateUdt("DiscreteUDT", "HS_Alarm", "Plant.HS", 1),
  ];

  const allInstances: UdtInstance[] = [
    ...pumps,
    ...valves,
    ...controlValves,
    ...tanks,
    ...motors,
    ...blowers,
    ...compressors,
    ...filters,
    ...hexes,
    ...conveyors,
    ...pids,
    ...temps,
    ...flows,
    ...vfds,
    ...reactors,
    ...vessels,
    ...discretes,
  ];

  const tags: Tag[] = allInstances.flatMap((i) => i.tags);

  return {
    tags,
    instances: {
      pumps,
      valves,
      controlValves,
      tanks,
      motors,
      blowers,
      compressors,
      filters,
      hexes,
      conveyors,
      pids,
      temps,
      flows,
      vfds,
      reactors,
      vessels,
      discretes,
    },
  };
}

function screenPumpFarm(pumps: UdtInstance[], valves: UdtInstance[]): Screen {
  const objects: ScreenObject[] = [
    obj(sid("txt_pump_title"), "text", "PUMP FARM — 20 Pumps", 40, 20, 420, 36, [], {
      label: "PUMP FARM — 20 Pumps",
      fontSize: 22,
      color: "#e8eef7",
    }),
    obj(sid("txt_pump_sub"), "text", "Each pump uses PumpUDT tags", 40, 56, 360, 24, [], {
      label: "Each pump uses PumpUDT (Running, Flow, Pressure, Fault…)",
      fontSize: 12,
      color: "#93a0b5",
    }),
  ];

const connections: Connection[] = [];

  // 4 rows × 5 pumps — valve Y offset keeps port centers collinear with pump
  for (let i = 0; i < 20; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = 40 + col * 248;
    const y = 100 + row * 140;
    const p = pumps[i];
    const v = valves[i];
    const pid = sid(`obj_pf_p_${i}`);
    const vid = sid(`obj_pf_v_${i}`);
    objects.push(fromInst(p, "pump", pid, x, y, 96, 80));
    objects.push(fromInst(v, "valve", vid, x + 160, y + 4, 72, 72));
    objects.push(
      obj(
        sid(`obj_pf_btn_${i}`),
        "button",
        `START ${p.instanceName}`,
        x,
        y + 90,
        100,
        36,
        [{ prop: "pressed", tagId: p.tagIds.StartCmd }],
        { label: "START" },
      ),
    );
    connections.push(conn(`c_pf_${i}`, pid, "discharge", vid, "a"));
  }

  return {
    id: sid("scr_pump_farm"),
    name: "10 — Pump Farm (20×)",
    width: 1280,
    height: 720,
    objects,
    connections,
  };
}

function screenValveGallery(valves: UdtInstance[], fvs: UdtInstance[]): Screen {
  const objects: ScreenObject[] = [
    obj(sid("txt_v_title"), "text", "VALVE GALLERY — 20 XV + 8 FV", 40, 20, 480, 36, [], {
      label: "VALVE GALLERY — 20× XV + 8× FV",
      fontSize: 22,
    }),
  ];

  for (let i = 0; i < 20; i++) {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = 40 + col * 120;
    const y = 90 + row * 130;
    objects.push(fromInst(valves[i], "valve", sid(`obj_vg_xv_${i}`), x, y, 72, 72));
    objects.push(
      obj(
        sid(`obj_vg_lbl_${i}`),
        "text",
        valves[i].instanceName,
        x - 4,
        y + 78,
        80,
        20,
        [],
        { label: valves[i].instanceName, fontSize: 11, color: "#93a0b5" },
      ),
    );
  }

  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 150;
    const y = 400;
    objects.push(
      fromInst(fvs[i], "control-valve", sid(`obj_vg_fv_${i}`), x, y, 80, 96),
    );
  }

  return {
    id: sid("scr_valve_gallery"),
    name: "11 — Valve Gallery",
    width: 1280,
    height: 720,
    objects,
    connections: [],
  };
}

function screenProcessTrain(
  tanks: UdtInstance[],
  pumps: UdtInstance[],
  valves: UdtInstance[],
  filters: UdtInstance[],
  flows: UdtInstance[],
  ready: UdtInstance,
): Screen {
  const t0 = tanks[0];
  const t1 = tanks[1];
  const p0 = pumps[0];
  const v0 = valves[0];
  const f0 = filters[0];
  const fl0 = flows[0];

  const idTankA = sid("obj_pt_tanka");
  const idFilter = sid("obj_pt_filter");
  const idPump = sid("obj_pt_pump");
  const idValve = sid("obj_pt_valve");
  const idTankB = sid("obj_pt_tankb");

  return {
    id: sid("scr_process_train"),
    name: "12 — Process Train",
    width: 1280,
    height: 720,
    objects: [
      obj(sid("txt_pt"), "text", "PROCESS TRAIN", 40, 24, 280, 32, [], {
        label: "PROCESS TRAIN — UDT-bound",
        fontSize: 22,
      }),
fromInst(t0, "tank", idTankA, 60, 191, 130, 180),
      fromInst(f0, "filter", idFilter, 280, 254, 88, 72),
      fromInst(p0, "pump", idPump, 450, 248, 100, 84),
      fromInst(v0, "valve", idValve, 640, 254, 72, 72),
      fromInst(t1, "tank", idTankB, 820, 191, 130, 180),
      fromInst(fl0, "flow-face", sid("obj_pt_flow"), 1000, 120, 170, 120),
      fromInst(pumps[1], "pump-face", sid("obj_pt_pface"), 1000, 280, 180, 140),
      fromInst(t0, "tank-face", sid("obj_pt_tface"), 1000, 450, 170, 150),
      obj(
        sid("obj_pt_lamp"),
        "lamp",
        "READY",
        80,
        80,
        64,
        64,
        [{ prop: "on", tagId: ready.tagIds.State }],
      ),
      obj(
        sid("obj_pt_start"),
        "button",
        "START",
        180,
        90,
        96,
        44,
        [{ prop: "pressed", tagId: p0.tagIds.StartCmd }],
        { label: "START P_01" },
      ),
      obj(
        sid("obj_pt_stop"),
        "button",
        "STOP",
        290,
        90,
        96,
        44,
        [{ prop: "pressed", tagId: p0.tagIds.StopCmd }],
        { label: "STOP P_01" },
      ),
    ],
    connections: [
      conn("c_pt_1", idTankA, "side-out", idFilter, "in"),
      conn("c_pt_2", idFilter, "out", idPump, "suction"),
      conn("c_pt_3", idPump, "discharge", idValve, "a"),
      conn("c_pt_4", idValve, "b", idTankB, "side-in"),
    ],
  };
}

function screenUtility(
  blowers: UdtInstance[],
  compressors: UdtInstance[],
  hexes: UdtInstance[],
  conveyors: UdtInstance[],
  motors: UdtInstance[],
  vfds: UdtInstance[],
): Screen {
  return {
    id: sid("scr_utility"),
    name: "13 — Utilities & Pack",
    width: 1280,
    height: 720,
    objects: [
      obj(sid("txt_ut"), "text", "UTILITIES & PACKAGING", 40, 24, 400, 32, [], {
        label: "UTILITIES & PACKAGING",
        fontSize: 22,
      }),
      fromInst(blowers[0], "blower", sid("obj_ut_b0"), 60, 100, 100, 88),
      fromInst(blowers[1], "blower", sid("obj_ut_b1"), 200, 100, 100, 88),
      fromInst(compressors[0], "compressor", sid("obj_ut_k0"), 360, 100, 110, 90),
      fromInst(hexes[0], "heat-exchanger", sid("obj_ut_he0"), 520, 90, 150, 110),
      fromInst(hexes[1], "heat-exchanger", sid("obj_ut_he1"), 720, 90, 150, 110),
fromInst(conveyors[0], "conveyor", sid("obj_ut_c0"), 60, 320, 200, 56),
      fromInst(conveyors[1], "conveyor", sid("obj_ut_c1"), 340, 320, 200, 56),
      fromInst(conveyors[2], "conveyor", sid("obj_ut_c2"), 620, 320, 200, 56),
      fromInst(motors[0], "motor", sid("obj_ut_m0"), 60, 420, 110, 80),
      fromInst(motors[1], "motor", sid("obj_ut_m1"), 200, 420, 110, 80),
      fromInst(vfds[0], "vfd-face", sid("obj_ut_vfd0"), 980, 80, 180, 150),
      fromInst(motors[0], "motor-face", sid("obj_ut_mface"), 980, 260, 180, 140),
      obj(
        sid("obj_ut_lamp"),
        "lamp",
        "AIR",
        860,
        120,
        64,
        64,
        [{ prop: "on", tagId: blowers[0].tagIds.Running }],
        { label: "AIR", colorOn: "#f0b429" },
      ),
    ],
    connections: [
      conn("c_ut_1", "obj_ut_c0", "out", "obj_ut_c1", "in"),
      conn("c_ut_2", "obj_ut_c1", "out", "obj_ut_c2", "in"),
    ],
  };
}

function screenLoops(
  pids: UdtInstance[],
  temps: UdtInstance[],
  flows: UdtInstance[],
  reactors: UdtInstance[],
  vessels: UdtInstance[],
  auto: UdtInstance,
): Screen {
  return {
    id: sid("scr_loops"),
    name: "14 — Control Loops",
    width: 1280,
    height: 720,
    objects: [
      obj(sid("txt_lp"), "text", "CONTROL LOOPS & FACEPLATES", 40, 24, 480, 32, [], {
        label: "CONTROL LOOPS & FACEPLATES",
        fontSize: 22,
      }),
      fromInst(pids[0], "pid-face", sid("obj_lp_p0"), 40, 90, 170, 120),
      fromInst(pids[1], "pid-face", sid("obj_lp_p1"), 240, 90, 170, 120),
      fromInst(pids[2], "pid-face", sid("obj_lp_p2"), 440, 90, 170, 120),
      fromInst(temps[0], "temp-face", sid("obj_lp_t0"), 640, 90, 170, 130),
      fromInst(temps[1], "temp-face", sid("obj_lp_t1"), 840, 90, 170, 130),
      fromInst(flows[0], "flow-face", sid("obj_lp_f0"), 40, 280, 170, 120),
      fromInst(flows[1], "flow-face", sid("obj_lp_f1"), 240, 280, 170, 120),
      fromInst(reactors[0], "reactor", sid("obj_lp_r0"), 480, 260, 140, 170),
      fromInst(vessels[0], "vessel", sid("obj_lp_v0"), 700, 300, 180, 90),
      obj(
        sid("obj_lp_mode"),
        "selector",
        "MODE",
        980,
        120,
        120,
        52,
        [{ prop: "auto", tagId: auto.tagIds.State }],
      ),
      obj(
        sid("obj_lp_sp"),
        "setpoint",
        "SP",
        980,
        200,
        130,
        64,
        [{ prop: "value", tagId: pids[0].tagIds.SP }],
        { unit: "%" },
      ),
      obj(sid("txt_lp_help"), "text", "help", 980, 300, 240, 80, [], {
        label: "All points from UDTs.\nClick equipment for control popup.\nHistorian samples to SQL.",
        fontSize: 12,
        color: "#93a0b5",
      }),
    ],
    connections: [],
  };
}

function screenTagBoard(pumps: UdtInstance[], valves: UdtInstance[]): Screen {
  // Compact overview showing first 10 pump + valve status lamps + numerics
  const objects: ScreenObject[] = [
    obj(sid("txt_tb"), "text", "LIVE TAG BOARD", 40, 20, 360, 32, [], {
      label: "LIVE TAG BOARD — sample of UDT tags",
      fontSize: 22,
    }),
  ];
  for (let i = 0; i < 10; i++) {
    const y = 70 + i * 58;
    objects.push(
      obj(
        sid(`obj_tb_plamp_${i}`),
        "lamp",
        pumps[i].instanceName,
        40,
        y,
        56,
        56,
        [{ prop: "on", tagId: pumps[i].tagIds.Running }],
        { label: pumps[i].instanceName },
      ),
    );
    objects.push(
      obj(
        sid(`obj_tb_pflow_${i}`),
        "numeric",
        "Flow",
        120,
        y + 4,
        150,
        48,
        [{ prop: "value", tagId: pumps[i].tagIds.Flow }],
        { label: `${pumps[i].instanceName} Flow`, decimals: 1, unit: "m³/h" },
      ),
    );
    objects.push(
      obj(
        sid(`obj_tb_vlamp_${i}`),
        "lamp",
        valves[i].instanceName,
        320,
        y,
        56,
        56,
        [{ prop: "on", tagId: valves[i].tagIds.Open }],
        { label: valves[i].instanceName, colorOn: "#f0b429" },
      ),
    );
    objects.push(
      obj(
        sid(`obj_tb_vpos_${i}`),
        "numeric",
        "Pos",
        400,
        y + 4,
        140,
        48,
        [{ prop: "value", tagId: valves[i].tagIds.Position }],
        { label: `${valves[i].instanceName} Pos`, decimals: 0, unit: "%" },
      ),
    );
  }
  return {
    id: sid("scr_tag_board"),
    name: "15 — Live Tag Board",
    width: 1280,
    height: 720,
    objects,
    connections: [],
  };
}

export function createDemoScreensFromPlant(
  plant: ReturnType<typeof buildPlant>,
): Screen[] {
  const { instances: i } = plant;
  // Keep earlier polished screens lightly by regenerating process-focused ones
  return [
    screenProcessTrain(
      i.tanks,
      i.pumps,
      i.valves,
      i.filters,
      i.flows,
      i.discretes[0],
    ),
    screenPumpFarm(i.pumps, i.valves),
    screenValveGallery(i.valves, i.controlValves),
    screenUtility(
      i.blowers,
      i.compressors,
      i.hexes,
      i.conveyors,
      i.motors,
      i.vfds,
    ),
    screenLoops(
      i.pids,
      i.temps,
      i.flows,
      i.reactors,
      i.vessels,
      i.discretes[1],
    ),
    screenTagBoard(i.pumps, i.valves),
  ];
}

export function createInitialProject(): ProjectState {
  const plant = buildPlant();
  const screens = createDemoScreensFromPlant(plant);
  return {
    name: "SCADA One Plant",
    version: 3,
    tags: plant.tags,
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

export { buildPlant as getPlantBlueprint };
