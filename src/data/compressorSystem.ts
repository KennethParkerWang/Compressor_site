export type Lang = 'zh' | 'en';

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface SourceRef {
  id: string;
  title: string;
  organization: string;
  url: string;
  kind: 'standard' | 'specification' | 'implementation' | 'paper';
  note: LocalizedText;
}

export type ConceptKind = 'infrastructure' | 'transform' | 'model' | 'coder' | 'format' | 'evaluation';

export interface CompressionConcept {
  id: string;
  slug: string;
  index: string;
  title: LocalizedText;
  short: LocalizedText;
  definition: LocalizedText;
  kind: ConceptKind;
  role: 'universal-constraint' | 'common-branch' | 'optional-branch' | 'research-branch';
  input: LocalizedText;
  output: LocalizedText;
  sideInformation: LocalizedText;
  encoderRole: LocalizedText;
  decoderRole: LocalizedText;
  mechanisms: LocalizedText[];
  tradeoffs: LocalizedText[];
  failureModes: LocalizedText[];
  usedBy: string[];
  notRequiredBy: string[];
  experimentIdeas: LocalizedText[];
  sourceIds: string[];
}

export interface CompressorRoute {
  id: string;
  slug: string;
  title: string;
  subtitle: LocalizedText;
  family: LocalizedText;
  summary: LocalizedText;
  steps: LocalizedText[];
  decoderSteps: LocalizedText[];
  sideInformation: LocalizedText[];
  engineeringNotes: LocalizedText[];
  cautions: LocalizedText[];
  sourceIds: string[];
  figure: string;
}

export const sourceRefs: readonly SourceRef[] = [
  {
    id: 'rfc1951',
    title: 'RFC 1951: DEFLATE Compressed Data Format Specification',
    organization: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc1951',
    kind: 'standard',
    note: {zh: 'DEFLATE 的块结构、LZ77 距离/长度表示与 Huffman 编码。', en: 'DEFLATE blocks, LZ77 length-distance representation, and Huffman coding.'},
  },
  {
    id: 'rfc1952',
    title: 'RFC 1952: GZIP File Format Specification',
    organization: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc1952',
    kind: 'standard',
    note: {zh: 'gzip 是文件封装格式；常见负载是 DEFLATE。', en: 'gzip is a file wrapper; its common compressed payload is DEFLATE.'},
  },
  {
    id: 'rfc8878',
    title: 'RFC 8878: Zstandard Compression and the application/zstd Media Type',
    organization: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc8878',
    kind: 'standard',
    note: {zh: 'Zstandard 帧、块、字面量和序列的标准化描述。', en: 'Standardized description of Zstandard frames, blocks, literals, and sequences.'},
  },
  {
    id: 'zstd-format',
    title: 'Zstandard Compression Format',
    organization: 'Meta / facebook-zstd',
    url: 'https://github.com/facebook/zstd/blob/dev/doc/zstd_compression_format.md',
    kind: 'specification',
    note: {zh: '实现侧格式说明：literals section、sequences section、Huffman、FSE 与 frame。', en: 'Implementation format notes for literals, sequences, Huffman, FSE, and frames.'},
  },
  {
    id: 'xz-format',
    title: 'The .xz File Format',
    organization: 'Tukaani Project',
    url: 'https://github.com/tukaani-project/xz/blob/master/doc/xz-file-format.txt',
    kind: 'specification',
    note: {zh: 'xz Stream Header、Block、Index、Footer、校验与 filter chain。', en: 'xz stream header, blocks, index, footer, checks, and filter chains.'},
  },
  {
    id: 'lzma-spec',
    title: 'LZMA SDK and format documentation',
    organization: '7-Zip / Igor Pavlov',
    url: 'https://www.7-zip.org/sdk.html',
    kind: 'implementation',
    note: {zh: 'LZMA/LZMA2 的参考实现与 SDK 文档入口。', en: 'Reference implementation and SDK documentation for LZMA/LZMA2.'},
  },
  {
    id: 'paq8px',
    title: 'paq8px source repository',
    organization: 'hxim / PAQ community',
    url: 'https://github.com/hxim/paq8px',
    kind: 'implementation',
    note: {zh: 'PAQ8px 的分段、可逆变换、上下文模型、混合器与实验性神经组件。', en: 'PAQ8px segmentation, reversible transforms, context models, mixers, and experimental neural components.'},
  },
  {
    id: 'cmix',
    title: 'cmix source repository',
    organization: 'Byron Knoll and contributors',
    url: 'https://github.com/byronknoll/cmix',
    kind: 'implementation',
    note: {zh: 'cmix 的预处理、上下文建模、混合与高资源消耗实现。', en: 'cmix preprocessing, context modeling, mixing, and resource-intensive implementation.'},
  },
  {
    id: 'nncp',
    title: 'NNCP: Lossless Data Compression with Neural Networks',
    organization: 'Fabrice Bellard',
    url: 'https://bellard.org/nncp/',
    kind: 'implementation',
    note: {zh: 'NNCP 项目说明；当前公开版本使用 Transformer 进行概率预测。', en: 'NNCP project description; the current public version uses a Transformer for probability prediction.'},
  },
  {
    id: 'nncp-metal',
    title: 'nncp-metal implementation notes',
    organization: 'kurokawamomo',
    url: 'https://github.com/kurokawamomo/nncp-metal',
    kind: 'implementation',
    note: {zh: '对 256 字节分布、算术编码和编码/解码同步在线训练的实现说明。', en: 'Implementation notes on 256-byte distributions, arithmetic coding, and synchronized online training.'},
  },
  {
    id: 'ans-paper',
    title: 'Asymmetric Numeral Systems',
    organization: 'Jarek Duda',
    url: 'https://arxiv.org/abs/0902.0271',
    kind: 'paper',
    note: {zh: 'ANS 的基本构造及其接近熵界的编码思想。', en: 'The core ANS construction and entropy-near coding idea.'},
  },
  {
    id: 'benchmark-method',
    title: 'lzbench compression benchmark',
    organization: 'inikep',
    url: 'https://github.com/inikep/lzbench',
    kind: 'implementation',
    note: {zh: '多压缩器吞吐与压缩率测试工具；结果仍需记录硬件、参数与版本。', en: 'Multi-codec throughput and ratio benchmark; results still require hardware, parameter, and version records.'},
  },
] as const;

