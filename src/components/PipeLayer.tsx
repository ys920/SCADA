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
        <linearGradient id="pipeMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4e2f0" />
          <stop offset="35%" stopColor="#8fa6bd" />
          <stop offset="70%" stopColor="#5f738a" />
          <stop offset="100%" stopColor="#3a4a5c" />
        </linearGradient>
        <filter id="pipeSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      {paths.map((c) => (
        <g key={c.id} className="pipe-group" filter="url(#pipeSoftShadow)">
          <path d={c.d} className="pipe-halo" />
          <path d={c.d} className="pipe-outer" />
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
          <path d={c.d} className="pipe-sheen" />
          <path d={c.d} className="pipe-flow" />
          {/* Flange rings at terminations */}
          <g className="pipe-flange-pair">
            <circle cx={c.start.x} cy={c.start.y} r={6.5} className="pipe-flange" />
            <circle cx={c.start.x} cy={c.start.y} r={3.8} className="pipe-flange-ring" />
            <circle cx={c.start.x} cy={c.start.y} r={2} className="pipe-flange-core" />
            <circle cx={c.end.x} cy={c.end.y} r={6.5} className="pipe-flange" />
            <circle cx={c.end.x} cy={c.end.y} r={3.8} className="pipe-flange-ring" />
            <circle cx={c.end.x} cy={c.end.y} r={2} className="pipe-flange-core" />
          </g>
        </g>
      ))}
    </g>
  );
}
