"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useScadaStore } from "@/lib/store";
import { LibraryTab } from "@/components/tabs/LibraryTab";
import { TagsTab } from "@/components/tabs/TagsTab";
import { DesignerTab } from "@/components/tabs/DesignerTab";
import { RuntimeTab } from "@/components/tabs/RuntimeTab";
import { OpcUaTab } from "@/components/tabs/OpcUaTab";
import type { AppTab } from "@/lib/types";

const TABS: { id: AppTab; label: string; hint: string }[] = [
  { id: "library", label: "Library", hint: "Templates" },
  { id: "tags", label: "Tags", hint: "Tag list" },
  { id: "designer", label: "Designer", hint: "Build screens" },
  { id: "runtime", label: "Runtime", hint: "Live HMI" },
  { id: "opcua", label: "OPC UA", hint: "PLC link" },
];

function useHasHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => useScadaStore.persist.onFinishHydration(onStoreChange),
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
            <div className="brand-sub">{projectName}</div>
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
              if (confirm("Reset project to demo seed?")) resetProject();
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === "library" && <LibraryTab />}
        {activeTab === "tags" && <TagsTab />}
        {activeTab === "designer" && <DesignerTab />}
        {activeTab === "runtime" && <RuntimeTab />}
        {activeTab === "opcua" && <OpcUaTab />}
      </main>
    </div>
  );
}
