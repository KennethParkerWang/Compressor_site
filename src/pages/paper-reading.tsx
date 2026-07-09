import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  ChevronRight,
  ExternalLink,
  FileText,
  FlaskConical,
  GitBranch,
  Layers3,
  Lightbulb,
  Network,
} from 'lucide-react';
import {literatureData, type LiteratureItem} from '../data/literatureData';
import {experimentAssets} from '../data/experimentData';
import styles from './paper-reading.module.css';

type ReaderMode = 'overview' | 'analysis';

interface ReaderTerm {
  name: string;
  group: string;
  description: string;
}

const TERM_BANK: ReaderTerm[] = [
  {name: 'Entropy', group: 'Information Theory', description: '衡量信息源不确定性的核心量，也是无损压缩理论下界的依据。'},
  {name: 'Probability Model', group: 'Modeling', description: '估计符号或特征出现概率的模型，直接影响最终码长。'},
  {name: 'Arithmetic Coding', group: 'Entropy Coding', description: '把消息映射到概率区间中，常用于把模型概率转成接近最优的码流。'},
  {name: 'Range Coding', group: 'Entropy Coding', description: '算术编码的工程变体，常用整数区间实现以提升速度和稳定性。'},
  {name: 'ANS', group: 'Entropy Coding', description: '非对称数字系统，兼顾接近算术编码的压缩率和接近查表编码的速度。'},
  {name: 'Huffman Coding', group: 'Entropy Coding', description: '经典前缀码构造方法，适合快速解码和概率较稳定的符号分布。'},
  {name: 'LZ77', group: 'Dictionary', description: '通过历史窗口中的重复片段引用来减少冗余，是 gzip、zstd、lz4 等方法的重要基础。'},
  {name: 'BWT', group: 'Transform', description: '可逆块排序变换，把相似上下文聚到一起，便于后续 MTF 和熵编码。'},
  {name: 'Context Mixing', group: 'Modeling', description: '融合多个上下文模型的预测结果，PAQ/CMIX 等高压缩率压缩器常使用这一思想。'},
  {name: 'PPM', group: 'Modeling', description: '基于不同阶历史上下文预测下一个符号，适合文本和序列数据。'},
  {name: 'Quantization', group: 'Learned Compression', description: '把连续潜变量映射为离散码字，是学习式压缩连接网络输出与码流的关键步骤。'},
  {name: 'Rate-Distortion', group: 'Metric', description: '描述码率与重建误差之间的权衡，是有损和学习式压缩论文中的常见目标。'},
  {name: 'BD-Rate', group: 'Metric', description: '衡量两条率失真曲线平均码率差异，常用于图像/视频压缩方法对比。'},
  {name: 'PSNR', group: 'Metric', description: '基于均方误差的重建质量指标，数值越高通常表示失真越小。'},
  {name: 'MS-SSIM', group: 'Metric', description: '多尺度结构相似性指标，更贴近视觉感知质量。'},
  {name: 'BPB', group: 'Metric', description: 'Bits Per Byte，每个原始字节需要的压缩比特数，常用于无损压缩横向比较。'},
];

function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function getPaperFromUrl(search: string): LiteratureItem {
  const litId = new URLSearchParams(search).get('lit');
  return literatureData.find((item) => item.id === litId) ?? literatureData[0];
}

