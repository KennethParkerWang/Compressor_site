import React, {useEffect, useRef, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {ArrowDown, ArrowRight, Check, Download, FileText, Flag, Gauge, Menu, Presentation, RotateCcw, Target, X} from 'lucide-react';
import {AreaSwitcher} from '../shared/AreaSwitcher';
import {V3Frame} from '../shared/V3Frame';
import {firstReport, researchCounts} from '../data/researchAdapter';
import {BenchmarkEmptyChart} from '../chart-library/ResearchCharts';
import styles from './projectPrototype.module.css';

const stages = [
  ['01', '输入与分流', '文件类型识别 / 流式 IO'],
  ['02', '可逆预处理', 'BitPlane / Residual / 块级优化'],
  ['03', '冗余发现与建模', 'LZ / 上下文 / 神经预测'],
  ['04', '概率融合与熵编码', 'Mixer / Huffman / FSE / Range'],
  ['05', '工程封装', 'Frame / 元数据 / 校验'],
];

const ganttTasks = [
  {id: 'phase-1', name: '理论、数据与文献调研', start: '2026-07-01', end: '2026-07-24', progress: 58},
  {id: 'phase-2', name: '工业基线与 PAQ8px-1', start: '2026-07-18', end: '2026-08-21', progress: 12, dependencies: 'phase-1'},
  {id: 'phase-3', name: '神经压缩与领域扩展', start: '2026-08-15', end: '2026-10-09', progress: 0, dependencies: 'phase-2'},
  {id: 'phase-4', name: '统一 benchmark 与复现', start: '2026-09-18', end: '2026-11-20', progress: 0, dependencies: 'phase-2'},
];

function GanttView() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    import('frappe-gantt').then(({default: Gantt}) => {
      if (!disposed && ref.current) new Gantt(ref.current, ganttTasks, {view_mode: 'Week', language: 'zh'});
    });
    return () => { disposed = true; if (ref.current) ref.current.innerHTML = ''; };
  }, []);
  return <div className={styles.gantt} ref={ref} />;
}

