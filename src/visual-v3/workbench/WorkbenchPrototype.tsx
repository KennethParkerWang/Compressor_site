import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {Group, Panel, Separator, type Layout} from 'react-resizable-panels';
import {set as setIdb} from 'idb-keyval';
import {Activity, ArrowLeft, BookOpen, Brain, ChevronDown, CircleDot, Clipboard, Columns3, Database, Eye, FileText, FlaskConical, Focus, Highlighter, LayoutPanelLeft, ListChecks, Maximize2, Network, NotebookPen, PanelLeftClose, PanelRightClose, Play, Plus, RotateCcw, Search, Settings2, Terminal, X} from 'lucide-react';
import {literatureData} from '../../data/literatureData';
import {experimentAssets} from '../../data/experimentData';
import {AreaSwitcher} from '../shared/AreaSwitcher';
import {V3Frame} from '../shared/V3Frame';
import {useV3Workspace} from '../shared/useV3Workspace';
import type {WorkbenchMode} from '../shared/types';
import styles from './workbenchPrototype.module.css';

const paper = literatureData.find((item) => item.id === 'LIT-0018') ?? literatureData[0];
const relatedExperiments = experimentAssets.filter((item) => item.chapterId === paper.chapterId).slice(0, 4);

const terms = [
  ['Context model', '利用历史符号估计下一比特或符号概率。'],
  ['Probability mixing', '把多个模型给出的概率组合成单一预测。'],
  ['Online adaptation', '编码和解码两侧按相同顺序更新参数。'],
  ['Arithmetic coding', '依据概率区间把预测转换为可逆 bitstream。'],
  ['Bit-exact', '解码输出必须与原始输入逐比特一致。'],
];

const modes: Array<[WorkbenchMode, string, React.ComponentType<{size?: number}>]> = [
  ['quick', '快速阅读', Eye], ['deep', '精读', BookOpen], ['reproduce', '实验复现', FlaskConical],
  ['write', '写作', NotebookPen], ['briefing', '汇报准备', Columns3], ['focus', '专注', Focus],
];

function ToolRail() {
  return <aside className={styles.toolRail}><b>CR</b>{[BookOpen,NotebookPen,Brain,FlaskConical,ListChecks,Database,Search].map((Icon,index)=><button key={index} type="button" title={['论文','笔记','术语','实验','任务','数据','搜索'][index]}><Icon size={18}/></button>)}<span/><button type="button" title="设置"><Settings2 size={18}/></button></aside>;
}

function KnowledgePanel() {
  return <section className={styles.knowledgePanel}>
    <header><div><span>KNOWLEDGE</span><b>术语与前置知识</b></div><button type="button"><Plus size={15}/></button></header>
    <div className={styles.paperOutline}><span>本文目录</span>{['问题与动机','上下文模型','自适应加权','编码与解码同步','实验与限制'].map((item,index)=><a href={`#section-${index}`} key={item} data-active={index===2}><i>{String(index+1).padStart(2,'0')}</i>{item}</a>)}</div>
    <div className={styles.termList}><span>当前术语 / {terms.length}</span>{terms.map(([name,description],index)=><article key={name} data-active={index===1}><div><b>{name}</b><small>{index===1?'当前段落':'基础概念'}</small></div><p>{description}</p></article>)}</div>
    <div className={styles.relatedNodes}><span>关联节点</span><button type="button"><Network size={15}/> PAQ / Context Mixing</button><button type="button"><BookOpen size={15}/> LIT-0017 / CTW</button></div>
  </section>;
}

