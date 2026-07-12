import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {PerformanceMode, WorkbenchLayoutState, WorkbenchMode} from './types';

interface WorkspaceState {
  favorites: string[];
  recent: string[];
  performance: PerformanceMode;
  workbench: WorkbenchLayoutState;
  toggleFavorite: (id: string) => void;
  visit: (id: string) => void;
  setPerformance: (mode: PerformanceMode) => void;
  setWorkbenchMode: (mode: WorkbenchMode) => void;
  setPanelVisibility: (panel: 'left' | 'right', visible: boolean) => void;
  setPanelSizes: (sizes: number[]) => void;
  resetWorkbench: () => void;
}

const defaultWorkbench: WorkbenchLayoutState = {
  mode: 'deep',
  leftVisible: true,
  rightVisible: true,
  leftSize: 21,
  centerSize: 54,
  rightSize: 25,
  activeTab: 'LIT-0018',
  pinnedTabs: ['LIT-0018'],
};

export const useV3Workspace = create<WorkspaceState>()(
  persist(
    (set) => ({
      favorites: [],
      recent: [],
      performance: 'full',
      workbench: defaultWorkbench,
      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter((item) => item !== id)
          : [...state.favorites, id],
      })),
      visit: (id) => set((state) => ({recent: [id, ...state.recent.filter((item) => item !== id)].slice(0, 12)})),
      setPerformance: (performance) => set({performance}),
      setWorkbenchMode: (mode) => set((state) => ({workbench: {...state.workbench, mode}})),
      setPanelVisibility: (panel, visible) => set((state) => ({
        workbench: {...state.workbench, [panel === 'left' ? 'leftVisible' : 'rightVisible']: visible},
      })),
      setPanelSizes: (sizes) => set((state) => ({
        workbench: {
          ...state.workbench,
          leftSize: sizes[0] ?? state.workbench.leftSize,
          centerSize: sizes[1] ?? state.workbench.centerSize,
          rightSize: sizes[2] ?? state.workbench.rightSize,
        },
      })),
      resetWorkbench: () => set({workbench: defaultWorkbench}),
    }),
    {name: 'cr-v3-workspace'},
  ),
);
