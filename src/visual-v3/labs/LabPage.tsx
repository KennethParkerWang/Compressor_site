import React, {useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {motion, AnimatePresence} from 'framer-motion';
import {AlertTriangle, ArrowRight, Bookmark, Check, ChevronRight, Database, FileText, FlaskConical, GripVertical, LoaderCircle, Menu, Network, Play, RotateCcw, Search, X} from 'lucide-react';
import {AreaSwitcher} from '../shared/AreaSwitcher';
import {V3Frame} from '../shared/V3Frame';
import {BenchmarkEmptyChart, ParetoProtocolChart} from '../chart-library/ResearchCharts';
import {featuredPapers, primaryDatasets} from '../data/researchAdapter';
import {useV3Workspace} from '../shared/useV3Workspace';
import type {PerformanceMode} from '../shared/types';
import styles from './labPage.module.css';

export type LabId = 'design'|'navigation'|'card'|'chart'|'motion'|'three';

const labNav: Array<[LabId,string]>=[['design','Design'],['navigation','Navigation'],['card','Cards'],['chart','Charts'],['motion','Motion'],['three','3D']];

function DesignLab(){return <div className={styles.designLab}>
  <section className={styles.tokenIntro}><span>THREE INTERFACES / ONE RESEARCH BRAND</span><h2>共同约束，不同工作语境</h2><p>项目区负责公开叙事，资源区负责发现，工作台负责长时间操作。三者共享可信度、来源状态和科研数据口径。</p></section>
  <section className={styles.colorSystems}>{[
    ['PROJECT','#08100e','#d8f15a','#52a8bf','深色精密系统'],['ARCHIVE','#edf0e9','#2b6d55','#ad493b','纸面研究档案'],['WORKBENCH','#151b1a','#5cc6d4','#94d66f','科研操作系统']
  ].map(([name,a,b,c,label])=><article key={name}><span>{name}</span><div><i style={{background:a}}/><i style={{background:b}}/><i style={{background:c}}/></div><b>{label}</b><small>AA contrast / system type / 8px baseline</small></article>)}</section>
  <section className={styles.typeSpec}><div><span>DISPLAY / SERIF</span><h3>算法结构决定压缩上限。</h3></div><div><span>INTERFACE / SANS</span><h4>实验结果必须回指数据、环境与实现版本。</h4></div><div><span>METADATA / MONO</span><code>SOURCE: LIT-0018 · STATUS: RECORDED · BPB: NULL</code></div></section>
  <section className={styles.stateSpec}>{['已核验','已记录','待核验','暂无数据','运行失败'].map((item,index)=><span key={item} data-state={index}>{index===0?<Check size={13}/>:index===4?<AlertTriangle size={13}/>:<i/>}{item}</span>)}</section>
</div>}

function NavigationLab(){const[compact,setCompact]=useState(false);const[open,setOpen]=useState(false);return <div className={styles.navLab}>
  <section><header><span>PROJECT NAV</span><button type="button" onClick={()=>setCompact(!compact)}>切换滚动态</button></header><div className={styles.projectNavDemo} data-compact={compact}><b>高压缩比无损数据压缩算法</b><nav>{['目标','路线','进展','基准','汇报','成果'].map(x=><a key={x}>{x}</a>)}</nav><button type="button"><FileText size={14}/> 最新汇报</button></div></section>
  <section><header><span>ARCHIVE NAV</span><button type="button" onClick={()=>setOpen(!open)}>{open?'收起':'展开'}</button></header><div className={styles.archiveNavDemo} data-open={open}><b>CR.</b><button type="button"><Menu/></button><nav>{['精选','论文','算法','压缩器','教程','数据集','技术脉络'].map((x,i)=><a key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}</a>)}</nav></div></section>
  <section><header><span>WORKBENCH NAV</span></header><div className={styles.workbenchNavDemo}><aside>{[FileText,Network,FlaskConical,Database,Search].map((Icon,i)=><button key={i}><Icon size={17}/></button>)}</aside><div><span>LIT-0018</span><b>Adaptive Weighing of Context Models…</b></div><em>LOCAL</em></div></section>
</div>}

function CardLab(){const[state,setState]=useState('default');return <div className={styles.cardLab}>
  <div className={styles.cardControls}>{['default','selected','loading','error'].map(item=><button type="button" data-active={state===item} onClick={()=>setState(item)} key={item}>{item}</button>)}</div>
  <section>
    <article className={styles.metricCard} data-state={state}><span>BASELINE / PAQ8px-1</span><b>{state==='loading'?<LoaderCircle className={styles.spin}/>:state==='error'?'不可用':'结果待录入'}</b><div><i style={{width:state==='selected'?'62%':'12%'}}/></div><small>{state==='error'?'配置文件未关联':'Silesia · bit-exact required'}</small></article>
    <article className={styles.paperCover} data-state={state}><span>2000 / LIT-0018</span><h3>{featuredPapers[0]?.title}</h3><p>{featuredPapers[0]?.summaryZh}</p><footer><Bookmark size={15}/><ArrowRight size={17}/></footer></article>
    <article className={styles.taskCard} data-state={state}><GripVertical/><div><span>REPRODUCTION</span><b>运行 Silesia 分文件基线</b><small>PAQ8px-1 · 环境待核验</small></div><i/></article>
    <article className={styles.datasetCard} data-state={state}><Database/><div><span>{primaryDatasets[0]?.id}</span><h3>{primaryDatasets[0]?.name}</h3><p>{primaryDatasets[0]?.scale}</p></div><ChevronRight/></article>
  </section>
</div>}