function ReadingPanel() {
  const [tab, setTab] = useState<'reading'|'pdf'|'notes'>('reading');
  const [saved, setSaved] = useState(false);
  const saveNote = async () => { await setIdb('cr-v3-note-LIT-0018', {text:'待补充：概率混合与 PAQ8px 实现的对应关系', updatedAt:new Date().toISOString()}); setSaved(true); };
  return <section className={styles.readingPanel}>
    <div className={styles.documentTabs}>{[['reading','结构化解读'],['pdf','论文原文'],['notes','六问笔记']].map(([id,label])=><button type="button" key={id} data-active={tab===id} onClick={()=>setTab(id as typeof tab)}>{label}</button>)}<span/><button type="button" title="高亮"><Highlighter size={15}/></button><button type="button" title="全屏"><Maximize2 size={15}/></button></div>
    {tab==='pdf'?<div className={styles.pdfEmpty}><FileText size={35}/><h3>尚未关联本地 PDF</h3><p>当前记录保留论文来源链接，但仓库内没有该论文文件。</p>{paper.url?<a href={paper.url} target="_blank" rel="noreferrer">打开来源页面</a>:null}</div>:
    tab==='notes'?<div className={styles.notesView}><span>SIX QUESTIONS / LOCAL DRAFT</span><h2>这篇论文解决了什么问题？</h2><textarea defaultValue="多个上下文模型各有偏差，需要一种可以在线适应数据的概率组合方式。"/><h2>方法的关键机制是什么？</h2><textarea defaultValue="待补充：结合论文公式解释权重更新、概率输出与算术编码之间的关系。"/><button type="button" onClick={saveNote}>{saved?'已保存在本机':'保存本机草稿'}</button></div>:
    <article className={styles.paperDocument}>
      <div className={styles.documentMeta}><span>{paper.id}</span><span>{paper.year}</span><span>{paper.venue}</span></div>
      <h1>{paper.title}</h1>
      <p className={styles.authors}>{paper.authors}</p>
      <div className={styles.abstract}><span>研究定位</span><p>{paper.coreReason ?? paper.summaryZh}</p></div>
      <section id="section-0"><i>01</i><div><span>PROBLEM</span><h2>为什么需要组合多个上下文模型？</h2><p>单一上下文只能捕获数据的一种规律。短上下文适应快，长上下文区分力强；词模型、匹配模型和局部统计模型在不同输入上各有优势。高压缩率系统因此需要把这些预测压缩为一个可供熵编码器使用的概率。</p></div></section>
      <section id="section-1"><i>02</i><div><span>PIPELINE</span><h2>从历史比特到编码区间</h2><div className={styles.methodFlow}><b>历史上下文</b><em>→</em><b>多个概率模型</b><em>→</em><b>自适应混合</b><em>→</em><b>算术编码</b></div><p>编码器与解码器维护完全相同的模型状态。任何预处理、概率更新或取整差异都会破坏 bit-exact 解码。</p></div></section>
      <section id="section-2" className={styles.activeSection}><i>03</i><div><span>CORE MECHANISM</span><h2>自适应加权不是简单平均</h2><p>混合器根据已经观察到的预测误差在线更新权重，使更适合当前数据局部结构的模型获得更大影响。实际系统通常还会按上下文选择不同混合参数。</p><blockquote>需要在精读阶段回到原始公式，确认权重空间、更新目标和编码概率的数值精度。</blockquote></div></section>
      <section id="section-3"><i>04</i><div><span>REPRODUCTION GATE</span><h2>复现首先验证可逆性</h2><p>在讨论压缩率之前，先固定输入哈希、编译参数、随机性和解压校验。性能结果必须在同一硬件、同一粒度和同一统计口径下报告。</p></div></section>
    </article>}
  </section>;
}

function ExperimentPanel() {
  const [copied,setCopied]=useState(false);
  const command='paq8px -8 input.dat output.paq8px';
  return <section className={styles.experimentPanel}>
    <header><div><span>EXPERIMENT</span><b>复现与任务</b></div><button type="button"><Plus size={15}/></button></header>
    <div className={styles.runStatus}><span><CircleDot size={14}/> 未运行</span><small>当前记录没有可比较结果</small></div>
    <div className={styles.contextBlock}><span>关联基线</span><b>PAQ8px-1</b><small>状态：配置待核验</small></div>
    <div className={styles.contextBlock}><span>数据集</span><b>Silesia Corpus</b><small>214 MB / 已核验来源</small></div>
    <div className={styles.commandBlock}><span>运行命令</span><code>{command}</code><button type="button" onClick={()=>{navigator.clipboard.writeText(command);setCopied(true)}}><Clipboard size={13}/>{copied?'已复制':'复制'}</button></div>
    <div className={styles.resultEmpty}><Activity size={22}/><b>暂无实验结果</b><p>导入运行日志后再生成压缩率、吞吐和内存图表。</p></div>
    <div className={styles.taskList}><span>当前任务</span><label><input type="checkbox" defaultChecked/>确认论文与实现版本</label><label><input type="checkbox"/>固定编译环境</label><label><input type="checkbox"/>运行 bit-exact 校验</label><label><input type="checkbox"/>记录 Silesia 分文件结果</label></div>
    <div className={styles.assetList}><span>相关实验资产</span>{relatedExperiments.map((item)=><button type="button" key={item.id}><b>{item.name}</b><small>{item.status}</small></button>)}</div>
  </section>;
}

