import {
  ACHIEVEMENT_PLAN_ROWS,
  CONTRACT_METRIC_ROWS,
  PROJECT_METRICS,
  QUICK_ANCHORS,
  type AchievementPlanRow,
  type AnnualPlanRow,
  type ContractMetricRow,
  type GanttTask,
  type MilestoneRow,
  type RiskRow,
} from './projectAnnualPlan';

export const PROJECT_OVERVIEW_EN = {
  title: 'Annual R&D Plan for a High-Compression-Ratio Lossless Data Compression Project',
  subtitle:
    'A one-year R&D plan for Silesia and Tencent datasets, covering the paq8px-1 comparison baseline, data classification and routing, compression-ratio optimization, throughput and latency analysis, demo delivery, survey writing, research papers, and patent outputs.',
  route:
    'Literature review and research-map construction → dataset preparation and code reproduction → baseline and evaluation framework → data preprocessing and classification routing → compression algorithm prototype → core model development and system experiments → compression-ratio and throughput optimization → demo and toolchain delivery → paper, patent, and final acceptance materials',
  period: '2026.07–2027.06',
  acceptance: 'Final acceptance in 2027.06',
};

const METRIC_EN = [
  {
    label: 'Project Period',
    value: '2026.07–2027.06',
    detail: 'One-year horizontal research project plan',
  },
  {
    label: 'Technical Target',
    value: 'Outperform paq8px-1',
    detail: 'Average compression ratio on specified datasets',
  },
  {
    label: 'Performance Target',
    value: 'GPU 8–10 MB/s',
    detail: 'or CPU 0.16–0.2 MB/s',
  },
  {
    label: 'Research Outputs',
    value: '1 survey / 1–2 papers / 1–2 patents',
    detail: 'Continuous accumulation across the project lifecycle',
  },
  {
    label: 'Engineering Delivery',
    value: 'Source / demo / toolchain',
    detail: 'Test reports and environment notes delivered together',
  },
  {
    label: 'Datasets & Baselines',
    value: 'Silesia / Tencent datasets',
    detail: 'Public benchmark and customer-data evaluation',
  },
];

export const PROJECT_METRICS_EN = PROJECT_METRICS.map((item, index) => ({
  ...item,
  ...METRIC_EN[index],
}));

export const PROJECT_ROUTE_STEPS_EN = [
  {label: 'Literature Review', detail: 'Research map and survey material base', tone: 'research' as const},
  {label: 'Data & Reproduction', detail: 'Silesia / Tencent datasets and open-source reproduction', tone: 'data' as const},
  {label: 'Baseline System', detail: 'paq8px-1 and evaluation metrics frozen', tone: 'experiment' as const},
  {label: 'Routing Module', detail: 'Data preprocessing and type-aware routing', tone: 'model' as const},
  {label: 'Core Model', detail: 'Compression prototype and model iterations', tone: 'model' as const},
  {label: 'System Experiments', detail: 'Block size, ratio, throughput, and latency analysis', tone: 'experiment' as const},
  {label: 'Output Finalization', detail: 'Papers, patents, demo, and acceptance package', tone: 'delivery' as const},
];

