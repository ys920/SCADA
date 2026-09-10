"use client";

import type { ReactNode } from "react";
import { getLibraryItem } from "@/lib/library-catalog";
import { asBool, asNumber, boundValue, formatValue } from "@/lib/bindings";
import { useScadaStore, useTagMap } from "@/lib/store";
import type { BindableProp, DataType, ScreenObject, Tag } from "@/lib/types";

function CommandRow({ children }: { children: ReactNode }) {
  return <div className="ctrl-commands">{children}</div>;
}

function StatusPill({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <span className={`ctrl-pill ${ok ? "on" : "off"}`}>{label}</span>
  );
}

export function ObjectControlPopup() {
  const controlObjectId = useScadaStore((s) => s.controlObjectId);
  const setControlObjectId = useScadaStore((s) => s.setControlObjectId);
  const screens = useScadaStore((s) => s.screens);
  const runtimeScreenId = useScadaStore((s) => s.runtimeScreenId);
  const writeTagValue = useScadaStore((s) => s.writeTagValue);
  const releaseObjectManual = useScadaStore((s) => s.releaseObjectManual);
  const updateObject = useScadaStore((s) => s.updateObject);
  const tags = useScadaStore((s) => s.tags);
  const tagMap = useTagMap();

  if (!controlObjectId) return null;

  const screen =
    screens.find((s) => s.id === runtimeScreenId) ?? screens[0] ?? null;
  const obj = screen?.objects.find((o) => o.id === controlObjectId) ?? null;
  if (!obj || !screen) return null;

  const lib = getLibraryItem(obj.libraryItemId);
  const boundTags = obj.bindings
    .map((b) => tags.find((t) => t.id === b.tagId))
    .filter(Boolean) as Tag[];
  const anyManual = boundTags.some((t) => t.manualHold);

  const writeProp = (prop: string, value: boolean | number | string) => {
    const binding = obj.bindings.find((b) => b.prop === prop);
    if (binding) {
      writeTagValue(binding.tagId, value);
      return;
    }
    updateObject(obj.id, {
      props: { ...obj.props, [prop]: value },
    });
  };

  const readProp = (prop: string, fallback: unknown = 0) =>
    boundValue(obj, prop, tagMap, obj.props[prop] ?? fallback);

  const close = () => setControlObjectId(null);

  return (
    <div className="ctrl-backdrop" onClick={close} role="presentation">
      <div
        className="ctrl-popup"
        role="dialog"
        aria-modal="true"
        aria-label={`${obj.name} control`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctrl-head">
          <div>
            <div className="ctrl-kicker">{lib?.name ?? obj.libraryItemId}</div>
            <h2>{obj.name}</h2>
          </div>
          <button type="button" className="ghost-btn" onClick={close}>
            Close
          </button>
        </header>

        <div className="ctrl-status-row">
          <StatusPill ok={!anyManual} label={anyManual ? "MANUAL" : "AUTO"} />
          {boundTags.length > 0 ? (
            <button
              type="button"
              className="ghost-btn"
              onClick={() => releaseObjectManual(obj.id)}
              disabled={!anyManual}
            >
              Release to Auto
            </button>
          ) : (
            <span className="muted tiny">No tags bound — writing to object props</span>
          )}
        </div>

        <TypeCommands obj={obj} readProp={readProp} writeProp={writeProp} />

        <section className="ctrl-section">
          <h3>Points</h3>
          <div className="ctrl-points">
            {(lib?.bindableProps ?? []).map((bp) => (
              <PointControl
                key={bp.key}
                obj={obj}
                bp={bp}
                value={readProp(bp.key, bp.dataType === "bool" ? false : 0)}
                tag={
                  tags.find(
                    (t) =>
                      t.id ===
                      obj.bindings.find((b) => b.prop === bp.key)?.tagId,
                  ) ?? null
                }
                onWrite={(v) => writeProp(bp.key, v)}
              />
            ))}
            {(!lib || lib.bindableProps.length === 0) && (
              <p className="muted">This template has no bindable points.</p>
            )}
          </div>
        </section>

        <section className="ctrl-section">
          <h3>Bindings</h3>
          <ul className="ctrl-bindings">
            {obj.bindings.length === 0 && (
              <li className="muted">Unbound — bind tags in Designer for live PLC/sim points.</li>
            )}
            {obj.bindings.map((b) => {
              const tag = tagMap[b.tagId];
              return (
                <li key={b.prop}>
                  <span>{b.prop}</span>
                  <span className="mono">
                    {tag?.name ?? b.tagId}
                    {tag?.manualHold ? " · HOLD" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function TypeCommands({
  obj,
  readProp,
  writeProp,
}: {
  obj: ScreenObject;
  readProp: (prop: string, fallback?: unknown) => unknown;
  writeProp: (prop: string, value: boolean | number | string) => void;
}) {
  const id = obj.libraryItemId;

  if (["pump", "motor", "blower", "compressor", "conveyor", "motor-face", "pump-face", "vfd-face"].includes(id)) {
    const running = asBool(readProp("running", false));
    return (
      <section className="ctrl-section">
        <h3>Drive commands</h3>
        <CommandRow>
          <button
            type="button"
            className="primary-btn"
            onClick={() => writeProp("running", true)}
            disabled={running}
          >
            Start
          </button>
          <button
            type="button"
            className="danger-btn"
            onClick={() => writeProp("running", false)}
            disabled={!running}
          >
            Stop
          </button>
          <StatusPill ok={running} label={running ? "RUNNING" : "STOPPED"} />
        </CommandRow>
      </section>
    );
  }

  if (["valve", "valve-face", "check-valve"].includes(id)) {
    const open = asBool(readProp("open", false));
    return (
      <section className="ctrl-section">
        <h3>Valve commands</h3>
        <CommandRow>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              writeProp("open", true);
              writeProp("position", 100);
            }}
          >
            Open
          </button>
          <button
            type="button"
            className="danger-btn"
            onClick={() => {
              writeProp("open", false);
              writeProp("position", 0);
            }}
          >
            Close
          </button>
          <StatusPill ok={open} label={open ? "OPEN" : "CLOSED"} />
        </CommandRow>
      </section>
    );
  }

  if (id === "control-valve") {
    const pos = asNumber(readProp("position", 0), 0);
    return (
      <section className="ctrl-section">
        <h3>Control valve</h3>
        <CommandRow>
          <button type="button" className="ghost-btn" onClick={() => writeProp("position", 0)}>
            0%
          </button>
          <button type="button" className="ghost-btn" onClick={() => writeProp("position", 50)}>
            50%
          </button>
          <button type="button" className="ghost-btn" onClick={() => writeProp("position", 100)}>
            100%
          </button>
          <StatusPill ok={pos > 5} label={`${pos.toFixed(0)}%`} />
        </CommandRow>
      </section>
    );
  }

  if (["tank", "tank-face", "vessel", "reactor", "bar"].includes(id)) {
    return (
      <section className="ctrl-section">
        <h3>Level force</h3>
        <CommandRow>
          {[0, 25, 50, 75, 100].map((n) => (
            <button
              key={n}
              type="button"
              className="ghost-btn"
              onClick={() => writeProp("level", n)}
            >
              {n}%
            </button>
          ))}
        </CommandRow>
      </section>
    );
  }

  if (["pid-face", "temp-face", "setpoint"].includes(id)) {
    const spKey = id === "setpoint" ? "value" : "sp";
    const sp = asNumber(readProp(spKey, 50), 50);
    return (
      <section className="ctrl-section">
        <h3>Setpoint</h3>
        <CommandRow>
          <button type="button" className="ghost-btn" onClick={() => writeProp(spKey, Math.max(0, sp - 5))}>
            −5
          </button>
          <span className="mono-readout lg">{formatValue(sp, 1)}</span>
          <button type="button" className="ghost-btn" onClick={() => writeProp(spKey, sp + 5)}>
            +5
          </button>
        </CommandRow>
      </section>
    );
  }

  if (["button", "toggle", "lamp", "selector"].includes(id)) {
    const key =
      id === "button" ? "pressed" : id === "lamp" ? "on" : id === "selector" ? "auto" : "state";
    const on = asBool(readProp(key, false));
    return (
      <section className="ctrl-section">
        <h3>Discrete control</h3>
        <CommandRow>
          <button
            type="button"
            className={on ? "danger-btn" : "primary-btn"}
            onClick={() => writeProp(key, !on)}
          >
            {on ? "Turn Off" : "Turn On"}
          </button>
          <StatusPill ok={on} label={on ? "ON" : "OFF"} />
        </CommandRow>
      </section>
    );
  }

  return null;
}

function PointControl({
  bp,
  value,
  tag,
  onWrite,
}: {
  obj: ScreenObject;
  bp: BindableProp;
  value: unknown;
  tag: Tag | null;
  onWrite: (v: boolean | number | string) => void;
}) {
  return (
    <div className={`ctrl-point ${tag?.manualHold ? "held" : ""}`}>
      <div className="ctrl-point-top">
        <strong>{bp.label}</strong>
        <span className="mono tiny">
          {tag ? tag.name : "prop"}
          {tag?.manualHold ? " · HOLD" : ""}
        </span>
      </div>
      <PointEditor dataType={bp.dataType} value={value} onWrite={onWrite} />
    </div>
  );
}

function PointEditor({
  dataType,
  value,
  onWrite,
}: {
  dataType: DataType;
  value: unknown;
  onWrite: (v: boolean | number | string) => void;
}) {
  if (dataType === "bool") {
    const on = asBool(value);
    return (
      <div className="ctrl-commands">
        <button
          type="button"
          className={on ? "primary-btn" : "ghost-btn"}
          onClick={() => onWrite(true)}
        >
          1 / True
        </button>
        <button
          type="button"
          className={!on ? "danger-btn" : "ghost-btn"}
          onClick={() => onWrite(false)}
        >
          0 / False
        </button>
      </div>
    );
  }

  if (dataType === "string") {
    return (
      <input
        className="field"
        value={String(value ?? "")}
        onChange={(e) => onWrite(e.target.value)}
      />
    );
  }

  const num = asNumber(value, 0);
  return (
    <div className="ctrl-analog">
      <input
        className="field"
        type="number"
        step={dataType === "int" ? 1 : 0.1}
        value={Number.isFinite(num) ? num : 0}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChangeSafe(n, dataType, onWrite);
        }}
      />
      <input
        type="range"
        min={0}
        max={dataType === "int" ? 2000 : 100}
        step={dataType === "int" ? 1 : 0.5}
        value={clampRange(num, dataType)}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChangeSafe(n, dataType, onWrite);
        }}
      />
    </div>
  );
}

function onChangeSafe(
  n: number,
  dataType: DataType,
  onWrite: (v: boolean | number | string) => void,
) {
  if (!Number.isFinite(n)) return;
  onWrite(dataType === "int" ? Math.round(n) : n);
}

function clampRange(n: number, dataType: DataType) {
  const max = dataType === "int" ? 2000 : 100;
  return Math.min(max, Math.max(0, n));
}