export default function WorkbenchPrototype() {
  const workbench=useV3Workspace((state)=>state.workbench);
  const setMode=useV3Workspace((state)=>state.setWorkbenchMode);
  const setVisibility=useV3Workspace((state)=>state.setPanelVisibility);
  const setSizes=useV3Workspace((state)=>state.setPanelSizes);
  const reset=useV3Workspace((state)=>state.resetWorkbench);
  const panels=useMemo(()=>[workbench.leftVisible?'left':null,'center',workbench.rightVisible?'right':null].filter(Boolean) as string[],[workbench.leftVisible,workbench.rightVisible]);
  const defaultLayout=useMemo(()=>Object.fromEntries(panels.map((id)=>[id,id==='left'?workbench.leftSize:id==='right'?workbench.rightSize:workbench.centerSize])),[panels,workbench]);
  const onLayout=(layout:Layout)=>setSizes([layout.left??workbench.leftSize,layout.center??workbench.centerSize,layout.right??workbench.rightSize]);
  return <V3Frame area="workbench" title="论文与实验工作台">
    <div className={styles.workbench} data-mode={workbench.mode}>
      <ToolRail/>
      <header className={styles.contextBar}>
        <Link to="/prototype/resources"><ArrowLeft size={15}/> 资源库</Link>
        <div className={styles.contextTitle}><FileText size={15}/><span><b>{paper.id}</b><small>{paper.title}</small></span><ChevronDown size={14}/></div>
        <div className={styles.contextState}><span><i/>仅保存在本机</span><span>未连接协作服务</span></div>
        <AreaSwitcher active="workbench" compact/>
      </header>
      <div className={styles.modeBar}>{modes.map(([id,label,Icon])=><button type="button" key={id} data-active={workbench.mode===id} onClick={()=>setMode(id)}><Icon size={14}/>{label}</button>)}<span/><button type="button" onClick={()=>setVisibility('left',!workbench.leftVisible)} title="切换左栏"><PanelLeftClose size={16}/></button><button type="button" onClick={()=>setVisibility('right',!workbench.rightVisible)} title="切换右栏"><PanelRightClose size={16}/></button><button type="button" onClick={reset} title="恢复布局"><RotateCcw size={15}/></button></div>
      <div className={styles.tabBar}><button type="button" data-active><BookOpen size={13}/>{paper.id}<X size={12}/></button><button type="button"><Plus size={13}/> 打开论文</button></div>
      <div className={styles.panelArea}>
        <Group key={panels.join('-')} orientation="horizontal" defaultLayout={defaultLayout} onLayoutChanged={onLayout}>
          {workbench.leftVisible?<><Panel id="left" minSize="16%" defaultSize={`${workbench.leftSize}%`}><KnowledgePanel/></Panel><Separator className={styles.separator}/></>:null}
          <Panel id="center" minSize="34%" defaultSize={`${workbench.centerSize}%`}><ReadingPanel/></Panel>
          {workbench.rightVisible?<><Separator className={styles.separator}/><Panel id="right" minSize="19%" defaultSize={`${workbench.rightSize}%`}><ExperimentPanel/></Panel></>:null}
        </Group>
      </div>
      <footer className={styles.statusBar}><span><Terminal size={12}/> LOCAL WORKSPACE</span><span>UTF-8</span><span>{paper.id}</span><span/><span>面板布局已保存</span></footer>
    </div>
  </V3Frame>;
}