export const ANNUAL_PLAN_ROWS_EN: AnnualPlanRow[] = [
  {
    month: '2026.07',
    position: 'Literature review launch and research-scope definition',
    mainTasks:
      'Conduct systematic literature retrieval on lossless compression, context modeling, probability prediction, entropy coding, PAQ-family compressors, cmix, nncp, deep-learning-assisted compression, and mixed-data compression. Prioritize recent top-tier journal/conference papers and classic representative algorithms. Establish paper tags, reading priorities, and a preliminary technical roadmap.',
    achievementTasks:
      'Build the survey material base and define initial survey sections, including traditional compression, context-mixing models, neural compression, entropy coding, datasets and metrics, engineering implementation, and hardware-friendly design.',
    deliverables: 'Literature repository, paper taxonomy, research map, key-paper candidate list, survey material base v0.1.',
    tone: 'research',
  },
  {
    month: '2026.08',
    position: 'Key-paper deep reading, interim reporting, dataset preparation, and reproduction scouting',
    mainTasks:
      'Select the most relevant papers for close reading and analyze algorithm ideas, datasets, metrics, reproducibility, and relevance to this project. Prepare interim presentation materials. Acquire and organize the Silesia and Tencent datasets, confirm the storage plan, attempt reproduction of representative open-source algorithms or key paper code, and produce preliminary algorithm comparisons.',
    achievementTasks:
      'Form a detailed survey outline, organize close-reading notes, build a method-comparison matrix, and record potential innovation points and improvement opportunities.',
    deliverables: 'Key-paper reading slides, method-comparison table, dataset organization note, reproduction records, preliminary comparison report, survey outline v0.1.',
    tone: 'data',
  },
  {
    month: '2026.09',
    position: 'Technical-route finalization, evaluation-framework construction, and baseline setup',
    mainTasks:
      'Finalize the project technical route based on the literature review and preliminary experiments. Freeze metrics such as compression ratio, throughput, latency, decompression correctness, and memory usage. Establish a unified testing workflow for paq8px-1 and other key baselines. Design preprocessing, segment/file classification, and compression-module routing schemes.',
    achievementTasks:
      'Start drafting the survey sections on research background, task definition, datasets, and evaluation metrics. Organize baseline experiment results as the experimental foundation for later research papers.',
    deliverables: 'Technical-route document, evaluation-framework specification, baseline test scripts, preprocessing plan, partial survey draft.',
    tone: 'experiment',
  },
  {
    month: '2026.10',
    position: 'Overall compression framework design and prototype closed-loop validation',
    mainTasks:
      'Design the full compression workflow, including input handling, preprocessing, classification, modeling, encoding, decoding, integrity verification, and result statistics. Complete the first compression/decompression prototype and verify the closed loop on small-scale datasets.',
    achievementTasks:
      'Draft the survey sections on traditional algorithms and context modeling. Establish an innovation ledger to record technical schemes that may support patents or research-paper contributions.',
    deliverables: 'Algorithm design proposal, system framework diagram, compression/decompression prototype v0.1, closed-loop test record, staged survey draft, innovation ledger v0.1.',
    tone: 'model',
  },
  {
    month: '2026.11',
    position: 'Data-classification module and first core compression model',
    mainTasks:
      'Implement file-level and segment-level classification modules. Design differentiated compression strategies for text, binary data, image/medical-like data, and structured data. Complete core compression model v1 and run preliminary system tests on the Silesia dataset.',
    achievementTasks:
      'Draft survey sections on deep-learning compression and mixed-data compression. Select one or two potential research-paper directions and preliminarily screen algorithm modules or system workflows that may support patent applications.',
    deliverables: 'Data-classification module, compression model v1, Silesia preliminary test report, survey main-body draft, paper-topic candidates, patent-innovation candidates.',
    tone: 'model',
  },
  {
    month: '2026.12',
    position: 'Silesia system experiments, block-granularity analysis, and complete survey draft',
    mainTasks:
      'Run systematic tests on the Silesia dataset. Compare against paq8px-1 and other reproducible baselines. Complete compression-ratio, throughput, and latency experiments at 32KB, 64KB, and 128KB granularities. Analyze the impact of block size on compression effectiveness and engineering performance.',
    achievementTasks:
      'Produce a complete survey draft, finalize the main research-paper storyline and experiment design, and conduct preliminary novelty and feasibility screening for potential patent points.',
    deliverables: 'Silesia comparison report, block-granularity report, performance bottleneck analysis, complete survey draft, research-paper experiment plan, patent screening record.',
    tone: 'experiment',
  },
  {
    month: '2027.01',
    position: 'Tencent dataset adaptation, robustness enhancement, and survey revision',
    mainTasks:
      'Adapt the workflow to the Tencent dataset and perform data-format checks. Improve the classification and routing mechanism, handle mixed data, small files, large files, and anomalous files, and improve compression/decompression stability.',
    achievementTasks:
      'Revise the survey according to advisor feedback, start drafting the method section of the research paper, and confirm at least one priority patent direction.',
    deliverables: 'Tencent dataset adaptation report, robustness test report, compression model v2, revised survey draft, research-paper method framework, patent direction confirmation table.',
    tone: 'experiment',
  },
  {
    month: '2027.02',
    position: 'Compression-ratio optimization and research-paper experiment execution',
    mainTasks:
      'Analyze data types where the model underperforms paq8px-1. Optimize context modeling, probability prediction, preprocessing transforms, and coding strategies. Produce a high-compression-ratio version and evaluate gains and costs across data types.',
    achievementTasks:
      'Complete the research paper related work, method, and experimental setup sections. Produce the first patent disclosure draft. Move the survey toward finalization or submission preparation.',
    deliverables: 'Compression-ratio optimization report, model v2.5, type-wise comparison results, partial research-paper draft, first patent disclosure draft, finalized survey version.',
    tone: 'model',
  },
  {
    month: '2027.03',
    position: 'Throughput/latency optimization, hardware-friendly redesign, and main paper experiments',
    mainTasks:
      'Optimize memory access, batching, parallel execution, and GPU/CPU workflows. Reduce redundant computation. Compare the high-ratio version and speed-optimized version, and measure compression and decompression throughput.',
    achievementTasks:
      'Complete the main experimental figures and tables for the research paper. Refine the patent disclosure technical scheme. Adjust survey formatting and references according to the target venue.',
    deliverables: 'CPU/GPU performance report, hardware-friendliness analysis, speed-optimized version, main paper figures and tables, revised patent disclosure.',
    tone: 'experiment',
  },
  {
    month: '2027.04',
    position: 'Integrated-metric sprint, system integration, demo v1, and complete paper draft',
    mainTasks:
      'Complete integrated tests for compression ratio, throughput, latency, and decompression correctness. Apply targeted fixes to modules that do not meet requirements. Develop the model-calling demo with one-click compression, one-click decompression, integrity verification, and result statistics.',
    achievementTasks:
      'Produce the complete research-paper draft, complete the internal-review version of the patent disclosure, and supplement the survey with project-specific analysis based on final experiments.',
    deliverables: 'Complete system v3, integrated test report, demo v1, complete research-paper draft, patent disclosure review draft.',
    tone: 'delivery',
  },
  {
    month: '2027.05',
    position: 'Toolchain finalization, technical documentation, and output consolidation',
    mainTasks:
      'Organize source code, environment configuration, toolchain, model-calling notes, training workflow, and testing workflow. Improve the demo and consolidate final experiment figures and test results.',
    achievementTasks:
      'Revise the research paper and form submission materials. Finalize or submit the patent disclosure. Revise the survey according to feedback. If results are sufficient, start the framework design for a second research paper or extended paper.',
    deliverables: 'Source-code documentation, toolchain manual, final experiment figures, research-paper submission draft, finalized patent disclosure, revised survey.',
    tone: 'delivery',
  },
  {
    month: '2027.06',
    position: 'Final acceptance, project handoff, and output submission',
    mainTasks:
      'Complete final version testing. Fix demo, code, and documentation issues. Organize the final delivery package, prepare the acceptance presentation, and submit project report, test report, code, demo, and acceptance materials.',
    achievementTasks:
      'Complete final submission or archival of paper and patent materials, and organize follow-up submission, revision, or extended-research plans.',
    deliverables: 'Final project report, final test report, source code and toolchain, demo, acceptance slides, paper submission materials, patent materials, follow-up output plan.',
    tone: 'delivery',
  },
];

