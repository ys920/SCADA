"use client";

import { useRef, useState } from "react";
import { LIBRARY_CATALOG, getLibraryItem } from "@/lib/library-catalog";
import { connectionSvgPaths } from "@/lib/connections";
import { portPosition } from "@/lib/bindings";
import { useScadaStore, useTagMap } from "@/lib/store";
import { RenderWidget } from "@/components/widgets/registry";
import type { ScreenObject } from "@/lib/types";

export function DesignerTab() {
  const screens = useScadaStore((s) => s.screens);
  const activeScreenId = useScadaStore((s) => s.activeScreenId);
  const setActiveScreen = useScadaStore((s) => s.setActiveScreen);
  const addScreen = useScadaStore((s) => s.addScreen);
  const renameScreen = useScadaStore((s) => s.renameScreen);
  const deleteScreen = useScadaStore((s) => s.deleteScreen);
  const designerMode = useScadaStore((s) => s.designerMode);
  const setDesignerMode = useScadaStore((s) => s.setDesignerMode);
  const selectedObjectId = useScadaStore((s) => s.selectedObjectId);
  const selectObject = useScadaStore((s) => s.selectObject);
  const placeLibraryItem = useScadaStore((s) => s.placeLibraryItem);
  const updateObject = useScadaStore((s) => s.updateObject);
  const deleteObject = useScadaStore((s) => s.deleteObject);
  const bindObjectProp = useScadaStore((s) => s.bindObjectProp);
  const connectFrom = useScadaStore((s) => s.connectFrom);
  const setConnectFrom = useScadaStore((s) => s.setConnectFrom);
  const completeConnection = useScadaStore((s) => s.completeConnection);
  const deleteConnection = useScadaStore((s) => s.deleteConnection);
  const tags = useScadaStore((s) => s.tags);
  const tagMap = useTagMap();

  const [paletteId, setPaletteId] = useState(LIBRARY_CATALOG[0]?.id ?? "tank");
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    ox: number;
    oy: number;
  } | null>(null);

  const screen = screens.find((s) => s.id === activeScreenId) ?? null;
  const selected =
    screen?.objects.find((o) => o.id === selectedObjectId) ?? null;
  const selectedLib = selected
    ? getLibraryItem(selected.libraryItemId)
    : undefined;

  const connectionPaths = screen ? connectionSvgPaths(screen) : [];

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (!screen || !canvasRef.current) return;
    if ((e.target as HTMLElement).closest(".screen-object")) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (designerMode === "select" && e.altKey) {
      placeLibraryItem(paletteId, x - 40, y - 40);
      return;
    }
    selectObject(null);
  };

  const startDrag = (obj: ScreenObject, e: React.PointerEvent) => {
    if (designerMode !== "select") return;
    e.stopPropagation();
    selectObject(obj.id);
    dragRef.current = {
      id: obj.id,
      ox: e.clientX - obj.x,
      oy: e.clientY - obj.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    updateObject(dragRef.current.id, {
      x: e.clientX - dragRef.current.ox,
      y: e.clientY - dragRef.current.oy,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="designer-layout">
      <aside className="designer-rail">
        <h2>Screens</h2>
        <ul className="screen-list">
          {screens.map((sc) => (
            <li key={sc.id}>
              <button
                type="button"
                className={sc.id === activeScreenId ? "active" : ""}
                onClick={() => setActiveScreen(sc.id)}
              >
                {sc.name}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="primary-btn block" onClick={() => addScreen()}>
          Add screen
        </button>
        {screen && (
          <>
            <label className="rail-label">
              Rename
              <input
                className="field"
                value={screen.name}
                onChange={(e) => renameScreen(screen.id, e.target.value)}
              />
            </label>
            <button
              type="button"
              className="danger-btn block"
              onClick={() => {
                if (confirm("Delete this screen?")) deleteScreen(screen.id);
              }}
            >
              Delete screen
            </button>
          </>
        )}

        <h2>Palette</h2>
        <select
          className="field"
          value={paletteId}
          onChange={(e) => setPaletteId(e.target.value)}
        >
          {LIBRARY_CATALOG.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <p className="hint">
          Alt+click canvas to place selected template, or use Place button.
        </p>
        <button
          type="button"
          className="ghost-btn block"
          onClick={() => {
            if (!screen) return;
            placeLibraryItem(paletteId, 80 + screen.objects.length * 12, 80);
          }}
        >
          Place on canvas
        </button>

        <h2>Mode</h2>
        <div className="mode-row">
          <button
            type="button"
            className={designerMode === "select" ? "primary-btn" : "ghost-btn"}
            onClick={() => setDesignerMode("select")}
          >
            Select
          </button>
          <button
            type="button"
            className={designerMode === "connect" ? "primary-btn" : "ghost-btn"}
            onClick={() => setDesignerMode("connect")}
          >
            Connect
          </button>
        </div>
        {designerMode === "connect" && (
          <p className="hint">
            {connectFrom
              ? "Click a target port to finish the connection."
              : "Click a source port to start."}
          </p>
        )}
      </aside>

      <div className="designer-canvas-wrap">
        {screen ? (
          <div
            ref={canvasRef}
            className="designer-canvas"
            style={{ width: screen.width, height: screen.height }}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
          >
            <svg className="conn-layer" width={screen.width} height={screen.height}>
              {connectionPaths.map((c) => (
                <path
                  key={c.id}
                  d={c.d}
                  className="conn-path"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete connection?")) deleteConnection(c.id);
                  }}
                />
              ))}
            </svg>

            {screen.objects.map((obj) => {
              const lib = getLibraryItem(obj.libraryItemId);
              return (
                <div
                  key={obj.id}
                  className={`screen-object ${selectedObjectId === obj.id ? "selected" : ""}`}
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    height: obj.height,
                  }}
                  onPointerDown={(e) => startDrag(obj, e)}
                >
                  <RenderWidget obj={obj} tags={tagMap} />
                  {lib?.ports.map((port) => {
                    const pos = portPosition(obj, port.side, port.offset);
                    return (
                      <button
                        key={port.id}
                        type="button"
                        className={`port-hotspot side-${port.side}`}
                        style={{
                          left: pos.x - obj.x - 6,
                          top: pos.y - obj.y - 6,
                        }}
                        title={port.name}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (designerMode !== "connect") return;
                          if (!connectFrom) {
                            setConnectFrom({
                              objectId: obj.id,
                              portId: port.id,
                            });
                          } else {
                            completeConnection({
                              objectId: obj.id,
                              portId: port.id,
                            });
                          }
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">Create a screen to start designing.</div>
        )}
      </div>

      <aside className="designer-props">
        <h2>Properties</h2>
        {selected && selectedLib ? (
          <div className="editor-form">
            <label>
              Name
              <input
                className="field"
                value={selected.name}
                onChange={(e) =>
                  updateObject(selected.id, { name: e.target.value })
                }
              />
            </label>
            <div className="field-row">
              <label>
                X
                <input
                  className="field"
                  type="number"
                  value={Math.round(selected.x)}
                  onChange={(e) =>
                    updateObject(selected.id, { x: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Y
                <input
                  className="field"
                  type="number"
                  value={Math.round(selected.y)}
                  onChange={(e) =>
                    updateObject(selected.id, { y: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <div className="field-row">
              <label>
                W
                <input
                  className="field"
                  type="number"
                  value={selected.width}
                  onChange={(e) =>
                    updateObject(selected.id, {
                      width: Number(e.target.value) || 40,
                    })
                  }
                />
              </label>
              <label>
                H
                <input
                  className="field"
                  type="number"
                  value={selected.height}
                  onChange={(e) =>
                    updateObject(selected.id, {
                      height: Number(e.target.value) || 40,
                    })
                  }
                />
              </label>
            </div>

            <h3>Tag bindings</h3>
            {selectedLib.bindableProps.map((bp) => {
              const current =
                selected.bindings.find((b) => b.prop === bp.key)?.tagId ?? "";
              return (
                <label key={bp.key}>
                  {bp.label}
                  <select
                    className="field"
                    value={current}
                    onChange={(e) =>
                      bindObjectProp(
                        selected.id,
                        bp.key,
                        e.target.value || null,
                      )
                    }
                  >
                    <option value="">— unbound —</option>
                    {tags.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}

            <button
              type="button"
              className="danger-btn"
              onClick={() => deleteObject(selected.id)}
            >
              Delete object
            </button>
          </div>
        ) : (
          <p className="muted">Select an object on the canvas.</p>
        )}
      </aside>
    </div>
  );
}