const t = (zh: string, en: string): LocalizedText => ({zh, en});

export const compressionConcepts: readonly CompressionConcept[] = [
  {
    id: 'C01', slug: 'blocking-streaming', index: '01', kind: 'infrastructure', role: 'common-branch',
    title: t('分块与流式处理', 'Blocking and streaming'),
    short: t('决定工作集、并行度、随机访问与上下文边界。', 'Sets working-set size, parallelism, random access, and context boundaries.'),
    definition: t('把输入组织成有限大小的块或连续流。它是工程组织方式，不等同于某一种压缩算法。', 'Organizes input as bounded blocks or a continuous stream. It is an engineering structure, not a compression algorithm by itself.'),
    input: t('原始字节流或已有容器中的数据块', 'Raw byte stream or blocks from an existing container'),
    output: t('带边界和顺序的块序列', 'An ordered sequence of bounded blocks'),
    sideInformation: t('块大小、最后块标记、可选校验与索引', 'Block sizes, last-block marker, optional checks and index'),
    encoderRole: t('选择块边界，控制内存、并行和模型重置位置。', 'Chooses block boundaries and controls memory, parallelism, and model reset points.'),
    decoderRole: t('按语法恢复块顺序，并在规定边界重置状态。', 'Restores block order and resets state at specified boundaries.'),
    mechanisms: [t('固定分块：实现简单、边界稳定。', 'Fixed blocks: simple implementation and stable boundaries.'), t('内容定义分块：更利于跨版本去重，但边界检测有成本。', 'Content-defined chunking: useful for deduplication but adds boundary-detection cost.'), t('流式状态：保留跨块历史以提高连续数据建模能力。', 'Streaming state: retains history across blocks for continuous modeling.')],
    tradeoffs: [t('块越小，随机访问和并行越容易，但头部开销与上下文损失可能增大。', 'Smaller blocks help random access and parallelism but may increase headers and context loss.'), t('块越大，压缩器可利用更多历史，但内存和启动延迟通常更高。', 'Larger blocks expose more history but usually increase memory and startup latency.')],
    failureModes: [t('编码端和解码端在块边界重置状态不一致。', 'Encoder and decoder reset state at different boundaries.'), t('基准测试只报告整体吞吐，掩盖首块延迟。', 'Benchmarks report aggregate throughput while hiding first-block latency.')],
    usedBy: ['DEFLATE', 'Zstandard', 'xz', 'LZMA2'], notRequiredBy: ['某些单流实验压缩器'],
    experimentIdeas: [t('固定总数据量，扫描块大小并分别记录压缩率、编码吞吐、解码吞吐、峰值内存和首块延迟。', 'Fix total input size, sweep block size, and record ratio, encode/decode throughput, peak memory, and first-block latency.')],
    sourceIds: ['rfc1951', 'rfc8878', 'xz-format'],
  },
  {
    id: 'C02', slug: 'reversible-transforms', index: '02', kind: 'transform', role: 'optional-branch',
    title: t('可逆变换与领域预处理', 'Reversible transforms and domain preprocessing'),
    short: t('重排或重表达数据，使后续建模更容易，但必须精确逆变换。', 'Reorders or re-expresses data for easier modeling while preserving exact inversion.'),
    definition: t('对数据做双射变换 T，使解码端能用 T⁻¹ 完整恢复原始字节。变换本身不保证压缩收益。', 'Applies a bijective transform T so the decoder can recover the exact bytes with T⁻¹. A transform alone does not guarantee compression gain.'),
    input: t('原始字节、字段、整数序列或已分段子流', 'Raw bytes, fields, integer sequences, or segmented substreams'),
    output: t('更适合统计或匹配的符号流', 'A symbol stream better suited to statistics or matching'),
    sideInformation: t('变换类型、参数、原长度、必要的逆变换元数据', 'Transform type, parameters, original length, and inverse metadata'),
    encoderRole: t('依据数据结构选择 delta、BWT、字节重排、文本/可执行文件专用变换等。', 'Selects delta, BWT, byte shuffling, or text/executable-specific transforms based on structure.'),
    decoderRole: t('严格按相反顺序应用逆变换。', 'Applies inverse transforms in strict reverse order.'),
    mechanisms: [t('Delta/Residual：把绝对值改写为相邻差或预测误差。', 'Delta/residual: replaces absolute values with differences or prediction errors.'), t('BWT：重排字符，使相似上下文聚集；通常还需 MTF/RLE 与熵编码。', 'BWT: clusters similar contexts; usually followed by MTF/RLE and entropy coding.'), t('分段与字段拆分：把不同统计性质的子流分开。', 'Segmentation and field separation: isolates substreams with different statistics.')],
    tradeoffs: [t('结构匹配时可显著改善后端分布；类型误判时可能只增加开销。', 'Can improve backend distributions when structure matches; misclassification may add only overhead.'), t('复杂变换增加格式兼容、攻击面和解码实现成本。', 'Complex transforms increase format compatibility, attack surface, and decoder cost.')],
    failureModes: [t('未把全部变换参数写入码流。', 'Not all transform parameters are written to the bitstream.'), t('浮点变换改变 NaN payload、符号零或字节序，破坏 bit-exact。', 'Floating-point transforms alter NaN payloads, signed zero, or endianness and break bit-exact reconstruction.')],
    usedBy: ['PAQ8px', 'cmix', 'xz filter chain'], notRequiredBy: ['DEFLATE 基本格式', '不使用预处理的 Zstd 路线'],
    experimentIdeas: [t('对每种数据类型做 transform-on/off 消融，并把变换元数据计入最终文件大小。', 'Run transform-on/off ablations per data type and include transform metadata in final size.')],
    sourceIds: ['xz-format', 'paq8px', 'cmix'],
  },
  {
    id: 'C03', slug: 'dictionary-parsing', index: '03', kind: 'model', role: 'common-branch',
    title: t('字典匹配与序列解析', 'Dictionary matching and sequence parsing'),
    short: t('把重复片段表示成长度—距离引用，把未匹配数据保留为 literals。', 'Represents repeats as length-distance references and leaves unmatched data as literals.'),
    definition: t('LZ 家族在历史窗口或字典中寻找重复串，并选择 literals 与 matches 的解析序列。', 'LZ-family methods search a history window or dictionary for repeated strings and choose a parse of literals and matches.'),
    input: t('当前输入位置、历史窗口、可选预训练字典', 'Current input position, history window, and optional trained dictionary'),
    output: t('literal 与 match(length, distance) 序列', 'A sequence of literals and match(length, distance) tokens'),
    sideInformation: t('窗口/字典标识、长度与距离编码语法', 'Window/dictionary identifier and length-distance syntax'),
    encoderRole: t('搜索候选匹配并根据估计码长选择解析。', 'Searches match candidates and chooses a parse using estimated coding cost.'),
    decoderRole: t('从已解码历史复制匹配片段，并按顺序插入 literals。', 'Copies match strings from decoded history and inserts literals in order.'),
    mechanisms: [t('哈希链或二叉树用于快速寻找候选匹配。', 'Hash chains or binary trees find match candidates quickly.'), t('lazy/optimal parsing 决定当前匹配是否值得推迟。', 'Lazy or optimal parsing decides whether to defer the current match.'), t('静态字典为小对象提供输入前历史。', 'Static dictionaries provide pre-input history for small objects.')],
    tradeoffs: [t('搜索更深通常提高找到长匹配的机会，但编码更慢、内存更高。', 'Deeper search can find longer matches but slows encoding and uses more memory.'), t('解码通常比强搜索编码简单，因为解码只执行已选好的引用。', 'Decoding is often simpler than strong-search encoding because it only executes chosen references.')],
    failureModes: [t('距离越过允许窗口或引用未解码数据。', 'Distance exceeds the allowed window or references undecoded data.'), t('只比较匹配长度，不计算 token 的真实编码成本。', 'Chooses by match length without accounting for actual token coding cost.')],
    usedBy: ['DEFLATE', 'Zstandard', 'LZMA/LZMA2'], notRequiredBy: ['PAQ8px 主建模路线', 'NNCP 主路线'],
    experimentIdeas: [t('固定熵编码器，比较 hash chain、binary tree、lazy parse 的压缩率/编码速度/内存。', 'Fix the entropy coder and compare hash chain, binary tree, and lazy parsing on ratio, encode speed, and memory.')],
    sourceIds: ['rfc1951', 'rfc8878', 'lzma-spec'],
  },
  {
    id: 'C04', slug: 'context-modeling', index: '04', kind: 'model', role: 'optional-branch',
    title: t('统计与上下文建模', 'Statistical and context modeling'),
    short: t('依据已观察历史估计下一符号或下一 bit 的条件概率。', 'Estimates the next symbol or bit probability from observed history.'),
    definition: t('模型估计 p(xᵢ | x₀…xᵢ₋₁)。它和把概率写成码字的熵编码器是不同职责。', 'A model estimates p(xᵢ | x₀…xᵢ₋₁). This is distinct from the entropy coder that turns probabilities into codewords.'),
    input: t('历史符号、当前位置特征与模型状态', 'Past symbols, position features, and model state'),
    output: t('概率、频率表或累计分布 CDF', 'Probabilities, frequency tables, or a cumulative distribution'),
    sideInformation: t('静态表需要传输；自适应模型通常只需约定初始化和更新规则', 'Static tables must be transmitted; adaptive models usually require agreed initialization and update rules'),
    encoderRole: t('在编码每个符号前给出与当前状态对应的概率。', 'Provides a state-conditioned probability before encoding each symbol.'),
    decoderRole: t('在解码同一符号前构造完全相同的概率，并按同一规则更新。', 'Constructs the identical probability before decoding each symbol and updates by the same rule.'),
    mechanisms: [t('零阶/高阶频率模型：按上下文统计符号计数。', 'Order-0/higher-order models: count symbols per context.'), t('PPM/CTW：在不同上下文长度之间回退或加权。', 'PPM/CTW: back off or combine across context lengths.'), t('bit-level models：逐 bit 预测，常用于上下文混合系统。', 'Bit-level models: predict one bit at a time, common in context mixing systems.')],
    tradeoffs: [t('长上下文更具体但更稀疏，需更多内存与退避策略。', 'Long contexts are more specific but sparse and require more memory and backoff.'), t('自适应模型无需发送完整频率表，但强依赖确定性同步。', 'Adaptive models avoid transmitting full tables but depend on deterministic synchronization.')],
    failureModes: [t('把 Huffman、Arithmetic Coding 或 ANS 当成概率模型。', 'Treating Huffman, arithmetic coding, or ANS as probability models.'), t('编码端和解码端更新顺序、整数舍入或初始化不同。', 'Encoder and decoder differ in update order, integer rounding, or initialization.')],
    usedBy: ['PAQ8px', 'cmix', 'LZMA 概率模型'], notRequiredBy: ['只使用静态 Huffman 表的简单块'],
    experimentIdeas: [t('在相同 coder 下比较 order-0、PPM 和多上下文模型，单独报告模型内存。', 'Compare order-0, PPM, and multi-context models under the same coder and report model memory separately.')],
    sourceIds: ['paq8px', 'cmix', 'lzma-spec'],
  },
  {
    id: 'C05', slug: 'probability-mixing', index: '05', kind: 'model', role: 'research-branch',
    title: t('概率混合与二次估计', 'Probability mixing and secondary estimation'),
    short: t('把多个专家的预测按当前上下文融合成一个最终概率。', 'Combines multiple expert predictions into one context-dependent probability.'),
    definition: t('上下文混合系统让多个模型并行预测，再由 mixer 和可选 SSE 校准输出；这不是所有压缩器都需要的通用阶段。', 'Context-mixing systems run multiple predictors in parallel and combine them with a mixer and optional SSE; this is not a universal stage.'),
    input: t('多个模型概率/logit 与选择器上下文', 'Multiple model probabilities/logits and selector context'),
    output: t('单个最终概率或二元 bit 概率', 'One final probability or binary bit probability'),
    sideInformation: t('通常不传输在线权重，但初始化、学习率和更新规则必须由格式固定', 'Online weights are often not transmitted, but initialization, learning rate, and updates must be fixed by the format'),
    encoderRole: t('根据已知真实符号在线更新 mixer。', 'Updates the mixer online using the known true symbol.'),
    decoderRole: t('解出符号后以相同顺序执行同样更新。', 'Performs the identical update after decoding the symbol.'),
    mechanisms: [t('线性/logistic mixing：组合不同专家的证据。', 'Linear/logistic mixing: combines evidence from different experts.'), t('context selection：不同数据状态使用不同权重集合。', 'Context selection: uses different weights for different data states.'), t('SSE：依据预测值和上下文做二次概率校准。', 'SSE: calibrates a probability using its value and context.')],
    tradeoffs: [t('专家越多，可能捕捉更多模式，但计算与状态规模增长。', 'More experts may capture more patterns but increase compute and state.'), t('强在线自适应提升局部适配能力，也提高同步和确定性要求。', 'Strong online adaptation improves local fit but raises synchronization and determinism requirements.')],
    failureModes: [t('把概率混合画成所有熵编码前都必须经过的阶段。', 'Drawing probability mixing as mandatory before every entropy coder.'), t('浮点实现跨硬件产生不同更新结果。', 'Floating-point implementations diverge across hardware.')],
    usedBy: ['PAQ8px', 'cmix'], notRequiredBy: ['DEFLATE', 'Zstandard', '典型 xz/LZMA2 路线'],
    experimentIdeas: [t('固定上下文专家集合，做 mixer/SSE 消融，并验证跨机器 bitstream 一致性。', 'Fix the expert set, ablate mixer/SSE, and verify bitstream identity across machines.')],
    sourceIds: ['paq8px', 'cmix'],
  },
  {
    id: 'C06', slug: 'neural-prediction', index: '06', kind: 'model', role: 'research-branch',
    title: t('神经概率预测', 'Neural probability prediction'),
    short: t('用神经网络给出下一符号分布，再由无损熵编码器编码。', 'Uses a neural network to predict the next-symbol distribution for a lossless entropy coder.'),
    definition: t('神经网络在无损压缩中通常替代或增强概率模型；网络输出本身不是压缩文件。', 'In lossless compression, a neural network usually replaces or augments the probability model; its output alone is not a compressed file.'),
    input: t('已解码历史、token/symbol 表示与模型参数', 'Decoded history, token/symbol representation, and model parameters'),
    output: t('下一 symbol 的离散概率分布', 'A discrete probability distribution for the next symbol'),
    sideInformation: t('模型版本/参数、tokenization、精度规则；若在线训练则还需固定优化器和更新次序', 'Model version/weights, tokenization, and precision rules; online training also requires fixed optimizer and update order'),
    encoderRole: t('预测分布，并把真实 symbol 交给熵编码器。', 'Predicts the distribution and passes the true symbol to the entropy coder.'),
    decoderRole: t('用相同历史得到同一分布，再从码流恢复 symbol。', 'Uses the same history to obtain the same distribution and recover the symbol from the bitstream.'),
    mechanisms: [t('Transformer/RNN 根据长历史建模离散序列。', 'Transformers/RNNs model discrete sequences from long histories.'), t('概率量化把浮点分布转换为 coder 可用的整数 CDF。', 'Probability quantization converts floating distributions into integer CDFs for the coder.'), t('在线训练可随文件适配，但编码和解码必须执行相同训练。', 'Online training can adapt to a file, but encoder and decoder must perform identical training.')],
    tradeoffs: [t('更强分布模型可能缩短码长，但推理、训练和模型传输成本都必须计入。', 'A stronger model may shorten codes, but inference, training, and model transfer costs must be counted.'), t('GPU/浮点非确定性会威胁可复现解码。', 'GPU and floating-point nondeterminism can threaten reproducible decoding.')],
    failureModes: [t('只报告 payload，不计模型大小或模型获取条件。', 'Reports payload size without model size or model availability assumptions.'), t('概率量化或 softmax 数值在两端不一致。', 'Probability quantization or softmax numerics differ between encoder and decoder.')],
    usedBy: ['NNCP', 'PAQ8px 的部分实验配置', 'cmix 的神经组件'], notRequiredBy: ['DEFLATE', 'Zstandard', 'LZMA2'],
    experimentIdeas: [t('同时报告含模型与不含模型的总码长、首符号延迟、encode/decode 吞吐和峰值显存。', 'Report total size with and without model transfer, first-symbol latency, encode/decode throughput, and peak VRAM.')],
    sourceIds: ['nncp', 'nncp-metal', 'paq8px', 'cmix'],
  },
  {
    id: 'C07', slug: 'entropy-coding', index: '07', kind: 'coder', role: 'common-branch',
    title: t('熵编码', 'Entropy coding'),
    short: t('依据符号概率把序列映射为可逆 bitstream。', 'Maps a symbol sequence to a reversible bitstream using symbol probabilities.'),
    definition: t('理想码长接近 −log₂p(x)。Huffman、Arithmetic/Range Coding 与 ANS 是编码方法，不是概率模型。', 'Ideal code length approaches −log₂p(x). Huffman, arithmetic/range coding, and ANS are coding methods, not probability models.'),
    input: t('符号以及与当前状态一致的频率/CDF/概率', 'A symbol and state-consistent frequencies/CDF/probabilities'),
    output: t('压缩 bitstream 与 coder 终止状态', 'Compressed bitstream and coder termination state'),
    sideInformation: t('静态码表、归一化频率、状态初始化与终止规则', 'Static codebooks, normalized frequencies, state initialization, and termination rules'),
    encoderRole: t('按概率区间或码字写入符号。', 'Writes symbols using probability intervals or codewords.'),
    decoderRole: t('用相同表/状态从码流唯一恢复符号。', 'Uses identical tables/state to recover symbols uniquely.'),
    mechanisms: [t('Huffman：整数位长前缀码，解码结构直接。', 'Huffman: integer-length prefix code with direct decoding structure.'), t('Arithmetic/Range Coding：连续缩小区间，适合细粒度自适应概率。', 'Arithmetic/range coding: narrows an interval and supports fine adaptive probabilities.'), t('ANS/FSE：把概率编码到有限状态转换中，适合高吞吐实现。', 'ANS/FSE: encodes probabilities into finite-state transitions for high-throughput implementations.')],
    tradeoffs: [t('不同 coder 的吞吐、表开销、并行性与概率精度不同。', 'Coders differ in throughput, table overhead, parallelism, and probability precision.'), t('小块上码表开销可能抵消更精细建模的收益。', 'On small blocks, table overhead may erase gains from finer modeling.')],
    failureModes: [t('频率归一化后出现零频符号。', 'Frequency normalization assigns zero to an occurring symbol.'), t('终止、renormalization 或字节顺序规则不一致。', 'Termination, renormalization, or byte-order rules differ.')],
    usedBy: ['DEFLATE/Huffman', 'Zstandard/Huffman+FSE', 'LZMA/Range Coding', 'NNCP/Arithmetic Coding'], notRequiredBy: ['直接存储 raw block 的退化路径'],
    experimentIdeas: [t('固定符号序列和频率表，对比最终大小、表开销、编码/解码吞吐和短块延迟。', 'Fix the symbol stream and table, then compare final size, table overhead, encode/decode throughput, and short-block latency.')],
    sourceIds: ['rfc1951', 'zstd-format', 'ans-paper'],
  },
  {
    id: 'C08', slug: 'framing-metadata', index: '08', kind: 'format', role: 'common-branch',
    title: t('帧、容器与元数据', 'Frames, containers, and metadata'),
    short: t('定义压缩负载如何被识别、分块、校验、索引和兼容解码。', 'Defines how compressed payloads are identified, blocked, checked, indexed, and decoded compatibly.'),
    definition: t('压缩算法与文件格式不是同一层：gzip 封装 DEFLATE，xz 是可承载 filter chain（通常含 LZMA2）的容器。', 'A compression algorithm and a file format are different layers: gzip wraps DEFLATE, while xz is a container for filter chains commonly including LZMA2.'),
    input: t('压缩块、参数、可选字典标识与校验信息', 'Compressed blocks, parameters, optional dictionary identifiers, and checks'),
    output: t('可解析的 frame/file/stream', 'A parseable frame/file/stream'),
    sideInformation: t('魔数、版本、块长度、flags、校验和、索引、filter 参数', 'Magic, version, block lengths, flags, checksums, indexes, and filter parameters'),
    encoderRole: t('按规范写入头部、负载、索引和尾部。', 'Writes headers, payloads, indexes, and footers according to the format.'),
    decoderRole: t('先验证语法和边界，再调度对应解码器与逆 filter。', 'Validates syntax and bounds before dispatching decoders and inverse filters.'),
    mechanisms: [t('frame header 描述整体参数与内容大小。', 'Frame headers describe global parameters and content size.'), t('block header 描述局部编码模式和长度。', 'Block headers describe local coding modes and lengths.'), t('checksum/index 支持损坏检测和可选随机访问。', 'Checksums/indexes support corruption detection and optional random access.')],
    tradeoffs: [t('更多索引和校验提高可用性，但增加格式开销。', 'More indexing and checks improve usability but add format overhead.'), t('向后兼容要求限制未来语法扩展方式。', 'Backward compatibility constrains future syntax extensions.')],
    failureModes: [t('把 gzip、DEFLATE、xz、LZMA2 当成同层算法名称。', 'Treating gzip, DEFLATE, xz, and LZMA2 as same-layer algorithm names.'), t('未检查长度和索引，导致越界或资源耗尽。', 'Fails to validate lengths and indexes, causing bounds or resource-exhaustion issues.')],
    usedBy: ['gzip', 'xz', 'Zstandard frame'], notRequiredBy: ['仅用于论文实验的裸 bitstream（仍需外部约定）'],
    experimentIdeas: [t('把 frame/header/index/checksum 大小单列，尤其分析小文件的格式开销。', 'Report frame/header/index/checksum bytes separately, especially for small files.')],
    sourceIds: ['rfc1952', 'rfc8878', 'xz-format'],
  },
  {
    id: 'C09', slug: 'decoder-synchronization', index: '09', kind: 'infrastructure', role: 'universal-constraint',
    title: t('解码同步与精确重建', 'Decoder synchronization and exact reconstruction'),
    short: t('无损系统的硬约束：D(E(x)) 必须逐字节等于 x。', 'The hard lossless constraint: D(E(x)) must equal x byte for byte.'),
    definition: t('编码器可以使用复杂搜索，但解码器必须仅依赖码流、规范允许的外部资源和已解码历史，确定性地恢复原数据。', 'The encoder may use complex search, but the decoder must deterministically recover data using only the bitstream, permitted external resources, and decoded history.'),
    input: t('bitstream、边信息、固定格式语义和允许的外部模型/字典', 'Bitstream, side information, fixed format semantics, and permitted external model/dictionary'),
    output: t('与原始输入相同的字节序列', 'The byte sequence identical to the original input'),
    sideInformation: t('所有影响解码的参数都必须在码流、版本规范或明确外部依赖中可得', 'Every decode-affecting parameter must be available from the bitstream, versioned specification, or explicit external dependency'),
    encoderRole: t('写出足以让解码器复现每个选择的语法。', 'Writes enough syntax for the decoder to reproduce every decision.'),
    decoderRole: t('按规范顺序更新字典、概率模型、神经状态和校验状态。', 'Updates dictionary, probability, neural, and checksum state in specified order.'),
    mechanisms: [t('bit-exact round trip：SHA-256(original)=SHA-256(decoded)。', 'Bit-exact round trip: SHA-256(original)=SHA-256(decoded).'), t('确定性状态机：相同输入码流得到相同状态迁移。', 'Deterministic state machine: identical bitstreams produce identical state transitions.'), t('版本化语法：旧解码器能拒绝未知特性，而不是静默误解。', 'Versioned syntax: old decoders reject unknown features instead of silently misinterpreting them.')],
    tradeoffs: [t('更严格的确定性可能限制浮点/GPU 优化。', 'Stricter determinism may constrain floating-point/GPU optimizations.'), t('外部字典和模型可减少 payload，但增加依赖管理。', 'External dictionaries and models can reduce payload but add dependency management.')],
    failureModes: [t('只验证“能解压”，未比较字节哈希。', 'Only checks that decompression finishes without comparing byte hashes.'), t('模型版本相同但数值实现或随机种子不同。', 'Model version matches but numeric implementation or random seeds differ.')],
    usedBy: ['所有无损压缩系统'], notRequiredBy: [],
    experimentIdeas: [t('在不同机器、线程数和重复运行间比较 compressed hash 与 decoded hash。', 'Compare compressed and decoded hashes across machines, thread counts, and repeated runs.')],
    sourceIds: ['rfc1951', 'rfc8878', 'xz-format', 'nncp-metal'],
  },
  {
    id: 'C10', slug: 'benchmarking', index: '10', kind: 'evaluation', role: 'universal-constraint',
    title: t('评测与复现闭环', 'Benchmarking and reproducibility loop'),
    short: t('在主数据流之外验证压缩率、资源、延迟、正确性与可复现条件。', 'Evaluates ratio, resources, latency, correctness, and reproducibility outside the codec data path.'),
    definition: t('评测不是压缩 bitstream 的中间模块，而是围绕整个编码—解码系统的实验协议。', 'Benchmarking is not an intermediate bitstream module; it is the experimental protocol around the encoder-decoder system.'),
    input: t('数据集清单、codec 版本与命令、硬件/软件环境', 'Dataset manifest, codec versions and commands, and hardware/software environment'),
    output: t('原始日志、结果 CSV/JSON、哈希、失败记录与汇总图', 'Raw logs, result CSV/JSON, hashes, failure records, and summary plots'),
    sideInformation: t('数据集校验和、参数、线程数、预热、重复次数、计时和内存测量方法', 'Dataset checksums, parameters, thread counts, warmup, repetitions, and timing/memory methods'),
    encoderRole: t('单独测量 encode time、峰值内存、输出大小与失败。', 'Separately measures encode time, peak memory, output size, and failures.'),
    decoderRole: t('单独测量 decode time、峰值内存，并验证 bit-exact。', 'Separately measures decode time, peak memory, and bit-exact output.'),
    mechanisms: [t('大小：compressed bytes、ratio 或 bits per byte，明确是否含模型与元数据。', 'Size: compressed bytes, ratio, or bits per byte, explicitly including/excluding model and metadata.'), t('速度：encode/decode throughput 分开报告，并记录启动延迟。', 'Speed: report encode/decode throughput separately and record startup latency.'), t('可用性：随机访问、流式、确定性、失败率和资源上限。', 'Usability: random access, streaming, determinism, failures, and resource limits.')],
    tradeoffs: [t('单一综合分数会隐藏压缩率、速度和内存之间的取舍。', 'A single aggregate score hides ratio-speed-memory trade-offs.'), t('只测大文件吞吐会误导小对象和交互式场景。', 'Large-file throughput alone misrepresents small-object and interactive workloads.')],
    failureModes: [t('不同 codec 使用不同线程数或压缩级别却直接排序。', 'Ranks codecs using different thread counts or incomparable levels.'), t('图表来自手工抄录而非原始 CSV/JSON。', 'Plots are hand-copied rather than generated from raw CSV/JSON.')],
    usedBy: ['研发流程'], notRequiredBy: [],
    experimentIdeas: [t('建立一条命令可重跑的 manifest，保存 stdout/stderr、退出码、时间、RSS、hash 与工具版本。', 'Build a one-command manifest that stores stdout/stderr, exit code, time, RSS, hashes, and tool versions.')],
    sourceIds: ['benchmark-method'],
  },
] as const;

