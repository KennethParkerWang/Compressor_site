# 意见文档 4：甲方第四轮评审与乙方整改

## 甲方意见

1. 文献库应该把“引用库导出”作为正式论文写作入口，而不是隐藏在批量管理里。
2. 文献库筛选后的导出应默认导出当前筛选，不要求用户必须先勾选。
3. 重复候选需要进入审计统计，避免重复参考文献进入论文。
4. 未发表/预印本应该明确显示，不能和正式发表论文混在一起。
5. 算法模块页应明确 Algorithm Board 和 Algorithm Catalog 的区别。
6. 实验台 baseline 应覆盖高速、工业平衡、高压缩率、神经、领域专用多类压缩器。
7. 资源库的标准类别应覆盖 Zstd、CRAM、JPEG/MPEG 等方向。
8. 页面构建结果需要作为每轮交付记录的一部分。

## 乙方整改

1. 文献库顶部保留“导出当前筛选”按钮，并新增 Citation Readiness 审计带的“导出引用库”按钮。
2. 引用弹窗支持选中文献导出或当前筛选导出。
3. `classifyCitationItems` 使用 DOI、arXiv、标题归一化进行重复候选识别。
4. 文献库新增预印本筛选与 Preprint KPI。
5. 算法模块页描述改为架构组件板；算法目录保留算法条目检索。
6. 实验台 baseline 覆盖 LZ4、gzip、Brotli、bzip2/bzip3、zstd、xz、ZPAQ、PAQ8PX、CMIX、NNCP、TRACE、JPEG XL、JPEG-LS、FLAC、fpzip、ZFP、SZ3、CRAM。
7. 资源库新增 JPEG/MPEG 标准入口，同时保留 Zstd RFC、CRAM specs。
8. `npm run build` 已通过。
