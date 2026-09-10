"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { asBool, asNumber, boundValue, formatValue } from "@/lib/bindings";
import type { ScreenObject, Tag } from "@/lib/types";

interface WidgetProps {
  obj: ScreenObject;
  tags: Record<string, Tag>;
  interactive?: boolean;
  onWrite?: (tagId: string, value: boolean | number | string) => void;
}

function shellStyle(): CSSProperties {
  return {
    width: "100%",
    height: "100%",
    position: "relative",
    userSelect: "none",
  };
}

export function TankWidget({ obj, tags }: WidgetProps) {
  const level = asNumber(boundValue(obj, "level", tags, 0), 0);
  const pct = Math.min(100, Math.max(0, level));
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-tank">
      <div className="tank-body">
        <div className="tank-fill" style={{ height: `${pct}%` }} />
        <span className="tank-pct">{pct.toFixed(0)}%</span>
      </div>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function ValveWidget({ obj, tags }: WidgetProps) {
  const open = asBool(boundValue(obj, "open", tags, false));
  const pos = asNumber(boundValue(obj, "position", tags, open ? 100 : 0), 0);
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className={`widget-valve ${open || pos > 5 ? "is-open" : ""}`}>
      <svg viewBox="0 0 72 72" className="widget-svg">
        <line x1="4" y1="36" x2="24" y2="36" stroke="currentColor" strokeWidth="4" />
        <line x1="48" y1="36" x2="68" y2="36" stroke="currentColor" strokeWidth="4" />
        <polygon
          points="24,20 48,36 24,52"
          fill={open || pos > 5 ? "var(--signal)" : "var(--steel-3)"}
          stroke="var(--steel-1)"
          strokeWidth="2"
        />
        <polygon
          points="48,20 24,36 48,52"
          fill={open || pos > 5 ? "var(--signal)" : "var(--steel-3)"}
          stroke="var(--steel-1)"
          strokeWidth="2"
        />
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function PumpWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className={`widget-pump ${running ? "is-running" : ""}`}>
      <svg viewBox="0 0 96 80" className="widget-svg">
        <circle
          cx="48"
          cy="40"
          r="26"
          fill="var(--steel-3)"
          stroke={running ? "var(--signal)" : "var(--steel-1)"}
          strokeWidth="3"
        />
        <circle
          cx="48"
          cy="40"
          r="10"
          className={running ? "pump-rotor" : ""}
          fill={running ? "var(--signal)" : "var(--steel-2)"}
        />
        <path
          d="M74 40 H90 M6 40 H22"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function MotorWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const speed = asNumber(boundValue(obj, "speed", tags, 0), 0);
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className={`widget-motor ${running ? "is-running" : ""}`}>
      <div className="motor-block">
        <span className="motor-dot" />
        <div>
          <div className="widget-label tight">{label}</div>
          <div className="mono-readout">{speed.toFixed(0)} rpm</div>
        </div>
      </div>
    </div>
  );
}