export const ACHIEVEMENT_PLAN_ROWS_EN: AchievementPlanRow[] = [
  {
    type: 'review',
    name: 'Survey Paper',
    start: '2026.07',
    midNode: 'Complete full draft by 2026.12; final/submission-ready version by 2027.02',
    finish: '2027.02–2027.04',
    approach: 'Accumulate materials from the first literature-review stage, organize sections according to the research map, and continuously incorporate recent papers and project-specific experimental observations.',
    outputs: 'Survey material base, survey outline, complete draft, revised draft, submission-ready version.',
  },
  {
    type: 'paper',
    name: 'Research Paper 1',
    start: '2026.11–2026.12',
    midNode: 'Method and experimental setup completed by 2027.02; full draft by 2027.04',
    finish: '2027.05–2027.06',
    approach: 'Use the core model, compression-ratio optimization, throughput/latency analysis, or mixed-data compression strategy as the main contribution. Generate figures, tables, and ablations alongside system experiments.',
    outputs: 'Paper topic, experiment plan, main experiment figures, full draft, submission package.',
  },
  {
    type: 'paper',
    name: 'Research Paper 2 / Extended Paper',
    start: '2027.03–2027.04',
    midNode: 'Assess independent publishability by 2027.05',
    finish: 'Post-2027.06 continuation or draft framework',
    approach: 'Decide based on additional innovations beyond the first paper, such as hardware-friendly compression, block-granularity optimization, or data-type-specific compression strategies.',
    outputs: 'Topic assessment, supplementary experiment plan, draft framework or follow-up submission plan.',
  },
  {
    type: 'patent',
    name: 'Patent 1',
    start: '2026.10',
    midNode: 'Innovation screening by 2026.12; disclosure draft by 2027.02; internal-review draft by 2027.04',
    finish: '2027.05–2027.06',
    approach: 'Record innovation points from the algorithm-framework and classification-routing design stages, and select technically implementable schemes with protection value.',
    outputs: 'Innovation ledger, patent direction confirmation table, disclosure draft, finalized disclosure.',
  },
  {
    type: 'patent',
    name: 'Patent 2',
    start: '2027.01–2027.03',
    midNode: 'Assess application value by 2027.04',
    finish: '2027.06 or later continuation',
    approach: 'Decide based on independent innovation points from model optimization, throughput/latency optimization, hardware-friendly implementation, or the demo toolchain.',
    outputs: 'Innovation assessment record, second patent direction note, disclosure framework or follow-up plan.',
  },
  {
    type: 'engineering',
    name: 'Demo and Toolchain Delivery',
    start: '2027.04',
    midNode: 'Complete demo, source-code notes, environment configuration, and toolchain manual by 2027.05',
    finish: 'Final acceptance in 2027.06',
    approach: 'Finalize engineering assets alongside system integration and integrated tests, ensuring code, demo, test scripts, result statistics, and acceptance materials are mutually traceable.',
    outputs: 'Demo v1, source-code documentation, toolchain manual, final delivery package, acceptance slides.',
  },
];

