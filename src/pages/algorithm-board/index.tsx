import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  ArrowRight,
  Binary,
  BookOpen,
  Box,
  Braces,
  CheckCircle2,
  CircleDot,
  Cpu,
  Database,
  FileArchive,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  Info,
  Link2,
  Map,
  Network,
  Sigma,
  Timer,
} from 'lucide-react';
import WorkbenchShell from '../../components/workbench/WorkbenchShell';
import {compressionConcepts, compressorRoutes, sourceRefs, type Lang, type LocalizedText} from '../../data/compressorSystem';
import styles from './styles.module.css';

const pick = (value: LocalizedText, lang: Lang): string => value[lang];

const COPY = {
  zh: {
    title: '无损压缩器系统地图',
    description: '从编码器、码流到解码器，区分通用约束、可选算法分支与工程格式。',
    eyebrow: 'Lossless compression architecture',
    intro: '无损压缩器不是一个单独算法，而是一套可逆系统：编码端发现并表示冗余，码流携带恢复所需的语法与边信息，解码端以确定的顺序重建原始字节。',
    verified: '内容依据公开标准与实现文档整理',
    noResults: '本页不展示未经仓库实验日志支持的性能数字。',
    guideEyebrow: 'How to read this map',
    guideTitle: '先回答三个问题，再从总图走到证据',
    guideIntro: '这不是算法排行榜，也不是必须逐项执行的流程清单。它用于建立无损压缩研究的系统边界。',
    guideQuestions: ['数据从哪里进入，如何保证逐字节还原？', '哪些模块是通用约束，哪些只是可选路线？', '如何把抽象模块映射到真实压缩器并形成可复现实验？'],
    readingOrder: '建议阅读顺序',
    architecture: '编码—解码总图',
    architectureLead: '主线展示信息如何经过编码器进入码流，再由镜像解码路径精确还原。虚线表示边信息和同步约束，不表示所有压缩器都执行同一串模块。',
    universal: '四条通用约束',
    families: '算法家族不是串行模块',
    familiesLead: '字典、上下文混合和神经预测是可选路线。一个压缩器可组合其中若干部分，也可以完全不使用某一分支。',
    concepts: '概念说明',
    routes: '六条真实压缩器路线',
    routesLead: '用相同观察维度比较格式层、解析/建模层、熵编码层和解码同步要求。',
    openRoute: '查看路线说明',
    evaluation: '评测闭环',
    evaluationLead: '评测围绕完整系统，不进入压缩数据流。所有图表都应从原始 CSV/JSON 生成。',
    metric: '指标',
    report: '必须记录',
    sources: '来源与边界',
    sourcesLead: '来源链接用于核对结构和术语。实现版本可能变化，实验结论必须绑定版本、命令和数据集。',
    doesNotClaim: '这张图不声称',
    sourceCount: '条公开来源',
  },
  en: {
    title: 'Lossless Compressor System Map',
    description: 'From encoder and bitstream to decoder, separating universal constraints, optional algorithm branches, and engineering formats.',
    eyebrow: 'Lossless compression architecture',
    intro: 'A lossless compressor is not a single algorithm. It is a reversible system: the encoder discovers and represents redundancy, the bitstream carries syntax and side information, and the decoder reconstructs the original bytes in a deterministic order.',
    verified: 'Content grounded in public standards and implementation documentation',
    noResults: 'No performance numbers are shown without experiment logs in this repository.',
    guideEyebrow: 'How to read this map',
    guideTitle: 'Answer three questions, then move from architecture to evidence',
    guideIntro: 'This is neither an algorithm ranking nor a mandatory serial checklist. It defines the system boundary for lossless-compression research.',
    guideQuestions: ['Where does data enter, and how is byte-exact recovery guaranteed?', 'Which parts are universal constraints, and which are optional routes?', 'How do abstract modules map to real codecs and reproducible experiments?'],
    readingOrder: 'Recommended reading order',
    architecture: 'Encoder–decoder overview',
    architectureLead: 'The main line shows information moving through the encoder into a bitstream and back through a mirrored decoder. Dashed links denote side information and synchronization, not a universal serial module chain.',
    universal: 'Four universal constraints',
    families: 'Algorithm families are branches, not serial modules',
    familiesLead: 'Dictionary coding, context mixing, and neural prediction are optional routes. A codec may combine some of them or omit a branch entirely.',
    concepts: 'Concept notes',
    routes: 'Six real compressor routes',
    routesLead: 'Compare format, parsing/modeling, entropy coding, and decoder synchronization using the same view.',
    openRoute: 'Open route note',
    evaluation: 'Evaluation loop',
    evaluationLead: 'Evaluation surrounds the complete system rather than entering the compressed data path. Every plot should be generated from raw CSV/JSON.',
    metric: 'Metric',
    report: 'Record',
    sources: 'Sources and scope',
    sourcesLead: 'Links support terminology and architecture checks. Implementations change; experimental claims must bind to versions, commands, and datasets.',
    doesNotClaim: 'This map does not claim',
    sourceCount: 'public sources',
  },
} as const;