export function GaugeWidget({ obj, tags }: WidgetProps) {
  const value = asNumber(boundValue(obj, "value", tags, 0), 0);
  const min = asNumber(obj.props.min, 0);
  const max = asNumber(obj.props.max, 100);
  const unit = String(obj.props.unit ?? "");
  const label = String(obj.props.label ?? obj.name);
  const frac = max === min ? 0 : (value - min) / (max - min);
  const angle = -120 + Math.min(1, Math.max(0, frac)) * 240;
  return (
    <div style={shellStyle()} className="widget-gauge">
      <svg viewBox="0 0 110 110" className="widget-svg">
        <path
          d="M20 78 A40 40 0 1 1 90 78"
          fill="none"
          stroke="var(--steel-3)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1="55"
          y1="55"
          x2={55 + 32 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={55 + 32 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke="var(--amber)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="55" cy="55" r="4" fill="var(--amber)" />
        <text x="55" y="92" textAnchor="middle" className="svg-text">
          {formatValue(value, 1, unit)}
        </text>
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function NumericWidget({ obj, tags }: WidgetProps) {
  const value = boundValue(obj, "value", tags, 0);
  const decimals = asNumber(obj.props.decimals, 1);
  const unit = String(obj.props.unit ?? "");
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-numeric">
      <div className="widget-label tight">{label}</div>
      <div className="mono-readout lg">{formatValue(value, decimals, unit)}</div>
    </div>
  );
}

export function LampWidget({ obj, tags }: WidgetProps) {
  const on = asBool(boundValue(obj, "on", tags, false));
  const label = String(obj.props.label ?? obj.name);
  const colorOn = String(obj.props.colorOn ?? "#3ddc97");
  const colorOff = String(obj.props.colorOff ?? "#2a3340");
  return (
    <div style={shellStyle()} className="widget-lamp">
      <div
        className={`lamp-orb ${on ? "on" : ""}`}
        style={{ background: on ? colorOn : colorOff }}
      />
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function BarWidget({ obj, tags }: WidgetProps) {
  const value = asNumber(boundValue(obj, "value", tags, 0), 0);
  const min = asNumber(obj.props.min, 0);
  const max = asNumber(obj.props.max, 100);
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-bar">
      <div className="bar-track">
        <div className="bar-fill" style={{ height: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function ButtonWidget({ obj, tags, interactive, onWrite }: WidgetProps) {
  const binding = obj.bindings.find((b) => b.prop === "pressed");
  const pressed = asBool(boundValue(obj, "pressed", tags, false));
  const label = String(obj.props.label ?? obj.name);
  return (
    <button
      type="button"
      className={`widget-button ${pressed ? "is-pressed" : ""}`}
      style={shellStyle()}
      disabled={!interactive || !binding}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (binding) onWrite?.(binding.tagId, true);
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        if (binding) onWrite?.(binding.tagId, false);
      }}
      onMouseLeave={() => {
        if (binding && pressed) onWrite?.(binding.tagId, false);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </button>
  );
}

export function ToggleWidget({ obj, tags, interactive, onWrite }: WidgetProps) {
  const binding = obj.bindings.find((b) => b.prop === "state");
  const state = asBool(boundValue(obj, "state", tags, false));
  const label = String(obj.props.label ?? obj.name);
  return (
    <button
      type="button"
      className={`widget-toggle ${state ? "is-on" : ""}`}
      style={shellStyle()}
      disabled={!interactive || !binding}
      onClick={(e) => {
        e.stopPropagation();
        if (binding) onWrite?.(binding.tagId, !state);
      }}
    >
      <span className="toggle-knob" />
      <span>{label}</span>
    </button>
  );
}

export function PidFaceWidget({ obj, tags }: WidgetProps) {
  const pv = asNumber(boundValue(obj, "pv", tags, 0), 0);
  const sp = asNumber(boundValue(obj, "sp", tags, 0), 0);
  const out = asNumber(boundValue(obj, "out", tags, 0), 0);
  const unit = String(obj.props.unit ?? "%");
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-pid">
      <div className="pid-title">{label}</div>
      <div className="pid-row">
        <span>PV</span>
        <span className="mono-readout">{formatValue(pv, 1, unit)}</span>
      </div>
      <div className="pid-row">
        <span>SP</span>
        <span className="mono-readout">{formatValue(sp, 1, unit)}</span>
      </div>
      <div className="pid-row">
        <span>OUT</span>
        <span className="mono-readout">{formatValue(out, 1, unit)}</span>
      </div>
    </div>
  );
}

export function VesselWidget({ obj, tags }: WidgetProps) {
  const level = asNumber(boundValue(obj, "level", tags, 0), 0);
  const pct = Math.min(100, Math.max(0, level));
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-vessel">
      <div className="vessel-body">
        <div className="vessel-fill" style={{ width: `${pct}%` }} />
        <span className="tank-pct">{pct.toFixed(0)}%</span>
      </div>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function ControlValveWidget({ obj, tags }: WidgetProps) {
  const pos = asNumber(boundValue(obj, "position", tags, 0), 0);
  const label = String(obj.props.label ?? obj.name);
  const open = pos > 5;
  return (
    <div style={shellStyle()} className={`widget-cvalve ${open ? "is-open" : ""}`}>
      <svg viewBox="0 0 80 96" className="widget-svg">
        <line x1="4" y1="62" x2="28" y2="62" stroke="currentColor" strokeWidth="4" />
        <line x1="52" y1="62" x2="76" y2="62" stroke="currentColor" strokeWidth="4" />
        <polygon
          points="28,48 52,62 28,76"
          fill={open ? "var(--signal)" : "var(--steel-3)"}
          stroke="var(--steel-1)"
          strokeWidth="2"
        />
        <polygon
          points="52,48 28,62 52,76"
          fill={open ? "var(--signal)" : "var(--steel-3)"}
          stroke="var(--steel-1)"
          strokeWidth="2"
        />
        <rect x="36" y="12" width="8" height="36" rx="2" fill="var(--steel-2)" />
        <rect
          x="28"
          y={12 + (1 - Math.min(1, Math.max(0, pos / 100))) * 28}
          width="24"
          height="10"
          rx="2"
          fill="var(--amber)"
        />
      </svg>
      <div className="widget-label">{label} {pos.toFixed(0)}%</div>
    </div>
  );
}

export function CheckValveWidget({ obj }: WidgetProps) {
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-check">
      <svg viewBox="0 0 64 56" className="widget-svg">
        <line x1="4" y1="28" x2="20" y2="28" stroke="currentColor" strokeWidth="4" />
        <line x1="44" y1="28" x2="60" y2="28" stroke="currentColor" strokeWidth="4" />
        <polygon points="20,14 44,28 20,42" fill="var(--steel-3)" stroke="var(--steel-1)" strokeWidth="2" />
        <line x1="44" y1="14" x2="44" y2="42" stroke="var(--steel-1)" strokeWidth="3" />
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function BlowerWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className={`widget-blower ${running ? "is-running" : ""}`}>
      <svg viewBox="0 0 100 88" className="widget-svg">
        <ellipse
          cx="50"
          cy="44"
          rx="30"
          ry="28"
          fill="var(--steel-3)"
          stroke={running ? "var(--signal)" : "var(--steel-1)"}
          strokeWidth="3"
        />
        <path
          className={running ? "pump-rotor" : ""}
          d="M50 20 L58 44 L50 68 L42 44 Z"
          fill={running ? "var(--signal)" : "var(--steel-2)"}
          style={{ transformOrigin: "50px 44px" }}
        />
        <path d="M8 44 H20 M80 44 H92" stroke="currentColor" strokeWidth="4" />
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function CompressorWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const load = asNumber(boundValue(obj, "load", tags, 0), 0);
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className={`widget-compressor ${running ? "is-running" : ""}`}>
      <div className="comp-body">
        <span className={`motor-dot ${running ? "on" : ""}`} />
        <div>
          <div className="widget-label tight">{label}</div>
          <div className="mono-readout">{load.toFixed(0)}% load</div>
        </div>
      </div>
    </div>
  );
}

export function HeatExchangerWidget({ obj, tags }: WidgetProps) {
  const duty = asNumber(boundValue(obj, "duty", tags, 0), 0);
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-hex">
      <svg viewBox="0 0 140 100" className="widget-svg">
        <rect x="20" y="18" width="100" height="64" rx="8" fill="var(--steel-3)" stroke="var(--steel-1)" strokeWidth="2" />
        <path d="M30 30 Q70 50 110 30" fill="none" stroke="var(--amber)" strokeWidth="2.5" />
        <path d="M30 50 Q70 70 110 50" fill="none" stroke="var(--signal)" strokeWidth="2.5" />
        <path d="M30 70 Q70 50 110 70" fill="none" stroke="var(--amber)" strokeWidth="2.5" />
        <text x="70" y="92" textAnchor="middle" className="svg-text">
          {duty.toFixed(0)}%
        </text>
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function FilterWidget({ obj, tags }: WidgetProps) {
  const dp = asNumber(boundValue(obj, "dp", tags, 0), 0);
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-filter">
      <svg viewBox="0 0 88 72" className="widget-svg">
        <line x1="4" y1="36" x2="22" y2="36" stroke="currentColor" strokeWidth="4" />
        <line x1="66" y1="36" x2="84" y2="36" stroke="currentColor" strokeWidth="4" />
        <rect x="22" y="14" width="44" height="44" rx="6" fill="var(--steel-3)" stroke="var(--steel-1)" strokeWidth="2" />
        <line x1="30" y1="22" x2="58" y2="50" stroke="var(--amber)" strokeWidth="2" />
        <line x1="30" y1="30" x2="58" y2="58" stroke="var(--amber)" strokeWidth="2" />
        <line x1="30" y1="38" x2="50" y2="58" stroke="var(--amber)" strokeWidth="2" />
      </svg>
      <div className="widget-label">{label} ΔP {dp.toFixed(1)}</div>
    </div>
  );
}

export function ReactorWidget({ obj, tags }: WidgetProps) {
  const level = asNumber(boundValue(obj, "level", tags, 0), 0);
  const temp = asNumber(boundValue(obj, "temp", tags, 0), 0);
  const agitating = asBool(boundValue(obj, "agitating", tags, false));
  const pct = Math.min(100, Math.max(0, level));
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className={`widget-reactor ${agitating ? "is-running" : ""}`}>
      <div className="tank-body">
        <div className="tank-fill" style={{ height: `${pct}%` }} />
        <span className="tank-pct">{temp.toFixed(0)}°C</span>
      </div>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function ConveyorWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className={`widget-conveyor ${running ? "is-running" : ""}`}>
      <div className="conveyor-belt">
        <div className="conveyor-dash" />
      </div>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function SparklineWidget({ obj, tags }: WidgetProps) {
  const value = asNumber(boundValue(obj, "value", tags, 0), 0);
  const min = asNumber(obj.props.min, 0);
  const max = asNumber(obj.props.max, 100);
  const label = String(obj.props.label ?? obj.name);
  // Deterministic decorative trail from current value (no render-time mutation)
  const pts = Array.from({ length: 24 }, (_, i) => {
    const t = i / 23;
    const wobble = Math.sin(t * Math.PI * 3 + value * 0.08) * 8;
    const v = value + wobble;
    const x = t * 140 + 8;
    const frac = max === min ? 0.5 : (v - min) / (max - min);
    const y = 48 - Math.min(1, Math.max(0, frac)) * 36;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div style={shellStyle()} className="widget-spark">
      <div className="widget-label tight">{label}</div>
      <svg viewBox="0 0 156 56" className="widget-svg">
        <polyline points={pts} fill="none" stroke="var(--signal)" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function AlarmBannerWidget({ obj, tags }: WidgetProps) {
  const active = asBool(boundValue(obj, "active", tags, false));
  const text =
    String(boundValue(obj, "text", tags, obj.props.message ?? "Alarm") ?? "Alarm");
  const label = String(obj.props.label ?? "ALARM");
  return (
    <div
      style={shellStyle()}
      className={`widget-alarm ${active ? "is-active" : ""}`}
    >
      <strong>{label}</strong>
      <span>{active ? text : "Normal"}</span>
    </div>
  );
}

export function SetpointWidget({ obj, tags }: WidgetProps) {
  const value = asNumber(boundValue(obj, "value", tags, 0), 0);
  const unit = String(obj.props.unit ?? "");
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-numeric">
      <div className="widget-label tight">{label}</div>
      <div className="mono-readout lg">{formatValue(value, 1, unit)}</div>
    </div>
  );
}

export function SelectorWidget({
  obj,
  tags,
  interactive,
  onWrite,
}: WidgetProps) {
  const binding = obj.bindings.find((b) => b.prop === "auto");
  const auto = asBool(boundValue(obj, "auto", tags, false));
  const label = String(obj.props.label ?? obj.name);
  return (
    <button
      type="button"
      className={`widget-selector ${auto ? "is-auto" : ""}`}
      style={shellStyle()}
      disabled={!interactive || !binding}
      onClick={(e) => {
        e.stopPropagation();
        if (binding) onWrite?.(binding.tagId, !auto);
      }}
    >
      <span className="widget-label tight">{label}</span>
      <strong>{auto ? "AUTO" : "MAN"}</strong>
    </button>
  );
}

function FaceShell({
  title,
  children,
  status,
}: {
  title: string;
  children: ReactNode;
  status?: "ok" | "run" | "fault" | "idle";
}) {
  return (
    <div style={shellStyle()} className={`widget-face status-${status ?? "idle"}`}>
      <div className="face-head">
        <span className="face-title">{title}</span>
        <span className="face-dot" />
      </div>
      <div className="face-body">{children}</div>
    </div>
  );
}

export function MotorFaceWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const speed = asNumber(boundValue(obj, "speed", tags, 0), 0);
  const amps = asNumber(boundValue(obj, "amps", tags, 0), 0);
  const fault = asBool(boundValue(obj, "fault", tags, false));
  return (
    <FaceShell
      title={String(obj.props.label ?? obj.name)}
      status={fault ? "fault" : running ? "run" : "idle"}
    >
      <div className="pid-row">
        <span>State</span>
        <span className="mono-readout">{fault ? "FAULT" : running ? "RUN" : "STOP"}</span>
      </div>
      <div className="pid-row">
        <span>Speed</span>
        <span className="mono-readout">{speed.toFixed(0)} rpm</span>
      </div>
      <div className="pid-row">
        <span>Amps</span>
        <span className="mono-readout">{amps.toFixed(1)} A</span>
      </div>
    </FaceShell>
  );
}

export function PumpFaceWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const flow = asNumber(boundValue(obj, "flow", tags, 0), 0);
  const pressure = asNumber(boundValue(obj, "pressure", tags, 0), 0);
  const fault = asBool(boundValue(obj, "fault", tags, false));
  const flowUnit = String(obj.props.flowUnit ?? "m³/h");
  const pressureUnit = String(obj.props.pressureUnit ?? "bar");
  return (
    <FaceShell
      title={String(obj.props.label ?? obj.name)}
      status={fault ? "fault" : running ? "run" : "idle"}
    >
      <div className="pid-row">
        <span>State</span>
        <span className="mono-readout">{fault ? "FAULT" : running ? "RUN" : "STOP"}</span>
      </div>
      <div className="pid-row">
        <span>Flow</span>
        <span className="mono-readout">{formatValue(flow, 1, flowUnit)}</span>
      </div>
      <div className="pid-row">
        <span>Press</span>
        <span className="mono-readout">{formatValue(pressure, 1, pressureUnit)}</span>
      </div>
    </FaceShell>
  );
}

export function ValveFaceWidget({ obj, tags }: WidgetProps) {
  const open = asBool(boundValue(obj, "open", tags, false));
  const position = asNumber(boundValue(obj, "position", tags, open ? 100 : 0), 0);
  const fault = asBool(boundValue(obj, "fault", tags, false));
  return (
    <FaceShell
      title={String(obj.props.label ?? obj.name)}
      status={fault ? "fault" : open || position > 5 ? "run" : "idle"}
    >
      <div className="pid-row">
        <span>FB</span>
        <span className="mono-readout">{open ? "OPEN" : "CLOSED"}</span>
      </div>
      <div className="pid-row">
        <span>Pos</span>
        <span className="mono-readout">{position.toFixed(0)} %</span>
      </div>
      <div className="face-bar">
        <div style={{ width: `${Math.min(100, Math.max(0, position))}%` }} />
      </div>
    </FaceShell>
  );
}

export function TankFaceWidget({ obj, tags }: WidgetProps) {
  const level = asNumber(boundValue(obj, "level", tags, 0), 0);
  const hi = asBool(boundValue(obj, "hi", tags, false));
  const lo = asBool(boundValue(obj, "lo", tags, false));
  const unit = String(obj.props.unit ?? "%");
  return (
    <FaceShell
      title={String(obj.props.label ?? obj.name)}
      status={hi || lo ? "fault" : "ok"}
    >
      <div className="pid-row">
        <span>Level</span>
        <span className="mono-readout">{formatValue(level, 1, unit)}</span>
      </div>
      <div className="face-bar tall">
        <div style={{ height: `${Math.min(100, Math.max(0, level))}%`, width: "100%" }} />
      </div>
      <div className="face-alarms">
        <span className={hi ? "on" : ""}>HI</span>
        <span className={lo ? "on" : ""}>LO</span>
      </div>
    </FaceShell>
  );
}

export function VfdFaceWidget({ obj, tags }: WidgetProps) {
  const running = asBool(boundValue(obj, "running", tags, false));
  const hz = asNumber(boundValue(obj, "hz", tags, 0), 0);
  const amps = asNumber(boundValue(obj, "amps", tags, 0), 0);
  const torque = asNumber(boundValue(obj, "torque", tags, 0), 0);
  return (
    <FaceShell
      title={String(obj.props.label ?? obj.name)}
      status={running ? "run" : "idle"}
    >
      <div className="pid-row">
        <span>Freq</span>
        <span className="mono-readout">{hz.toFixed(1)} Hz</span>
      </div>
      <div className="pid-row">
        <span>Amps</span>
        <span className="mono-readout">{amps.toFixed(1)} A</span>
      </div>
      <div className="pid-row">
        <span>Torque</span>
        <span className="mono-readout">{torque.toFixed(0)} %</span>
      </div>
    </FaceShell>
  );
}

export function TempFaceWidget({ obj, tags }: WidgetProps) {
  const pv = asNumber(boundValue(obj, "pv", tags, 0), 0);
  const sp = asNumber(boundValue(obj, "sp", tags, 0), 0);
  const out = asNumber(boundValue(obj, "out", tags, 0), 0);
  const unit = String(obj.props.unit ?? "°C");
  return (
    <FaceShell title={String(obj.props.label ?? obj.name)} status="ok">
      <div className="pid-row">
        <span>PV</span>
        <span className="mono-readout">{formatValue(pv, 1, unit)}</span>
      </div>
      <div className="pid-row">
        <span>SP</span>
        <span className="mono-readout">{formatValue(sp, 1, unit)}</span>
      </div>
      <div className="pid-row">
        <span>OUT</span>
        <span className="mono-readout">{formatValue(out, 1, "%")}</span>
      </div>
    </FaceShell>
  );
}

export function FlowFaceWidget({ obj, tags }: WidgetProps) {
  const rate = asNumber(boundValue(obj, "rate", tags, 0), 0);
  const total = asNumber(boundValue(obj, "total", tags, 0), 0);
  const rateUnit = String(obj.props.rateUnit ?? "m³/h");
  const totalUnit = String(obj.props.totalUnit ?? "m³");
  return (
    <FaceShell title={String(obj.props.label ?? obj.name)} status="ok">
      <div className="pid-row">
        <span>Rate</span>
        <span className="mono-readout">{formatValue(rate, 1, rateUnit)}</span>
      </div>
      <div className="pid-row">
        <span>Total</span>
        <span className="mono-readout">{formatValue(total, 0, totalUnit)}</span>
      </div>
    </FaceShell>
  );
}

const REGISTRY: Record<string, (props: WidgetProps) => ReactElement> = {
  tank: TankWidget,
  vessel: VesselWidget,
  valve: ValveWidget,
  "control-valve": ControlValveWidget,
  "check-valve": CheckValveWidget,
  pump: PumpWidget,
  blower: BlowerWidget,
  compressor: CompressorWidget,
  motor: MotorWidget,
  "heat-exchanger": HeatExchangerWidget,
  filter: FilterWidget,
  reactor: ReactorWidget,
  conveyor: ConveyorWidget,
  gauge: GaugeWidget,
  numeric: NumericWidget,
  lamp: LampWidget,
  bar: BarWidget,
  sparkline: SparklineWidget,
  "alarm-banner": AlarmBannerWidget,
  button: ButtonWidget,
  toggle: ToggleWidget,
  setpoint: SetpointWidget,
  selector: SelectorWidget,
  "pid-face": PidFaceWidget,
  "motor-face": MotorFaceWidget,
  "pump-face": PumpFaceWidget,
  "valve-face": ValveFaceWidget,
  "tank-face": TankFaceWidget,
  "vfd-face": VfdFaceWidget,
  "temp-face": TempFaceWidget,
  "flow-face": FlowFaceWidget,
};

export function RenderWidget(props: WidgetProps) {
  const Comp = REGISTRY[props.obj.libraryItemId];
  if (!Comp) {
    return (
      <div className="widget-unknown" style={shellStyle()}>
        Unknown: {props.obj.libraryItemId}
      </div>
    );
  }
  return <Comp {...props} />;
}