export const CONTRACT_METRIC_ROWS_EN: ContractMetricRow[] = CONTRACT_METRIC_ROWS.map((row, index) => {
  const data: Omit<ContractMetricRow, 'status' | 'tone'>[] = [
    {
      metric: 'Compression Ratio',
      target: 'Average compression ratio on specified datasets should outperform paq8px-1, with type-wise analysis for low-gain data categories.',
      plannedTime: '2027.02–2027.04',
      verification: 'Run unified scripts on Silesia / Tencent datasets and record parameters, versions, hardware, data hashes, and result tables.',
      evidence: 'Type-wise comparison results, compression-ratio optimization report, final performance report.',
    },
    {
      metric: 'Throughput and Latency',
      target: 'GPU 8–10 MB/s or CPU 0.16–0.2 MB/s, including compression/decompression throughput, latency, and peak memory.',
      plannedTime: '2027.03–2027.04',
      verification: 'Run CPU/GPU benchmark tests under a controlled environment and output throughput curves, latency distributions, and bottleneck analysis.',
      evidence: 'CPU/GPU performance report, hardware-friendliness analysis, speed-optimized version.',
    },
    {
      metric: 'Datasets and Evaluation Framework',
      target: 'Complete Silesia / Tencent dataset acquisition, organization, storage plan, evaluation metrics, and baseline testing workflow.',
      plannedTime: '2026.08–2026.10',
      verification: 'Unify data entry, scripts, result templates, and exception records; reproduce paq8px-1 and key baselines.',
      evidence: 'Dataset organization note, evaluation-framework document, baseline scripts, preliminary experiment report.',
    },
    {
      metric: 'Decompression Correctness',
      target: 'All official experiment samples must pass bit-exact decompression verification; anomalous files must be separately recorded and explained.',
      plannedTime: '2026.10–2027.04',
      verification: 'Perform byte-level comparison after decompression and record checksums, failed samples, and fixes.',
      evidence: 'Closed-loop test record, robustness test report, integrated test report.',
    },
    {
      metric: 'Engineering Delivery',
      target: 'Deliver source code, demo, toolchain, model-calling notes, test reports, and acceptance slides.',
      plannedTime: '2027.04–2027.06',
      verification: 'Demo supports one-click compression, one-click decompression, integrity verification, and result statistics; source and environment notes are reproducible.',
      evidence: 'Complete system v3, demo v1, source-code documentation, final delivery package.',
    },
    {
      metric: 'Research Outputs',
      target: 'Produce one survey, one to two research papers, and one to two patents, with submission or archival materials completed.',
      plannedTime: '2026.07–2027.06',
      verification: 'Check sections, figures, disclosures, submission drafts, and archival files according to the output schedule.',
      evidence: 'Survey submission version, research-paper submission package, finalized patent disclosure, follow-up output plan.',
    },
  ];
  return {...row, ...data[index]};
});