const constraints = [
  {
    icon: GitCompareArrows,
    title: {zh: '可逆性', en: 'Reversibility'},
    body: {zh: '必须满足 D(E(x), side)=x；不是“看起来一样”，而是逐字节一致。', en: 'Must satisfy D(E(x), side)=x byte for byte, not merely look equivalent.'},
  },
  {
    icon: Network,
    title: {zh: '状态同步', en: 'State synchronization'},
    body: {zh: '字典、概率模型、神经状态与更新次序必须在两端一致。', en: 'Dictionary, probability, neural state, and update order must match at both ends.'},
  },
  {
    icon: Braces,
    title: {zh: '码流语法', en: 'Bitstream syntax'},
    body: {zh: '块边界、表、参数、终止规则必须能被解码器唯一解析。', en: 'Block boundaries, tables, parameters, and termination must be uniquely parseable.'},
  },
  {
    icon: CheckCircle2,
    title: {zh: '精确验证', en: 'Exact verification'},
    body: {zh: '解码后比较长度与哈希，并保留失败日志。', en: 'Compare decoded length and hashes, and retain failure logs.'},
  },
] as const;

const familyRows = [
  {
    key: 'dictionary', icon: Database,
    title: {zh: '字典 / 序列解析', en: 'Dictionary / sequence parsing'},
    question: {zh: '哪里出现过相同片段？', en: 'Where has the same substring appeared?'},
    output: {zh: 'literal + match(length, distance)', en: 'literal + match(length, distance)'},
    systems: 'DEFLATE · LZMA2 · Zstandard',
    concepts: ['dictionary-parsing'],
  },
  {
    key: 'transform', icon: Binary,
    title: {zh: '可逆变换', en: 'Reversible transforms'},
    question: {zh: '能否先重排或改写表示，使规律更集中？', en: 'Can data be reversibly re-expressed to concentrate structure?'},
    output: {zh: '变换后子流 + 逆变换信息', en: 'Transformed substreams + inverse metadata'},
    systems: 'xz filters · PAQ8px · cmix',
    concepts: ['reversible-transforms'],
  },
  {
    key: 'statistical', icon: Sigma,
    title: {zh: '统计 / 上下文模型', en: 'Statistical / context models'},
    question: {zh: '给定历史，下一个符号概率是多少？', en: 'Given the history, what is the next-symbol probability?'},
    output: {zh: 'frequency / probability / CDF', en: 'frequency / probability / CDF'},
    systems: 'LZMA · PPM · PAQ8px · cmix',
    concepts: ['context-modeling'],
  },
  {
    key: 'mixing', icon: CircleDot,
    title: {zh: '上下文混合', en: 'Context mixing'},
    question: {zh: '多个专家的预测如何按当前状态加权？', en: 'How should multiple experts be weighted in the current state?'},
    output: {zh: '校准后的最终概率', en: 'Calibrated final probability'},
    systems: 'PAQ8px · cmix',
    concepts: ['probability-mixing'],
  },
  {
    key: 'neural', icon: Cpu,
    title: {zh: '神经概率模型', en: 'Neural probability models'},
    question: {zh: '神经网络能否利用更长依赖得到更准分布？', en: 'Can a neural network exploit longer dependencies for a better distribution?'},
    output: {zh: '下一 symbol 的离散分布', en: 'Discrete next-symbol distribution'},
    systems: 'NNCP · selected PAQ8px/cmix configurations',
    concepts: ['neural-prediction'],
  },
  {
    key: 'coding', icon: Box,
    title: {zh: '熵编码与格式', en: 'Entropy coding and format'},
    question: {zh: '如何把 token/概率写成可解析的 bitstream？', en: 'How are tokens/probabilities written into a parseable bitstream?'},
    output: {zh: 'coded payload + frame/container', en: 'coded payload + frame/container'},
    systems: 'Huffman · Range Coding · ANS/FSE · gzip/xz/zstd',
    concepts: ['entropy-coding', 'framing-metadata'],
  },
] as const;

