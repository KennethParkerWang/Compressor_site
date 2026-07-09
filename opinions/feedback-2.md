# 意见文档 2：甲方复评与乙方整改

## 甲方意见

1. 三页拆分后，需要在 Hub 顶部给出 SOTA 和 Datasets 的显式跳转，避免用户不知道旧内容去了哪里。
2. SOTA 顶部应放 Mahoney、Hutter Prize、CLIC 等主入口，体现榜单证据来源。
3. 数据集页应把官方入口、引用风险和实验用途放在同一屏，不要只展示资源卡片。
4. 文献库统计指标应优先服务论文写作，不应被代码/数据集数量抢走注意力。
5. 引用弹窗要说明默认排除非论文资源的理由。
6. 实验台数据集增多后必须有领域筛选，否则页面密度失控。
7. 算法模块页新增模块后，顶部指标需要自动反映模块数量和类别数量。
8. 算法目录性能排序需要和每个算法卡片上的 speed/ratio 指标一致，避免排序看不出依据。
9. 移动端要保证新数据集表格不会撑破页面。

## 乙方整改

1. Hub 顶部新增 SOTA、Datasets 和 Artifact Review 关键跳转。
2. SOTA 顶部新增 Mahoney、Hutter Prize、CLIC 主入口。
3. 数据集页采用左侧领域/风险筛选、中部表格、右侧详情的数据库布局。
4. 文献库 KPI 调整为 Records、Papers、Citable、Non-paper、Preprint。
5. 引用弹窗说明默认 GB/T 7714，并解释软件仓库、标准页、benchmark 站点不进入默认参考文献。
6. 实验台 Step 1 新增领域分段筛选。
7. 算法模块页指标由数据数组自动计算。
8. 算法目录排序使用同一份 evolutionNodes 的 speed/ratio 字段。
9. 移动端浏览器抽查 `/datasets`、`/library`、`/neural-hub`、`/algorithm-evolution`、`/algorithm-catalog` 无横向溢出。
