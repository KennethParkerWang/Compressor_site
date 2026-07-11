import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';

const config: Config = {
  title: '无损压缩研究',
  tagline: '文献、算法与可复现实验记录',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://KennethParkerWang.github.io',
  baseUrl: '/Compressor_site/',

  organizationName: 'KennethParkerWang',
  projectName: 'Compressor_site',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function tailwindcssPlugin() {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '无损压缩研究',
      logo: {
        alt: '无损压缩研究',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/', label: '今日总览', position: 'left' },
        { to: '/library', label: '文献库', position: 'left' },
        { to: '/sota', label: 'SOTA', position: 'left' },
        { to: '/datasets', label: '数据集', position: 'left' },
        { to: '/map', label: '研究图谱', position: 'left' },
        { to: '/tasks', label: '任务看板', position: 'left' },
        { to: '/calendar', label: '日程计划', position: 'left' },
        { to: '/weekly-reports', label: '双周汇报', position: 'left' },
        { to: '/experiments', label: '实验台', position: 'left' },
        { to: '/tutorials', label: '教程资源', position: 'left' },
        {
          label: '更多',
          position: 'right',
          items: [
            { to: '/reading-paths', label: '阅读路线' },
            { to: '/notes', label: '研究笔记' },
            { to: '/core', label: '核心论文' },
            { to: '/terms', label: '术语库' },
            { to: '/standards', label: '标准矩阵' },
            { to: '/hub', label: '资源库' },
            { to: '/datasets', label: '数据集' },
            { to: '/algorithm-board', label: '算法模块' },
            { to: '/algorithm-evolution', label: '演化天梯' },
            { to: '/algorithm-catalog', label: '算法目录' },
            { to: '/neural-hub', label: '深度压缩器' },
            { to: '/research-feed', label: '来源监控' },
            { to: '/weekly-reports', label: '双周汇报' },
            { to: '/project-overview', label: '项目计划' },
            { to: '/settings', label: '设置' },
          ],
        },
        { to: '/docs/intro', label: '关于', position: 'right' },
        {
          type: 'html',
          position: 'right',
          value: '<div id="cr-theme-switcher-slot"></div>',
        },
        {
          type: 'html',
          value: '<button class="navbar-search-btn" aria-label="Search" onclick="window.__openCommandPalette__ && window.__openCommandPalette__()">🔍 <kbd>⌘K</kbd></button>',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '研究',
          items: [
            { label: '今日总览', to: '/' },
            { label: '文献库', to: '/library' },
            { label: '研究图谱', to: '/map' },
            { label: '阅读路线', to: '/reading-paths' },
          ],
        },
        {
          title: '工作台',
          items: [
            { label: '研究笔记', to: '/notes' },
            { label: '任务看板', to: '/tasks' },
            { label: '日程计划', to: '/calendar' },
            { label: '双周汇报', to: '/weekly-reports' },
            { label: '来源监控', to: '/research-feed' },
          ],
        },
        {
          title: '学习',
          items: [
            { label: '教程', to: '/tutorials' },
            { label: '术语库', to: '/terms' },
          ],
        },
        {
          title: '资源',
          items: [
            { label: '实验台', to: '/experiments' },
            { label: 'SOTA榜单', to: '/sota' },
            { label: '算法模块', to: '/algorithm-board' },
            { label: '演化天梯', to: '/algorithm-evolution' },
            { label: '算法目录', to: '/algorithm-catalog' },
            { label: '标准矩阵', to: '/standards' },
          ],
        },
        {
          title: '项目',
          items: [
            { label: '设置', to: '/settings' },
            { label: '关于', to: '/docs/intro' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 无损压缩研究`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
