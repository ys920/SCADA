"use client";

import type { PipePath } from "@/lib/connections";

/** Multi-layer industrial pipe rendering with flanges + flow animation. */
export function PipeLayer({
  paths,
  interactive,
  onDelete,
}: {
  paths: PipePath[];
  interactive?: boolean;
  onDelete?: (id: string) => void;
}) {
  return (
    <g className="pipe-layer">
      <defs>
        <filter id="pipeSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>
      {paths.map((c) => (
        <g key={c.id} className="pipe-group">
          <path d={c.d} className="pipe-halo" />
          <path d={c.d} className="pipe-outer" filter="url(#pipeSoftShadow)" />
          <path
            d={c.d}
            className={`pipe-body ${interactive ? "pipe-interactive" : ""}`}
            onClick={
              interactive && onDelete
                ? (e) => {
                    e.stopPropagation();
                    if (confirm("Delete connection?")) onDelete(c.id);
                  }
                : undefined
            }
          />
          <path d={c.d} className="pipe-highlight" />
          <path d={c.d} className="pipe-flow" />
          <g className="pipe-flange-pair">
            <circle cx={c.start.x} cy={c.start.y} r={7} className="pipe-flange" />
            <circle cx={c.start.x} cy={c.start.y} r={4.2} className="pipe-flange-ring" />
            <circle cx={c.start.x} cy={c.start.y} r={2.2} className="pipe-flange-core" />
            <circle cx={c.end.x} cy={c.end.y} r={7} className="pipe-flange" />
            <circle cx={c.end.x} cy={c.end.y} r={4.2} className="pipe-flange-ring" />
            <circle cx={c.end.x} cy={c.end.y} r={2.2} className="pipe-flange-core" />
          </g>
        </g>
      ))}
    </g>
  );
}
