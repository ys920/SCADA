"use client";

import { useMemo, useState } from "react";
import { useScadaStore } from "@/lib/store";
import type { DataType, SimProfile, Tag, TagSource } from "@/lib/types";

function qualityClass(q: Tag["quality"]) {
  return `quality-${q}`;
}

export function TagsTab() {
  const tags = useScadaStore((s) => s.tags);
  const addTag = useScadaStore((s) => s.addTag);
  const upsertTag = useScadaStore((s) => s.upsertTag);
  const deleteTag = useScadaStore((s) => s.deleteTag);
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.path.toLowerCase().includes(q) ||
        t.id.includes(q),
    );
  }, [tags, filter]);

  const selected = tags.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="panel-page tags-layout">
      <div className="panel-toolbar">
        <div>
          <h1 className="panel-title">Tag List</h1>
          <p className="panel-desc">
            Master process database. Phase 1 values come from the simulation
            engine; OPC UA mappings will overwrite selected tags in Phase 2.
          </p>
        </div>
        <div className="toolbar-actions">
          <input
            className="field"
            placeholder="Filter tags…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              addTag({ name: `Tag_${tags.length + 1}` });
            }}
          >
            Add tag
          </button>
        </div>
      </div>

      <div className="tags-split">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Path</th>
                <th>Type</th>
                <th>Value</th>
                <th>Quality</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tag) => (
                <tr
                  key={tag.id}
                  className={selectedId === tag.id ? "selected" : ""}
                  onClick={() => setSelectedId(tag.id)}
                >
                  <td className="strong">{tag.name}</td>
                  <td className="mono">{tag.path}</td>
                  <td>{tag.dataType}</td>
                  <td className="mono">
                    {typeof tag.value === "number"
                      ? tag.value.toFixed(2)
                      : String(tag.value)}
                    {tag.unit ? ` ${tag.unit}` : ""}
                  </td>
                  <td>
                    <span className={`quality-pill ${qualityClass(tag.quality)}`}>
                      {tag.quality}
                    </span>
                  </td>
                  <td>{tag.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="side-panel">
          {selected ? (
            <TagEditor
              tag={selected}
              onChange={upsertTag}
              onDelete={() => {
                deleteTag(selected.id);
                setSelectedId(null);
              }}
            />
          ) : (
            <p className="muted">Select a tag to edit simulation and metadata.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function TagEditor({
  tag,
  onChange,
  onDelete,
}: {
  tag: Tag;
  onChange: (t: Tag) => void;
  onDelete: () => void;
}) {
  const patch = (p: Partial<Tag>) => onChange({ ...tag, ...p });
  const patchSim = (p: Partial<NonNullable<Tag["sim"]>>) =>
    onChange({
      ...tag,
      sim: { ...(tag.sim ?? {
        profile: "sine",
        periodMs: 8000,
        min: 0,
        max: 100,
        amplitude: 30,
        offset: 50,
        phase: 0,
      }), ...p },
    });

  return (
    <div className="editor-form">
      <h2>Edit tag</h2>
      <label>
        Name
        <input
          className="field"
          value={tag.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </label>
      <label>
        Path
        <input
          className="field"
          value={tag.path}
          onChange={(e) => patch({ path: e.target.value })}
        />
      </label>
      <label>
        Data type
        <select
          className="field"
          value={tag.dataType}
          onChange={(e) => patch({ dataType: e.target.value as DataType })}
        >
          <option value="bool">bool</option>
          <option value="int">int</option>
          <option value="float">float</option>
          <option value="string">string</option>
        </select>
      </label>
      <label>
        Unit
        <input
          className="field"
          value={tag.unit ?? ""}
          onChange={(e) => patch({ unit: e.target.value })}
        />
      </label>
      <label>
        Source
        <select
          className="field"
          value={tag.source}
          onChange={(e) => patch({ source: e.target.value as TagSource })}
        >
          <option value="simulation">simulation</option>
          <option value="opcua">opcua</option>
        </select>
      </label>
      {tag.sim && tag.source === "simulation" && (
        <>
          <h3>Simulation</h3>
          <label>
            Profile
            <select
              className="field"
              value={tag.sim.profile}
              onChange={(e) =>
                patchSim({ profile: e.target.value as SimProfile })
              }
            >
              <option value="constant">constant</option>
              <option value="sine">sine</option>
              <option value="ramp">ramp</option>
              <option value="noise">noise</option>
              <option value="toggle">toggle</option>
              <option value="pulse">pulse</option>
            </select>
          </label>
          <label>
            Period (ms)
            <input
              className="field"
              type="number"
              value={tag.sim.periodMs}
              onChange={(e) =>
                patchSim({ periodMs: Number(e.target.value) || 1000 })
              }
            />
          </label>
          <div className="field-row">
            <label>
              Min
              <input
                className="field"
                type="number"
                value={tag.sim.min}
                onChange={(e) => patchSim({ min: Number(e.target.value) })}
              />
            </label>
            <label>
              Max
              <input
                className="field"
                type="number"
                value={tag.sim.max}
                onChange={(e) => patchSim({ max: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="field-row">
            <label>
              Offset
              <input
                className="field"
                type="number"
                value={tag.sim.offset}
                onChange={(e) => patchSim({ offset: Number(e.target.value) })}
              />
            </label>
            <label>
              Amplitude
              <input
                className="field"
                type="number"
                value={tag.sim.amplitude}
                onChange={(e) =>
                  patchSim({ amplitude: Number(e.target.value) })
                }
              />
            </label>
          </div>
        </>
      )}
      <button type="button" className="danger-btn" onClick={onDelete}>
        Delete tag
      </button>
    </div>
  );
}
