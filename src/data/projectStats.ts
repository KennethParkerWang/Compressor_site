// 项目统计(Project Stats)数据
// 数据来源:projectContent.statistics
// 字段命名对齐 projectContent 的 statistics,只展示公开可信字段。

import {projectContent} from './projectContent';

export interface ProjectStats {
  chapterCount: number;
  sectionCount: number;
  publicLiteratureCount: number;
  projectAssetCount: number;
  totalItemCount: number;
}

export const projectStats: ProjectStats = {
  chapterCount: projectContent.statistics.chapterCount,
  sectionCount: projectContent.statistics.sectionCount,
  publicLiteratureCount: projectContent.statistics.publicLiteratureCount,
  projectAssetCount: projectContent.statistics.projectAssetCount,
  totalItemCount: projectContent.statistics.totalItemCount,
};

export default projectStats;
