export type CrTheme = 'light' | 'paper' | 'graph' | 'dark' | 'focus';

export interface ThemePreset {
  id: CrTheme;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  blurb: string;
  background: 'grid' | 'paper' | 'nodes' | 'bitstream' | 'dark';
  recommended: 'day' | 'reading' | 'graph' | 'night' | 'focus';
  swatch: {from: string; via: string; to: string};
}

export const themePresets: readonly ThemePreset[] = [
  {
    id: 'light',
    nameZh: '学术浅色',
    nameEn: 'Academic Light',
    descZh: '白底、细网格、适合日常浏览',
    descEn: 'White canvas, fine grid, everyday reading',
    blurb: '白底、细网格、适合日常浏览',
    background: 'grid',
    recommended: 'day',
    swatch: {from: '#f8fafc', via: '#dbeafe', to: '#2563eb'},
  },
  {
    id: 'paper',
    nameZh: '纸张阅读',
    nameEn: 'Paper Reading',
    descZh: '暖白纸感、低对比、适合长文献',
    descEn: 'Warm paper tone for long-form reading',
    blurb: '暖白纸感、低对比、适合长文献',
    background: 'paper',
    recommended: 'reading',
    swatch: {from: '#fffaf0', via: '#f1dfbf', to: '#b45309'},
  },
  {
    id: 'graph',
    nameZh: '图谱实验室',
    nameEn: 'Graph Lab',
    descZh: '青蓝节点纹理、适合图谱与实验页面',
    descEn: 'Cyan graph texture for maps and lab pages',
    blurb: '青蓝节点纹理、适合图谱与实验页面',
    background: 'nodes',
    recommended: 'graph',
    swatch: {from: '#ecfeff', via: '#99f6e4', to: '#0f766e'},
  },
  {
    id: 'dark',
    nameZh: '深色研究',
    nameEn: 'Dark Research',
    descZh: '深色控制台、适合投屏和夜间讨论',
    descEn: 'Dark console for projection and night work',
    blurb: '深色控制台、适合投屏和夜间讨论',
    background: 'dark',
    recommended: 'night',
    swatch: {from: '#020617', via: '#1e3a8a', to: '#38bdf8'},
  },
  {
    id: 'focus',
    nameZh: '专注写作',
    nameEn: 'Focus Writing',
    descZh: '低饱和墨色、适合写作和汇报准备',
    descEn: 'Muted ink tone for writing and briefing',
    blurb: '低饱和墨色、适合写作和汇报准备',
    background: 'bitstream',
    recommended: 'focus',
    swatch: {from: '#f4efe5', via: '#c7b69d', to: '#7c2d12'},
  },
];

export default themePresets;
