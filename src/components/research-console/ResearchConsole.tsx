import React from 'react';
import Link from '@docusaurus/Link';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Database,
  ExternalLink,
  FileText,
  Info,
  LucideIcon,
  RadioTower,
} from 'lucide-react';
import styles from './ResearchConsole.module.css';

type Tone = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate' | 'cyan';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function MetricTile({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  tone = 'blue',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}): React.ReactElement {
  return (
    <div className={styles.metricTile} data-tone={tone}>
      <div className={styles.metricTop}>
        <span className={styles.metricLabel}>{label}</span>
        {Icon ? (
          <span className={styles.metricIcon}>
            <Icon size={15} />
          </span>
        ) : null}
      </div>
      <div className={styles.metricValue}>{value}</div>
      {hint || trend ? (
        <div className={styles.metricFoot}>
          {hint ? <span>{hint}</span> : <span />}
          {trend ? <strong>{trend}</strong> : null}
        </div>
      ) : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'slate',
  icon,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
}): React.ReactElement {
  return (
    <span className={styles.statusPill} data-tone={tone}>
      {icon ?? null}
      {children}
    </span>
  );
}

export function EvidenceBadge({
  type = 'curated',
  children,
}: {
  type?: 'official' | 'paper' | 'code' | 'curated' | 'unverified';
  children?: React.ReactNode;
}): React.ReactElement {
  const meta = {
    official: {tone: 'green' as Tone, icon: <CheckCircle2 size={12} />, label: '官方来源'},
    paper: {tone: 'blue' as Tone, icon: <FileText size={12} />, label: '论文证据'},
    code: {tone: 'purple' as Tone, icon: <Database size={12} />, label: '代码证据'},
    curated: {tone: 'cyan' as Tone, icon: <RadioTower size={12} />, label: '人工整理'},
    unverified: {tone: 'amber' as Tone, icon: <CircleAlert size={12} />, label: '待核验'},
  }[type];

  return (
    <StatusPill tone={meta.tone} icon={meta.icon}>
      {children ?? meta.label}
    </StatusPill>
  );
}

export function SourceChip({
  label,
  href,
  kind = 'source',
}: {
  label: string;
  href?: string;
  kind?: 'source' | 'paper' | 'code' | 'dataset' | 'standard';
}): React.ReactElement {
  const content = (
    <>
      <span className={styles.sourceKind}>{kind}</span>
      <span className={styles.sourceLabel}>{label}</span>
      {href ? <ExternalLink size={11} /> : null}
    </>
  );

  if (href) {
    return (
      <a className={styles.sourceChip} href={href} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return <span className={styles.sourceChip}>{content}</span>;
}

export function ResearchPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <section className={cx(styles.panel, className)}>
      {(eyebrow || title || description || action) ? (
        <header className={styles.panelHead}>
          <div>
            {eyebrow ? <div className={styles.panelEyebrow}>{eyebrow}</div> : null}
            {title ? <h2 className={styles.panelTitle}>{title}</h2> : null}
            {description ? <p className={styles.panelDesc}>{description}</p> : null}
          </div>
          {action ? <div className={styles.panelAction}>{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({
  icon: Icon = CircleDashed,
  title,
  description,
  actions,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>
        <Icon size={20} />
      </span>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {actions ? <div className={styles.emptyActions}>{actions}</div> : null}
    </div>
  );
}

export function ConsoleLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Link to={to} className={styles.consoleLink}>
      {children}
      <ArrowRight size={13} />
    </Link>
  );
}

export function InfoStrip({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode;
  tone?: Tone;
}): React.ReactElement {
  return (
    <div className={styles.infoStrip} data-tone={tone}>
      <Info size={15} />
      <span>{children}</span>
    </div>
  );
}
