"use client";

import { useRef } from "react";
import { connectionSvgPaths } from "@/lib/connections";
import { useScadaStore, useTagMap } from "@/lib/store";
import { RenderWidget } from "@/components/widgets/registry";

export function RuntimeTab() {
  const screens = useScadaStore((s) => s.screens);
  const runtimeScreenId = useScadaStore((s) => s.runtimeScreenId);
  const setRuntimeScreen = useScadaStore((s) => s.setRuntimeScreen);
  const writeTagValue = useScadaStore((s) => s.writeTagValue);
  const tagMap = useTagMap();
  const stageRef = useRef<HTMLDivElement>(null);

  const screen = screens.find((s) => s.id === runtimeScreenId) ?? screens[0];

  const connectionPaths = screen ? connectionSvgPaths(screen) : [];

  const enterFullscreen = () => {
    stageRef.current?.requestFullscreen?.();
  };

  if (!screen) {
    return (
      <div className="panel-page">
        <div className="empty-state">No screens yet — create one in Designer.</div>
      </div>
    );
  }

  return (
    <div className="runtime-layout">
      <div className="runtime-bar">
        <div>
          <h1 className="panel-title tight">Runtime</h1>
          <p className="panel-desc tight">
            Live operator view driven by simulation tags.
          </p>
        </div>
        <div className="toolbar-actions">
          <select
            className="field"
            value={screen.id}
            onChange={(e) => setRuntimeScreen(e.target.value)}
          >
            {screens.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
          <button type="button" className="ghost-btn" onClick={enterFullscreen}>
            Fullscreen
          </button>
        </div>
      </div>

      <div className="runtime-stage-wrap" ref={stageRef}>
        <div
          className="runtime-stage"
          style={{ width: screen.width, height: screen.height }}
        >
          <svg
            className="conn-layer"
            width={screen.width}
            height={screen.height}
          >
            {connectionPaths.map((c) => (
              <g key={c.id}>
                <path d={c.d} className="conn-path live" />
                <path d={c.d} className="conn-flow" />
              </g>
            ))}
          </svg>
          {screen.objects.map((obj) => (
            <div
              key={obj.id}
              className="screen-object runtime"
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
              }}
            >
              <RenderWidget
                obj={obj}
                tags={tagMap}
                interactive
                onWrite={writeTagValue}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