const evaluationRows = [
  {icon: FileArchive, metric: {zh: '大小', en: 'Size'}, report: {zh: 'compressed bytes、ratio 或 bits/byte；注明是否计入模型、字典、表和容器开销', en: 'Compressed bytes, ratio, or bits/byte; state whether models, dictionaries, tables, and framing are included'}},
  {icon: Gauge, metric: {zh: '吞吐', en: 'Throughput'}, report: {zh: '编码和解码分开；数据量、线程、预热、重复次数与统计量', en: 'Encode and decode separately; input size, threads, warmup, repetitions, and statistic'}},
  {icon: Timer, metric: {zh: '延迟', en: 'Latency'}, report: {zh: '启动、首块/首符号、小文件与随机访问延迟', en: 'Startup, first block/symbol, small-object, and random-access latency'}},
  {icon: Database, metric: {zh: '资源', en: 'Resources'}, report: {zh: '峰值 RSS、显存、模型/字典大小、临时磁盘', en: 'Peak RSS, VRAM, model/dictionary size, and temporary disk'}},
  {icon: CheckCircle2, metric: {zh: '正确性', en: 'Correctness'}, report: {zh: '原始/解码 SHA-256、退出码、失败文件与损坏输入处理', en: 'Original/decoded SHA-256, exit codes, failed files, and corrupt-input behavior'}},
] as const;

type SectionGuide = {
  purpose: LocalizedText;
  contents: LocalizedText;
  connection: LocalizedText;
  position: LocalizedText;
};

