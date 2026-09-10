import type { PortDef, Screen, ScreenObject } from "./types";
import { getLibraryItem } from "./library-catalog";
import { portPosition } from "./bindings";

type Side = PortDef["side"];

function stubOffset(side: Side, len: number): { x: number; y: number } {
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

/**
 * Orthogonal (P&ID-style) pipe path: exit perpendicular from each port,
 * then join with 90° elbows. Avoids curved “noodle” overlaps.
 */
export function orthogonalPath(
  ax: number,
  ay: number,
  aSide: Side,
  bx: number,
  by: number,
  bSide: Side,
  stub = 28,
): string {
  const aOff = stubOffset(aSide, stub);
  const bOff = stubOffset(bSide, stub);
  const a1 = { x: ax + aOff.x, y: ay + aOff.y };
  const b1 = { x: bx + bOff.x, y: by + bOff.y };

  const aHoriz = aSide === "left" || aSide === "right";
  const bHoriz = bSide === "left" || bSide === "right";

  let mid: { x: number; y: number }[];

  if (aHoriz && bHoriz) {
    // Leave horizontally, drop/rise, then enter horizontally
    const midX = (a1.x + b1.x) / 2;
    mid = [
      { x: midX, y: a1.y },
      { x: midX, y: b1.y },
    ];
  } else if (!aHoriz && !bHoriz) {
    // Leave vertically, jog sideways, then enter vertically
    const midY = (a1.y + b1.y) / 2;
    mid = [
      { x: a1.x, y: midY },
      { x: b1.x, y: midY },
    ];
  } else if (aHoriz && !bHoriz) {
    // Horizontal out → vertical in
    mid = [{ x: b1.x, y: a1.y }];
  } else {
    // Vertical out → horizontal in
    mid = [{ x: a1.x, y: b1.y }];
  }

  const pts = [
    { x: ax, y: ay },
    a1,
    ...mid,
    b1,
    { x: bx, y: by },
  ];

  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${Math.round(p.x)} ${Math.round(p.y)}`)
    .join(" ");
}

export function connectionSvgPaths(screen: Screen): { id: string; d: string }[] {
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
      };
    })
    .filter(Boolean) as { id: string; d: string }[];
}

export function findPort(
  obj: ScreenObject,
  portId: string,
): PortDef | undefined {
  return getLibraryItem(obj.libraryItemId)?.ports.find((p) => p.id === portId);
}