function getRelatedTerms(paper: LiteratureItem): ReaderTerm[] {
  const text = [paper.title, paper.summaryZh, paper.coreReason, paper.readerBenefit, ...(paper.tags ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const direct = TERM_BANK.filter((term) => {
    const name = term.name.toLowerCase();
    return text.includes(name) || name.split(/[-\s]/).some((part) => part.length > 3 && text.includes(part));
  });
  const fallback = TERM_BANK.filter((term) => {
    if (paper.chapterId === '01') return ['Information Theory', 'Entropy Coding', 'Modeling', 'Dictionary', 'Transform'].includes(term.group);
    if (paper.chapterId === '06' || text.includes('learned') || text.includes('neural')) return ['Learned Compression', 'Metric'].includes(term.group);
    return ['Entropy Coding', 'Metric', 'Modeling'].includes(term.group);
  });
  return Array.from(new Map([...direct, ...fallback].map((term) => [term.name, term])).values()).slice(0, 12);
}

function getRelatedExperiments(paper: LiteratureItem) {
  const chapterMatches = experimentAssets.filter((asset) => asset.chapterId === paper.chapterId);
  if (chapterMatches.length > 0) return chapterMatches.slice(0, 6);
  const text = [paper.title, ...(paper.tags ?? [])].join(' ').toLowerCase();
  return experimentAssets
    .filter((asset) => text.includes(asset.name.toLowerCase()) || text.includes(asset.category))
    .slice(0, 6);
}

function splitAuthors(authors?: string): string[] {
  if (!authors) return [];
  return authors.split(/;|,/).map((item) => item.trim()).filter(Boolean).slice(0, 6);
}

export default function PaperReadingPage(): React.ReactElement {
  const location = useLocation();
  const lang = isEnglishPath(location.pathname) ? 'en' : 'zh';
  const paper = useMemo(() => getPaperFromUrl(location.search), [location.search]);
  const [mode, setMode] = useState<ReaderMode>('overview');
  const terms = useMemo(() => getRelatedTerms(paper), [paper]);
  const experiments = useMemo(() => getRelatedExperiments(paper), [paper]);
  const authors = splitAuthors(paper.authors);

  return (
    <Layout title={`${paper.title} | 论文精读`} description={paper.summaryZh ?? paper.title}>
      <main className={styles.reader}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <Link to={lang === 'en' ? '/en/library' : '/library'} className={styles.backLink}>
              <ArrowLeft size={16} /> 返回文献库
            </Link>
            <div>
              <span>Paper Deep Dive</span>
              <strong>{paper.id}</strong>
            </div>
          </div>
          <div className={styles.modeTabs} role="tablist" aria-label="阅读模式">
            <button type="button" data-active={mode === 'overview'} onClick={() => setMode('overview')}>
              <FileText size={15} /> 信息页
            </button>
            <button type="button" data-active={mode === 'analysis'} onClick={() => setMode('analysis')}>
              <Network size={15} /> 进入解析
            </button>
          </div>
          <div className={styles.topActions}>
            {paper.url ? (
              <a href={paper.url} target="_blank" rel="noreferrer">
                原文 <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
        </header>

        <div className={styles.shell}>
          <aside className={styles.leftRail}>
            <div className={styles.railHead}>
              <span>Terms</span>
              <strong>本文涉及专业名词</strong>
            </div>
            <div className={styles.termHint}>术语解释会随论文标签与章节自动筛选。</div>
            <div className={styles.termList}>
              {terms.map((term) => (
                <article key={term.name} className={styles.termCard}>
                  <div>
                    <strong>{term.name}</strong>
                    <span>{term.group}</span>
                  </div>
                  <p>{term.description}</p>
                </article>
              ))}
            </div>
          </aside>

          <section className={styles.centerPane}>
            {mode === 'overview' ? (
              <Overview paper={paper} authors={authors} onEnterAnalysis={() => setMode('analysis')} />
            ) : (
              <Analysis paper={paper} />
            )}
          </section>

          <aside className={styles.rightRail}>
            <div className={styles.railHead}>
              <span>Experiments</span>
              <strong>实验结果与配置</strong>
            </div>
            {experiments.length > 0 ? (
              <ExperimentPanel paper={paper} experiments={experiments} />
            ) : (
              <EmptyExperiment />
            )}
          </aside>
        </div>
      </main>
    </Layout>
  );
}

function Overview({paper, authors, onEnterAnalysis}: {paper: LiteratureItem; authors: string[]; onEnterAnalysis: () => void}) {
  return (
    <article className={styles.paperPage}>
      <section className={styles.paperHero}>
        <div className={styles.paperCoverMini}>
          <BookOpen size={42} />
          <span>{paper.year ?? 'Paper'}</span>
        </div>
        <div className={styles.paperHeroText}>
          <div className={styles.metaLine}>
            <span>{paper.venue ?? 'Unknown venue'}</span>
            <span>{paper.year ?? 'No year'}</span>
            <span>{paper.type ?? 'paper'}</span>
          </div>
          <h1>{paper.title}</h1>
          <div className={styles.authorLine}>
            {authors.length > 0 ? authors.map((author) => <span key={author}>{author}</span>) : <span>作者待补充</span>}
          </div>
          <div className={styles.tagRow}>
            {(paper.tags ?? []).slice(0, 8).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <InfoSection icon={FileText} title="摘要">
          <p>{paper.summaryZh || '这篇论文的摘要尚未整理。后续可以从原文 PDF 或论文解析 skill 生成结构化摘要。'}</p>
        </InfoSection>
        <InfoSection icon={Lightbulb} title="核心贡献">
          <p>{paper.coreReason || '核心贡献待补充。建议后续按“解决的问题、提出的方法、相比 baseline 的改进、适用边界”四项整理。'}</p>
        </InfoSection>
        <InfoSection icon={Layers3} title="方法概览">
          <div className={styles.moduleStrip}>
            <span>输入数据</span><ChevronRight size={16} /><span>结构建模</span><ChevronRight size={16} /><span>编码/压缩</span><ChevronRight size={16} /><span>重建与评价</span>
          </div>
          <p>{paper.readerBenefit || '这里先保留方法概览框架，后续会把论文方法拆成可视化模块。'}</p>
        </InfoSection>
        <InfoSection icon={GitBranch} title="阅读定位">
          <p>所属章节：{paper.chapterId} / {paper.chapterTitleZh || paper.chapterTitleEn}。推荐动作：{paper.recommendedAction ?? 'deep-read'}。</p>
        </InfoSection>
      </section>

      <button type="button" className={styles.enterAnalysis} onClick={onEnterAnalysis}>
        进入解析 <ChevronRight size={18} />
      </button>
    </article>
  );
}

function Analysis({paper}: {paper: LiteratureItem}) {
  return (
    <article className={styles.analysisPage}>
      <section className={styles.analysisIntro}>
        <h1>{paper.title}</h1>
        <div className={styles.markdownCanvas} aria-label="Markdown document area" />
      </section>
    </article>
  );
}

function InfoSection({icon: Icon, title, children}: {icon: React.ComponentType<{size?: number}>; title: string; children: React.ReactNode}) {
  return (
    <section className={styles.infoSection}>
      <h2><Icon size={17} />{title}</h2>
      {children}
    </section>
  );
}

function ExperimentPanel({paper, experiments}: {paper: LiteratureItem; experiments: typeof experimentAssets}) {
  return (
    <div className={styles.experimentPanel}>
      <section className={styles.expConfig}>
        <h2><FlaskConical size={16} />实验配置</h2>
        <label>数据集<select defaultValue={experiments.find((item) => item.category === 'dataset')?.id ?? ''}>
          {experiments.filter((item) => item.category === 'dataset').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          <option value="">待选择</option>
        </select></label>
        <label>指标<select defaultValue="bpb">
          <option value="bpb">BPB / Compression Ratio</option>
          <option value="speed">Throughput</option>
          <option value="memory">Peak Memory</option>
        </select></label>
        <label>关联论文<input value={paper.id} readOnly /></label>
      </section>

      <section className={styles.expTable}>
        <h2><BarChart3 size={16} />关联实验资产</h2>
        {experiments.map((item) => (
          <div key={item.id} className={styles.expRow}>
            <span>{item.category}</span>
            <strong>{item.name}</strong>
            <em data-status={item.status}>{item.status}</em>
          </div>
        ))}
      </section>

      <section className={styles.curvePlaceholder}>
        <h2>对比曲线</h2>
        <div className={styles.chartMock}>
          <span style={{height: '38%'}} />
          <span style={{height: '58%'}} />
          <span style={{height: '46%'}} />
          <span style={{height: '72%'}} />
          <span style={{height: '64%'}} />
        </div>
        <p>这里后续接入实验结果表或压缩率曲线。</p>
      </section>
    </div>
  );
}

function EmptyExperiment() {
  return (
    <div className={styles.emptyExp}>
      <FlaskConical size={28} />
      <strong>暂无实验数据</strong>
      <p>该论文还没有绑定实验结果。后续可从实验台导入数据集、baseline、指标和曲线。</p>
    </div>
  );
}
