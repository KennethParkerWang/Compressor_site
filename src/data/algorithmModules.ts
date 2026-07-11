import {compressionConcepts} from './compressorSystem';

export type ModuleStatus = 'spec';
export type ModuleCategory = 'input' | 'transform' | 'probability' | 'neural' | 'entropy' | 'io' | 'orchestration';

export interface AlgorithmModule {
  id: string;
  name: string;
  nameZh: string;
  category: ModuleCategory;
  problem: string;
  why: string;
  input: string;
  output: string;
  inputs: readonly string[];
  outputs: readonly string[];
  dependsOn: readonly string[];
  references: readonly string[];
  status: ModuleStatus;
  experimentStatus: 'todo';
  risk: 'low' | 'medium' | 'high';
  impact: readonly string[];
  alternatives: readonly string[];
  difficulty: 'intro' | 'medium' | 'hard';
  notes: string;
}

const categoryFor = (kind: string): ModuleCategory => {
  if (kind === 'transform') return 'transform';
  if (kind === 'model') return 'probability';
  if (kind === 'coder') return 'entropy';
  if (kind === 'format') return 'io';
  if (kind === 'evaluation') return 'orchestration';
  return 'input';
};

/**
 * Compatibility view for task search and the legacy homepage section.
 * These entries describe knowledge-map concepts only; they do not claim an
 * implementation, benchmark result, or verified project status.
 */
export const algorithmModules: readonly AlgorithmModule[] = compressionConcepts.map((concept) => ({
  id: concept.id,
  name: concept.slug,
  nameZh: concept.title.zh,
  category: concept.slug === 'neural-prediction' ? 'neural' : categoryFor(concept.kind),
  problem: concept.definition.zh,
  why: concept.short.zh,
  input: concept.input.zh,
  output: concept.output.zh,
  inputs: [concept.input.zh],
  outputs: [concept.output.zh],
  dependsOn: [],
  references: concept.usedBy,
  status: 'spec',
  experimentStatus: 'todo',
  risk: concept.role === 'research-branch' ? 'high' : concept.role === 'universal-constraint' ? 'low' : 'medium',
  impact: [],
  alternatives: concept.usedBy,
  difficulty: concept.role === 'research-branch' ? 'hard' : concept.role === 'universal-constraint' ? 'intro' : 'medium',
  notes: concept.failureModes[0]?.zh ?? '',
}));

export const moduleStatusLabels: Record<ModuleStatus, string> = {spec: '知识条目'};
export const experimentStatusLabels: Record<AlgorithmModule['experimentStatus'], string> = {todo: '未关联实验'};
export const categoryLabels: Record<ModuleCategory, string> = {
  input: '系统约束',
  transform: '可逆变换',
  probability: '概率建模',
  neural: '神经建模',
  entropy: '熵编码',
  io: '格式封装',
  orchestration: '评测方法',
};
export const pipelineOrder: readonly string[] = compressionConcepts.map((concept) => concept.id);

export default algorithmModules;