export default function ProjectPrototype() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <V3Frame area="project" title="项目原型">
      <div className={styles.project}>
        <header className={styles.nav} data-scrolled={scrolled}>
          <Link to="/prototype/project" className={styles.brand}><span>CR</span><b>高压缩比无损数据压缩算法</b></Link>
          <nav className={styles.localNav} data-open={menuOpen}>
            {['项目目标', '研究路线', '当前进展', '基准结果', '双周汇报', '阶段成果'].map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
          </nav>
          <AreaSwitcher active="project" compact />
          <button className={styles.menuButton} type="button" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </header>

        <section className={styles.hero}>
          <div className={styles.scene} aria-label="可交互压缩数据流">
            <BrowserOnly fallback={<div className={styles.sceneFallback}>DATA → MODEL → BITSTREAM</div>}>
              {() => {
                const Scene = require('../three-library/CompressionFlowScene').default;
                return <Scene variant="flow" />;
              }}
            </BrowserOnly>
          </div>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span>PROJECT 2026</span><i /> <span>阶段 01 / 05</span></div>
            <h1>高压缩比<br />无损数据压缩算法</h1>
            <p>围绕多源数据的可逆预处理、概率建模与熵编码，建立可复现的算法比较和模块化研究路线。</p>
            <div className={styles.heroActions}>
              <a href="#研究路线">查看研究路线 <ArrowDown size={16} /></a>
              <Link to={`/weekly-reports?report=${firstReport.id}`}>打开最新汇报 <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className={styles.heroStatus}>
            <span>当前基线</span><strong>PAQ8px-1</strong>
            <span>主评测集</span><strong>Silesia / 腾讯数据集</strong>
            <span>正确性门槛</span><strong>bit-exact</strong>
          </div>
        </section>

        <main>
          <section id="项目目标" className={styles.objective}>
            <div className={styles.sectionIndex}>01 / OBJECTIVE</div>
            <div><h2>不是寻找一个“万能算法”，而是识别压缩流水线中可验证的改进位置。</h2><p>从输入特征、可逆变换、冗余建模到 bitstream 封装，每个模块都必须在同一数据集和同一测量协议下接受评估。</p></div>
            <div className={styles.scopeNumbers}><span><b>{researchCounts.papers}</b>公开文献记录</span><span><b>{researchCounts.algorithms}</b>算法演化节点</span><span><b>{researchCounts.datasets}</b>数据集档案</span></div>
          </section>

          <section id="研究路线" className={styles.routeSection}>
            <div className={styles.sectionHead}><span>02 / SYSTEM ROUTE</span><h2>压缩数据流</h2><p>研发评测位于主流程之外，持续检查压缩率、速度、内存、延迟和解压正确性。</p></div>
            <div className={styles.routeTrack}>
              <div className={styles.routeInput}>RAW<br />DATA</div>
              {stages.map(([no, title, detail]) => <article key={no}><span>{no}</span><h3>{title}</h3><p>{detail}</p></article>)}
              <div className={styles.routeOutput}>.zst<br />.paq<br />.nncp</div>
            </div>
            <div className={styles.evaluationLoop}><RotateCcw size={17} /><b>评测闭环</b><span>Compression ratio</span><span>CPU / GPU throughput</span><span>Memory</span><span>Latency</span><span>bit-exact decode</span></div>
          </section>

          <section id="当前进展" className={styles.metrics}>
            <div className={styles.metricLead}><span>03 / CURRENT STATE</span><h2>当前阶段只报告已确认的事实。</h2><p>尚未在统一环境下完成的性能测试不提前填数。</p></div>
            <div className={styles.metricRail}>
              <div><Gauge /><span>压缩率</span><b>待统一测试</b><i style={{width: '12%'}} /></div>
              <div><Target /><span>CPU 吞吐</span><b>待统一测试</b><i style={{width: '8%'}} /></div>
              <div><Flag /><span>基线配置</span><b>PAQ8px-1 已确定</b><i style={{width: '62%'}} /></div>
              <div><Check /><span>解压正确性</span><b>bit-exact 门槛已确定</b><i style={{width: '100%'}} /></div>
            </div>
          </section>

          <section id="基准结果" className={styles.benchmark}>
            <div className={styles.sectionHead}><span>04 / BENCHMARK</span><h2>统一结果面板</h2><p>图表已建立数据协议，等待 Silesia 与腾讯数据集上的同环境结果。</p></div>
            <BenchmarkEmptyChart />
          </section>

          <section id="双周汇报" className={styles.reportSection}>
            <div className={styles.reportDate}><b>10</b><span>JUL<br />2026</span></div>
            <div className={styles.reportMain}><span>REPORT / 01</span><h2>第一次双周汇报</h2><p>汇报人：王坤鹏　·　14:30–15:30　·　已收录 1 / 2 份材料</p></div>
            <div className={styles.reportFiles}>
              <a href="/Compressor_site/reports/2026-07-10/WR-2026-07-10-wang-kunpeng.pdf" target="_blank"><FileText /> PDF <Download size={15} /></a>
              <a href="/Compressor_site/reports/2026-07-10/WR-2026-07-10-wang-kunpeng.pptx"><Presentation /> PPTX <Download size={15} /></a>
            </div>
          </section>

          <section id="阶段成果" className={styles.planSection}>
            <div className={styles.sectionHead}><span>05 / PLAN</span><h2>研究计划与依赖关系</h2><p>拖动时间轴查看阶段安排；正式任务编辑仍保留在旧站。</p></div>
            <BrowserOnly fallback={<div className={styles.ganttFallback}>计划时间轴加载中</div>}>{() => <GanttView />}</BrowserOnly>
          </section>
        </main>
      </div>
    </V3Frame>
  );
}
