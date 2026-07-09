import React from 'react';
import styles from './styles.module.css';

interface PageHeroProps {
  kicker?: string;
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHero({kicker, title, meta, actions}: PageHeroProps): React.ReactElement {
  return (
    <section className={styles.hero}>
      <div className={styles.titleBlock}>
        {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
        <h2>{title}</h2>
      </div>
      {(meta || actions) ? (
        <div className={styles.side}>
          {meta ? <div className={styles.meta}>{meta}</div> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
