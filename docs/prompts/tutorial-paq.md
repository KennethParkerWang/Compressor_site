# PAQ / Context Mixing 专题教程生成

## 输入
- 教程 ID: `TUT-0205` 或 `TUT-0301`
- 主论文: `LIT-0018` (Mahoney 2005 PAQ8) + 相关
- 关联资源: `paq8px` GitHub, `Matt Mahoney Block Sorting Test Page`

## 必讲清单 (不能漏)
1. **Context Modeling 的核心思想**: 用前面字节预测下一字节的概率
2. **PPM 的局限**: 自适应统计在高阶上下文失效
3. **Mixer 的发明**: 把多个独立模型加权平均 (CM / NN)
4. **Bit-level vs Byte-level**: PAQ 用 bit-level
5. **paq8px 工程实践**: 
   - SSE2 / AVX2 优化
   - 内存占用 (~1.5GB for -9)
   - 速度 vs 压缩率权衡
6. **vs LZMA**: 何时选 PAQ,何时选 LZMA

## 关联论文 (必须用)
- `LIT-0016` — Cleary & Witten 1984 PPM
- `LIT-0017` — Willems 1995 CTW
- `LIT-0018` — Mahoney 2005 PAQ8
- `LIT-0187` — DeepZip (神经混合)
- `LIT-0190` — NNCP

## 必填字段
- `linkedTerms`: `Context Modeling`, `Mixer`, `Adaptive Probability`, `Arithmetic Coding`
- `linkedPapers`: 至少 3 篇
- `linkedResources`: PAQ8px GitHub + Matt Mahoney 主页
- `codeExamples`: 一个 30 行 Python 实现的最简 mixer (用神经网络)
- `comparison`: vs LZMA / vs ZPAQ / vs CMIX

## 联网核查
- paq8px 最新 commit / 最新 release 必须联网核实
- Mahoney 主页必须可访问
- arXiv ID 必须真实