export const GANTT_TASKS_EN: GanttTask[] = [
  {id: 'g1', name: 'Literature review and research map', start: '2026.07', end: '2026.08', track: 'Technical R&D', tone: 'research', deliverable: 'Literature repository, research map, key-paper candidate list.'},
  {id: 'g2', name: 'Survey material base and paper', start: '2026.07', end: '2027.04', track: 'Research Outputs', tone: 'achievement', deliverable: 'Survey material base, full draft, revised draft, submission version.'},
  {id: 'g3', name: 'Key-paper reading and interim report', start: '2026.07', end: '2026.08', track: 'Research Outputs', tone: 'research', deliverable: 'Key-paper reading slides, method-comparison table.'},
  {id: 'g4', name: 'Dataset acquisition and organization', start: '2026.08', end: '2026.09', track: 'Technical R&D', tone: 'data', deliverable: 'Dataset note, storage plan, data-check records.'},
  {id: 'g5', name: 'Code reproduction and initial comparison', start: '2026.08', end: '2026.09', track: 'Technical R&D', tone: 'data', deliverable: 'Reproduction records and preliminary comparison report.'},
  {id: 'g6', name: 'Evaluation framework and baselines', start: '2026.09', end: '2026.10', track: 'Technical R&D', tone: 'experiment', deliverable: 'Evaluation specification and baseline scripts.'},
  {id: 'g7', name: 'Preprocessing and classification routing', start: '2026.09', end: '2026.11', track: 'Technical R&D', tone: 'model', deliverable: 'Preprocessing plan and routing module.'},
  {id: 'g8', name: 'Compression framework design', start: '2026.10', end: '2026.10', track: 'Technical R&D', tone: 'model', deliverable: 'Algorithm proposal, system diagram, prototype v0.1.'},
  {id: 'g9', name: 'Core compression model development', start: '2026.10', end: '2027.01', track: 'Technical R&D', tone: 'model', deliverable: 'Compression model v1/v2 and robustness report.'},
  {id: 'g10', name: 'Silesia / Tencent system experiments', start: '2026.12', end: '2027.02', track: 'Technical R&D', tone: 'experiment', deliverable: 'Silesia comparison report and Tencent adaptation report.'},
  {id: 'g11', name: '32KB/64KB/128KB block experiments', start: '2026.12', end: '2027.01', track: 'Technical R&D', tone: 'experiment', deliverable: 'Block-granularity report and bottleneck analysis.'},
  {id: 'g12', name: 'Compression-ratio optimization', start: '2027.01', end: '2027.04', track: 'Technical R&D', tone: 'model', deliverable: 'Ratio optimization report and integrated test report.'},
  {id: 'g13', name: 'Throughput and latency optimization', start: '2027.02', end: '2027.04', track: 'Technical R&D', tone: 'experiment', deliverable: 'CPU/GPU performance report and speed-optimized version.'},
  {id: 'g14', name: 'Research Paper 1', start: '2026.12', end: '2027.06', track: 'Research Outputs', tone: 'achievement', deliverable: 'Experiment plan, main figures, full draft, submission package.'},
  {id: 'g15', name: 'Patent 1', start: '2026.10', end: '2027.06', track: 'Research Outputs', tone: 'achievement', deliverable: 'Innovation ledger, disclosure draft, finalized disclosure.'},
  {id: 'g16', name: 'Patent 2 / Extended output', start: '2027.03', end: '2027.06', track: 'Research Outputs', tone: 'achievement', deliverable: 'Second patent direction note or follow-up plan.'},
  {id: 'g17', name: 'Demo and toolchain', start: '2027.04', end: '2027.05', track: 'Acceptance Delivery', tone: 'delivery', deliverable: 'Demo v1, source-code notes, toolchain manual.'},
  {id: 'g18', name: 'Documents, reports, and acceptance materials', start: '2027.05', end: '2027.06', track: 'Acceptance Delivery', tone: 'delivery', deliverable: 'Final project report, test report, acceptance slides, final package.'},
];

