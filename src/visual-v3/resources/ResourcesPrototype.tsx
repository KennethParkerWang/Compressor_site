import React, {useEffect, useMemo, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {ArrowRight, Bookmark, Clock3, Compass, ExternalLink, Menu, Search, Shuffle, X} from 'lucide-react';
import {motion} from 'framer-motion';
import {AreaSwitcher} from '../shared/AreaSwitcher';
import {V3Frame} from '../shared/V3Frame';
import {featuredPapers, primaryDatasets, recentPapers, researchCounts} from '../data/researchAdapter';
import {useV3Workspace} from '../shared/useV3Workspace';
import {AlgorithmLineage} from './AlgorithmLineage';
import styles from './resourcesPrototype.module.css';

const tags = ['无损压缩', 'LZ', '上下文混合', '熵编码', '神经压缩', 'Benchmark', 'Silesia', 'Transformer'];

export default function ResourcesPrototype() {
  const [menu, setMenu] = useState(false);
  const [tag, setTag] = useState('全部');
  const favorites = useV3Workspace((state) => state.favorites);
  const toggleFavorite = useV3Workspace((state) => state.toggleFavorite);
  const visit = useV3Workspace((state) => state.visit);
  const visibleRecent = useMemo(() => tag === '全部' ? recentPapers : recentPapers.filter((paper) => paper.tags?.some((item) => item.includes(tag))), [tag]);
  useEffect(() => {
    const id = window.setTimeout(() => document.documentElement.style.setProperty('--resource-ready', '1'), 80);
    return () => window.clearTimeout(id);
  }, []);
  const randomPaper = () => {
    const paper = featuredPapers[Math.floor(Math.random() * featuredPapers.length)];
    visit(paper.id);
    window.location.assign(`/paper-reading?lit=${paper.id}`);
  };
  return (
    <V3Frame area="resources" title="资源原型">
      <div className={styles.resources}>
        <aside className={styles.sideNav} data-open={menu}>
          <div className={styles.archiveMark}><b>CR.</b><span>RESEARCH<br />ARCHIVE</span></div>
          <nav>
            {['精选', '论文', '算法', '压缩器', '教程', '数据集', '研究图谱', '技术脉络'].map((item, index) => <a key={item} href={index < 2 ? '#精选' : index < 6 ? '#论文' : '#技术脉络'}><span>{String(index + 1).padStart(2, '0')}</span>{item}</a>)}
          </nav>
          <button type="button" onClick={randomPaper}><Shuffle size={15} /> 随机探索</button>
          <small>ARCHIVE BUILD<br />2026.07</small>
        </aside>

        <header className={styles.topNav}>
          <button className={styles.mobileMenu} type="button" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
          <div className={styles.tagRail}>{tags.map((item) => <button type="button" key={item} onClick={() => setTag(item)} data-active={tag === item}>{item}</button>)}</div>
          <button className={styles.searchButton} type="button" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key:'k', ctrlKey:true}))}><Search size={16} /> 检索档案 <kbd>⌘K</kbd></button>
          <AreaSwitcher active="resources" compact />
        </header>

        <main>
          <section id="精选" className={styles.editorialHero}>
            <div className={styles.issue}><span>ISSUE</span><b>01</b><small>LOSSLESS<br />SYSTEMS</small></div>
            <motion.div className={styles.heroTitle} initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.55}}>
              <span>研究档案 / 2026</span>
              <h1>压缩不是一个算法，<br />是一组可组合的判断。</h1>
            </motion.div>
            <div className={styles.heroFeature}>
              <span>EDITOR'S FILE</span>
              <h2>Adaptive Weighing of Context Models for Lossless Data Compression</h2>
              <p>PAQ 系列的重要思想来源：多个上下文模型给出概率，再由自适应混合器组合。</p>
              <Link to="/paper-reading?lit=LIT-0018" onClick={() => visit('LIT-0018')}>打开档案 <ArrowRight size={16} /></Link>
            </div>
            <div className={styles.heroVisual}>
              <BrowserOnly fallback={<div className={styles.visualFallback}>MODEL / ENTROPY / BITSTREAM</div>}>
                {() => { const Scene = require('../three-library/CompressionFlowScene').default; return <Scene variant="archive" />; }}
              </BrowserOnly>
              <span>拖动查看数据结构 / 点击模型核心</span>
            </div>
            <div className={styles.archiveStats}>
              <span><b>{researchCounts.papers}</b> Papers</span><span><b>{researchCounts.algorithms}</b> Nodes</span><span><b>{researchCounts.datasets}</b> Datasets</span>
            </div>
          </section>

          <section id="论文" className={styles.paperSection}>
            <header><span>01 / SELECTED PAPERS</span><h2>从理论边界到工程系统</h2><p>按证据来源、技术位置和复现价值组织，不按“最新”替代判断。</p></header>
            <div className={styles.paperMosaic}>
              {featuredPapers.slice(0,5).map((paper, index) => (
                <article key={paper.id} data-feature={index === 0}>
                  <div className={styles.paperMeta}><span>{paper.year ?? '—'}</span><span>{paper.id}</span></div>
                  <h3>{paper.title}</h3>
                  <p>{paper.summaryZh ?? paper.coreReason}</p>
                  <footer><span>{paper.venue ?? paper.chapterTitleEn}</span><button type="button" aria-label="收藏论文" data-active={favorites.includes(paper.id)} onClick={() => toggleFavorite(paper.id)}><Bookmark size={16} /></button><Link to={`/paper-reading?lit=${paper.id}`} onClick={() => visit(paper.id)}><ArrowRight size={17} /></Link></footer>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.discoveryBand}>
            <div><Compass /><span>THIS WEEK</span><h2>Language Modeling Is Compression</h2><p>把语言建模的 log-loss 与无损编码长度放进同一框架。</p></div>
            <div className={styles.compressorIndex}>{['gzip / DEFLATE','xz / LZMA2','Zstandard','PAQ8px','CMIX','NNCP'].map((item,index)=><span key={item}><i>{String(index+1).padStart(2,'0')}</i>{item}<ArrowRight size={14}/></span>)}</div>
          </section>

          <section id="技术脉络" className={styles.lineageSection}>
            <header><span>02 / INTERACTIVE LINEAGE</span><h2>算法演化不是一条直线</h2><p>拖动、缩放并筛选技术家族。节点位置按年代与技术分支组织。</p></header>
            <BrowserOnly fallback={<div className={styles.graphFallback}>算法谱系加载中</div>}>{() => <AlgorithmLineage />}</BrowserOnly>
          </section>

          <section className={styles.indexSection}>
            <div className={styles.indexTitle}><span>03 / INDEX</span><h2>最近收录</h2><div><button type="button" data-active={tag === '全部'} onClick={() => setTag('全部')}>全部</button>{tags.slice(0,4).map((item)=><button type="button" data-active={tag===item} onClick={()=>setTag(item)} key={item}>{item}</button>)}</div></div>
            <div className={styles.paperIndex}>
              {visibleRecent.length ? visibleRecent.map((paper)=><Link key={paper.id} to={`/paper-reading?lit=${paper.id}`} onClick={()=>visit(paper.id)}><span>{paper.year ?? '—'}</span><b>{paper.title}</b><small>{paper.venue ?? paper.chapterTitleEn}</small><ExternalLink size={14}/></Link>) : <div className={styles.emptyIndex}>当前筛选暂无最新记录</div>}
            </div>
            <aside className={styles.datasetStrip}><span>BENCHMARK SETS</span>{primaryDatasets.map((dataset)=><a href={dataset.sourceUrl} key={dataset.id} target="_blank" rel="noreferrer"><b>{dataset.name}</b><small>{dataset.scale}</small></a>)}</aside>
          </section>
        </main>
        <footer className={styles.footer}><div>Compression Research Archive</div><span><Clock3 size={13}/> Updated from repository records</span><button type="button" onClick={randomPaper}><Shuffle size={14}/> 随机打开一篇论文</button></footer>
      </div>
    </V3Frame>
  );
}
