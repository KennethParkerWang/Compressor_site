import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  FileCode2,
  FlaskConical,
  Info,
  Network,
  Repeat2,
} from 'lucide-react';
import WorkbenchShell from '../workbench/WorkbenchShell';
import {
  compressorRoutes,
  sourceById,
  type CompressionConcept,
  type CompressorRoute,
  type Lang,
  type LocalizedText,
} from '../../data/compressorSystem';
import styles from './styles.module.css';

const pick = (value: LocalizedText, lang: Lang): string => value[lang];

const COPY = {
  zh: {
    back: '返回系统地图',
    concept: 'Concept note',
    route: 'Compressor route',
    definition: '定义与边界',
    interface: '编码器 / 解码器接口',
    encoder: '编码端',
    decoder: '解码端',
    input: '输入',
    output: '输出',
    side: '必须可得的边信息',
    mechanism: '机制拆解',
    tradeoffs: '取舍',
    failure: '常见错误与失效方式',
    systems: '使用关系',
    uses: '采用或相关',
    omits: '通常不依赖',
    experiment: '建议实验',
    sources: '核对来源',
    steps: '编码路线',
    decoderSteps: '解码路线',
    engineering: '工程说明',
    caution: '解释时需要避免',
    next: '相邻路线',
  },
  en: {
    back: 'Back to system map',
    concept: 'Concept note',
    route: 'Compressor route',
    definition: 'Definition and scope',
    interface: 'Encoder / decoder interface',
    encoder: 'Encoder',
    decoder: 'Decoder',
    input: 'Input',
    output: 'Output',
    side: 'Required side information',
    mechanism: 'Mechanism',
    tradeoffs: 'Trade-offs',
    failure: 'Common errors and failure modes',
    systems: 'Usage relationship',
    uses: 'Uses or relates to',
    omits: 'Usually does not require',
    experiment: 'Suggested experiment',
    sources: 'Sources',
    steps: 'Encoding route',
    decoderSteps: 'Decoding route',
    engineering: 'Engineering notes',
    caution: 'Avoid these interpretations',
    next: 'Adjacent routes',
  },
} as const;

