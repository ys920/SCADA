"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useScadaStore } from "@/lib/store";
import { useHistorianSampler } from "@/lib/historian-client";
import { LibraryTab } from "@/components/tabs/LibraryTab";
import { UdtsTab } from "@/components/tabs/UdtsTab";
import { TagsTab } from "@/components/tabs/TagsTab";
import { DesignerTab } from "@/components/tabs/DesignerTab";
import { RuntimeTab } from "@/components/tabs/RuntimeTab";
import { HistorianTab } from "@/components/tabs/HistorianTab";
import { OpcUaTab } from "@/components/tabs/OpcUaTab";
import type { AppTab } from "@/lib/types";

const TABS: { id: AppTab; label: string; hint: string }[] = [
  { id: "library", label: "Library", hint: "Templates" },
  { id: "udts", label: "UDTs", hint: "Type defs" },
  { id: "tags", label: "Tags", hint: "Tag list" },
  { id: "designer", label: "Designer", hint: "Build screens" },
  { id: "runtime", label: "Runtime", hint: "Live HMI" },
  { id: "historian", label: "Historian", hint: "SQL log" },
  { id: "opcua", label: "OPC UA", hint: "PLC link" },
];

function useHasHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const unsub = useScadaStore.persist.onFinishHydration(onStoreChange);
      if (useScadaStore.persist.hasHydrated()) onStoreChange();
      return unsub;
    },
    () => useScadaStore.persist.hasHydrated(),
    () => false,
  );
}

export function AppShell() {
  const ready = useHasHydrated();
  const activeTab = useScadaStore((s) => s.activeTab);
  const setActiveTab = useScadaStore((s) => s.setActiveTab);
  const simRunning = useScadaStore((s) => s.simRunning);
  const simTickMs = useScadaStore((s) => s.simTickMs);
  const tickSim = useScadaStore((s) => s.tickSim);
  const setSimRunning = useScadaStore((s) => s.setSimRunning);
  const projectName = useScadaStore((s) => s.name);
  const opcState = useScadaStore((s) => s.opcUa.status.state);
  const resetProject = useScadaStore((s) => s.resetProject);
  const tagCount = useScadaStore((s) => s.tags.length);

  useHistorianSampler(5000);

  useEffect(() => {
    if (!ready || !simRunning) return;
    const handle = window.setInterval(() => tickSim(), simTickMs);
    return () => window.clearInterval(handle);
  }, [ready, simRunning, simTickMs, tickSim]);

  if (!ready) {
    return (
      <div className="app-shell">
        <div className="empty-state">Loading SCADA One…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden />
          <div>
            <div className="brand-name">SCADA One</div>
            <div className="brand-sub">
              {projectName} · {tagCount} tags
            </div>
          </div>
        </div>

        <nav className="tab-nav" aria-label="Primary">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-hint">{tab.hint}</span>
            </button>
          ))}
        </nav>

        <div className="header-status">
          <button
            type="button"
            className={`sim-toggle ${simRunning ? "on" : ""}`}
            onClick={() => setSimRunning(!simRunning)}
            title="Toggle simulation"
          >
            <span className="pulse-dot" />
            Sim {simRunning ? "RUN" : "HOLD"}
          </button>
          <span className={`opc-pill state-${opcState}`}>
            OPC {opcState}
          </span>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              if (confirm("Reset project to UDT plant seed?")) resetProject();
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === "library" && <LibraryTab />}
        {activeTab === "udts" && <UdtsTab />}
        {activeTab === "tags" && <TagsTab />}
        {activeTab === "designer" && <DesignerTab />}
        {activeTab === "runtime" && <RuntimeTab />}
        {activeTab === "historian" && <HistorianTab />}
        {activeTab === "opcua" && <OpcUaTab />}
      </main>
    </div>
  );
}
