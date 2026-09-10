"use client";

import { useEffect, useRef } from "react";
import { useScadaStore } from "@/lib/store";

/**
 * Periodically posts live tag samples to the SQL historian while sim runs.
 */
export function useHistorianSampler(intervalMs = 5000) {
  const simRunning = useScadaStore((s) => s.simRunning);
  const getTags = useRef(() => useScadaStore.getState().tags);

  useEffect(() => {
    if (!simRunning) return;
    let cancelled = false;

    const tick = async () => {
      const snapshot = getTags.current();
      if (!snapshot.length) return;
      const samples = snapshot
        .filter((t) =>
          /\.(Running|Open|Level|Flow|Pressure|PV|PosPV|Rate|Duty|Hz)$/.test(
            t.path,
          ),
        )
        .slice(0, 300)
        .map((t) => ({
          tagId: t.id,
          tagPath: t.path,
          tagName: t.name,
          dataType: t.dataType,
          quality: t.quality,
          value: t.value,
        }));
      if (!samples.length) return;
      try {
        await fetch("/api/historian/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ samples }),
        });
      } catch {
        // Historian optional when DATABASE_URL missing
      }
      if (cancelled) return;
    };

    void tick();
    const handle = window.setInterval(() => void tick(), intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(handle);
    };
  }, [simRunning, intervalMs]);
}
