"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLibraryItem } from "./library-catalog";
import { createInitialProject, newId } from "./seed";
import { defaultSimForType, tickSimulation } from "./simulation";
import type {
  AppTab,
  ConnectionEndpoint,
  DataType,
  OpcUaConfig,
  ProjectState,
  Screen,
  ScreenObject,
  Tag,
} from "./types";

interface UiSlice {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  controlObjectId: string | null;
  setControlObjectId: (id: string | null) => void;
}

interface ProjectActions {
  resetProject: () => void;
  tickSim: () => void;
  setSimRunning: (running: boolean) => void;

  // Tags
  upsertTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;
  addTag: (partial?: Partial<Tag>) => void;
  writeTagValue: (id: string, value: boolean | number | string) => void;
  releaseTagManual: (id: string) => void;
  releaseObjectManual: (objectId: string) => void;

  // Screens
  addScreen: (name?: string) => void;
  renameScreen: (id: string, name: string) => void;
  deleteScreen: (id: string) => void;
  setActiveScreen: (id: string) => void;
  setRuntimeScreen: (id: string) => void;

  // Designer
  setDesignerMode: (mode: "select" | "connect") => void;
  selectObject: (id: string | null) => void;
  placeLibraryItem: (libraryItemId: string, x: number, y: number) => void;
  updateObject: (id: string, patch: Partial<ScreenObject>) => void;
  deleteObject: (id: string) => void;
  bindObjectProp: (objectId: string, prop: string, tagId: string | null) => void;
  setConnectFrom: (ep: ConnectionEndpoint | null) => void;
  completeConnection: (to: ConnectionEndpoint) => void;
  deleteConnection: (id: string) => void;

  // OPC UA
  updateOpcUa: (patch: Partial<OpcUaConfig>) => void;
  addOpcUaMapping: (nodeId: string, tagId: string) => void;
  removeOpcUaMapping: (id: string) => void;
  simulateOpcUaConnect: () => void;
  simulateOpcUaDisconnect: () => void;
}

type Store = ProjectState & UiSlice & ProjectActions;

const GRID = 8;

function snap(n: number) {
  return Math.round(n / GRID) * GRID;
}

function activeScreen(state: ProjectState): Screen | undefined {
  return state.screens.find((s) => s.id === state.activeScreenId);
}

