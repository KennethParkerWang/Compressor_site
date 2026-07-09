// TutorialDetailPage:教程详情 (由 plugins/tutorial-routes 注册路由)
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {ChevronRight, FileText, Home} from 'lucide-react';
import WorkbenchShell from '../workbench/WorkbenchShell';
import {getTutorialById} from '../../data/tutorials';
import {TutorialHeader} from './TutorialHeader';
import {TutorialNav} from './TutorialNav';
import {MarkdownRenderer} from './MarkdownRenderer';
import {NextTutorial} from './NextTutorial';
import {LinkedRefPanel} from './LinkedRefPanel';
import {TutorialFigure} from './TutorialFigure';
import styles from '../../pages/tutorials.module.css';

const CN = {
  breadcrumbHome: '首页',
  breadcrumbTut: '教程',
  pitfallTitle: '常见坑',
  prereqTitle: '前置知识',
  empty: '该教程正文待写入。',
  notFoundTitle: '未找到教程',
  notFoundHint: '该教程不存在或尚未发布',
  backToList: '返回教程列表',
};

function TutorialDetailPage(props?: {id?: string}): React.ReactElement {
  const loc = useLocation();
  const match = /\/tutorials[?]id=(TUT-\d{4,5})/.exec(loc.search);
  // 优先用 props.id (从父页面传入),其次从 query string,最后从 pathname
  const fromProp = props?.id;
  const fromQuery = match?.[1];
  const fromPath = /\/tutorials\/(TUT-\d{4,5})/.exec(loc.pathname)?.[1];
  const tutorialId = fromProp ?? fromQuery ?? fromPath ?? '';
  const tutorial = getTutorialById(tutorialId);

  if (!tutorial) {
    return (
      <Layout title={CN.notFoundTitle} description={CN.notFoundHint}>
        <WorkbenchShell pageTitle="教程 / Tutorials">
          <div className={styles.notFound}>
            <FileText size={48} />
            <h1>{CN.notFoundTitle}</h1>
            <p>{CN.notFoundHint}</p>
            <Link to="/tutorials">← {CN.backToList}</Link>
          </div>
        </WorkbenchShell>
      </Layout>
    );
  }

  const bodySections = tutorial.sections;
  const hasBody = bodySections.length > 0 && bodySections.some((s) => s.body && s.body.trim().length > 0);

  return (
    <Layout title={tutorial.title} description={tutorial.summary}>
      <WorkbenchShell>
        <div className={styles.detailLayout}>
          <aside className={styles.sidebar}>
            <nav className={styles.breadcrumb}>
              <Home size={11} />
              <Link to="/">{CN.breadcrumbHome}</Link>
              <ChevronRight size={11} />
              <Link to="/tutorials">{CN.breadcrumbTut}</Link>
              <ChevronRight size={11} />
              <span style={{fontFamily: 'var(--ifm-font-family-monospace)'}}>{tutorial.id}</span>
            </nav>
            <LinkedRefPanel
              terms={tutorial.linkedTerms}
              papers={tutorial.linkedPapers}
              resources={tutorial.linkedResources}
              assets={tutorial.linkedAssets}
            />
            {tutorial.prerequisites.length > 0 && (
              <div className={styles.panel}>
                <div className={styles.panelTitle}>{CN.prereqTitle}</div>
                <div className={styles.panelList}>
                  {tutorial.prerequisites.map((p) => (
                    <Link key={`${p.kind}-${p.id}`} to={`/${p.kind === 'tutorial' ? `tutorials?id=${p.id}` : p.kind === 'term' ? `terms#${p.id}` : p.kind === 'paper' ? `core?focus=${p.id}` : '#'}`} className={styles.panelLink}>
                      {p.id}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
          <article>
            <TutorialHeader tutorial={tutorial} />

          {!hasBody && (
            <div style={{padding: 24, background: 'var(--ifm-color-emphasis-50)', borderRadius: 12, textAlign: 'center', color: 'var(--ifm-color-emphasis-600)'}}>
              {CN.empty}
            </div>
          )}

          {hasBody && (
            <div>
              {bodySections.map((sec) => (
                <section key={sec.id} style={{marginBottom: 24}}>
                  <h2 style={{
                    fontSize: 22,
                    marginTop: 32,
                    marginBottom: 12,
                    paddingBottom: 6,
                    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                  }}>{sec.title}</h2>
                  {sec.body && <MarkdownRenderer body={sec.body} />}
                  {/* 配图 (SVG / URL) — position: before / after */}
                  {sec.figures && sec.figures.filter((f) => (f.position ?? 'before') === 'before').map((f) => (
                    <TutorialFigure key={`f-${f.id}`} figure={f} />
                  ))}
                  {sec.code && (
                    <div className={styles.codeBlock}>
                      {sec.code.title && <div className={styles.codeHeader}>{sec.code.title}</div>}
                      <pre className={styles.codePre}><code>{sec.code.content}</code></pre>
                    </div>
                  )}
                  {sec.figures && sec.figures.filter((f) => f.position === 'after').map((f) => (
                    <TutorialFigure key={`f-${f.id}`} figure={f} />
                  ))}
                </section>
              ))}

              {tutorial.codeExamples.length > 0 && (
                <section style={{marginBottom: 24}}>
                  <h2 style={{fontSize: 22, marginTop: 32, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--ifm-color-emphasis-200)'}}>代码示例</h2>
                  {tutorial.codeExamples.map((c, i) => (
                    <div key={i} className={styles.codeBlock}>
                      {c.title && <div className={styles.codeHeader}>{c.title}</div>}
                      <pre className={styles.codePre}><code>{c.code}</code></pre>
                      {c.note && <div style={{padding: '4px 14px', fontSize: 11, color: 'var(--ifm-color-emphasis-600)', background: 'var(--ifm-color-emphasis-100)'}}>{c.note}</div>}
                    </div>
                  ))}
                </section>
              )}

              {tutorial.commonPitfalls.length > 0 && (
                <section style={{marginBottom: 24}}>
                  <h2 style={{fontSize: 22, marginTop: 32, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--ifm-color-emphasis-200)'}}>{CN.pitfallTitle}</h2>
                  <ul style={{paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8}}>
                    {tutorial.commonPitfalls.map((p, i) => (
                      <li key={i} style={{fontSize: 14, lineHeight: 1.6}}>{p}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          <TutorialNav prevId={tutorial.prevId} nextId={tutorial.nextId} />
          <NextTutorial tutorialId={tutorial.id} />
          </article>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

export default TutorialDetailPage;
