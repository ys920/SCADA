/** SCADA One domain types — keep extendable for new library components and I/O sources. */

export type DataType = "bool" | "int" | "float" | "string";

export type TagQuality = "good" | "uncertain" | "bad";

export type TagSource = "simulation" | "opcua";

export type SimProfile =
  | "constant"
  | "sine"
  | "ramp"
  | "noise"
  | "toggle"
  | "pulse";

export interface SimConfig {
  profile: SimProfile;
  periodMs: number;
  min: number;
  max: number;
  /** For sine/noise amplitude around offset; for constant = value */
  amplitude: number;
  offset: number;
  phase: number;
}

export interface Tag {
  id: string;
  name: string;
  path: string;
  dataType: DataType;
  unit?: string;
  description?: string;
  value: boolean | number | string;
  quality: TagQuality;
  timestamp: number;
  source: TagSource;
  sim?: SimConfig;
  /** When true, simulation will not overwrite operator writes */
  manualHold?: boolean;
  /** Optional alarm stubs for later */
  hiLimit?: number;
  loLimit?: number;
}

export type LibraryCategory =
  | "process"
  | "indicators"
  | "controls"
  | "faces";

export interface PortDef {
  id: string;
  name: string;
  side: "left" | "right" | "top" | "bottom";
  /** 0–1 along that side */
  offset: number;
  direction: "in" | "out" | "bidirectional";
}

export interface BindableProp {
  key: string;
  label: string;
  dataType: DataType;
  description?: string;
}

export interface LibraryItem {
  id: string;
  category: LibraryCategory;
  name: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  ports: PortDef[];
  bindableProps: BindableProp[];
  /** Default static props when placed */
  defaultProps: Record<string, unknown>;
}

export interface PropBinding {
  prop: string;
  tagId: string;
}

export interface ScreenObject {
  id: string;
  libraryItemId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  bindings: PropBinding[];
  props: Record<string, unknown>;
}

export interface ConnectionEndpoint {
  objectId: string;
  portId: string;
}

export interface Connection {
  id: string;
  from: ConnectionEndpoint;
  to: ConnectionEndpoint;
}

export interface Screen {
  id: string;
  name: string;
  width: number;
  height: number;
  objects: ScreenObject[];
  connections: Connection[];
}

export type OpcUaSecurityMode = "None" | "Sign" | "SignAndEncrypt";
export type OpcUaSecurityPolicy =
  | "None"
  | "Basic256Sha256"
  | "Aes128_Sha256_RsaOaep";
export type OpcUaAuthMode = "Anonymous" | "Username";
export type OpcUaConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"
  | "simulated";

export interface OpcUaMapping {
  id: string;
  nodeId: string;
  tagId: string;
  browseName?: string;
}

export interface OpcUaConfig {
  endpointUrl: string;
  securityMode: OpcUaSecurityMode;
  securityPolicy: OpcUaSecurityPolicy;
  authMode: OpcUaAuthMode;
  username: string;
  /** Never persist real secrets long-term in localStorage in production */
  password: string;
  enabled: boolean;
  pollIntervalMs: number;
  mappings: OpcUaMapping[];
  status: {
    state: OpcUaConnectionState;
    message: string;
    lastOkAt?: number;
  };
}

export type AppTab =
  | "library"
  | "udts"
  | "tags"
  | "designer"
  | "runtime"
  | "historian"
  | "opcua";

export interface ProjectState {
  name: string;
  version: number;
  tags: Tag[];
  screens: Screen[];
  activeScreenId: string | null;
  runtimeScreenId: string | null;
  opcUa: OpcUaConfig;
  selectedObjectId: string | null;
  connectFrom: ConnectionEndpoint | null;
  designerMode: "select" | "connect";
  simRunning: boolean;
  simTickMs: number;
}
