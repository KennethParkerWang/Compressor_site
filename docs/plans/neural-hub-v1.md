# 规划: 深度学习压缩板块 (跨模态)

## 用户需求
- 加一个独立板块: **深度学习在压缩的应用情况**
- 全面搜集文章和开源仓库
- 按要点排序 + 筛选条件
- 板块名和位置你来定

## 现状调研

### 已有数据
- 270 篇文献,10 章节
- **Chapter 06 (Neural General-Purpose Lossless Compression, 40 篇)** — 已覆盖文本/RNN/Transformer/LLM/PCs
- **Chapter 07 (Domain-Specific Lossless, 27 篇)** — 含 L3C, ArIB-BPS, DLPR
- **Chapter 08 (Lossy / Near-Lossless, 21 篇)** — 含 End-to-end (Ballé 2016), Ballé 2018 scale hyperprior, Minnen 2018 joint AR, CompressAI (2020), Cheng 2020 GMM, HiFi 2020

### 5 个 Gap (要把这板块做出来的原因)
1. **跨模态**: Ch06 只覆盖 *general-purpose* lossless (text),没有 image/audio/video lossy learned
2. **音频**: 完全无 Ch (EnCodec, SoundStream, DAC, APCodec...)
3. **视频**: 完全无 Ch (DCVC, FVC, end-to-end video learned)
4. **生成式压缩**: 缺失 (PerCo, CDC, GLC, HiFi 2020 已在 ch08 但太散乱)
5. **新架构**: 缺 (MambaIC, LALIC, RWKV, FNLIC 2025)

### 排序/筛选要点 (设计)
- **热力值**: GitHub stars + 论文年份 + 训练数据规模
- **实用程度**: 是否 SOTA benchmark / 是否开源 / 是否工业部署
- **成熟度**: 论文 → 仓库 → 用户量 → 在 use
- **质量**: 代码 review / 测试覆盖 / 作者活跃

## 板块设计: **Cross-Modal Neural Compression Hub**

### 位置
顶层导航加新入口: **"Neural Hub"**
跟 Library 并列,在 Workbench 板块之前

### 文件结构
```
src/pages/neural-hub.tsx              # 主板块 (跨模态浏览)
src/pages/neural-hub.module.css

src/data/neuralHub.ts                 # 数据层
  - 4 个 collection + 1 个全光谱:
    * text-general (继承 Ch06 + Ch11)
    * image-lossless (L3C, FNLIC...)
    * image-lossy (Ballé 2016+, CompressAI, PerCo...)
    * audio-codec (EnCodec, SoundStream, DAC...)
    * video-codec (DCVC, FVC...)
    * hybrid-arch (Mamba, RWKV, Diffusion)
  - 每个 item 包含:
    id, title, modality, losslessOrLossy,
    paperUrl, codeUrl, year, venue,
    github { stars, lastCommit, license },
    sotaBench { dataset, metric, value },
    qualityBar { novelty, reusability, deployment, codeQuality },
```

### 主板块 UI 设计
**3 段式**:
1. **KPI Top**: 4 个统计 — 模态数 / SOTA 项目数 / 开源率 / 2024+ 项目数
2. **左侧 Sidebar (320px)**:
   - **模态筛选**: 文本 / 图片(lossy) / 图片(lossless) / 音频 / 视频 / 跨模态 / 新架构
   - **年份筛选**: 滑块 2018-2025
   - **排序**: SOTA / 最新 / 仓库 stars / 代码质量 / 工业部署
   - **图例**: 6 种模态的色块 + emoji
3. **主区 (Card Grid)**:
   - 每张 card 显示:
     - 顶: emoji + 标题 + (year, venue) 小字
     - 中: 摘要 (1-2 行)
     - 下: 4 个微型进度条: 创新 / 代码质量 / 部署 / SOTA
     - 底: GitHub stars + license + 论文/代码链接按钮 + "在 SOTA 上" badge
   - **排序**: 当前排序模式下,顶部会有一段短说明为什么这样排

