# 神经无损压缩专题教程生成

## 输入
- 教程 ID: `TUT-0301` (P2 专题)
- 主论文: `LIT-0187` (DeepZip) + `LIT-0190` (NNCP) + `LIT-0214` (TRACE)
- 关联资源: 各论文的官方 GitHub / 官方页面

## 必讲清单
1. **核心思想**: 用神经网络预测下一字节/下一比特的概率,接熵编码
2. **架构演进**:
   - RNN/LSTM (NNCP, 2017)
   - Byte-level CNN (DeepZip, 2017)
   - PixelCNN / PixelRNN
   - Transformer-based (近年, Bit-Swap 等)
3. **训练数据**: 通常 ImageNet32/64, enwik8, enwik9
4. **与 PAQ 的关系**: NN 是更强的 mixer,PAQ 的 mixer 是线性回归
5. **速度权衡**: 训练慢,推理比 PAQ 慢,但压缩率更高
6. **vs 传统 codec**: 在高熵数据 (图像/音频) 上领先,文本上 PAQ 仍有竞争力
7. **瓶颈**: GPU 推理成本、模型大小、泛化能力

## 关联论文
- `LIT-0187` — DeepZip
- `LIT-0190` — NNCP  
- `LIT-0214` — TRACE
- `LIT-0312` — fpzip (浮点压缩)
- `LIT-0089` — FITS (天文图像)

## 必填字段
- `linkedTerms`: `Neural Lossless Compression`, `Likelihood Model`, `Bits-Back Coding`, `Bit-Swap`
- `linkedPapers`: 至少 5 篇
- `comparison`: NN vs PAQ vs LZMA 在 enwik9/ImageNet64 上的 SOTA 数字 (引 `leaderboards.ts`)

## 联网核查
- 各论文 GitHub 仓库可访问
- 最新 SOTA 数字引 `Hutter Prize` / `ImageNet32 SOTA` leaderboard
- 若发现新论文,加进 literatureData.ts

## 写作风格
- 不要把 NN 当万能解,讲清楚局限
- 给读者一个判断: "我的数据/场景要不要用 NN"
- 必须引至少 2 个失败案例 (例如泛化差、训练慢)