export const MILESTONE_ROWS_EN: MilestoneRow[] = [
  {
    id: 'M1',
    title: 'Literature review and research map completed',
    time: '2026.07–2026.08',
    content: 'Complete systematic collection, classification, key-paper screening, close-reading report, and survey material-base construction.',
    deliverables: ['Literature repository', 'Research map', 'Reading slides', 'Survey material table'],
    tone: 'research',
  },
  {
    id: 'M2',
    title: 'Datasets and initial baselines completed',
    time: '2026.08–2026.09',
    content: 'Complete Silesia / Tencent dataset acquisition, storage organization, initial data checks, representative code reproduction, and preliminary algorithm comparison.',
    deliverables: ['Dataset note', 'Reproduction records', 'Preliminary experiment report'],
    tone: 'data',
  },
  {
    id: 'M3',
    title: 'Evaluation framework and algorithm prototype completed',
    time: '2026.09–2026.10',
    content: 'Complete metrics, baseline testing workflow, preprocessing scheme, and compression/decompression prototype closed loop.',
    deliverables: ['Evaluation document', 'Baseline scripts', 'Algorithm prototype', 'Partial survey draft'],
    tone: 'model',
  },
  {
    id: 'M4',
    title: 'Core model and system experiments completed',
    time: '2026.11–2027.02',
    content: 'Complete data-classification module, core compression model, system experiments on Silesia / Tencent datasets, block-granularity analysis, and complete survey draft.',
    deliverables: ['Compression model v2', 'System experiment report', 'Block-granularity report', 'Survey draft'],
    tone: 'experiment',
  },
  {
    id: 'M5',
    title: 'Compression-ratio and performance sprint completed',
    time: '2027.02–2027.04',
    content: 'Complete compression-ratio optimization, CPU/GPU throughput optimization, decompression correctness verification, integrated tests, research-paper draft, and patent disclosure review draft.',
    deliverables: ['Final performance report', 'Integrated test report', 'Research-paper draft', 'Patent disclosure review draft'],
    tone: 'achievement',
  },
  {
    id: 'M6',
    title: 'Demo, documents, and final acceptance materials completed',
    time: '2027.04–2027.06',
    content: 'Complete model-calling demo, source toolchain, test reports, paper submission materials, patent materials, and acceptance slides.',
    deliverables: ['Final delivery package', 'Demo', 'Acceptance slides', 'Paper submission package', 'Patent disclosure'],
    tone: 'delivery',
  },
];

