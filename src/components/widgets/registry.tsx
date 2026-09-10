"use client";

import type { CSSProperties, ReactElement } from "react";
import { asBool, asNumber, boundValue, formatValue } from "@/lib/bindings";
import type { ScreenObject, Tag } from "@/lib/types";

interface WidgetProps {
  obj: ScreenObject;
  tags: Record<string, Tag>;
  interactive?: boolean;
  onWrite?: (tagId: string, value: boolean | number | string) => void;
}

function shellStyle(obj: ScreenObject): CSSProperties {
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
    <div style={shellStyle(obj)} className="widget-tank">
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
    <div style={shellStyle(obj)} className={`widget-valve ${open || pos > 5 ? "is-open" : ""}`}>
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
    <div style={shellStyle(obj)} className={`widget-pump ${running ? "is-running" : ""}`}>
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
    <div style={shellStyle(obj)} className={`widget-motor ${running ? "is-running" : ""}`}>
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
    <div style={shellStyle(obj)} className="widget-gauge">
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
    <div style={shellStyle(obj)} className="widget-numeric">
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
    <div style={shellStyle(obj)} className="widget-lamp">
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
    <div style={shellStyle(obj)} className="widget-bar">
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
      style={shellStyle(obj)}
      disabled={!interactive || !binding}
      onMouseDown={() => binding && onWrite?.(binding.tagId, true)}
      onMouseUp={() => binding && onWrite?.(binding.tagId, false)}
      onMouseLeave={() => binding && pressed && onWrite?.(binding.tagId, false)}
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
      style={shellStyle(obj)}
      disabled={!interactive || !binding}
      onClick={() => binding && onWrite?.(binding.tagId, !state)}
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
    <div style={shellStyle(obj)} className="widget-pid">
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

const REGISTRY: Record<string, (props: WidgetProps) => ReactElement> = {
  tank: TankWidget,
  valve: ValveWidget,
  pump: PumpWidget,
  motor: MotorWidget,
  gauge: GaugeWidget,
  numeric: NumericWidget,
  lamp: LampWidget,
  bar: BarWidget,
  button: ButtonWidget,
  toggle: ToggleWidget,
  "pid-face": PidFaceWidget,
};

export function RenderWidget(props: WidgetProps) {
  const Comp = REGISTRY[props.obj.libraryItemId];
  if (!Comp) {
    return (
      <div className="widget-unknown" style={shellStyle(props.obj)}>
        Unknown: {props.obj.libraryItemId}
      </div>
    );
  }
  return <Comp {...props} />;
}