### 排序算法 (5 种)
| 模式 | 公式 | 适用 |
|---|---|---|
| **SOTA** | 优先看 `sotaBench` 达成 + 引用数 | 找最强基线 |
| **最新** | `publishedAt` 倒序 | 跟踪前沿 |
| **代码** | `github.stars * 0.6 + codeQuality * 0.4` | 工业落地 |
| **质量** | `codeQuality` 加权 | 长期使用 |
| **工业** | `deployment` 加权 | 想投产 |

### 筛选条件 (multi-select)
1. **模态**: 7 选 (上面那些)
2. **年份**: 范围滑块
3. **开源**: 仅显示有 GitHub 仓库
4. **License**: MIT / Apache 2.0 / BSD / 仅论文 / 仅仓库 / 任意
5. **实验可用**: 仅显示 docker/模型可下载的
6. **成熟度**: 论文 SOTA / 已成熟 / 实验原型
7. **语言**: Python / C++ / Rust / 任意

### 初始数据 (本批)
**Image lossy (新增 12 条)**:
- Ballé 2017 E2E optimized (LIT-0250)
- Ballé 2018 Scale Hyperprior (LIT-0251)
- Minnen 2018 Joint AR (LIT-0252)
- Cheng 2020 GMM (LIT-0253)
- CompressAI 2020 (LIT-0254)
- HiFi 2020 (LIT-0262)
- LVQAC 2023 (CVPR)
- FTIC 2024 (ICLR)
- MambaIC 2025
- LALIC 2025
- PerCo 2024 (ICLR)
- GLC 2024 (CVPR)
- FNLIC 2025 (CVPR)

**Audio codec (新增 8 条)**:
- SoundStream 2021 (Google)
- EnCodec 2022 (Meta)
- DAC 2023 (Descript)
- APCodec 2024
- APCodec+ 2024
- HILCodec 2024
- SpectroStream 2024
- Audio LM Survey 2024

**Video codec (新增 6 条)**:
- FVC 2022 (Google)
- DCVC 2021
- DCVC-DC 2023
- DCVC-B 2024
- MPAI-EEV 2025
- LVC Survey IJCAI 2024

**Hybrid arch (新增 4 条)**:
- MambaIC 2025
- LALIC 2025
- FNLIC 2025
- OpenDIC 2024 (MM)

总计新增 ~30 条,与已有 Ch06/Ch07/Ch08 重复的不算。

### 字段示例
```ts
{
  id: 'NH-IMAGE-001',
  title: 'Variational Image Compression with a Scale Hyperprior',
  authors: 'Ballé, Minnen, Singh, Tucker, Agustsson, Johannes Ballé',
  year: 2018,
  venue: 'ICLR (sub)',
  modality: 'image-lossy',
  losslessOrLossy: 'lossy',
  paperUrl: 'https://arxiv.org/abs/1802.01436',
  paperLits: ['LIT-0251'],
  codeUrl: '',
  github: null,
  sotaBench: { dataset: 'Kodak', metric: 'BD-rate vs JPEG', value: '-50%', vsBest: 'self-improve' },
  qualityBar: { novelty: 9, reusability: 10, deployment: 7, codeQuality: 8 },
  summaryZh: '在 latent 加 scale hyperprior, 首次让 NN 图像压缩超过 JPEG。',
  level: 'paper-only',
  venueTag: 'ICLR 2018',
}
```

### 实施
1. 调研: 30 分钟 (已完成部分,要扩充:audio, video 仓库数据)
2. 数据层: 1 小时写完 neuralHub.ts + 30 条
3. UI: 1.5 小时 (neural-hub.tsx + css)
4. 集成: 30 分钟 (导航 + 全局注入)
5. 验证 + build + commit: 30 分钟
总计 ~4 小时

### 风险
- 字段缺失: 部分老论文没 GitHub 仓库,要在 qualityBar 标"代码无"
- 数据维护: 每条都要联网核实 stars/license,可用 paper-pdf-finder 批量
- 排序算法: weighted 算法需做大量测试,可能要做排除逻辑

### 备选方案 (用户未决定)
- A. 新增顶级页 neural-hub (推荐)
- B. 嵌进 library 页 (在 chapter 11 加 tab)
- C. 单页 markdown "深度学习压缩综述"
- D. 加进 Map 页 (项目地图)