export const compressorRoutes: readonly CompressorRoute[] = [
  {
    id: 'R01', slug: 'deflate', title: 'gzip / DEFLATE',
    subtitle: t('文件封装与压缩格式要分层理解', 'Separate the file wrapper from the compression format'),
    family: t('LZ77 解析 + Huffman 编码', 'LZ77 parsing + Huffman coding'),
    summary: t('DEFLATE 把输入表示为 literals 与 length-distance pairs，再按块使用固定或动态 Huffman 码；gzip 在外层提供头部、尾部、CRC32 和原始大小字段。', 'DEFLATE represents input as literals and length-distance pairs and uses fixed or dynamic Huffman codes per block; gzip adds a wrapper with headers, trailer, CRC32, and original-size field.'),
    steps: [t('gzip header', 'gzip header'), t('DEFLATE block', 'DEFLATE block'), t('LZ77 parse', 'LZ77 parse'), t('fixed/dynamic Huffman', 'fixed/dynamic Huffman'), t('CRC32 + ISIZE', 'CRC32 + ISIZE')],
    decoderSteps: [t('解析 gzip 头', 'Parse gzip header'), t('读取 DEFLATE 块', 'Read DEFLATE blocks'), t('解 Huffman symbols', 'Decode Huffman symbols'), t('复制 length-distance matches', 'Copy length-distance matches'), t('验证 CRC32/大小', 'Verify CRC32/size')],
    sideInformation: [t('块类型与 BFINAL', 'Block type and BFINAL'), t('动态 Huffman 码长表（如使用）', 'Dynamic Huffman code lengths when used'), t('gzip flags、CRC32 与 ISIZE', 'gzip flags, CRC32, and ISIZE')],
    engineeringNotes: [t('DEFLATE 允许 stored、fixed-Huffman 和 dynamic-Huffman blocks。', 'DEFLATE permits stored, fixed-Huffman, and dynamic-Huffman blocks.'), t('匹配搜索策略属于编码器实现选择，不写进 RFC 的解码语义。', 'Match-search strategy is an encoder implementation choice, not part of RFC decode semantics.')],
    cautions: [t('不要把 gzip 直接写成“压缩算法”；它是文件格式。', 'Do not label gzip itself as the compression algorithm; it is a file format.'), t('DEFLATE 不包含 ANS/FSE。', 'DEFLATE does not use ANS/FSE.')],
    sourceIds: ['rfc1951', 'rfc1952'], figure: '/research/compressor-system/routes/deflate/route.svg',
  },
  {
    id: 'R02', slug: 'xz-lzma2', title: 'xz / LZMA2',
    subtitle: t('xz 容器承载 filter chain，LZMA2 通常是最终压缩 filter', 'xz carries a filter chain, commonly ending in LZMA2'),
    family: t('LZ 字典解析 + 概率模型 + Range Coding', 'LZ dictionary parsing + probability models + range coding'),
    summary: t('xz 文件由 Stream Header、Blocks、Index 和 Stream Footer 组成；每个 Block 可描述一条 filter chain，常见最后一个 filter 是 LZMA2。', 'An xz file contains a Stream Header, Blocks, an Index, and a Stream Footer; each block describes a filter chain commonly ending in LZMA2.'),
    steps: [t('Stream Header', 'Stream Header'), t('Block + filter chain', 'Block + filter chain'), t('LZMA2 chunks', 'LZMA2 chunks'), t('Range Coding', 'Range Coding'), t('Index + Footer', 'Index + Footer')],
    decoderSteps: [t('读取 stream flags', 'Read stream flags'), t('按 block header 建立 inverse filters', 'Build inverse filters from block header'), t('解 LZMA2 chunk', 'Decode LZMA2 chunks'), t('逆序执行 filters', 'Run filters in reverse'), t('校验 Index/Footer', 'Validate Index/Footer')],
    sideInformation: [t('filter IDs 与属性', 'Filter IDs and properties'), t('block sizes 与 padding', 'Block sizes and padding'), t('check type 与 Index records', 'Check type and index records')],
    engineeringNotes: [t('LZMA2 允许在 chunk 边界重置字典或概率状态。', 'LZMA2 can reset dictionary or probability state at chunk boundaries.'), t('BCJ/Delta 等 filter 可位于 LZMA2 前。', 'BCJ/Delta filters may precede LZMA2.')],
    cautions: [t('xz 不是 LZMA2 的同义词；它们分属容器和压缩 filter。', 'xz is not synonymous with LZMA2; they are container and compression filter layers.'), t('比较时需要同时报告 preset、dictionary size 和线程设置。', 'Comparisons should report preset, dictionary size, and thread settings.')],
    sourceIds: ['xz-format', 'lzma-spec'], figure: '/research/compressor-system/routes/xz-lzma2/route.svg',
  },
  {
    id: 'R03', slug: 'zstd', title: 'Zstandard',
    subtitle: t('面向工程吞吐的分块 LZ 与双熵编码后端', 'Block-oriented LZ with two entropy-coding backends for engineering throughput'),
    family: t('LZ 匹配 + Huffman literals + FSE sequences', 'LZ matching + Huffman literals + FSE sequences'),
    summary: t('Zstd frame 包含若干 block。压缩块将内容分成 literals section 与 sequences section；literals 可用 Huffman，sequence codes 使用 FSE，具体语法由格式规范定义。', 'A Zstd frame contains blocks. A compressed block separates literals and sequences; literals may use Huffman and sequence codes use FSE, with syntax defined by the format specification.'),
    steps: [t('Frame Header', 'Frame Header'), t('Block split', 'Block split'), t('Literals + Sequences', 'Literals + Sequences'), t('Huffman + FSE', 'Huffman + FSE'), t('Frame checksum（可选）', 'Optional frame checksum')],
    decoderSteps: [t('解析 frame/block headers', 'Parse frame/block headers'), t('恢复 literals', 'Recover literals'), t('解 sequence codes', 'Decode sequence codes'), t('执行 offset/length copies', 'Execute offset/length copies'), t('校验 frame', 'Validate frame')],
    sideInformation: [t('frame content size/window descriptor/dictionary ID（按 flags）', 'Frame content size, window descriptor, dictionary ID as flagged'), t('literal Huffman table', 'Literal Huffman table'), t('FSE normalized counts 或 repeat/predefined mode', 'FSE normalized counts or repeat/predefined mode')],
    engineeringNotes: [t('Block 类型包括 Raw、RLE 和 Compressed。', 'Block types include Raw, RLE, and Compressed.'), t('sequence 由 literal length、match length 和 offset 表示。', 'A sequence represents literal length, match length, and offset.')],
    cautions: [t('“Huff0”是实现库名称；格式层应写 Huffman coding。', '“Huff0” is an implementation/library name; the format layer uses Huffman coding.'), t('Zstd 不是“所有模块都走一遍”的线性路线。', 'Zstd is not a linear route through every possible module.')],
    sourceIds: ['rfc8878', 'zstd-format'], figure: '/research/compressor-system/routes/zstd/route.svg',
  },
  {
    id: 'R04', slug: 'paq8px', title: 'PAQ8px',
    subtitle: t('面向极致压缩率的上下文混合实验系统', 'An experimental context-mixing system targeting high compression ratio'),
    family: t('分段/变换 + 多上下文专家 + Mixer/SSE + 算术类编码', 'Segmentation/transforms + context experts + Mixer/SSE + arithmetic-family coding'),
    summary: t('PAQ8px 根据数据类型执行分段和可逆变换，运行多个 bit-level 上下文模型，再由 mixer 与 SSE 形成概率，最后交给算术类编码器。具体模型组合随版本和配置变化。', 'PAQ8px segments and reversibly transforms data by type, runs multiple bit-level context models, combines them with mixers and SSE, and sends the probability to an arithmetic-family coder. Exact model sets vary by version and configuration.'),
    steps: [t('检测/分段', 'Detection/segmentation'), t('可逆变换', 'Reversible transforms'), t('上下文专家', 'Context experts'), t('Mixer + SSE', 'Mixer + SSE'), t('Arithmetic-family coder', 'Arithmetic-family coder')],
    decoderSteps: [t('初始化同版模型', 'Initialize same-version models'), t('生成 bit 概率', 'Produce bit probability'), t('解码 bit', 'Decode bit'), t('同步更新模型/mixer', 'Synchronously update models/mixer'), t('逆变换与拼接', 'Invert transforms and reassemble')],
    sideInformation: [t('块/类型与变换标记', 'Block/type and transform markers'), t('实现版本与配置约定', 'Implementation version and configuration contract'), t('可选神经模型依赖', 'Optional neural-model dependency')],
    engineeringNotes: [t('该路线主要追求压缩率，CPU 和内存成本通常较高。', 'This route primarily targets compression ratio and typically uses substantial CPU and memory.'), t('部分配置可包含 LSTM 等实验组件，不能概括为所有 PAQ8px 都固定使用。', 'Some configurations include experimental components such as LSTM; this is not universal to every PAQ8px build.')],
    cautions: [t('必须记录 commit、编译选项和 level，版本差异会改变路线。', 'Record commit, build options, and level because versions can change the route.'), t('不要给出无来源的百分比收益。', 'Do not attach unsourced percentage gains.')],
    sourceIds: ['paq8px'], figure: '/research/compressor-system/routes/paq8px/route.svg',
  },
  {
    id: 'R05', slug: 'cmix', title: 'cmix',
    subtitle: t('把上下文模型、混合器与神经组件组合成高资源压缩器', 'Combines context models, mixers, and neural components in a resource-intensive compressor'),
    family: t('预处理 + 上下文混合 + SSE/神经模型 + 算术类编码', 'Preprocessing + context mixing + SSE/neural models + arithmetic-family coding'),
    summary: t('cmix 是高压缩率实验压缩器。其实现包含数据预处理、多个上下文模型、mixer、SSE 和神经组件；它适合研究模型组合，不应被描述成通用工程吞吐基线。', 'cmix is an experimental high-ratio compressor. Its implementation includes preprocessing, multiple context models, mixers, SSE, and neural components; it is useful for studying model ensembles rather than as a general throughput baseline.'),
    steps: [t('预处理', 'Preprocessing'), t('模型集合', 'Model ensemble'), t('Mixer', 'Mixer'), t('SSE/神经组件', 'SSE/neural components'), t('Arithmetic-family coder', 'Arithmetic-family coder')],
    decoderSteps: [t('复现预处理语义', 'Reproduce preprocessing semantics'), t('并行计算模型预测', 'Compute model predictions'), t('混合与校准', 'Mix and calibrate'), t('解码 symbol/bit', 'Decode symbol/bit'), t('同步更新并逆变换', 'Synchronously update and invert transforms')],
    sideInformation: [t('版本化预处理标记', 'Versioned preprocessing markers'), t('模型/配置约定', 'Model/configuration contract'), t('流终止与校验信息', 'Stream termination and check information')],
    engineeringNotes: [t('算法研究时应把预处理收益与模型收益分开消融。', 'Research should ablate preprocessing gains separately from model gains.'), t('资源测量应包含内存峰值与可能的神经模型状态。', 'Resource measurement should include peak memory and neural-model state.')],
    cautions: [t('cmix 与 PAQ8px 同属上下文混合大类，但具体模型和预处理并不相同。', 'cmix and PAQ8px share the context-mixing family but differ in models and preprocessing.'), t('公开结果需要绑定具体 revision 与命令。', 'Published results must bind to a specific revision and command.')],
    sourceIds: ['cmix'], figure: '/research/compressor-system/routes/cmix/route.svg',
  },
  {
    id: 'R06', slug: 'nncp', title: 'NNCP',
    subtitle: t('Transformer 概率模型与算术编码的同步系统', 'A synchronized Transformer probability model and arithmetic coder'),
    family: t('神经自回归建模 + Arithmetic Coding', 'Neural autoregressive modeling + arithmetic coding'),
    summary: t('NNCP 用 Transformer 根据已知历史预测下一字节的 256 类分布，再由算术编码写入实际字节。公开实现说明包含编码/解码两端同步的在线训练。', 'NNCP uses a Transformer to predict a 256-way next-byte distribution from known history and arithmetic coding to encode the actual byte. Public implementation notes describe synchronized online training on encoder and decoder.'),
    steps: [t('字节输入', 'Byte input'), t('Transformer context', 'Transformer context'), t('256-way distribution', '256-way distribution'), t('Arithmetic Coding', 'Arithmetic Coding'), t('bitstream', 'bitstream')],
    decoderSteps: [t('用已解码历史运行 Transformer', 'Run Transformer on decoded history'), t('构造相同整数 CDF', 'Build the same integer CDF'), t('从算术码流恢复字节', 'Recover byte from arithmetic stream'), t('执行同步在线更新', 'Perform synchronized online update'), t('追加历史', 'Append to history')],
    sideInformation: [t('模型结构与初始化', 'Model architecture and initialization'), t('概率量化/CDF 规则', 'Probability quantization/CDF rules'), t('优化器、精度与更新次序', 'Optimizer, precision, and update order')],
    engineeringNotes: [t('模型计算是编码和解码共同成本，不可只测编码端。', 'Model computation is paid by both encoder and decoder and cannot be measured on the encoder alone.'), t('模型大小、预训练权重获取方式和在线训练成本需明确计入实验口径。', 'Model size, weight availability, and online-training cost must be explicit in evaluation accounting.')],
    cautions: [t('不能只写“Transformer 输出 bitstream”；中间仍需要确定性的熵编码器。', 'Do not say “the Transformer outputs a bitstream”; a deterministic entropy coder is still required.'), t('跨平台浮点一致性是无损解码的核心风险。', 'Cross-platform floating-point consistency is a central lossless-decoding risk.')],
    sourceIds: ['nncp', 'nncp-metal'], figure: '/research/compressor-system/routes/nncp/route.svg',
  },
] as const;

export const sourceById = (id: string): SourceRef | undefined => sourceRefs.find((source) => source.id === id);
export const conceptBySlug = (slug: string): CompressionConcept | undefined => compressionConcepts.find((concept) => concept.slug === slug);
export const routeBySlug = (slug: string): CompressorRoute | undefined => compressorRoutes.find((route) => route.slug === slug);

