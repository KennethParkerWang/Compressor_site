// GlobalHelpButton - 全站浮动帮助入口
import React, {useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '../ui/dialog';
import {HelpCircle, BookOpen, Map, FileText, Target, NotebookPen, ClipboardList, CalendarDays, Presentation, FlaskConical, Database, Boxes, GitBranch, Rss, Settings, ChevronRight} from 'lucide-react';

interface GuideItem {
  icon: React.ComponentType<{size?: number}>;
  zhLabel: string;
  enLabel: string;
  url: string;
  zhBrief: string;
  enBrief: string;
  group: '发现' | '工作台' | '设置';
}

const GUIDE: GuideItem[] = [
  // 发现
  {icon: BookOpen, zhLabel: '今日总览', enLabel: 'Today Dashboard', url: '/', zhBrief: '研究驾驶舱、证据状态、任务入口与近期更新。', enBrief: 'Research dashboard, evidence status, task entry points, and recent updates.', group: '发现'},
  {icon: BookOpen, zhLabel: '文献库', enLabel: 'Library', url: '/library', zhBrief: '压缩算法文献、标准、代码和数据集。按章节、难度、年份筛选，每篇带附件资源。', enBrief: 'Compression papers, standards, code, and datasets with filters and linked assets.', group: '发现'},
  {icon: Map, zhLabel: '研究图谱', enLabel: 'Research Map', url: '/map', zhBrief: '提供章节卡片、列表、时间线、树状和径向等多种文献视图。', enBrief: 'Multiple literature views including cards, table, timeline, treemap, and radial layout.', group: '发现'},
  {icon: FileText, zhLabel: '核心文献', enLabel: 'Core Papers', url: '/core', zhBrief: '高优先级论文与基础资料索引。', enBrief: 'High-priority papers and essential reference materials.', group: '发现'},
  // 工作台
  {icon: Target, zhLabel: '阅读路线', enLabel: 'Reading Paths', url: '/reading-paths', zhBrief: '按主题排序的阅读路径，从基础到进阶再到专题。', enBrief: 'Topic-based reading paths from fundamentals to advanced tracks.', group: '工作台'},
  {icon: NotebookPen, zhLabel: '研究笔记', enLabel: 'Research Notes', url: '/notes', zhBrief: '读一篇文献，沉淀一篇笔记：六问模板、摘录和自由写作。', enBrief: 'Structured notes with reading prompts, excerpts, and free-form writing.', group: '工作台'},
  {icon: ClipboardList, zhLabel: '任务看板', enLabel: 'Task Board', url: '/tasks', zhBrief: '按待办、笔记、资料、实验和报告组织研究任务。', enBrief: 'Organize research tasks by reading, notes, materials, experiments, and reports.', group: '工作台'},
  {icon: CalendarDays, zhLabel: '日程计划', enLabel: 'Calendar', url: '/calendar', zhBrief: '按日历视图查看任务截止、笔记节点和阅读节奏。', enBrief: 'Calendar view for due dates, note milestones, and reading rhythm.', group: '工作台'},
  {icon: Presentation, zhLabel: '双周汇报中心', enLabel: 'Biweekly Briefings', url: '/weekly-reports', zhBrief: '管理双周汇报排期、可编辑草稿、材料状态和全屏展示。', enBrief: 'Manage biweekly briefing schedule, editable drafts, material status, and fullscreen presentation.', group: '工作台'},
  {icon: FlaskConical, zhLabel: '实验台', enLabel: 'Experiments', url: '/experiments', zhBrief: '从复现论文、运行基准测试到整理实验报告。', enBrief: 'Guide reproduction, benchmark runs, and experiment reporting.', group: '工作台'},
  {icon: Database, zhLabel: '标准矩阵', enLabel: 'Standards', url: '/standards', zhBrief: '按数据场景查找相关标准和评价约束。', enBrief: 'Find standards and evaluation constraints by data scenario.', group: '工作台'},
  {icon: Boxes, zhLabel: '算法模块', enLabel: 'Algorithm Modules', url: '/algorithm-board', zhBrief: '拆解压缩器流水线模块，例如解析、建模和熵编码。', enBrief: 'Break down codec modules such as parsing, modeling, and entropy coding.', group: '工作台'},
  {icon: GitBranch, zhLabel: '演化天梯', enLabel: 'Algorithm Evolution', url: '/algorithm-evolution', zhBrief: '展示从 Shannon、LZ、DEFLATE 到 Zstd、Brotli、神经压缩的技术脉络。', enBrief: 'Trace the algorithm lineage from Shannon and LZ to modern and neural codecs.', group: '工作台'},
  // 设置
  {icon: Rss, zhLabel: '来源监控', enLabel: 'Source Monitor', url: '/research-feed', zhBrief: '外部来源同步、去重和候选跟踪。', enBrief: 'External source sync, deduplication, and candidate tracking.', group: '设置'},
  {icon: Settings, zhLabel: '设置', enLabel: 'Settings', url: '/settings', zhBrief: '主题、字体和快捷键配置。', enBrief: 'Theme, typography, and shortcut settings.', group: '设置'},
];

const HELP_COPY = {
  zh: {
    title: '平台导航',
    desc: '压缩算法研究平台',
    groups: {发现: '发现', 工作台: '工作台', 设置: '设置'},
    evidence: '证据检索',
    evidencePath: '今日总览 → 文献库 → 研究图谱',
    writing: '论文写作',
    writingPath: '文献库 → 研究笔记 → 引用导出',
    experiment: '实验复现',
    experimentPath: '任务看板 → 实验台 → 算法模块',
    quickTitle: '类型速查',
    quickText: '论文、代码仓库、数据集、标准、项目主页、官方页面和视频。每篇文献的附加资源在文献库详情里能看到完整列表。',
  },
  en: {
    title: 'Platform Navigation',
    desc: 'Compression algorithm research platform',
    groups: {发现: 'Discovery', 工作台: 'Workbench', 设置: 'Settings'},
    evidence: 'Evidence Search',
    evidencePath: 'Today Dashboard → Library → Research Map',
    writing: 'Paper Writing',
    writingPath: 'Library → Research Notes → Citation Export',
    experiment: 'Experiment Reproduction',
    experimentPath: 'Task Board → Experiments → Algorithm Modules',
    quickTitle: 'Quick Types',
    quickText: 'Papers, code repositories, datasets, standards, project pages, official pages, and videos. Linked assets are listed in each Library detail panel.',
  },
};

export default function GlobalHelpButton(): React.ReactElement {
  const location = useLocation();
  const lang: 'zh' | 'en' = location.pathname === '/en' || location.pathname.startsWith('/en/') ? 'en' : 'zh';
  const copy = HELP_COPY[lang];
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button"
        onClick={() => setOpen(true)}
        title={copy.title}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 60,
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--cr-accent, #1d4ed8)', color: '#fff',
          border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 14px rgba(29, 78, 216, 0.30)',
          transition: 'transform .15s, box-shadow .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(29, 78, 216, 0.40)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 78, 216, 0.30)'; }}>
        <HelpCircle size={20} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{maxWidth: 720, width: '90vw', maxHeight: '90vh', overflowY: 'auto'}}>
          <DialogHeader>
            <DialogTitle style={{fontSize: 20}}>{copy.title}</DialogTitle>
            <DialogDescription>{copy.desc}</DialogDescription>
          </DialogHeader>

          <div style={{padding: '8px 0 4px', fontSize: 13.5, lineHeight: 1.7, color: '#1e293b'}}>
            <div style={{display: 'flex', gap: 8, margin: '12px 0', padding: '10px 14px', background: '#f0f9ff', borderRadius: 8, fontSize: 12.5, color: '#0c4a6e'}}>
              <div style={{flex: 1}}><strong>{copy.evidence}</strong><br />{copy.evidencePath}</div>
              <div style={{flex: 1}}><strong>{copy.writing}</strong><br />{copy.writingPath}</div>
              <div style={{flex: 1}}><strong>{copy.experiment}</strong><br />{copy.experimentPath}</div>
            </div>

            {(['发现', '工作台', '设置'] as const).map((g) => (
              <div key={g} style={{marginTop: 14}}>
                <div style={{fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6}}>{copy.groups[g]}</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                  {GUIDE.filter((x) => x.group === g).map((it) => {
                    const Icon = it.icon;
                    return (
                      <a key={it.url} href={localizeHref(it.url, lang)} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
                        borderRadius: 6, textDecoration: 'none', color: 'inherit',
                        border: '1px solid #f1f5f9', background: '#fff', transition: 'background .12s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                        <Icon size={16} style={{color: '#1d4ed8', flexShrink: 0, marginTop: 2}} />
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{fontSize: 13.5, fontWeight: 600, color: '#0f172a'}}>
                            {lang === 'zh' ? it.zhLabel : it.enLabel}
                          </div>
                          <div style={{fontSize: 12.5, color: '#475569', lineHeight: 1.55, marginTop: 2}}>
                            {lang === 'zh' ? it.zhBrief : it.enBrief}
                          </div>
                        </div>
                        <ChevronRight size={12} style={{color: '#cbd5e1', flexShrink: 0, marginTop: 4}} />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{marginTop: 16, padding: '10px 14px', background: '#f1f5f9', borderRadius: 6, fontSize: 12, color: '#64748b'}}>
              <strong>{copy.quickTitle}</strong>: {copy.quickText}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function localizeHref(href: string, lang: 'zh' | 'en'): string {
  if (lang === 'zh' || !href.startsWith('/')) return href;
  return href === '/' ? '/en/' : `/en${href}`;
}
