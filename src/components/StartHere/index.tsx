import React from 'react';
import Link from '@docusaurus/Link';
import {GraduationCap, Database, Network, FlaskConical, ArrowRight} from 'lucide-react';
import styles from './styles.module.css';

interface Entry {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  desc: string;
  to: string;
  cta: string;
}

const ENTRIES: Entry[] = [
  {
    icon: <GraduationCap size={18} />,
    eyebrow: '我是初学者',
    title: '从理论开始阅读',
    desc: '5 条已经组织好的阅读路线,带学习目标与配套实验。',
    to: '/reading-paths',
    cta: '进入阅读路线',
  },
  {
    icon: <Database size={18} />,
    eyebrow: '我要查文献',
    title: '打开文献检索工作台',
    desc: '338 篇文献,按章节 / 类型 / 优先级 / 标签筛选,带详情面板。',
    to: '/database',
    cta: '进入文献检索',
  },
  {
    icon: <Network size={18} />,
    eyebrow: '我要看知识结构',
    title: '查看思维导图',
    desc: '中心 + 三层结构,自动布局,可展开深度,带右侧节点详情。',
    to: '/map',
    cta: '打开思维导图',
  },
  {
    icon: <FlaskConical size={18} />,
    eyebrow: '我要跑实验',
    title: '进入实验向导',
    desc: '选数据集 / 选压缩器 / 选块大小 / 选指标,生成可执行命令。',
    to: '/experiments',
    cta: '进入实验向导',
  },
];

export default function StartHere(): React.ReactElement {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <span className="cr-eyebrow">Start Here</span>
        <h2 className={styles.title}>你今天想做什么?</h2>
        <p className={styles.desc}>
          四个常用入口,按"你是谁 / 你要做什么"直接跳转,不必先爬整张目录。
        </p>
      </header>

      <div className={styles.grid}>
        {ENTRIES.map((e) => (
          <Link key={e.to} to={e.to} className={styles.card}>
            <div className={styles.iconWrap}>{e.icon}</div>
            <div className={styles.cardBody}>
              <span className={styles.cardEyebrow}>{e.eyebrow}</span>
              <span className={styles.cardTitle}>{e.title}</span>
              <span className={styles.cardDesc}>{e.desc}</span>
            </div>
            <div className={styles.cardCta}>
              {e.cta}
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}