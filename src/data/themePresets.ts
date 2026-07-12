export type CrTheme = 'light';

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
    nameZh: '研究工作台',
    nameEn: 'Research Workbench',
    descZh: '冷灰画布、清晰层级与克制蓝色强调',
    descEn: 'Cool neutral canvas with restrained blue accents',
    blurb: '面向长期阅读、实验记录和项目管理的统一主题',
    background: 'grid',
    recommended: 'day',
    swatch: {from: '#f4f7fb', via: '#dbe7f5', to: '#175cd3'},
  },
];

export default themePresets;
