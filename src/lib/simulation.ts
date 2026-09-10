import type { SimConfig, Tag } from "./types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Compute next simulated value for a tag at time `now`. */
export function simulateTagValue(
  tag: Tag,
  now: number,
): boolean | number | string {
  if (!tag.sim) return tag.value;
  const cfg = tag.sim;
  const t = now / Math.max(cfg.periodMs, 1);

  switch (cfg.profile) {
    case "constant": {
      if (tag.dataType === "bool") return cfg.offset >= 0.5;
      if (tag.dataType === "string") return String(tag.value);
      return cfg.offset;
    }
    case "sine": {
      const v =
        cfg.offset +
        cfg.amplitude * Math.sin(2 * Math.PI * t + cfg.phase);
      return clamp(v, cfg.min, cfg.max);
    }
    case "ramp": {
      const frac = ((now % cfg.periodMs) / cfg.periodMs + cfg.phase) % 1;
      const v = cfg.min + frac * (cfg.max - cfg.min);
      return v;
    }
    case "noise": {
      const base =
        cfg.offset +
        cfg.amplitude * Math.sin(2 * Math.PI * t + cfg.phase);
      const noise = (Math.random() - 0.5) * cfg.amplitude * 0.35;
      return clamp(base + noise, cfg.min, cfg.max);
    }
    case "toggle": {
      const on = Math.floor(now / cfg.periodMs) % 2 === 0;
      return on;
    }
    case "pulse": {
      const frac = (now % cfg.periodMs) / cfg.periodMs;
      return frac < 0.15;
    }
    default:
      return tag.value;
  }
}

export function tickSimulation(tags: Tag[], now: number): Tag[] {
  return tags.map((tag) => {
    if (tag.source !== "simulation" || !tag.sim || tag.manualHold) return tag;
    const next = simulateTagValue(tag, now);
    return {
      ...tag,
      value: next,
      quality: "good",
      timestamp: now,
    };
  });
}

export function defaultSimForType(
  dataType: Tag["dataType"],
): SimConfig {
  if (dataType === "bool") {
    return {
      profile: "toggle",
      periodMs: 4000,
      min: 0,
      max: 1,
      amplitude: 1,
      offset: 0,
      phase: 0,
    };
  }
  return {
    profile: "sine",
    periodMs: 8000,
    min: 0,
    max: 100,
    amplitude: 35,
    offset: 50,
    phase: 0,
  };
}
