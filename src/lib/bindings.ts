import type { ScreenObject, Tag } from "./types";

export function boundValue(
  obj: ScreenObject,
  prop: string,
  tags: Record<string, Tag>,
  fallback: unknown = 0,
): unknown {
  const binding = obj.bindings.find((b) => b.prop === prop);
  if (!binding) return obj.props[prop] ?? fallback;
  const tag = tags[binding.tagId];
  if (!tag) return fallback;
  return tag.value;
}

export function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v === "true" || v === "1";
  return false;
}

export function formatValue(
  v: unknown,
  decimals = 1,
  unit?: string,
): string {
  let text: string;
  if (typeof v === "number") text = v.toFixed(decimals);
  else if (typeof v === "boolean") text = v ? "1" : "0";
  else text = String(v ?? "—");
  return unit ? `${text} ${unit}` : text;
}

export function portPosition(
  obj: ScreenObject,
  side: "left" | "right" | "top" | "bottom",
  offset: number,
): { x: number; y: number } {
  const o = Math.min(1, Math.max(0, offset));
  switch (side) {
    case "left":
      return { x: obj.x, y: obj.y + obj.height * o };
    case "right":
      return { x: obj.x + obj.width, y: obj.y + obj.height * o };
    case "top":
      return { x: obj.x + obj.width * o, y: obj.y };
    case "bottom":
      return { x: obj.x + obj.width * o, y: obj.y + obj.height };
  }
}
