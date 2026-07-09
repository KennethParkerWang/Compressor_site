// 阅读笔记 - 每篇文献支持六问模板
// 六问:问题 / 方法 / 实验 / 结论 / 局限 / 对自己的作用

export interface SixQuestions {
  problem: string;
  method: string;
  experiment: string;
  conclusion: string;
  limitation: string;
  takeaway: string;
}

export interface NoteSnapshot {
  id: string;
  savedAt: string;
  freeform: string;
  sixQuestions: SixQuestions;
  highlights: readonly string[];
  wordCount: number;
}

export interface ReadingNote {
  id: string;
  /** 关联的文献 ID,对应 literatureData 中的 id */
  litId: string;
  title: string;
  author: string;
  year: number;
  tags: readonly string[];
  status: 'draft' | 'in-review' | 'final';
  sixQuestions: SixQuestions;
  highlights: readonly string[];
  freeform: string;
  updatedAt: string;
  wordCount: number;
  snapshots?: readonly NoteSnapshot[];
}

const empty = (): SixQuestions => ({
  problem: '',
  method: '',
  experiment: '',
  conclusion: '',
  limitation: '',
  takeaway: '',
});

const monthsAgo = (n: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
};

export const readingNotes: ReadingNote[] = [
  {
    id: 'note-0001',
    litId: 'LIT-0001',
    title: 'A Mathematical Theory of Communication',
    author: 'C. E. Shannon',
    year: 1948,
    tags: ['information-theory', 'lossless', '经典'],
    status: 'final',
    sixQuestions: {
      problem: '信源的极限压缩比是多少?什么样的编码可以达到这个极限?',
      method: '提出熵 H(X) 与信源编码定理:无损压缩下界是熵,可达。',
      experiment: '论文以英语文本为例,给出 1.3 bit/char 的实验估算熵。',
      conclusion: '无损压缩存在理论极限(熵),构造性编码(Huffman/AC)可逼近。',
      limitation: '未给出具体可实现的算法,假设已知概率分布。',
      takeaway: '后续所有无损压缩器的目标 = 逼近信源熵。',
    },
    highlights: [
      '熵是压缩下界:任何无损编码器的平均码长 ≥ H(X)。',
      '信源编码定理:存在编码使平均码长 < H(X) + 1。',
    ],
    freeform: 'Shannon 这篇 1948 的开山论文奠定了信息论与压缩理论的根基。要回头反复看图 4:英文文本的 1.3 bit/char 估算,跟现代 zstd 在大语料上的数字已经很接近。',
    updatedAt: monthsAgo(1),
    wordCount: 1280,
  },
  {
    id: 'note-0002',
    litId: 'LIT-0016',
    title: 'PPM 模型与上下文统计',
    author: 'Cleary & Witten',
    year: 1984,
    tags: ['ppm', 'context-modeling'],
    status: 'in-review',
    sixQuestions: {
      problem: '如何用可变长上下文预测下一个字符概率?',
      method: 'PPM 用 escape 机制从高阶上下文向低阶回退,得到平滑后的概率。',
      experiment: '在 Calgary Corpus 上比较 PPM A/B/C 与 Huffman 的 BPB。',
      conclusion: '高阶 PPM 显著优于 Huffman,代价是计算与内存。',
      limitation: '高阶的存储开销大,escape 估计是经验性的。',
      takeaway: '上下文 + 平滑 = 统计压缩的核心范式。',
    },
    highlights: ['Escape 是 PPM 的灵魂', '回退顺序由上下文长度决定'],
    freeform: '',
    updatedAt: monthsAgo(2),
    wordCount: 760,
  },
  {
    id: 'note-0003',
    litId: 'LIT-0187',
    title: 'DeepZip: RNN-based Lossless Compression',
    author: 'Goyal et al.',
    year: 2018,
    tags: ['neural', 'rnn'],
    status: 'draft',
    sixQuestions: empty(),
    highlights: [],
    freeform: '刚开始看,先抓框架。',
    updatedAt: monthsAgo(0),
    wordCount: 120,
  },
];

export default readingNotes;