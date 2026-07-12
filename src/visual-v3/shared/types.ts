export type AreaId = 'project' | 'resources' | 'workbench';

export type PerformanceMode = 'full' | 'reduced' | 'static';

export type ResearchItemKind =
  | 'paper'
  | 'algorithm'
  | 'compressor'
  | 'dataset'
  | 'report'
  | 'experiment';

export interface V3ResearchItem {
  id: string;
  kind: ResearchItemKind;
  title: string;
  summary: string;
  meta: string;
  href: string;
  tags: readonly string[];
  sourceId: string;
  verification: 'verified' | 'recorded' | 'pending';
}

export interface ResearchChartDatum {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  sourceId: string;
  verification: 'verified' | 'pending';
}

export type WorkbenchMode = 'quick' | 'deep' | 'reproduce' | 'write' | 'briefing' | 'focus';

export interface WorkbenchLayoutState {
  mode: WorkbenchMode;
  leftVisible: boolean;
  rightVisible: boolean;
  leftSize: number;
  centerSize: number;
  rightSize: number;
  activeTab: string;
  pinnedTabs: readonly string[];
}
