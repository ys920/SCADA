import type { PortDef, Screen, ScreenObject } from "./types";
import { getLibraryItem } from "./library-catalog";
import { portPosition } from "./bindings";

type Side = PortDef["side"];
type Pt = { x: number; y: number };

function stubOffset(side: Side, len: number): Pt {
  switch (side) {
    case "left":
      return { x: -len, y: 0 };
    case "right":
      return { x: len, y: 0 };
    case "top":
      return { x: 0, y: -len };
    case "bottom":
      return { x: 0, y: len };
  }
}

function round(n: number) {
  return Math.round(n);
}

/** Build corner points for an orthogonal route (no fillets yet). */
function orthogonalPoints(
  ax: number,
  ay: number,
  aSide: Side,
  bx: number,
  by: number,
  bSide: Side,
  stub = 24,
): Pt[] {
  const aOff = stubOffset(aSide, stub);
  const bOff = stubOffset(bSide, stub);
  const a1 = { x: ax + aOff.x, y: ay + aOff.y };
  const b1 = { x: bx + bOff.x, y: by + bOff.y };

  const aHoriz = aSide === "left" || aSide === "right";
  const bHoriz = bSide === "left" || bSide === "right";

  let mid: Pt[];
  if (aHoriz && bHoriz) {
    const midX = (a1.x + b1.x) / 2;
    mid = [
      { x: midX, y: a1.y },
      { x: midX, y: b1.y },
    ];
  } else if (!aHoriz && !bHoriz) {
    const midY = (a1.y + b1.y) / 2;
    mid = [
      { x: a1.x, y: midY },
      { x: b1.x, y: midY },
    ];
  } else if (aHoriz && !bHoriz) {
    mid = [{ x: b1.x, y: a1.y }];
  } else {
    mid = [{ x: a1.x, y: b1.y }];
  }

  // Collapse near-duplicate points (straight runs)
  const raw = [{ x: ax, y: ay }, a1, ...mid, b1, { x: bx, y: by }];
  const pts: Pt[] = [];
  for (const p of raw) {
    const prev = pts[pts.length - 1];
    if (!prev || Math.hypot(prev.x - p.x, prev.y - p.y) > 1.5) pts.push(p);
  }
  return pts;
}

/**
 * Orthogonal path with rounded elbows (quadratic fillets).
 * Looks like industrial pipework instead of sharp miters.
 */
export function orthogonalPath(
  ax: number,
  ay: number,
  aSide: Side,
  bx: number,
  by: number,
  bSide: Side,
  stub = 28,
  radius = 14,
): string {
  const pts = orthogonalPoints(ax, ay, aSide, bx, by, bSide, stub);
  if (pts.length < 2) return "";

  let d = `M ${round(pts[0].x)} ${round(pts[0].y)}`;

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    const inDx = cur.x - prev.x;
    const inDy = cur.y - prev.y;
    const outDx = next.x - cur.x;
    const outDy = next.y - cur.y;
    const inLen = Math.hypot(inDx, inDy) || 1;
    const outLen = Math.hypot(outDx, outDy) || 1;
    const r = Math.min(radius, inLen / 2, outLen / 2);

    // Skip fillet on colinear segments
    const cross = inDx * outDy - inDy * outDx;
    if (Math.abs(cross) < 0.01) {
      d += ` L ${round(cur.x)} ${round(cur.y)}`;
      continue;
    }

    const before = {
      x: cur.x - (inDx / inLen) * r,
      y: cur.y - (inDy / inLen) * r,
    };
    const after = {
      x: cur.x + (outDx / outLen) * r,
      y: cur.y + (outDy / outLen) * r,
    };
    d += ` L ${round(before.x)} ${round(before.y)}`;
    d += ` Q ${round(cur.x)} ${round(cur.y)} ${round(after.x)} ${round(after.y)}`;
  }

  const last = pts[pts.length - 1];
  d += ` L ${round(last.x)} ${round(last.y)}`;
  return d;
}

export type PipePath = {
  id: string;
  d: string;
  start: Pt;
  end: Pt;
};

export function connectionSvgPaths(screen: Screen): PipePath[] {
  return screen.connections
    .map((c) => {
      const fromObj = screen.objects.find((o) => o.id === c.from.objectId);
      const toObj = screen.objects.find((o) => o.id === c.to.objectId);
      if (!fromObj || !toObj) return null;
      const fromLib = getLibraryItem(fromObj.libraryItemId);
      const toLib = getLibraryItem(toObj.libraryItemId);
      const fromPort = fromLib?.ports.find((p) => p.id === c.from.portId);
      const toPort = toLib?.ports.find((p) => p.id === c.to.portId);
      if (!fromPort || !toPort) return null;
      const a = portPosition(fromObj, fromPort.side, fromPort.offset);
      const b = portPosition(toObj, toPort.side, toPort.offset);
      return {
        id: c.id,
        d: orthogonalPath(a.x, a.y, fromPort.side, b.x, b.y, toPort.side),
        start: a,
        end: b,
      };
    })
    .filter(Boolean) as PipePath[];
}

export function findPort(
  obj: ScreenObject,
  portId: string,
): PortDef | undefined {
  return getLibraryItem(obj.libraryItemId)?.ports.find((p) => p.id === portId);
}