export const RISK_ROWS_EN: RiskRow[] = [
  {
    risk: 'Customer dataset acquisition or authorization delay',
    trigger: 'Dataset entry, version, and storage plan are still not confirmed by the end of 2026.08.',
    impact: 'Affects Tencent dataset adaptation, system experiments, and final test coverage.',
    buffer: 'Use Silesia and public mixed datasets first to complete scripts, metrics, and baseline workflow; migrate the same evaluation protocol when customer data becomes available.',
    owner: 'Data and experiment lead',
    level: '高',
  },
  {
    risk: 'paq8px-1 and key baseline reproduction variance',
    trigger: 'Compression ratio, speed, or memory varies significantly across hardware or parameter settings.',
    impact: 'Affects contract-metric judgment and the credibility of research-paper comparisons.',
    buffer: 'Freeze versions, parameters, compiler options, and hardware configuration; keep rerun logs and data hashes; add confidence intervals or repeated-run statistics when needed.',
    owner: 'Experiment lead',
    level: '高',
  },
  {
    risk: 'Compression-ratio advantage is unstable',
    trigger: 'Some data types remain below paq8px-1 or the gain is insufficient to support the main research-paper conclusion.',
    impact: 'Affects the core technical target, paper contribution, and acceptance-material persuasiveness.',
    buffer: 'Analyze bottlenecks by data type and optimize preprocessing, context modeling, probability prediction, and coding strategies separately. Maintain high-ratio and speed-optimized versions.',
    owner: 'Algorithm lead',
    level: '高',
  },
  {
    risk: 'Throughput/latency optimization conflicts with compression ratio',
    trigger: 'The high-ratio version has excessive computation and fails to meet GPU/CPU performance targets.',
    impact: 'Affects engineering delivery and demo usability.',
    buffer: 'Maintain ratio-priority, balanced, and speed-priority versions and report scenario-specific tradeoffs rather than forcing one model to satisfy all metrics.',
    owner: 'System lead',
    level: '中',
  },
  {
    risk: 'Paper and patent disclosure order conflict',
    trigger: 'Research-paper submission materials are completed before patent disclosures and include protectable technical details.',
    impact: 'Affects patent novelty and output-transfer path.',
    buffer: 'Maintain an innovation ledger from 2026.10, perform patent disclosure checks before paper submission, and classify public materials into public, protect-first, and internal groups.',
    owner: 'Output lead',
    level: '中',
  },
  {
    risk: 'Final acceptance materials become fragmented',
    trigger: 'Source code, test reports, demo, papers, and patent materials are not indexed consistently before 2027.05.',
    impact: 'Affects final acceptance efficiency and later handoff maintenance.',
    buffer: 'Freeze the delivery directory structure from 2027.04 and bind each material to version, owner, acceptance evidence, and maintenance notes.',
    owner: 'Project lead',
    level: '中',
  },
];

export const QUICK_ANCHORS_EN = QUICK_ANCHORS.map((item, index) => ({
  ...item,
  label: ['Annual Plan', 'Outputs', 'Metrics', 'Gantt', 'Milestones', 'Risks'][index],
}));

