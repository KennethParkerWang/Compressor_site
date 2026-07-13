import React from 'react';
import Layout from '@theme/Layout';
import {Archive, FileCheck2, FolderOpen} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import PublicAssetPanel from '../components/public-assets/PublicAssetPanel';
import styles from './project-files.module.css';

const PROJECT_FILE_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export default function ProjectFilesPage(): React.ReactElement {
  return (
    <Layout title="项目文件" description="项目计划书、盖章文件与交付材料">
      <WorkbenchShell pageTitle="项目文件">
        <div className={styles.page}>
          <header className={styles.hero}>
            <span><Archive size={14} /> PROJECT RECORDS</span>
            <h1>项目文件</h1>
            <p>集中保存项目计划书、盖章文件、合同附件与阶段交付材料。公开文件无需登录即可查看和下载。</p>
          </header>
          <section className={styles.scope} aria-label="文件范围">
            <div><FolderOpen size={18} /><strong>过程文件</strong><span>计划书、汇报材料、工作文档</span></div>
            <div><FileCheck2 size={18} /><strong>正式文件</strong><span>盖章件、合同附件、验收材料</span></div>
          </section>
          <PublicAssetPanel
            title="项目资料库"
            description="管理员可上传或删除；其他访问者只可查看和下载已发布文件。"
            relatedType="project-document"
            relatedKey="project-main"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
            allowedMimeTypes={PROJECT_FILE_MIME_TYPES}
          />
        </div>
      </WorkbenchShell>
    </Layout>
  );
}
