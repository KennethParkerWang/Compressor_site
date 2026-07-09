// 标准场景化分组 - 服务"我该看哪个标准"页面

export type StandardLossless = 'lossless' | 'near-lossless' | 'lossy';

export interface StandardScenario {
  id: string;
  /** 场景标题: "我要压网页/文本" */
  scenario: string;
  /** 场景说明: 我在这种场景下该看哪些标准 */
  why: string;
  /** 适用数据 */
  dataShape: string;
  standards: readonly StandardItem[];
}

export interface StandardItem {
  id: string;
  name: string;
  /** 解决什么问题 */
  problem: string;
  /** 什么时候看它 */
  whenToUse: string;
  /** 适用数据 */
  applicable: string;
  /** 无损状态 */
  lossless: StandardLossless;
  /** 官方链接 */
  url?: string;
  /** 是否可用作 benchmark 语料 */
  isBenchmark?: boolean;
}

export const standardScenarios: readonly StandardScenario[] = [
  {
    id: 'web-text',
    scenario: '我要压网页 / 文本',
    why: '网页/文本冗余以字典与字符概率为主,需要工业成熟、吞吐高的组合方案。',
    dataShape: 'HTML / JSON / 日志 / 源码',
    standards: [
      {
        id: 'S-DEFLATE',
        name: 'DEFLATE',
        problem: '兼顾通用性与吞吐的最广泛通用压缩',
        whenToUse: '任意二进制/文本,需要最大兼容',
        applicable: '任意字节流',
        lossless: 'lossless',
        url: 'https://www.rfc-editor.org/rfc/rfc1951',
      },
      {
        id: 'S-BROTLI',
        name: 'Brotli',
        problem: '文本与网页的更高压缩率',
        whenToUse: 'HTML/JS/CSS 等静态资源',
        applicable: '网页、字体、文本',
        lossless: 'lossless',
        url: 'https://www.rfc-editor.org/rfc/rfc7932',
      },
      {
        id: 'S-ZSTD',
        name: 'Zstandard (Zstd)',
        problem: '极速压缩/解压 + 现代字典支持',
        whenToUse: '需要吞吐与压缩比平衡的通用场景',
        applicable: '任意字节流、日志、备份',
        lossless: 'lossless',
        url: 'https://www.rfc-editor.org/rfc/rfc8478',
      },
    ],
  },
  {
    id: 'image',
    scenario: '我要压图像',
    why: '图像冗余以像素相关为主,通用字典往往吃不满;近无损/有损参考用于带宽敏感场景。',
    dataShape: '8-bit / 16-bit 图像 / 高位深图像',
    standards: [
      {
        id: 'S-PNG',
        name: 'PNG',
        problem: '无损 8-bit 图像的事实标准',
        whenToUse: 'UI 截屏、图标、网页图',
        applicable: '8-bit 图像、透明度',
        lossless: 'lossless',
        url: 'https://www.w3.org/TR/PNG/',
      },
      {
        id: 'S-JPEGLS',
        name: 'JPEG-LS',
        problem: '医学/卫星常用近无损图像压缩',
        whenToUse: '需要无损或近似无损,且低复杂度',
        applicable: '连续色调图像',
        lossless: 'near-lossless',
        url: 'https://www.itu.int/rec/T-REC-T.87',
      },
      {
        id: 'S-J2K',
        name: 'JPEG 2000',
        problem: '高压缩率有损 + 无损能力',
        whenToUse: '对图像质量有较高要求',
        applicable: '医学、地理、影像归档',
        lossless: 'lossless',
        url: 'https://www.itu.int/rec/T-REC-T.800',
      },
      {
        id: 'S-JXL',
        name: 'JPEG XL',
        problem: '现代通用图像编码,支持无损/有损',
        whenToUse: '需要兼容旧 JPEG 又想换格式',
        applicable: '静态图像',
        lossless: 'lossless',
        url: 'https://www.iso.org/standard/85451.html',
      },
    ],
  },
  {
    id: 'medical',
    scenario: '我要压医学影像',
    why: '医学对无损、稳定性、互操作要求最高,DICOM 是行业默认承载格式。',
    dataShape: 'DICOM 图像序列 / 体积数据',
    standards: [
      {
        id: 'S-DICOM',
        name: 'DICOM',
        problem: '医学影像存储与传输的事实标准',
        whenToUse: '医学图像归档、影像归档系统',
        applicable: '医学影像、元数据',
        lossless: 'lossless',
        url: 'https://dicom.nema.org/medical/dicom/current/output/html/part05.html',
      },
      {
        id: 'S-JPEGLS-MED',
        name: 'JPEG-LS',
        problem: '医学常用的低复杂度无损/近无损',
        whenToUse: 'DICOM 内的图像编码',
        applicable: 'CT / MR / 超声图像',
        lossless: 'near-lossless',
        url: 'https://www.itu.int/rec/T-REC-T.87',
      },
      {
        id: 'S-J2K-MED',
        name: 'JPEG 2000',
        problem: '医学影像高质量存储',
        whenToUse: '病理图 / 大尺寸影像',
        applicable: '全切片图、CT/MR',
        lossless: 'lossless',
        url: 'https://www.itu.int/rec/T-REC-T.800',
      },
    ],
  },
  {
    id: 'astronomy',
    scenario: '我要压天文遥感',
    why: '天文/卫星数据常为 16-bit+ 大体积,需要严格无损或可控误差,CCSDS 是航天标准。',
    dataShape: 'FITS / 高光谱 / 卫星载荷',
    standards: [
      {
        id: 'S-FITS',
        name: 'FITS',
        problem: '天文数据存储与交换的通用容器',
        whenToUse: '望远镜观测、谱线、图像',
        applicable: '天文图像 / 谱线',
        lossless: 'lossless',
        url: 'https://fits.gsfc.nasa.gov/standard40/fits_standard40aa-le.pdf',
      },
      {
        id: 'S-RICE',
        name: 'Rice',
        problem: '简单可逆压缩,适配 16-bit 整数',
        whenToUse: '天文无损压缩',
        applicable: '天文图像',
        lossless: 'lossless',
      },
      {
        id: 'S-CCSDS121',
        name: 'CCSDS 121.0',
        problem: '航天无损数据压缩标准',
        whenToUse: '卫星下行链路',
        applicable: '航天载荷数据',
        lossless: 'lossless',
        url: 'https://ccsds.org/Pubs/121x0b3.pdf',
      },
      {
        id: 'S-CCSDS122',
        name: 'CCSDS 122.0',
        problem: '航天图像压缩标准',
        whenToUse: '对地观测、多光谱图像',
        applicable: '对地观测图像',
        lossless: 'near-lossless',
        url: 'https://ccsds.org/Pubs/122x0b2s.pdf',
      },
    ],
  },
  {
    id: 'scientific',
    scenario: '我要压科学数组',
    why: '科学数据多为浮点/高位深,HDF5/NetCDF 是容器,fpzip/zfp 是针对浮点的压缩。',
    dataShape: '浮点数组 / 大规模模拟数据',
    standards: [
      {
        id: 'S-HDF5',
        name: 'HDF5',
        problem: '科学数据通用容器',
        whenToUse: '需要分块 + 元数据的科学数据',
        applicable: '任意科学数组',
        lossless: 'lossless',
        url: 'https://www.hdfgroup.org/solutions/hdf5/',
      },
      {
        id: 'S-NetCDF',
        name: 'NetCDF',
        problem: '面向地球科学的数组容器',
        whenToUse: '气候/海洋/气象数据',
        applicable: '网格化数组',
        lossless: 'lossless',
        url: 'https://www.unidata.ucar.edu/software/netcdf/',
      },
      {
        id: 'S-FPZIP',
        name: 'fpzip',
        problem: '浮点数组高精度压缩',
        whenToUse: '需要保真浮点且 zstd 浪费',
        applicable: '浮点数组',
        lossless: 'lossless',
        url: 'https://computing.llnl.gov/projects/fpzip',
      },
      {
        id: 'S-ZFP',
        name: 'ZFP',
        problem: '浮点数组的有损/无损压缩',
        whenToUse: '容忍小幅误差的浮点数组',
        applicable: '浮点数组',
        lossless: 'near-lossless',
        url: 'https://computing.llnl.gov/projects/zfp',
      },
    ],
  },
  {
    id: 'tabular',
    scenario: '我要压表格 / 日志',
    why: '时序与结构化数据冗余在列内字典与值域分布,列式压缩更适合。',
    dataShape: '时序、列存表、日志流',
    standards: [
      {
        id: 'S-Parquet',
        name: 'Apache Parquet',
        problem: '列存压缩通用容器',
        whenToUse: 'Spark / 数据仓库',
        applicable: '结构化表',
        lossless: 'lossless',
        url: 'https://parquet.apache.org/',
      },
      {
        id: 'S-ORC',
        name: 'Apache ORC',
        problem: 'Hive 生态列式压缩',
        whenToUse: 'Hive / 大数据',
        applicable: '结构化表',
        lossless: 'lossless',
        url: 'https://orc.apache.org/',
      },
      {
        id: 'S-Gorilla',
        name: 'Gorilla',
        problem: '面向时序的位图压缩',
        whenToUse: '高频时序数据库',
        applicable: '时间序列',
        lossless: 'lossless',
        url: 'http://www.vldb.org/pvldb/vol8/p1816-teller.pdf',
      },
    ],
  },
  {
    id: 'benchmark',
    scenario: '我要做基准测试',
    why: '通用压缩研究需要可比对的语料,Benchmark 语料本身就是研究材料。',
    dataShape: '标准化文本/二进制/混合语料',
    standards: [
      {
        id: 'S-CANTERBURY',
        name: 'Canterbury Corpus',
        problem: '经典通用压缩评测语料',
        whenToUse: '新算法的入门评测',
        applicable: '通用文本/二进制',
        lossless: 'lossless',
        url: 'https://corpus.canterbury.ac.nz/',
        isBenchmark: true,
      },
      {
        id: 'S-SILESIA',
        name: 'Silesia Corpus',
        problem: '现代通用压缩事实标准',
        whenToUse: 'PAQ/CMIX 类算法评测',
        applicable: '大文件通用压缩',
        lossless: 'lossless',
        isBenchmark: true,
      },
      {
        id: 'S-ENWIK',
        name: 'enwik8 / enwik9',
        problem: '字符级语言建模标准',
        whenToUse: '神经压缩评测',
        applicable: '维基百科文本',
        lossless: 'lossless',
        url: 'http://mattmahoney.net/dc/textdata.html',
        isBenchmark: true,
      },
      {
        id: 'S-NNLCB',
        name: 'NNLCB',
        problem: '神经无损压缩评测平台',
        whenToUse: '神经压缩横向对比',
        applicable: '神经压缩器基准',
        lossless: 'lossless',
        url: 'https://fahaihi.github.io/NNLCB/',
        isBenchmark: true,
      },
      {
        id: 'S-FCBENCH',
        name: 'FCBench',
        problem: 'FairCom 压缩评测',
        whenToUse: '公平压缩评测',
        applicable: '混合语料',
        lossless: 'lossless',
        url: 'https://github.com/faircomp/FCBench',
        isBenchmark: true,
      },
    ],
  },
];

export const losslessLabels: Record<StandardLossless, string> = {
  lossless: '严格无损',
  'near-lossless': '近无损',
  lossy: '有损参考',
};

export default standardScenarios;