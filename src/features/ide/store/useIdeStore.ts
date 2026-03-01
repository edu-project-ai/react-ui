import { create } from 'zustand';
import type { Tab } from '../types';

interface IdeState {
  containerId: string | null;
  tabs: Tab[];
  activeFilePath: string | null;
  sidebarVisible: boolean;
  activeSidebarPanel: 'explorer' | 'search';
  savedFileContents: Record<string, string>;

  setContainerId: (id: string | null) => void;
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  setActiveFile: (path: string) => void;
  markDirty: (path: string) => void;
  markClean: (path: string) => void;
  setSavedContent: (path: string, content: string) => void;
  checkDirtyState: (path: string, currentContent: string) => void;
  toggleSidebar: () => void;
  setActiveSidebarPanel: (panel: 'explorer' | 'search') => void;
  reset: () => void;
}

const initialState = {
  containerId: null,
  tabs: [] as Tab[],
  activeFilePath: null as string | null,
  sidebarVisible: true,
  activeSidebarPanel: 'explorer' as const,
  savedFileContents: {} as Record<string, string>,
};

export const useIdeStore = create<IdeState>((set, get) => ({
  ...initialState,

  setContainerId: (id) => set({ containerId: id }),

  openFile: (path) => {
    const { tabs } = get();
    const exists = tabs.some((t) => t.path === path);
    if (exists) {
      set({ activeFilePath: path });
    } else {
      set({
        tabs: [...tabs, { path, isDirty: false }],
        activeFilePath: path,
      });
    }
  },

  closeTab: (path) => {
    const { tabs, activeFilePath } = get();
    const idx = tabs.findIndex((t) => t.path === path);
    if (idx === -1) return;

    const next = tabs.filter((t) => t.path !== path);
    let nextActive = activeFilePath;

    if (activeFilePath === path) {
      if (next.length === 0) {
        nextActive = null;
      } else if (idx < next.length) {
        nextActive = next[idx].path;
      } else {
        nextActive = next[next.length - 1].path;
      }
    }

    set({ tabs: next, activeFilePath: nextActive });
  },

  setActiveFile: (path) => set({ activeFilePath: path }),

  markDirty: (path) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.path === path ? { ...t, isDirty: true } : t,
      ),
    })),

  markClean: (path) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.path === path ? { ...t, isDirty: false } : t,
      ),
    })),

  setSavedContent: (path, content) =>
    set((state) => ({
      savedFileContents: { ...state.savedFileContents, [path]: content },
    })),

  checkDirtyState: (path, currentContent) => {
    const { savedFileContents } = get();
    const isDirty = currentContent !== (savedFileContents[path] ?? '');

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.path === path ? { ...t, isDirty } : t,
      ),
    }));
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarVisible: !state.sidebarVisible })),

  setActiveSidebarPanel: (panel) => set({ activeSidebarPanel: panel }),

  reset: () => set(initialState),
}));
