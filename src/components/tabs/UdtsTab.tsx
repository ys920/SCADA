"use client";

import { useMemo, useState } from "react";
import { UDT_CATALOG } from "@/lib/udt";

export function UdtsTab() {
  const [selectedId, setSelectedId] = useState(UDT_CATALOG[0]?.id ?? "");
  const selected = useMemo(
    () => UDT_CATALOG.find((u) => u.id === selectedId) ?? null,
    [selectedId],
  );

  return (
    <div className="panel-page udt-layout">
      <div className="panel-toolbar">
        <div>
          <h1 className="panel-title">UDT Catalog</h1>
          <p className="panel-desc">
            User-defined types for every equipment class. Instantiating a UDT
            creates unique tags (`Area.Instance.Member`) used by screens,
            controls, and the historian.
          </p>
        </div>
      </div>

      <div className="udt-split">
        <aside className="side-panel">
          <ul className="screen-list">
            {UDT_CATALOG.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className={u.id === selectedId ? "active" : ""}
                  onClick={() => setSelectedId(u.id)}
                >
                  <strong>{u.id}</strong>
                  <span className="muted tiny">{u.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="side-panel grow">
          {selected ? (
            <>
              <h2>{selected.name}</h2>
              <p className="muted">{selected.description}</p>
              {selected.libraryItemId && (
                <p className="mono tiny">library → {selected.libraryItemId}</p>
              )}
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Type</th>
                    <th>Role</th>
                    <th>Unit</th>
                    <th>Bind prop</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.members.map((m) => (
                    <tr key={m.key}>
                      <td className="strong">{m.key}</td>
                      <td>{m.dataType}</td>
                      <td>{m.role}</td>
                      <td>{m.unit ?? "—"}</td>
                      <td className="mono">{m.bindProp ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="muted">Select a UDT.</p>
          )}
        </div>
      </div>
    </div>
  );
}
