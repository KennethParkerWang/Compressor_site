import React, {useMemo, useState, useCallback} from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

import {treeData, type ResearchTreeNode} from '@/src/data/treeData';
import {literatureData, type LiteratureItem} from '@/src/data/literatureData';
import PaperDetailDrawer from '@/src/components/PaperDetailDrawer';
import styles from './styles.module.css';

type NodeKind = 'center' | 'branch' | 'chapter' | 'section' | 'paper';
type SourceKindFilter = 'all' | LiteratureItem['sourceKind'];
type ViewMode = 'all' | 'theory' | 'system' | 'paq' | 'neural' | 'domain' | 'experiment' | 'algo';
type DepthLevel = 1 | 2 | 3;

interface BranchDef {
  id: string;
  name: string;
  desc: string;
  chapters: string[]; // chapter ids included
  tone: 'blue' | 'teal' | 'slate' | 'violet' | 'amber' | 'emerald' | 'rose';
}

const BRANCHES: readonly BranchDef[] = [
  {id: 'br-theory', name: '理论基础', desc: '信息�?/ 熵编�?/ 字典 / 上下文建�?, chapters: ['01'], tone: 'blue'},
  {id: 'br-system', name: '通用压缩系统', desc: 'gzip / zstd / bzip2 / xz 等通用工业系统', chapters: ['02', '04'], tone: 'slate'},
  {id: 'br-paq', name: 'PAQ/CMIX', desc: '高压缩率近熵极限经典路线', chapters: ['05'], tone: 'amber'},
  {id: 'br-neural', name: '神经压缩', desc: 'DeepZip / NNCP / TRACE / LLM as Compressor', chapters: ['06'], tone: 'violet'},
  {id: 'br-domain', name: '领域专用', desc: '图像 / 医学 / 卫星 / 科学数组', chapters: ['07', '08'], tone: 'emerald'},
  {id: 'br-exp', name: '实验复现', desc: 'Benchmark / 复现协议 / 评测流程', chapters: ['09'], tone: 'teal'},
  {id: 'br-algo', name: '算法模块', desc: '可迁移的压缩器流水线模块设计', chapters: ['10'], tone: 'rose'},
];

const TONE_COLORS: Record<BranchDef['tone'], {stroke: string; bg: string; fg: string}> = {
  blue: {stroke: '#2563eb', bg: 'rgba(37, 99, 235, 0.10)', fg: '#1d4ed8'},
  slate: {stroke: '#475569', bg: 'rgba(71, 85, 105, 0.10)', fg: '#334155'},
  amber: {stroke: '#d97706', bg: 'rgba(217, 119, 6, 0.10)', fg: '#b45309'},
  violet: {stroke: '#7c3aed', bg: 'rgba(124, 58, 237, 0.10)', fg: '#6d28d9'},
  emerald: {stroke: '#059669', bg: 'rgba(5, 150, 105, 0.10)', fg: '#047857'},
  teal: {stroke: '#0d9488', bg: 'rgba(13, 148, 136, 0.10)', fg: '#0f766e'},
  rose: {stroke: '#e11d48', bg: 'rgba(225, 29, 72, 0.10)', fg: '#be123c'},
};

interface MapNodeData extends Record<string, unknown> {
  kind: NodeKind;
  chapterId?: string;
  sectionId?: string;
  label: string;
  subLabel?: string;
  literatureCount: number;
  paperId?: string;
  priority?: string;
  sourceKind?: string;
  branch?: string;
  tone?: BranchDef['tone'];
  description?: string;
  isCenter?: boolean;
}

function CustomNode({data, selected}: NodeProps): React.ReactElement {
  const d = data as unknown as MapNodeData;
  const isCenter = d.kind === 'center';
  const isBranch = d.kind === 'branch';
  const isChapter = d.kind === 'chapter';
  const isSection = d.kind === 'section';
  const isPaper = d.kind === 'paper';
  const tone = TONE_COLORS[(d.tone ?? 'slate') as BranchDef['tone']];

  let cls = styles.node;
  if (isCenter) cls += ' ' + styles.nodeCenter;
  else if (isBranch) cls += ' ' + styles.nodeBranch;
  else if (isChapter) cls += ' ' + styles.nodeChapter;
  else if (isSection) cls += ' ' + styles.nodeSection;
  else if (isPaper) cls += ' ' + styles.nodePaper;
  if (selected) cls += ' ' + styles.nodeHighlight;

  return (
    <div className={cls} style={isBranch ? {borderColor: tone.stroke, background: tone.bg} : undefined}>
      <Handle type="target" position={Position.Left} style={{opacity: 0, pointerEvents: 'none'}} />
      {isCenter && (
        <>
          <div className={styles.nodeCenterTitle}>压缩算法研图</div>
          <div className={styles.nodeCenterSub}>Compression Research Atlas</div>
          <div className={styles.nodeCenterMeta}>11 �?· 88 方向 · 338 文献</div>
        </>
      )}
      {isBranch && (
        <>
          <div className={styles.nodeBranchTitle} style={{color: tone.fg}}>{d.label}</div>
          {d.subLabel && <div className={styles.nodeBranchSub}>{d.subLabel}</div>}
        </>
      )}
      {isChapter && (
        <>
          <div className={styles.nodeBadge}>Ch.{d.chapterId}</div>
          <div className={styles.nodeTitle}>{d.label}</div>
          {d.subLabel && <div className={styles.nodeSub}>{d.subLabel}</div>}
        </>
      )}
      {isSection && (
        <>
          <div className={styles.nodeBadge}>{d.sectionId ?? d.chapterId}</div>
          <div className={styles.nodeTitleSm}>{d.label}</div>
          <span className={styles.nodeCount}>{d.literatureCount} 文献</span>
        </>
      )}
      {isPaper && (
        <>
          <div className={styles.nodePaperBadge}>{d.priority ?? d.sourceKind ?? 'paper'}</div>
          <div className={styles.nodeTitleSm}>{d.label}</div>
        </>
      )}
      <Handle type="source" position={Position.Right} style={{opacity: 0, pointerEvents: 'none'}} />
    </div>
  );
}

const nodeTypes = {custom: CustomNode};

const NODE_W = 200;
const NODE_H = 64;
const BRANCH_W = 180;
const BRANCH_H = 70;
const CENTER_W = 220;
const CENTER_H = 110;

function sizeFor(kind: NodeKind): {w: number; h: number} {
  if (kind === 'center') return {w: CENTER_W, h: CENTER_H};
  if (kind === 'branch') return {w: BRANCH_W, h: BRANCH_H};
  return {w: NODE_W, h: NODE_H};
}

function layoutWithDagre(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR',
): {nodes: Node[]; edges: Edge[]} {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({rankdir: direction, nodesep: 18, ranksep: 90, marginx: 30, marginy: 30});

  nodes.forEach((n) => {
    const d = n.data as unknown as MapNodeData;
    const s = sizeFor(d.kind);
    g.setNode(n.id, {width: s.w, height: s.h});
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return {
    nodes: nodes.map((n) => {
      const d = n.data as unknown as MapNodeData;
      const s = sizeFor(d.kind);
      const pos = g.node(n.id);
      return {
        ...n,
        position: {
          x: pos.x - s.w / 2,
          y: pos.y - s.h / 2,
        },
      };
    }),
    edges,
  };
}

function ResearchMapInner(): React.ReactElement {
  const {fitView} = useReactFlow();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('all');
  const [depth, setDepth] = useState<DepthLevel>(2);
  const [kindFilter, setKindFilter] = useState<SourceKindFilter>('all');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [selectedPaper, setSelectedPaper] = useState<LiteratureItem | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ResearchTreeNode | null>(null);
  const [selectedSection, setSelectedSection] = useState<ResearchTreeNode | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDef | null>(null);

  const chapters = useMemo(
    () => treeData.filter((c) => c.type === 'chapter'),
    [],
  );

  // Build a quick map: chapterId -> chapter
  const chapterById = useMemo(() => {
    const m = new Map<string, ResearchTreeNode>();
    chapters.forEach((c) => m.set(c.id, c));
    return m;
  }, [chapters]);

  // Determine which branches to include given view mode
  const activeBranches = useMemo(() => {
    if (view === 'all') return BRANCHES;
    if (view === 'theory') return BRANCHES.filter((b) => b.id === 'br-theory');
    if (view === 'system') return BRANCHES.filter((b) => b.id === 'br-system');
    if (view === 'paq') return BRANCHES.filter((b) => b.id === 'br-paq');
    if (view === 'neural') return BRANCHES.filter((b) => b.id === 'br-neural');
    if (view === 'domain') return BRANCHES.filter((b) => b.id === 'br-domain');
    if (view === 'experiment') return BRANCHES.filter((b) => b.id === 'br-exp');
    if (view === 'algo') return BRANCHES.filter((b) => b.id === 'br-algo');
    return BRANCHES;
  }, [view]);

  const papersBySection = useMemo(() => {
    const m = new Map<string, LiteratureItem[]>();
    (literatureData as readonly LiteratureItem[]).forEach((p) => {
      if (!p.isPublic) return;
      const key: string = p.sectionId ?? p.chapterId;
      const arr = m.get(key);
      if (arr) arr.push(p);
      else m.set(key, [p]);
    });
    return m;
  }, []);

  const {nodes, edges} = useMemo<{nodes: Node[]; edges: Edge[]}>(() => {
    const list: Node[] = [];
    const linkList: Edge[] = [];
    const centerId = '__center__';
    const q = search.trim().toLowerCase();

    list.push({
      id: centerId,
      type: 'custom',
      position: {x: 0, y: 0},
      data: {
        kind: 'center',
        label: '压缩算法研图',
        literatureCount: 0,
        isCenter: true,
      } as MapNodeData,
    });

    // Level 1: branches
    activeBranches.forEach((br) => {
      list.push({
        id: br.id,
        type: 'custom',
        position: {x: 0, y: 0},
        data: {
          kind: 'branch',
          label: br.name,
          subLabel: br.desc,
          tone: br.tone,
          branch: br.id,
          literatureCount: 0,
        } as MapNodeData,
      });
      linkList.push({
        id: `e-${centerId}-${br.id}`,
        source: centerId,
        target: br.id,
        style: {stroke: TONE_COLORS[br.tone].stroke, strokeWidth: 1.5, opacity: 0.85},
        type: 'smoothstep',
        markerEnd: {type: MarkerType.ArrowClosed, color: TONE_COLORS[br.tone].stroke},
      });
    });

    if (depth < 2) {
      return layoutWithDagre(list, linkList, 'LR');
    }

    // Level 2: chapters (filtered by view's branches)
    const brByCh: Record<string, BranchDef> = {};
    activeBranches.forEach((br) => br.chapters.forEach((c) => (brByCh[c] = br)));

    chapters.forEach((ch) => {
      const br = brByCh[ch.id];
      if (!br) return;
      const matchSearch = !q ||
        ch.titleZh.toLowerCase().includes(q) ||
        ch.titleEn.toLowerCase().includes(q);
      if (!matchSearch) return;

      list.push({
        id: ch.id,
        type: 'custom',
        position: {x: 0, y: 0},
        data: {
          kind: 'chapter',
          chapterId: ch.id,
          label: ch.titleZh,
          subLabel: ch.titleEn,
          literatureCount: ch.literatureCount,
          tone: br.tone,
          branch: br.id,
        } as MapNodeData,
      });
      linkList.push({
        id: `e-${br.id}-${ch.id}`,
        source: br.id,
        target: ch.id,
        style: {stroke: TONE_COLORS[br.tone].stroke, strokeWidth: 1, opacity: 0.7},
        type: 'smoothstep',
      });

      // Level 3: papers (only at depth 3 or when chapter explicitly expanded)
      if (depth >= 3 || expandedChapters.has(ch.id)) {
        // gather chapter-level papers
        const chapterPapers = literatureData.filter(
          (p) => p.isPublic && p.chapterId === ch.id,
        );
        const filtered = kindFilter === 'all'
          ? chapterPapers
          : chapterPapers.filter((p) => p.sourceKind === kindFilter);

        // take top by priority and id to keep layout readable
        const top = filtered.slice(0, 6);
        top.forEach((p) => {
          list.push({
            id: p.id,
            type: 'custom',
            position: {x: 0, y: 0},
            data: {
              kind: 'paper',
              chapterId: ch.id,
              sectionId: p.sectionId,
              label: p.title,
              paperId: p.id,
              priority: p.priority,
              sourceKind: p.sourceKind,
              tone: br.tone,
              branch: br.id,
              literatureCount: 0,
            } as MapNodeData,
          });
          linkList.push({
            id: `e-${ch.id}-${p.id}`,
            source: ch.id,
            target: p.id,
            style: {stroke: TONE_COLORS[br.tone].stroke, strokeWidth: 0.7, opacity: 0.4},
            type: 'smoothstep',
          });
        });
      }
    });

    return layoutWithDagre(list, linkList, 'LR');
  }, [activeBranches, chapters, depth, expandedChapters, kindFilter, search]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const d = node.data as unknown as MapNodeData;
      if (d.kind === 'center') return;
      if (d.kind === 'branch') {
        const br = BRANCHES.find((b) => b.id === d.branch) ?? null;
        setSelectedBranch(br);
        setSelectedChapter(null);
        setSelectedSection(null);
        setSelectedPaper(null);
        return;
      }
      if (d.kind === 'chapter') {
        const ch = chapterById.get(d.chapterId ?? '');
        setSelectedChapter(ch ?? null);
        setSelectedSection(null);
        setSelectedPaper(null);
        setSelectedBranch(null);
        // Auto-expand on click
        if (ch) {
          setExpandedChapters((prev) => {
            const next = new Set(prev);
            if (next.has(ch.id)) next.delete(ch.id);
            else next.add(ch.id);
            return next;
          });
        }
      } else if (d.kind === 'paper' && d.paperId) {
        const paper = literatureData.find((p) => p.id === d.paperId);
        if (paper) setSelectedPaper(paper);
      }
    },
    [chapterById],
  );

  const handleFitView = useCallback(() => {
    fitView({padding: 0.1, duration: 400});
  }, [fitView]);

  const handleResetLayout = useCallback(() => {
    setExpandedChapters(new Set());
    setSearch('');
    setKindFilter('all');
    setView('all');
    setDepth(2);
    setTimeout(() => fitView({padding: 0.15, duration: 400}), 50);
  }, [fitView]);

  const relatedPapers = useMemo(() => {
    if (!selectedPaper) return [] as LiteratureItem[];
    return literatureData
      .filter(
        (p) =>
          p.id !== selectedPaper.id &&
          p.isPublic &&
          (p.chapterId === selectedPaper.chapterId ||
            p.sectionId === selectedPaper.sectionId),
      )
      .slice(0, 4);
  }, [selectedPaper]);

  return (
    <div className={styles.layout}>
      {/* Left toolbar */}
      <aside className={styles.toolbar}>
        <div className={styles.toolbarHeader}>
          <div className={styles.toolbarTitle}>Mind Map Tools</div>
          <p className={styles.toolbarLead}>点击节点展开 · 拖拽缩放 · 视图/深度切换</p>
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel}>搜索节点</label>
          <input
            className={styles.searchInput}
            placeholder="章节 / 子方�?/ 文献�?
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel}>视图切换</label>
          <div className={styles.btnGroup}>
            <button className={view === 'all' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('all')}>总览</button>
            <button className={view === 'theory' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('theory')}>理论</button>
            <button className={view === 'system' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('system')}>系统</button>
            <button className={view === 'paq' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('paq')}>PAQ</button>
            <button className={view === 'neural' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('neural')}>神经</button>
            <button className={view === 'domain' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('domain')}>领域</button>
            <button className={view === 'experiment' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('experiment')}>实验</button>
            <button className={view === 'algo' ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setView('algo')}>算法</button>
          </div>
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel}>展开深度</label>
          <div className={styles.btnGroup}>
            <button className={depth === 1 ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setDepth(1)}>一�?/button>
            <button className={depth === 2 ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setDepth(2)}>二级</button>
            <button className={depth === 3 ? styles.btnGroupActive : styles.btnGroupBtn} onClick={() => setDepth(3)}>三级</button>
          </div>
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel}>节点类型</label>
          <select
            className={styles.select}
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as SourceKindFilter)}
          >
            <option value="all">全部</option>
            <option value="literature">文献</option>
            <option value="standard">标准</option>
            <option value="sourceCode">源码</option>
            <option value="benchmark">Benchmark</option>
            <option value="documentation">文档</option>
          </select>
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel}>视图操作</label>
          <button className={styles.toolbarBtn} onClick={handleFitView}>Fit view</button>
          <button className={styles.toolbarBtn} onClick={handleResetLayout}>Reset layout</button>
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel}>图例</label>
          <div className={styles.legendRow}>
            <div className={styles.legendDot} style={{background: '#0f172a'}} />
            <span>中心节点</span>
          </div>
          {BRANCHES.map((br) => (
            <div className={styles.legendRow} key={br.id}>
              <div className={styles.legendDot} style={{background: TONE_COLORS[br.tone].stroke}} />
              <span>{br.name}</span>
            </div>
          ))}
        </div>

        <div className={styles.toolbarStats}>
          <div className={styles.statsRow}>
            <span>章节</span>
            <span className="cr-tnum">{chapters.length}</span>
          </div>
          <div className={styles.statsRow}>
            <span>当前节点</span>
            <span className="cr-tnum">{nodes.length}</span>
          </div>
        </div>
      </aside>

      {/* Graph */}
      <div className={styles.canvasWrap}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{padding: 0.15}}
          proOptions={{hideAttribution: true}}
          minZoom={0.1}
          maxZoom={2}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          defaultEdgeOptions={{type: 'smoothstep'}}
        >
          <Background gap={32} color="var(--cr-grid-line)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Right detail panel */}
      <aside className={styles.sidePanel}>
        {selectedPaper ? (
          <div className={styles.panelInner}>
            <div className={styles.panelHeader}>
              <span className={styles.panelBadge}>Paper</span>
              <button className={styles.panelClose} onClick={() => setSelectedPaper(null)}>
                �?              </button>
            </div>
            <h3 className={styles.panelTitle}>{selectedPaper.title}</h3>
            <div className={styles.panelMeta}>
              <span>{selectedPaper.priority ?? '-'}</span>
              <span>·</span>
              <span>{selectedPaper.year ?? '-'}</span>
              <span>·</span>
              <span>Ch.{selectedPaper.chapterId}</span>
            </div>
            {selectedPaper.coreReason && (
              <p className={styles.panelText}>
                <strong>为什么核�?</strong> {selectedPaper.coreReason}
              </p>
            )}
            {selectedPaper.readerBenefit && (
              <p className={styles.panelText}>
                <strong>读完能获�?</strong> {selectedPaper.readerBenefit}
              </p>
            )}
            {selectedPaper.summaryZh && (
              <p className={styles.panelText}>{selectedPaper.summaryZh}</p>
            )}
            <div className={styles.panelActions}>
              <a className={styles.panelBtnPrimary} href={`/core?focus=${selectedPaper.id}`}>
                查看详情 �?              </a>
            </div>
          </div>
        ) : selectedBranch ? (
          <div className={styles.panelInner}>
            <div className={styles.panelHeader}>
              <span className={styles.panelBadge}>Branch</span>
              <button className={styles.panelClose} onClick={() => setSelectedBranch(null)}>
                �?              </button>
            </div>
            <h3 className={styles.panelTitle}>{selectedBranch.name}</h3>
            <p className={styles.panelText}>{selectedBranch.desc}</p>
            <div className={styles.panelMeta}>
              {selectedBranch.chapters.map((c) => <span key={c}>Ch.{c}</span>)}
            </div>
            <div className={styles.panelActions}>
              <a className={styles.panelBtnPrimary} href={`/reading-paths?focus=${selectedBranch.id}`}>
                查看相关阅读路线 �?              </a>
            </div>
          </div>
        ) : selectedChapter ? (
          <div className={styles.panelInner}>
            <div className={styles.panelHeader}>
              <span className={styles.panelBadge}>Chapter</span>
              <button className={styles.panelClose} onClick={() => setSelectedChapter(null)}>
                �?              </button>
            </div>
            <h3 className={styles.panelTitle}>{selectedChapter.titleZh}</h3>
            <div className={styles.panelMeta}>
              <span>Ch.{selectedChapter.id}</span>
              <span>·</span>
              <span>{selectedChapter.literatureCount} 文献</span>
              <span>·</span>
              <span>{selectedChapter.projectAssetCount} 资产</span>
            </div>
            <p className={styles.panelText}>{selectedChapter.titleEn}</p>
            <div className={styles.panelActions}>
              <a className={styles.panelBtnPrimary} href={`/database?chapter=${selectedChapter.id}`}>
                查看全部文献 �?              </a>
            </div>
          </div>
        ) : selectedSection ? (
          <div className={styles.panelInner}>
            <div className={styles.panelHeader}>
              <span className={styles.panelBadge}>Section</span>
              <button className={styles.panelClose} onClick={() => setSelectedSection(null)}>
                �?              </button>
            </div>
            <h3 className={styles.panelTitle}>{selectedSection.titleZh}</h3>
            <div className={styles.panelMeta}>
              <span>{selectedSection.id}</span>
              <span>·</span>
              <span>{selectedSection.literatureCount} 文献</span>
            </div>
            <p className={styles.panelText}>{selectedSection.titleEn}</p>
            <div className={styles.panelActions}>
              <a className={styles.panelBtnPrimary} href={`/database?section=${selectedSection.id}`}>
                查看全部文献 �?              </a>
            </div>
          </div>
        ) : (
          <div className={styles.panelInner}>
            <div className={styles.panelHeader}>
              <span className={styles.panelBadge}>使用说明</span>
            </div>
            <h3 className={styles.panelTitle}>图谱说明</h3>
            <ul className={styles.helpList}>
              <li><strong>中心节点</strong>:整张图谱的总入�?/li>
              <li><strong>7 个一级分�?/strong>:理论 / 系统 / PAQ / 神经 / 领域 / 实验 / 算法</li>
              <li><strong>二级节点</strong>:对应 11 个研究章�?/li>
              <li><strong>三级节点</strong>:核心文献、标准、源码、benchmark</li>
              <li>点击 <strong>章节节点</strong>展开文献</li>
              <li>点击 <strong>文献节点</strong>查看详情</li>
              <li>左侧工具栏切换视图、深度、Fit / Reset</li>
            </ul>
          </div>
        )}
      </aside>

      {selectedPaper && (
        <PaperDetailDrawer
          paper={selectedPaper}
          related={relatedPapers}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </div>
  );
}

export default function ResearchMapGraph(): React.ReactElement {
  return (
    <ReactFlowProvider>
      <ResearchMapInner />
    </ReactFlowProvider>
  );
}