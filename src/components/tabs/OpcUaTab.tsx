"use client";

import { useState } from "react";
import { useScadaStore } from "@/lib/store";
import type {
  OpcUaAuthMode,
  OpcUaSecurityMode,
  OpcUaSecurityPolicy,
} from "@/lib/types";

export function OpcUaTab() {
  const opcUa = useScadaStore((s) => s.opcUa);
  const tags = useScadaStore((s) => s.tags);
  const updateOpcUa = useScadaStore((s) => s.updateOpcUa);
  const addOpcUaMapping = useScadaStore((s) => s.addOpcUaMapping);
  const removeOpcUaMapping = useScadaStore((s) => s.removeOpcUaMapping);
  const simulateOpcUaConnect = useScadaStore((s) => s.simulateOpcUaConnect);
  const simulateOpcUaDisconnect = useScadaStore(
    (s) => s.simulateOpcUaDisconnect,
  );

  const [nodeId, setNodeId] = useState('ns=2;s="Tank1.Level"');
  const [tagId, setTagId] = useState(tags[0]?.id ?? "");

  return (
    <div className="panel-page opc-layout">
      <div className="panel-toolbar">
        <div>
          <h1 className="panel-title">OPC UA Configuration</h1>
          <p className="panel-desc">
            Configure the PLC endpoint and node→tag mappings. Phase 1 stores
            config and simulates connection status. Real binary OPC UA runs in a
            companion gateway (Phase 2) — browsers and Vercel serverless cannot
            host long-lived OPC UA sessions.
          </p>
        </div>
        <div className="toolbar-actions">
          {opcUa.status.state === "simulated" ||
          opcUa.status.state === "connected" ? (
            <button
              type="button"
              className="danger-btn"
              onClick={simulateOpcUaDisconnect}
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              className="primary-btn"
              onClick={simulateOpcUaConnect}
            >
              Test connect (sim)
            </button>
          )}
        </div>
      </div>

      <div className="opc-grid">
        <section className="opc-card">
          <h2>Endpoint</h2>
          <label>
            Endpoint URL
            <input
              className="field"
              value={opcUa.endpointUrl}
              onChange={(e) => updateOpcUa({ endpointUrl: e.target.value })}
              placeholder="opc.tcp://host:4840"
            />
          </label>
          <div className="field-row">
            <label>
              Security mode
              <select
                className="field"
                value={opcUa.securityMode}
                onChange={(e) =>
                  updateOpcUa({
                    securityMode: e.target.value as OpcUaSecurityMode,
                  })
                }
              >
                <option value="None">None</option>
                <option value="Sign">Sign</option>
                <option value="SignAndEncrypt">SignAndEncrypt</option>
              </select>
            </label>
            <label>
              Security policy
              <select
                className="field"
                value={opcUa.securityPolicy}
                onChange={(e) =>
                  updateOpcUa({
                    securityPolicy: e.target.value as OpcUaSecurityPolicy,
                  })
                }
              >
                <option value="None">None</option>
                <option value="Basic256Sha256">Basic256Sha256</option>
                <option value="Aes128_Sha256_RsaOaep">
                  Aes128_Sha256_RsaOaep
                </option>
              </select>
            </label>
          </div>
          <div className="field-row">
            <label>
              Auth
              <select
                className="field"
                value={opcUa.authMode}
                onChange={(e) =>
                  updateOpcUa({ authMode: e.target.value as OpcUaAuthMode })
                }
              >
                <option value="Anonymous">Anonymous</option>
                <option value="Username">Username</option>
              </select>
            </label>
            <label>
              Poll interval (ms)
              <input
                className="field"
                type="number"
                value={opcUa.pollIntervalMs}
                onChange={(e) =>
                  updateOpcUa({
                    pollIntervalMs: Number(e.target.value) || 500,
                  })
                }
              />
            </label>
          </div>
          {opcUa.authMode === "Username" && (
            <div className="field-row">
              <label>
                Username
                <input
                  className="field"
                  value={opcUa.username}
                  onChange={(e) => updateOpcUa({ username: e.target.value })}
                />
              </label>
              <label>
                Password
                <input
                  className="field"
                  type="password"
                  value={opcUa.password}
                  onChange={(e) => updateOpcUa({ password: e.target.value })}
                  autoComplete="off"
                />
              </label>
            </div>
          )}

          <div className={`opc-status state-${opcUa.status.state}`}>
            <strong>{opcUa.status.state}</strong>
            <span>{opcUa.status.message}</span>
            {opcUa.status.lastOkAt && (
              <span className="mono">
                last OK {new Date(opcUa.status.lastOkAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </section>

        <section className="opc-card">
          <h2>Node → Tag mappings</h2>
          <div className="field-row">
            <label>
              NodeId
              <input
                className="field"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
              />
            </label>
            <label>
              Tag
              <select
                className="field"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
              >
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!nodeId.trim() || !tagId) return;
              addOpcUaMapping(nodeId.trim(), tagId);
            }}
          >
            Add mapping
          </button>

          <table className="data-table compact">
            <thead>
              <tr>
                <th>NodeId</th>
                <th>Tag</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {opcUa.mappings.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    No mappings yet.
                  </td>
                </tr>
              )}
              {opcUa.mappings.map((m) => {
                const tag = tags.find((t) => t.id === m.tagId);
                return (
                  <tr key={m.id}>
                    <td className="mono">{m.nodeId}</td>
                    <td>{tag?.name ?? m.tagId}</td>
                    <td>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => removeOpcUaMapping(m.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="callout">
            <strong>Vercel note:</strong> Deploy this Next.js app on Vercel for
            the HMI. Pair it later with a persistent OPC UA gateway that pushes
            values into the tag store over WebSocket/HTTPS.
          </div>
        </section>
      </div>
    </div>
  );
}