const SECTION_GUIDES: Record<string, SectionGuide> = {
  architecture: {
    purpose: {zh: '先建立完整系统边界，避免把某一个算法误当成整个压缩器。', en: 'Establish the full system boundary before treating any algorithm as a complete compressor.'},
    contents: {zh: '原始字节、编码端分支、熵编码、码流、逆过程与精确重建。', en: 'Raw bytes, encoder branches, entropy coding, bitstream, inverse process, and exact reconstruction.'},
    connection: {zh: '向下把总图拆成通用约束与算法家族，之后再映射到真实压缩器路线。', en: 'The following sections split this overview into universal constraints and algorithm families, then map them to real codecs.'},
    position: {zh: '第 1/6 步：全页骨架与入口。', en: 'Step 1 of 6: the page skeleton and entry point.'},
  },
  universal: {
    purpose: {zh: '说明所有无损系统都必须满足的底线，与采用哪种算法无关。', en: 'Define the invariants every lossless system must satisfy, independent of algorithm choice.'},
    contents: {zh: '可逆性、状态同步、可解析码流语法与 bit-exact 验证。', en: 'Reversibility, synchronized state, parseable bitstream syntax, and bit-exact verification.'},
    connection: {zh: '约束总图中的编码器、码流和解码器，并作为后续路线评测的正确性门槛。', en: 'Constrains encoder, bitstream, and decoder, and becomes the correctness gate for later evaluation.'},
    position: {zh: '第 2/6 步：系统不可违背的基础层。', en: 'Step 2 of 6: the non-negotiable foundation.'},
  },
  families: {
    purpose: {zh: '区分可替换、可组合的技术路线，避免把所有模块误读成串行流水线。', en: 'Separate interchangeable and composable routes instead of reading every module as one serial pipeline.'},
    contents: {zh: '字典解析、可逆变换、统计建模、上下文混合、神经模型与熵编码。', en: 'Dictionary parsing, reversible transforms, statistical modeling, context mixing, neural models, and entropy coding.'},
    connection: {zh: '承接总图中的“选择分支”，下一节会展示这些家族如何在真实压缩器中组合。', en: 'Expands the overview’s branch selection; the next section shows how real codecs combine these families.'},
    position: {zh: '第 3/6 步：抽象方法层。', en: 'Step 3 of 6: the abstract method layer.'},
  },
  routes: {
    purpose: {zh: '用真实格式和实现验证抽象分类，说明不同压缩器实际上走哪条路线。', en: 'Validate the abstraction with real formats and implementations and show the route each codec actually follows.'},
    contents: {zh: 'gzip/DEFLATE、xz/LZMA2、Zstandard、PAQ8px、cmix 与 NNCP。', en: 'gzip/DEFLATE, xz/LZMA2, Zstandard, PAQ8px, cmix, and NNCP.'},
    connection: {zh: '把算法家族落到工程系统；下一节对这些完整系统而非孤立模块进行评测。', en: 'Maps families to engineering systems; the next section evaluates complete systems rather than isolated modules.'},
    position: {zh: '第 4/6 步：实例映射层。', en: 'Step 4 of 6: the implementation mapping layer.'},
  },
  evaluation: {
    purpose: {zh: '定义如何公平验证路线，不把评测误画成压缩数据流中的一个模块。', en: 'Define fair validation without presenting evaluation as a module inside the compressed-data path.'},
    contents: {zh: '大小、吞吐、延迟、资源、正确性以及可复现记录协议。', en: 'Size, throughput, latency, resources, correctness, and reproducibility records.'},
    connection: {zh: '以通用约束中的精确重建为硬门槛，比较上一节的真实压缩器路线。', en: 'Uses exact reconstruction from the universal constraints as a hard gate when comparing real codec routes.'},
    position: {zh: '第 5/6 步：系统外部的验证闭环。', en: 'Step 5 of 6: the validation loop outside the codec.'},
  },
  sources: {
    purpose: {zh: '标明哪些结论有公开规范或实现文档支撑，并划定页面不作出的推断。', en: 'Show which claims are grounded in public specifications or implementation docs and define excluded claims.'},
    contents: {zh: '标准、格式规范、实现仓库、评测方法与本页的声明边界。', en: 'Standards, format specifications, implementation repositories, benchmark methods, and scope limits.'},
    connection: {zh: '反向支撑前面五层；实验结论仍需绑定版本、数据集、命令与日志。', en: 'Supports all five preceding layers; experimental claims still require versions, datasets, commands, and logs.'},
    position: {zh: '第 6/6 步：证据与审计出口。', en: 'Step 6 of 6: the evidence and audit exit.'},
  },
};

