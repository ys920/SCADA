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
      <svg viewBox="0 0 120 160" className="widget-svg tall" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`tankLiq-${obj.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5cf0b0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1a7a52" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`tankShell-${obj.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a3648" />
            <stop offset="35%" stopColor="#3d4f66" />
            <stop offset="100%" stopColor="#1c2636" />
          </linearGradient>
        </defs>
        {/* shell */}
        <rect x="18" y="22" width="84" height="118" rx="8" fill={`url(#tankShell-${obj.id})`} stroke="#9aafc2" strokeWidth="2.5" />
        {/* dome */}
        <ellipse cx="60" cy="24" rx="42" ry="12" fill="#3d4f66" stroke="#9aafc2" strokeWidth="2.5" />
        {/* liquid clip */}
        <clipPath id={`tankClip-${obj.id}`}>
          <rect x="22" y="28" width="76" height="108" rx="4" />
        </clipPath>
        <g clipPath={`url(#tankClip-${obj.id})`}>
          <rect
            x="22"
            y={28 + 108 * (1 - pct / 100)}
            width="76"
            height={108 * (pct / 100)}
            fill={`url(#tankLiq-${obj.id})`}
          />
          <rect
            x="22"
            y={28 + 108 * (1 - pct / 100)}
            width="76"
            height="3"
            fill="rgba(255,255,255,0.35)"
          />
        </g>
        {/* nozzles */}
        <rect x="54" y="8" width="12" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="98" y="85" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="8" y="85" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="54" y="138" width="12" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <text x="60" y="90" textAnchor="middle" className="svg-text tank-pct-svg">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function ValveWidget({ obj, tags }: WidgetProps) {
  const open = asBool(boundValue(obj, "open", tags, false));
  const pos = asNumber(boundValue(obj, "position", tags, open ? 100 : 0), 0);
  const label = String(obj.props.label ?? obj.name);
  const active = open || pos > 5;
  return (
    <div style={shellStyle()} className={`widget-valve ${active ? "is-open" : ""}`}>
      <svg viewBox="0 0 72 72" className="widget-svg">
        {/* pipe stubs */}
        <rect x="2" y="31" width="18" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="52" y="31" width="18" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        {/* body */}
        <polygon
          points="20,22 36,36 20,50"
          fill={active ? "#2bb87a" : "#2a3648"}
          stroke="#9aafc2"
          strokeWidth="2"
        />
        <polygon
          points="52,22 36,36 52,50"
          fill={active ? "#2bb87a" : "#2a3648"}
          stroke="#9aafc2"
          strokeWidth="2"
        />
        {/* stem + actuator */}
        <rect x="33" y="10" width="6" height="26" rx="1" fill="#5c6f88" />
        <rect x="26" y="6" width="20" height="10" rx="3" fill="#f0b429" stroke="#c48a12" strokeWidth="1" />
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
        <defs>
          <radialGradient id={`pumpGrad-${obj.id}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4a5d75" />
            <stop offset="100%" stopColor="#1c2636" />
          </radialGradient>
        </defs>
        {/* flanges */}
        <rect x="2" y="34" width="18" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="76" y="34" width="18" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        {/* casing */}
        <circle
          cx="48"
          cy="40"
          r="28"
          fill={`url(#pumpGrad-${obj.id})`}
          stroke={running ? "#3ddc97" : "#9aafc2"}
          strokeWidth="2.5"
        />
        <circle cx="48" cy="40" r="18" fill="none" stroke="#5c6f88" strokeWidth="1.5" />
        {/* impeller */}
        <g className={running ? "pump-rotor" : ""} style={{ transformOrigin: "48px 40px" }}>
          <path d="M48 24 L54 40 L48 56 L42 40 Z" fill={running ? "#3ddc97" : "#6f849c"} />
          <path d="M32 40 L48 34 L64 40 L48 46 Z" fill={running ? "#2bb87a" : "#5c6f88"} opacity="0.85" />
        </g>
        <circle cx="48" cy="40" r="5" fill={running ? "#a8ffd4" : "#8fa0b8"} />
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
      <svg viewBox="0 0 120 80" className="widget-svg">
        <defs>
          <linearGradient id={`mtrShell-${obj.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a5d75" />
            <stop offset="100%" stopColor="#1c2636" />
          </linearGradient>
        </defs>
        <rect x="18" y="18" width="70" height="44" rx="8" fill={`url(#mtrShell-${obj.id})`} stroke="#9aafc2" strokeWidth="2" />
        <rect x="28" y="26" width="50" height="8" rx="2" fill="#2a3648" />
        <rect x="28" y="46" width="50" height="8" rx="2" fill="#2a3648" />
        <circle
          cx="96"
          cy="40"
          r="14"
          fill="#243146"
          stroke={running ? "#3ddc97" : "#9aafc2"}
          strokeWidth="2"
        />
        <g className={running ? "pump-rotor" : ""} style={{ transformOrigin: "96px 40px" }}>
          <path d="M96 30 L100 40 L96 50 L92 40 Z" fill={running ? "#3ddc97" : "#6f849c"} />
        </g>
        <circle cx="28" cy="40" r="5" fill={running ? "#3ddc97" : "#5c6f88"} />
        <text x="53" y="72" textAnchor="middle" className="svg-text">
          {speed.toFixed(0)} rpm
        </text>
      </svg>
      <div className="widget-label">{label}</div>
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
      <svg viewBox="0 0 180 90" className="widget-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`vesShell-${obj.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d4f66" />
            <stop offset="100%" stopColor="#1c2636" />
          </linearGradient>
          <linearGradient id={`vesLiq-${obj.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a7a52" />
            <stop offset="100%" stopColor="#5cf0b0" />
          </linearGradient>
          <clipPath id={`vesClip-${obj.id}`}>
            <ellipse cx="90" cy="45" rx="78" ry="28" />
          </clipPath>
        </defs>
        <ellipse cx="90" cy="45" rx="80" ry="30" fill={`url(#vesShell-${obj.id})`} stroke="#9aafc2" strokeWidth="2.5" />
        <g clipPath={`url(#vesClip-${obj.id})`}>
          <rect
            x="12"
            y="17"
            width={156 * (pct / 100)}
            height="56"
            fill={`url(#vesLiq-${obj.id})`}
            opacity="0.85"
          />
        </g>
        <rect x="2" y="40" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="164" y="40" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <text x="90" y="50" textAnchor="middle" className="svg-text tank-pct-svg" style={{ fontSize: 14 }}>
          {pct.toFixed(0)}%
        </text>
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function ControlValveWidget({ obj, tags }: WidgetProps) {
  const pos = asNumber(boundValue(obj, "position", tags, 0), 0);
  const label = String(obj.props.label ?? obj.name);
  const open = pos > 5;
  const stemY = 14 + (1 - Math.min(1, Math.max(0, pos / 100))) * 26;
  return (
    <div style={shellStyle()} className={`widget-cvalve ${open ? "is-open" : ""}`}>
      <svg viewBox="0 0 80 96" className="widget-svg">
        <rect x="2" y="56" width="18" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="60" y="56" width="18" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <polygon
          points="20,48 40,62 20,76"
          fill={open ? "#2bb87a" : "#2a3648"}
          stroke="#9aafc2"
          strokeWidth="2"
        />
        <polygon
          points="60,48 40,62 60,76"
          fill={open ? "#2bb87a" : "#2a3648"}
          stroke="#9aafc2"
          strokeWidth="2"
        />
        <rect x="37" y="18" width="6" height="44" rx="1" fill="#5c6f88" />
        <rect x="24" y="4" width="32" height="16" rx="4" fill="#243146" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="28" y={stemY} width="24" height="9" rx="2" fill="#f0b429" stroke="#c48a12" strokeWidth="1" />
      </svg>
      <div className="widget-label">{label} {pos.toFixed(0)}%</div>
    </div>
  );
}

export function CheckValveWidget({ obj }: WidgetProps) {
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-check">
      <svg viewBox="0 0 72 56" className="widget-svg">
        <rect x="2" y="23" width="16" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="54" y="23" width="16" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <polygon points="18,14 46,28 18,42" fill="#2a3648" stroke="#9aafc2" strokeWidth="2" />
        <line x1="46" y1="14" x2="46" y2="42" stroke="#9aafc2" strokeWidth="3" strokeLinecap="round" />
        <circle cx="46" cy="28" r="3" fill="#f0b429" />
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
        <defs>
          <radialGradient id={`blwGrad-${obj.id}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4a5d75" />
            <stop offset="100%" stopColor="#1c2636" />
          </radialGradient>
        </defs>
        <rect x="2" y="38" width="16" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="82" y="38" width="16" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <ellipse
          cx="50"
          cy="44"
          rx="30"
          ry="28"
          fill={`url(#blwGrad-${obj.id})`}
          stroke={running ? "#3ddc97" : "#9aafc2"}
          strokeWidth="2.5"
        />
        <g className={running ? "pump-rotor" : ""} style={{ transformOrigin: "50px 44px" }}>
          <path d="M50 20 L58 44 L50 68 L42 44 Z" fill={running ? "#3ddc97" : "#6f849c"} />
          <path d="M26 44 L50 36 L74 44 L50 52 Z" fill={running ? "#2bb87a" : "#5c6f88"} opacity="0.85" />
        </g>
        <circle cx="50" cy="44" r="5" fill={running ? "#a8ffd4" : "#8fa0b8"} />
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
      <svg viewBox="0 0 120 90" className="widget-svg">
        <defs>
          <linearGradient id={`cmpShell-${obj.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a5d75" />
            <stop offset="100%" stopColor="#1c2636" />
          </linearGradient>
        </defs>
        <rect x="2" y="40" width="16" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="102" y="40" width="16" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect
          x="20"
          y="22"
          width="80"
          height="48"
          rx="10"
          fill={`url(#cmpShell-${obj.id})`}
          stroke={running ? "#3ddc97" : "#9aafc2"}
          strokeWidth="2.5"
        />
        <rect x="32" y="34" width="20" height="24" rx="3" fill="#2a3648" stroke="#5c6f88" strokeWidth="1" />
        <rect x="58" y="34" width="20" height="24" rx="3" fill="#2a3648" stroke="#5c6f88" strokeWidth="1" />
        <circle cx="90" cy="46" r="8" fill={running ? "#3ddc97" : "#5c6f88"} />
        <text x="60" y="84" textAnchor="middle" className="svg-text">
          {load.toFixed(0)}% load
        </text>
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function HeatExchangerWidget({ obj, tags }: WidgetProps) {
  const duty = asNumber(boundValue(obj, "duty", tags, 0), 0);
  const label = String(obj.props.label ?? obj.name);
  return (
    <div style={shellStyle()} className="widget-hex">
      <svg viewBox="0 0 140 100" className="widget-svg">
        <defs>
          <linearGradient id={`hexShell-${obj.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d4f66" />
            <stop offset="100%" stopColor="#1c2636" />
          </linearGradient>
        </defs>
        <rect x="4" y="28" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="4" y="58" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="122" y="28" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="122" y="58" width="14" height="10" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="20" y="16" width="100" height="64" rx="10" fill={`url(#hexShell-${obj.id})`} stroke="#9aafc2" strokeWidth="2.5" />
        <path d="M32 28 Q70 48 108 28" fill="none" stroke="#f0b429" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 48 Q70 68 108 48" fill="none" stroke="#3ddc97" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 68 Q70 48 108 68" fill="none" stroke="#f0b429" strokeWidth="2.5" strokeLinecap="round" />
        <text x="70" y="94" textAnchor="middle" className="svg-text">
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
        <rect x="2" y="30" width="18" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="68" y="30" width="18" height="12" rx="2" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <rect x="20" y="12" width="48" height="48" rx="8" fill="#243146" stroke="#9aafc2" strokeWidth="2" />
        <path d="M28 20 L60 52 M28 28 L52 52 M28 36 L44 52" stroke="#f0b429" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="44" cy="36" r="4" fill="#5c6f88" />
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
      <svg viewBox="0 0 220 56" className="widget-svg" preserveAspectRatio="none">
        <rect x="8" y="14" width="204" height="28" rx="10" fill="#1c2636" stroke="#9aafc2" strokeWidth="2" />
        <rect x="16" y="20" width="188" height="16" rx="6" fill="#243146" />
        <g className={running ? "conveyor-motion" : ""}>
          <path
            d="M24 28 H196"
            fill="none"
            stroke={running ? "#3ddc97" : "#5c6f88"}
            strokeWidth="3"
            strokeDasharray="10 8"
            strokeLinecap="round"
          />
        </g>
        <circle cx="22" cy="28" r="8" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <circle cx="198" cy="28" r="8" fill="#2a3648" stroke="#9aafc2" strokeWidth="1.5" />
        <circle cx="22" cy="28" r="3" fill={running ? "#3ddc97" : "#6f849c"} />
        <circle cx="198" cy="28" r="3" fill={running ? "#3ddc97" : "#6f849c"} />
      </svg>
      <div className="widget-label">{label}</div>
    </div>
  );
}

export function TextWidget({ obj, tags }: WidgetProps) {
  const bound = boundValue(obj, "text", tags, undefined);
  const label = String(
    bound !== undefined && bound !== null && String(bound).length > 0
      ? bound
      : (obj.props.label ?? obj.name),
  );
  const fontSize = asNumber(obj.props.fontSize, 14);
  const color = String(obj.props.color ?? "#e8eef7");
  return (
    <div
      style={{
        ...shellStyle(),
        fontSize,
        color,
        whiteSpace: "pre-wrap",
        lineHeight: 1.35,
        display: "flex",
        alignItems: "center",
        fontFamily: "var(--font-display)",
        fontWeight: fontSize >= 20 ? 700 : 500,
      }}
      className="widget-text"
    >
      {label}
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
        if (binding && onWrite) onWrite(binding.tagId, !auto);
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
  text: TextWidget,
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
