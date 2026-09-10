"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  LIBRARY_CATALOG,
} from "@/lib/library-catalog";
import type { LibraryCategory } from "@/lib/types";
import { useScadaStore } from "@/lib/store";

export function LibraryTab() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LibraryCategory | "all">("all");
  const setActiveTab = useScadaStore((s) => s.setActiveTab);

  const items = useMemo(() => {
    return LIBRARY_CATALOG.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.id.includes(q)
      );
    });
  }, [query, category]);

  return (
    <div className="panel-page">
      <div className="panel-toolbar">
        <div>
          <h1 className="panel-title">Component Library</h1>
          <p className="panel-desc">
            Industrial templates you place on screens in Designer. Each item
            exposes ports and tag-bindable properties.
          </p>
        </div>
        <div className="toolbar-actions">
          <input
            className="field"
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="field"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as LibraryCategory | "all")
            }
          >
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_LABELS) as LibraryCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="library-grid">
        {items.map((item) => (
          <article key={item.id} className="library-item">
            <div className="library-item-top">
              <span className="cat-chip">{CATEGORY_LABELS[item.category]}</span>
              <span className="mono-id">{item.id}</span>
            </div>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <dl className="meta-dl">
              <div>
                <dt>Size</dt>
                <dd>
                  {item.defaultWidth}×{item.defaultHeight}
                </dd>
              </div>
              <div>
                <dt>Ports</dt>
                <dd>{item.ports.length}</dd>
              </div>
              <div>
                <dt>Bindings</dt>
                <dd>{item.bindableProps.map((b) => b.key).join(", ") || "—"}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="primary-btn"
              onClick={() => setActiveTab("designer")}
            >
              Use in Designer
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
