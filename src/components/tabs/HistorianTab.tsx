"use client";

import { useState } from "react";
import { useScadaStore } from "@/lib/store";

type HistRow = {
  id: number;
  tag_id: string;
  tag_path: string;
  tag_name: string;
  value_num: number | null;
  value_bool: boolean | null;
  value_text: string | null;
  data_type: string;
  quality: string;
  recorded_at: string;
};

type StatusState = {
  message: string;
  configured: boolean;
  count: number;
};

export function HistorianTab() {
  const tags = useScadaStore((s) => s.tags);
  const [status, setStatus] = useState<StatusState>({
    message: "Click Refresh status",
    configured: false,
    count: 0,
  });
  const [tagId, setTagId] = useState("");
  const [rows, setRows] = useState<HistRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = async () => {
    try {
      const res = await fetch("/api/historian/status");
      const data = await res.json();
      setStatus({
        configured: Boolean(data.configured),
        message: data.message ?? (res.ok ? "OK" : "Unavailable"),
        count: Number(data.count ?? 0),
      });
    } catch (err) {
      setStatus({
        configured: false,
        message: err instanceof Error ? err.message : "Status failed",
        count: 0,
      });
    }
  };

  const loadQuery = async () => {
    setBusy(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: "80" });
      if (tagId) qs.set("tagId", tagId);
      const res = await fetch(`/api/historian/query?${qs}`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Query failed");
        setRows([]);
      } else {
        setRows(data.rows ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setBusy(false);
    }
  };

  const flushNow = async () => {
    setBusy(true);
    setError(null);
    try {
      const samples = tags.slice(0, 400).map((t) => ({
        tagId: t.id,
        tagPath: t.path,
        tagName: t.name,
        dataType: t.dataType,
        quality: t.quality,
        value: t.value,
      }));
      const res = await fetch("/api/historian/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples }),
      });
      const data = await res.json();
      if (!data.ok) setError(data.error ?? "Ingest failed");
      await refreshStatus();
      await loadQuery();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed");
    } finally {
      setBusy(false);
    }
  };

  const selectedTagId = tagId || tags[0]?.id || "";

  return (
    <div className="panel-page">
      <div className="panel-toolbar">
        <div>
          <h1 className="panel-title">SQL Historian</h1>
          <p className="panel-desc">
            Neon Postgres stores time-series samples from live tags. Auto-sample
            runs while simulation is active; you can also flush manually.
          </p>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="ghost-btn" onClick={() => void refreshStatus()}>
            Refresh status
          </button>
          <button
            type="button"
            className="primary-btn"
            disabled={busy}
            onClick={() => void flushNow()}
          >
            Flush now
          </button>
        </div>
      </div>

      <div className="hist-status">
        <span className={`ctrl-pill ${status.configured ? "on" : "off"}`}>
          {status.configured ? "CONNECTED" : "NOT CONFIGURED"}
        </span>
        <span>{status.message}</span>
        <span className="mono">rows: {status.count}</span>
      </div>

      <div className="hist-query-bar">
        <label>
          Tag
          <select
            className="field"
            value={selectedTagId}
            onChange={(e) => setTagId(e.target.value)}
          >
            <option value="">All recent</option>
            {tags.slice(0, 500).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.path}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="primary-btn"
          disabled={busy}
          onClick={() => void loadQuery()}
        >
          Query
        </button>
      </div>

      {error && <p className="hist-error">{error}</p>}

      <div className="table-wrap">
        <table className="data-table compact">
          <thead>
            <tr>
              <th>Time</th>
              <th>Tag</th>
              <th>Path</th>
              <th>Value</th>
              <th>Quality</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No rows yet — click Refresh status, then Flush now or Query.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="mono">
                  {new Date(r.recorded_at).toLocaleString()}
                </td>
                <td>{r.tag_name}</td>
                <td className="mono">{r.tag_path}</td>
                <td className="mono">
                  {r.value_num !== null
                    ? r.value_num
                    : r.value_bool !== null
                      ? String(r.value_bool)
                      : (r.value_text ?? "—")}
                </td>
                <td>{r.quality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