function ChartLab(){const[chart,setChart]=useState<'benchmark'|'pareto'>('benchmark');return <div className={styles.chartLab}>
  <div className={styles.chartToolbar}><div><span>VIEW</span><button type="button" data-active={chart==='benchmark'} onClick={()=>setChart('benchmark')}>压缩率</button><button type="button" data-active={chart==='pareto'} onClick={()=>setChart('pareto')}>Pareto</button></div><div><button type="button">导出 PNG</button><button type="button">导出 CSV</button><button type="button">全屏</button></div></div>
  <section className={styles.chartCanvas}><header><span>UNIFIED BENCHMARK / SILESIA</span><h2>{chart==='benchmark'?'算法压缩率比较':'压缩率—吞吐权衡'}</h2><p>空图是有效状态：当前仓库没有同环境、同粒度的可比结果。</p></header>{chart==='benchmark'?<BenchmarkEmptyChart/>:<ParetoProtocolChart/>}</section>
  <aside><b>数据协议</b><span>sourceId</span><code>EXP-BENCH-SILESIA</code><span>metric</span><code>{chart==='benchmark'?'bits_per_byte':'throughput_mb_s'}</code><span>verification</span><code>pending</code></aside>
</div>}

function MotionLab(){const[step,setStep]=useState(0);return <div className={styles.motionLab}>
  <section className={styles.motionStage}><AnimatePresence mode="wait"><motion.div key={step} initial={{opacity:0,x:28,clipPath:'inset(0 100% 0 0)'}} animate={{opacity:1,x:0,clipPath:'inset(0 0% 0 0)'}} exit={{opacity:0,x:-18}} transition={{duration:.42,ease:[.22,1,.36,1]}}><span>STATE / {String(step+1).padStart(2,'0')}</span><h2>{['识别输入类型','发现数据冗余','生成可逆 bitstream'][step]}</h2><p>{['判断文件和数据粒度，选择后续压缩路线。','模型给出重复引用或下一符号概率。','熵编码器把模型判断转换为紧凑码流。'][step]}</p></motion.div></AnimatePresence><button type="button" onClick={()=>setStep((step+1)%3)}>下一状态 <ArrowRight/></button></section>
  <section className={styles.flowMotion}>{[0,1,2,3,4].map(i=><motion.i key={i} animate={{x:[0,220],opacity:[0,1,1,0]}} transition={{duration:2.4,repeat:Infinity,delay:i*.34,ease:'linear'}}/>)}<b>MODEL</b></section>
  <section className={styles.motionRules}><span>120 ms</span><p>控件状态与轻量反馈</p><span>160 ms</span><p>导航、面板和筛选</p><span>420 ms</span><p>仅用于跨区域页面叙事</p></section>
</div>}

function ThreeLab(){const performance=useV3Workspace(s=>s.performance);const setPerformance=useV3Workspace(s=>s.setPerformance);return <div className={styles.threeLab}>
  <div className={styles.performanceSwitch}>{(['full','reduced','static'] as PerformanceMode[]).map(mode=><button type="button" key={mode} data-active={performance===mode} onClick={()=>setPerformance(mode)}>{mode}</button>)}</div>
  <section>{performance==='static'?<div className={styles.staticScene}><span>RAW BLOCKS</span><i>→</i><b>MODEL</b><i>→</i><span>BITSTREAM</span></div>:<BrowserOnly fallback={<div className={styles.staticScene}>3D LOADING</div>}>{()=>{const Scene=require('../three-library/CompressionFlowScene').default;return <Scene variant={performance==='full'?'flow':'lineage'}/>}}</BrowserOnly>}<div className={styles.sceneCaption}><span>DATA FLOW / INTERACTIVE</span><p>拖动镜头，点击核心暂停自动旋转。低性能模式降低像素密度和场景复杂度。</p></div></section>
</div>}

export default function LabPage({lab}: {lab:LabId}){const body={design:<DesignLab/>,navigation:<NavigationLab/>,card:<CardLab/>,chart:<ChartLab/>,motion:<MotionLab/>,three:<ThreeLab/>}[lab];return <V3Frame area="resources" title={`${lab} lab`}><div className={styles.lab}><header><Link to="/prototype/project">CR / V3</Link><nav>{labNav.map(([id,label])=><Link key={id} to={`/${id}-lab`} data-active={id===lab}>{label}</Link>)}</nav><AreaSwitcher active="resources" compact/></header><div className={styles.labTitle}><span>VISUAL SYSTEM TEST / {lab.toUpperCase()}</span><h1>{labNav.find(([id])=>id===lab)?.[1]} Lab</h1><p>使用真实压缩研究内容测试组件行为、状态和响应式表现。</p></div>{body}</div></V3Frame>}
