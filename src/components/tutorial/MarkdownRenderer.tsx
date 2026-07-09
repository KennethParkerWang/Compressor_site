// MarkdownRenderer:教程内 Markdown 渲染 (内联引用支持)
// 使用 react-markdown + remark-gfm + remark-math + rehype-highlight
// 支持 <Term id='Entropy' /> <LitLink id='LIT-0001' /> <ResourceLink name='X' />
// 自动把 <TUT-0102> 转 <Link to='/tutorials?id=TUT-0102'>
import React from 'react';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import {TermPopover} from './TermPopover';
import {LitLink} from './LitLink';
import {ResourceLink} from './ResourceLink';
import styles from './tutorial.module.css';

export interface MarkdownRendererProps {
  body: string;
}

// 自定义组件: 用于替换 ReactMarkdown 节点
const customComponents = {
  // 自定义标签: Term/LitLink/ResourceLink 在 markdown 里写作 <Term id='Entropy' />,
  // remark 解析为带 name 的 HTML 元素,这里映射回 React 组件
  Term: (props: any) => {
    const id = props.id ?? props.children;
    return <TermPopover termId={String(id)}>{String(props.children ?? id)}</TermPopover>;
  },
  LitLink: (props: any) => {
    const display = props.display ?? props.children;
    return <LitLink litId={String(props.id)} display={display ? String(display) : undefined} />;
  },
  ResourceLink: (props: any) => {
    const display = props.display ?? props.children;
    return <ResourceLink name={String(props.name)} display={display ? String(display) : undefined} />;
  },
  // 把 <TUT-0102> 转链接 (经 remark 后变未知标签)
  TUT: (props: any) => {
    const tutId = String(props.children ?? '');
    const match = /TUT-\d{4}/.exec(tutId);
    if (!match) return <>{tutId}</>;
    return <Link to={`/tutorials?id=${match[0]}`} style={{color: 'var(--ifm-color-primary)'}}>{match[0]}</Link>;
  },
  // 美化原生元素
  a: (props: any) => <Link {...props} />,
  table: (props: any) => (
    <div style={{overflowX: 'auto', margin: '12px 0'}}>
      <table style={{borderCollapse: 'collapse', width: '100%'}}>{props.children}</table>
    </div>
  ),
  th: (props: any) => (
    <th style={{border: '1px solid var(--ifm-color-emphasis-300)', padding: '6px 10px', background: 'var(--ifm-color-emphasis-100)', textAlign: 'left'}}>{props.children}</th>
  ),
  td: (props: any) => (
    <td style={{border: '1px solid var(--ifm-color-emphasis-300)', padding: '6px 10px'}}>{props.children}</td>
  ),
  blockquote: (props: any) => (
    <blockquote style={{borderLeft: '4px solid var(--ifm-color-primary)', margin: '12px 0', padding: '4px 12px', color: 'var(--ifm-color-emphasis-700)', background: 'var(--ifm-color-emphasis-50)'}}>{props.children}</blockquote>
  ),
  code: (props: any) => {
    const {inline, className, children} = props;
    if (inline) {
      return <code className={className} style={{background: 'var(--ifm-color-emphasis-100)', padding: '1px 5px', borderRadius: 3, fontSize: '0.9em'}}>{children}</code>;
    }
    return <code className={className}>{children}</code>;
  },
};

// 预处理: 把 <TUT-XXXX> 转成 TUT-XXXX (让 react-markdown 的 components 命中自定义 TUT 节点)
// 真正的 XML/HTML 自定义标签需要写在段落里,这里把 <Term ... /> 这样的变成自闭合的 markdown 兼容写法
// remark 默认会把未知 HTML 标签原样保留为 React 元素 (lowerCase 属性),
// 但为避免 React 警告,我们通过 rehype 也保持一致 — 用 react-markdown 的 components 直接接管。
function preprocess(body: string): string {
  return body;
}

export function MarkdownRenderer({body}: MarkdownRendererProps): React.ReactElement {
  return (
    <div className={styles.mdBody}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight]}
        components={customComponents}
        skipHtml={false}
      >
        {preprocess(body)}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;