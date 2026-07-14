import React from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import PaperReaderWorkspace from '../components/paper-reader/PaperReaderWorkspace';
import {literatureData, type LiteratureItem} from '../data/literatureData';

function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function getPaperFromUrl(search: string): LiteratureItem {
  const literatureId = new URLSearchParams(search).get('lit');
  return literatureData.find((item) => item.id === literatureId) ?? literatureData[0];
}

export default function PaperReadingPage(): React.ReactElement {
  const location = useLocation();
  const lang = isEnglishPath(location.pathname) ? 'en' : 'zh';
  const paper = React.useMemo(() => getPaperFromUrl(location.search), [location.search]);

  return (
    <Layout title={`${paper.title} | 论文精读`} description={paper.summaryZh ?? paper.title} noFooter>
      <PaperReaderWorkspace paper={paper} lang={lang} />
    </Layout>
  );
}