export function ConceptDetailPage({concept}: {concept: CompressionConcept}): React.ReactElement {
  const {i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const sources = concept.sourceIds.map(sourceById).filter(Boolean);

  return (
    <DetailFrame title={pick(concept.title, lang)} description={pick(concept.short, lang)} lang={lang}>
      <header className={styles.detailHero}>
        <Link to="/algorithm-board"><ArrowLeft size={14} />{copy.back}</Link>
        <span>{copy.concept} · {concept.id}</span>
        <h1>{pick(concept.title, lang)}</h1>
        <p>{pick(concept.short, lang)}</p>
        <div className={styles.roleLine}>
          <span>{concept.kind}</span>
          <span>{concept.role}</span>
        </div>
      </header>

      <DetailSection index="01" title={copy.definition} icon={Info}>
        <p className={styles.leadText}>{pick(concept.definition, lang)}</p>
      </DetailSection>

      <DetailSection index="02" title={copy.interface} icon={Repeat2}>
        <div className={styles.interfaceDiagram}>
          <div><span>{copy.input}</span><strong>{pick(concept.input, lang)}</strong></div>
          <ArrowRight size={20} />
          <div className={styles.encoderBlock}><span>{copy.encoder}</span><strong>{pick(concept.encoderRole, lang)}</strong></div>
          <ArrowRight size={20} />
          <div><span>{copy.output}</span><strong>{pick(concept.output, lang)}</strong></div>
        </div>
        <div className={styles.decoderBand}>
          <Network size={18} />
          <div><span>{copy.decoder}</span><strong>{pick(concept.decoderRole, lang)}</strong></div>
        </div>
        <div className={styles.sideBand}><FileCode2 size={17} /><span>{copy.side}</span><strong>{pick(concept.sideInformation, lang)}</strong></div>
      </DetailSection>

      <DetailSection index="03" title={copy.mechanism} icon={Cpu}>
        <NumberedList items={concept.mechanisms.map((item) => pick(item, lang))} />
      </DetailSection>

      <div className={styles.twoColumnSections}>
        <DetailSection index="04" title={copy.tradeoffs} icon={CheckCircle2} compact>
          <BulletList items={concept.tradeoffs.map((item) => pick(item, lang))} />
        </DetailSection>
        <DetailSection index="05" title={copy.failure} icon={AlertTriangle} compact tone="warn">
          <BulletList items={concept.failureModes.map((item) => pick(item, lang))} />
        </DetailSection>
      </div>

      <DetailSection index="06" title={copy.systems} icon={Network}>
        <div className={styles.usageTable}>
          <div><span>{copy.uses}</span><strong>{concept.usedBy.join(' · ') || '—'}</strong></div>
          <div><span>{copy.omits}</span><strong>{concept.notRequiredBy.join(' · ') || '—'}</strong></div>
        </div>
      </DetailSection>

      <DetailSection index="07" title={copy.experiment} icon={FlaskConical}>
        <div className={styles.experimentBox}>
          {concept.experimentIdeas.map((item, index) => <p key={index}>{pick(item, lang)}</p>)}
          <small>{lang === 'zh' ? '这里只定义实验问题，不填入未经运行得到的结果。' : 'This section defines experimental questions and does not insert results that have not been run.'}</small>
        </div>
      </DetailSection>

      <SourcesSection title={copy.sources} sources={sources} lang={lang} />
    </DetailFrame>
  );
}

export function RouteDetailPage({route}: {route: CompressorRoute}): React.ReactElement {
  const {i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const sources = route.sourceIds.map(sourceById).filter(Boolean);
  const routeFigure = useBaseUrl(route.figure);
  const current = compressorRoutes.findIndex((item) => item.slug === route.slug);
  const previous = current > 0 ? compressorRoutes[current - 1] : undefined;
  const next = current < compressorRoutes.length - 1 ? compressorRoutes[current + 1] : undefined;

  return (
    <DetailFrame title={route.title} description={pick(route.summary, lang)} lang={lang}>
      <header className={`${styles.detailHero} ${styles.routeHero}`}>
        <Link to="/algorithm-board"><ArrowLeft size={14} />{copy.back}</Link>
        <span>{copy.route} · {route.id}</span>
        <h1>{route.title}</h1>
        <p>{pick(route.subtitle, lang)}</p>
        <div className={styles.roleLine}><span>{pick(route.family, lang)}</span></div>
      </header>

      <figure className={styles.routeFigure}>
        <img src={routeFigure} alt={`${route.title} route`} />
      </figure>

      <DetailSection index="01" title={copy.definition} icon={Info}>
        <p className={styles.leadText}>{pick(route.summary, lang)}</p>
      </DetailSection>

      <div className={styles.twoColumnSections}>
        <DetailSection index="02" title={copy.steps} icon={ArrowRight} compact>
          <RouteSteps items={route.steps.map((item) => pick(item, lang))} />
        </DetailSection>
        <DetailSection index="03" title={copy.decoderSteps} icon={Repeat2} compact>
          <RouteSteps items={route.decoderSteps.map((item) => pick(item, lang))} reverse />
        </DetailSection>
      </div>

      <DetailSection index="04" title={copy.side} icon={FileCode2}>
        <BulletList items={route.sideInformation.map((item) => pick(item, lang))} />
      </DetailSection>

      <div className={styles.twoColumnSections}>
        <DetailSection index="05" title={copy.engineering} icon={Cpu} compact>
          <BulletList items={route.engineeringNotes.map((item) => pick(item, lang))} />
        </DetailSection>
        <DetailSection index="06" title={copy.caution} icon={AlertTriangle} compact tone="warn">
          <BulletList items={route.cautions.map((item) => pick(item, lang))} />
        </DetailSection>
      </div>

      <SourcesSection title={copy.sources} sources={sources} lang={lang} />

      <nav className={styles.routeNavigation} aria-label={copy.next}>
        {previous ? <Link to={`/algorithm-board/routes/${previous.slug}`}><ArrowLeft size={15} /><span>{previous.title}</span></Link> : <span />}
        {next ? <Link to={`/algorithm-board/routes/${next.slug}`}><span>{next.title}</span><ArrowRight size={15} /></Link> : <span />}
      </nav>
    </DetailFrame>
  );
}

function DetailFrame({title, description, children, lang}: {title: string; description: string; children: React.ReactNode; lang: Lang}): React.ReactElement {
  return (
    <Layout title={title} description={description}>
      <WorkbenchShell>
        <article className={styles.detailPage} lang={lang === 'zh' ? 'zh-CN' : 'en'}>{children}</article>
      </WorkbenchShell>
    </Layout>
  );
}

function DetailSection({index, title, icon: Icon, children, compact = false, tone}: {index: string; title: string; icon: React.ComponentType<{size?: number}>; children: React.ReactNode; compact?: boolean; tone?: 'warn'}): React.ReactElement {
  return (
    <section className={styles.detailSection} data-compact={compact} data-tone={tone}>
      <header><span>{index}</span><Icon size={17} /><h2>{title}</h2></header>
      <div>{children}</div>
    </section>
  );
}

function NumberedList({items}: {items: string[]}): React.ReactElement {
  return <ol className={styles.numberedList}>{items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol>;
}

function BulletList({items}: {items: string[]}): React.ReactElement {
  return <ul className={styles.bulletList}>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function RouteSteps({items, reverse = false}: {items: string[]; reverse?: boolean}): React.ReactElement {
  return <ol className={styles.routeSteps} data-reverse={reverse}>{items.map((item, index) => <li key={item}><span>{index + 1}</span><strong>{item}</strong></li>)}</ol>;
}

function SourcesSection({title, sources, lang}: {title: string; sources: ReturnType<typeof sourceById>[]; lang: Lang}): React.ReactElement {
  return (
    <DetailSection index="08" title={title} icon={BookOpen}>
      <div className={styles.detailSources}>
        {sources.map((source) => source ? (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
            <strong>{source.title}</strong>
            <span>{source.organization} · {pick(source.note, lang)}</span>
            <ArrowRight size={14} />
          </a>
        ) : null)}
      </div>
    </DetailSection>
  );
}
