# 意见文档 3：甲方第三轮评审与乙方整改

## 甲方意见

1. Learned Compression 页面必须避免让人误解为全领域 SOTA，应强调它收集“深度学习参与压缩器设计”的工作。
2. 深度学习压缩器页的 KPI 不应再写 Radar Items。
3. 首页中的 Evidence Policy 应同步体现 Datasets、SOTA、Learned Compression、Library 的分工。
4. Research Feed、Tasks 等入口不应继续出现 Neural Hub 旧名。
5. 数据集来源应尽量用官方站点或主维护站点。
6. 资源库里应增加引用管理和复现实验工具，因为论文写作和实验交付都需要。
7. 算法演化图的节点间距需要略增，减少视觉拥挤。
8. 算法目录跳转演化图时应能保留用户当前选择。

## 乙方整改

1. Learned Compression hero 改为“深度学习压缩器库”。
2. KPI 改为 Records、2024+、2025+、Code、Benchmark。
3. 首页 Evidence Policy 改为 SOTA、Datasets、Learned Compression、Library 四类证据分工。
4. Tasks、Research Feed、Reading Paths 中的旧名已替换为 Learned Compression。
5. 数据集库优先记录 Canterbury、Silesia、Mahoney、Hutter、CLIC、DIV2K、UVG、SDRBench、OpenSLR、VCTK 等主入口。
6. 资源库新增 Zotero CSL、Better BibTeX、Pooch、DVC、ReproZip 等引用和复现工具。
7. 演化图画布行距和节点宽度上调。
8. 演化图支持读取 `?node=` 参数，算法目录详情按钮可定位节点。