export const useScadaStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createInitialProject(),
      activeTab: "runtime",
      controlObjectId: null,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setControlObjectId: (controlObjectId) => set({ controlObjectId }),

      resetProject: () =>
        set({
          ...createInitialProject(),
          activeTab: get().activeTab,
          controlObjectId: null,
        }),

      tickSim: () => {
        const { simRunning, tags } = get();
        if (!simRunning) return;
        set({ tags: tickSimulation(tags, Date.now()) });
      },

      setSimRunning: (simRunning) => set({ simRunning }),

      upsertTag: (tag) =>
        set((s) => ({
          tags: s.tags.some((t) => t.id === tag.id)
            ? s.tags.map((t) => (t.id === tag.id ? tag : t))
            : [...s.tags, tag],
        })),

      deleteTag: (id) =>
        set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),

      addTag: (partial) => {
        const dataType: DataType = partial?.dataType ?? "float";
        const tag: Tag = {
          id: partial?.id ?? newId("tag"),
          name: partial?.name ?? "New_Tag",
          path: partial?.path ?? "Plant.New.Tag",
          dataType,
          unit: partial?.unit,
          description: partial?.description,
          value:
            partial?.value ??
            (dataType === "bool" ? false : dataType === "string" ? "" : 0),
          quality: partial?.quality ?? "good",
          timestamp: Date.now(),
          source: partial?.source ?? "simulation",
          sim: partial?.sim ?? defaultSimForType(dataType),
          hiLimit: partial?.hiLimit,
          loLimit: partial?.loLimit,
        };
        set((s) => ({ tags: [...s.tags, tag] }));
      },

      writeTagValue: (id, value) =>
        set((s) => ({
          tags: s.tags.map((t) =>
            t.id === id
              ? {
                  ...t,
                  value,
                  timestamp: Date.now(),
                  quality: "good" as const,
                  manualHold: true,
                }
              : t,
          ),
        })),

      releaseTagManual: (id) =>
        set((s) => ({
          tags: s.tags.map((t) =>
            t.id === id ? { ...t, manualHold: false } : t,
          ),
        })),

      releaseObjectManual: (objectId) => {
        const screen =
          get().screens.find((sc) => sc.id === get().runtimeScreenId) ??
          get().screens.find((sc) => sc.id === get().activeScreenId);
        const obj = screen?.objects.find((o) => o.id === objectId);
        if (!obj) return;
        const ids = new Set(obj.bindings.map((b) => b.tagId));
        set((s) => ({
          tags: s.tags.map((t) =>
            ids.has(t.id) ? { ...t, manualHold: false } : t,
          ),
        }));
      },

      addScreen: (name) => {
        const screen: Screen = {
          id: newId("scr"),
          name: name ?? `Screen ${get().screens.length + 1}`,
          width: 1280,
          height: 720,
          objects: [],
          connections: [],
        };
        set((s) => ({
          screens: [...s.screens, screen],
          activeScreenId: screen.id,
          runtimeScreenId: s.runtimeScreenId ?? screen.id,
        }));
      },

      renameScreen: (id, name) =>
        set((s) => ({
          screens: s.screens.map((sc) =>
            sc.id === id ? { ...sc, name } : sc,
          ),
        })),

      deleteScreen: (id) =>
        set((s) => {
          const screens = s.screens.filter((sc) => sc.id !== id);
          const fallback = screens[0]?.id ?? null;
          return {
            screens,
            activeScreenId:
              s.activeScreenId === id ? fallback : s.activeScreenId,
            runtimeScreenId:
              s.runtimeScreenId === id ? fallback : s.runtimeScreenId,
            selectedObjectId: null,
          };
        }),

      setActiveScreen: (id) =>
        set({ activeScreenId: id, selectedObjectId: null, connectFrom: null }),

      setRuntimeScreen: (id) => set({ runtimeScreenId: id, controlObjectId: null }),

      setDesignerMode: (designerMode) =>
        set({ designerMode, connectFrom: null }),

      selectObject: (selectedObjectId) => set({ selectedObjectId }),

      placeLibraryItem: (libraryItemId, x, y) => {
        const item = getLibraryItem(libraryItemId);
        const screen = activeScreen(get());
        if (!item || !screen) return;
        const obj: ScreenObject = {
          id: newId("obj"),
          libraryItemId,
          name: String(item.defaultProps.label ?? item.name),
          x: snap(x),
          y: snap(y),
          width: item.defaultWidth,
          height: item.defaultHeight,
          rotation: 0,
          bindings: [],
          props: { ...item.defaultProps },
        };
        set((s) => ({
          screens: s.screens.map((sc) =>
            sc.id === screen.id
              ? { ...sc, objects: [...sc.objects, obj] }
              : sc,
          ),
          selectedObjectId: obj.id,
          designerMode: "select",
        }));
      },

      updateObject: (id, patch) =>
        set((s) => ({
          screens: s.screens.map((sc) => {
            if (!sc.objects.some((o) => o.id === id)) return sc;
            return {
              ...sc,
              objects: sc.objects.map((o) =>
                o.id === id ? { ...o, ...patch } : o,
              ),
            };
          }),
        })),

      deleteObject: (id) =>
        set((s) => ({
          screens: s.screens.map((sc) =>
            sc.id !== s.activeScreenId
              ? sc
              : {
                  ...sc,
                  objects: sc.objects.filter((o) => o.id !== id),
                  connections: sc.connections.filter(
                    (c) => c.from.objectId !== id && c.to.objectId !== id,
                  ),
                },
          ),
          selectedObjectId:
            s.selectedObjectId === id ? null : s.selectedObjectId,
        })),

      bindObjectProp: (objectId, prop, tagId) =>
        set((s) => ({
          screens: s.screens.map((sc) =>
            sc.id !== s.activeScreenId
              ? sc
              : {
                  ...sc,
                  objects: sc.objects.map((o) => {
                    if (o.id !== objectId) return o;
                    const bindings = o.bindings.filter((b) => b.prop !== prop);
                    if (tagId) bindings.push({ prop, tagId });
                    return { ...o, bindings };
                  }),
                },
          ),
        })),

      setConnectFrom: (connectFrom) => set({ connectFrom }),

      completeConnection: (to) => {
        const { connectFrom, activeScreenId } = get();
        if (!connectFrom || !activeScreenId) return;
        if (
          connectFrom.objectId === to.objectId &&
          connectFrom.portId === to.portId
        ) {
          set({ connectFrom: null });
          return;
        }
        const conn = {
          id: newId("conn"),
          from: connectFrom,
          to,
        };
        set((s) => ({
          screens: s.screens.map((sc) =>
            sc.id === activeScreenId
              ? { ...sc, connections: [...sc.connections, conn] }
              : sc,
          ),
          connectFrom: null,
          designerMode: "select",
        }));
      },

      deleteConnection: (id) =>
        set((s) => ({
          screens: s.screens.map((sc) =>
            sc.id !== s.activeScreenId
              ? sc
              : {
                  ...sc,
                  connections: sc.connections.filter((c) => c.id !== id),
                },
          ),
        })),

      updateOpcUa: (patch) =>
        set((s) => ({ opcUa: { ...s.opcUa, ...patch } })),

      addOpcUaMapping: (nodeId, tagId) =>
        set((s) => ({
          opcUa: {
            ...s.opcUa,
            mappings: [
              ...s.opcUa.mappings,
              { id: newId("map"), nodeId, tagId },
            ],
          },
        })),

      removeOpcUaMapping: (id) =>
        set((s) => ({
          opcUa: {
            ...s.opcUa,
            mappings: s.opcUa.mappings.filter((m) => m.id !== id),
          },
        })),

      simulateOpcUaConnect: () =>
        set((s) => ({
          opcUa: {
            ...s.opcUa,
            enabled: true,
            status: {
              state: "simulated",
              message:
                "Simulated connection OK. Real OPC UA requires a gateway worker (Phase 2).",
              lastOkAt: Date.now(),
            },
          },
        })),

      simulateOpcUaDisconnect: () =>
        set((s) => ({
          opcUa: {
            ...s.opcUa,
            enabled: false,
            status: {
              state: "disconnected",
              message: "Disconnected.",
            },
          },
        })),
    }),
    {
      name: "scada-one-project-v6",
      partialize: (s) => ({
        name: s.name,
        version: s.version,
        tags: s.tags,
        screens: s.screens,
        activeScreenId: s.activeScreenId,
        runtimeScreenId: s.runtimeScreenId,
        opcUa: {
          ...s.opcUa,
          password: "", // never persist password
        },
        simRunning: s.simRunning,
        simTickMs: s.simTickMs,
      }),
    },
  ),
);

export function useTagMap(): Record<string, Tag> {
  const tags = useScadaStore((s) => s.tags);
  return Object.fromEntries(tags.map((t) => [t.id, t]));
}