export default function AlgorithmBoardPage(): React.ReactElement {
  const {i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const overviewFigure = useBaseUrl('/research/compressor-system/overview/encoder-decoder-system.svg');
  const readingSteps = [
    {id: 'architecture', index: '01', title: copy.architecture},
    {id: 'universal', index: '02', title: copy.universal},
    {id: 'families', index: '03', title: copy.families},
    {id: 'routes', index: '04', title: copy.routes},
    {id: 'evaluation', index: '05', title: copy.evaluation},
    {id: 'sources', index: '06', title: copy.sources},
  ];

  return (
    <Layout title={copy.title} description={copy.description}>
      <WorkbenchShell fullBleed>
        <div className={styles.page}>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
              <div className={styles.evidenceLine}>
                <span><BookOpen size={14} /> {copy.verified}</span>
                <span><FlaskConical size={14} /> {copy.noResults}</span>
              </div>
            </div>
            <div className={styles.equationPanel} aria-label="lossless compression equations">
              <div><span>exact reconstruction</span><strong>D(E(x; θ), s) = x</strong></div>
              <div><span>ideal symbol length</span><strong>ℓ(x) ≈ −log₂ p(x)</strong></div>
              <div><span>side information</span><strong>s = tables + parameters + syntax</strong></div>
            </div>
          </header>

          <section className={styles.readingGuide} aria-labelledby="map-reading-guide">
            <div className={styles.guideSummary}>
              <span><Map size={15} /> {copy.guideEyebrow}</span>
              <h2 id="map-reading-guide">{copy.guideTitle}</h2>
              <p>{copy.guideIntro}</p>
              <ol>
                {copy.guideQuestions.map((question) => <li key={question}>{question}</li>)}
              </ol>
            </div>
            <nav className={styles.readingOrder} aria-label={copy.readingOrder}>
              <strong>{copy.readingOrder}</strong>
              <div>
                {readingSteps.map((step) => (
                  <a key={step.id} href={`#${step.id}`}>
                    <span>{step.index}</span>
                    <b>{step.title}</b>
                    <ArrowRight size={13} />
                  </a>
                ))}
              </div>
            </nav>
          </section>

          <section className={styles.section}>
            <SectionHeading id="architecture" index="01" title={copy.architecture} lead={copy.architectureLead} guide={SECTION_GUIDES.architecture} lang={lang} />
            <figure className={styles.architectureFigure}>
              <img src={overviewFigure} alt={copy.architecture} />
              <figcaption>
                {lang === 'zh'
                  ? '实线：压缩数据主路径；虚线：边信息、模型约定与校验。算法分支在编码端选择，解码端按码流语法执行对应逆过程。'
                  : 'Solid: compressed-data path. Dashed: side information, model contract, and checks. The encoder selects branches; the decoder follows syntax and executes the corresponding inverse process.'}
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <SectionHeading id="universal" index="02" title={copy.universal} guide={SECTION_GUIDES.universal} lang={lang} />
            <div className={styles.constraintStrip}>
              {constraints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title.zh}>
                    <Icon size={18} />
                    <strong>{pick(item.title, lang)}</strong>
                    <span>{pick(item.body, lang)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHeading id="families" index="03" title={copy.families} lead={copy.familiesLead} guide={SECTION_GUIDES.families} lang={lang} />
            <div className={styles.familyMatrix}>
              <div className={styles.familyHeader}>
                <span>{lang === 'zh' ? '家族' : 'Family'}</span>
                <span>{lang === 'zh' ? '回答的问题' : 'Question'}</span>
                <span>{lang === 'zh' ? '接口输出' : 'Interface output'}</span>
                <span>{lang === 'zh' ? '代表系统' : 'Representative systems'}</span>
                <span>{copy.concepts}</span>
              </div>
              {familyRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div className={styles.familyRow} data-family={row.key} key={row.key}>
                    <span className={styles.familyName}><Icon size={18} /><strong>{pick(row.title, lang)}</strong></span>
                    <span>{pick(row.question, lang)}</span>
                    <code>{pick(row.output, lang)}</code>
                    <span>{row.systems}</span>
                    <span className={styles.familyLinks}>
                      {row.concepts.map((slug) => {
                        const concept = compressionConcepts.find((item) => item.slug === slug);
                        return concept ? <Link key={slug} to={`/algorithm-board/concepts/${slug}`}>{concept.index}<ArrowRight size={13} /></Link> : null;
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHeading id="routes" index="04" title={copy.routes} lead={copy.routesLead} guide={SECTION_GUIDES.routes} lang={lang} />
            <div className={styles.routeList}>
              {compressorRoutes.map((route) => (
                <article key={route.slug} className={styles.routeRow}>
                  <div className={styles.routeIdentity}>
                    <span>{route.id}</span>
                    <h2>{route.title}</h2>
                    <p>{pick(route.subtitle, lang)}</p>
                  </div>
                  <div className={styles.routePath}>
                    {route.steps.map((step, index) => (
                      <React.Fragment key={`${route.slug}-${index}`}>
                        <span>{pick(step, lang)}</span>
                        {index < route.steps.length - 1 ? <ArrowRight size={13} /> : null}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className={styles.routeMeta}>
                    <span>{pick(route.family, lang)}</span>
                    <Link to={`/algorithm-board/routes/${route.slug}`}>{copy.openRoute}<ArrowRight size={14} /></Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHeading id="evaluation" index="05" title={copy.evaluation} lead={copy.evaluationLead} guide={SECTION_GUIDES.evaluation} lang={lang} />
            <div className={styles.evaluationLayout}>
              <div className={styles.evaluationTable}>
                <div className={styles.evaluationHeader}><span>{copy.metric}</span><span>{copy.report}</span></div>
                {evaluationRows.map((row) => {
                  const Icon = row.icon;
                  return <div key={row.metric.zh}><span><Icon size={16} />{pick(row.metric, lang)}</span><span>{pick(row.report, lang)}</span></div>;
                })}
              </div>
              <aside className={styles.protocolPanel}>
                <span>EXPERIMENT PROTOCOL</span>
                <strong>{lang === 'zh' ? '结果必须可追溯到原始记录' : 'Results must trace back to raw records'}</strong>
                <ol>
                  <li>{lang === 'zh' ? '固定 dataset manifest 与 SHA-256' : 'Fix dataset manifest and SHA-256'}</li>
                  <li>{lang === 'zh' ? '固定 codec commit、命令与参数' : 'Fix codec commit, command, and parameters'}</li>
                  <li>{lang === 'zh' ? '分别测 encode / decode' : 'Measure encode and decode separately'}</li>
                  <li>{lang === 'zh' ? '保存 stdout、stderr、退出码与资源记录' : 'Store stdout, stderr, exit code, and resource logs'}</li>
                  <li>{lang === 'zh' ? '图表仅由 CSV/JSON 生成' : 'Generate plots only from CSV/JSON'}</li>
                </ol>
                <Link to="/algorithm-board/concepts/benchmarking">{copy.concepts}<ArrowRight size={14} /></Link>
              </aside>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sourceSection}`}>
            <SectionHeading id="sources" index="06" title={copy.sources} lead={copy.sourcesLead} guide={SECTION_GUIDES.sources} lang={lang} />
            <div className={styles.sourceLayout}>
              <div className={styles.sourceList}>
                {sourceRefs.map((source, index) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{source.title}</strong><small>{source.organization} · {source.kind}</small></div>
                    <ArrowRight size={14} />
                  </a>
                ))}
              </div>
              <aside className={styles.scopeNote}>
                <strong>{copy.doesNotClaim}</strong>
                <ul>
                  <li>{lang === 'zh' ? '所有压缩器都必须经过同一串模块。' : 'Every compressor passes through the same serial modules.'}</li>
                  <li>{lang === 'zh' ? '某个算法在所有数据类型上都更好。' : 'One algorithm is superior on every data type.'}</li>
                  <li>{lang === 'zh' ? '页面中的结构说明等同于项目已经实现。' : 'Architecture notes imply project implementation status.'}</li>
                  <li>{lang === 'zh' ? '没有版本、数据集和日志的性能数字可信。' : 'Performance numbers without versions, datasets, and logs are trustworthy.'}</li>
                </ul>
                <div><strong>{sourceRefs.length}</strong><span>{copy.sourceCount}</span></div>
              </aside>
            </div>
          </section>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function SectionHeading({
  id,
  index,
  title,
  lead,
  guide,
  lang,
}: {
  id: string;
  index: string;
  title: string;
  lead?: string;
  guide: SectionGuide;
  lang: Lang;
}): React.ReactElement {
  return (
    <header id={id} className={styles.sectionHeading}>
      <span>{index}</span>
      <div>
        <div className={styles.headingLinkWrap}>
          <h2>
            <a href={`#${id}`} aria-describedby={`${id}-guide`}>
              {title}<Link2 size={15} />
            </a>
          </h2>
          <aside id={`${id}-guide`} className={styles.sectionGuide} role="tooltip">
            <div><Info size={15} /><strong>{lang === 'zh' ? '章节作用' : 'Purpose'}</strong></div>
            <p>{pick(guide.purpose, lang)}</p>
            <dl>
              <div><dt>{lang === 'zh' ? '下面包含' : 'Contains'}</dt><dd>{pick(guide.contents, lang)}</dd></div>
              <div><dt>{lang === 'zh' ? '前后联系' : 'Connection'}</dt><dd>{pick(guide.connection, lang)}</dd></div>
              <div><dt>{lang === 'zh' ? '全页位置' : 'Position'}</dt><dd>{pick(guide.position, lang)}</dd></div>
            </dl>
          </aside>
        </div>
        {lead ? <p>{lead}</p> : null}
      </div>
    </header>
  );
}
