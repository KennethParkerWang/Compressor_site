'use client';
import React, {useMemo, useCallback, useEffect} from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {treeData} from '../../data/treeData';
import styles from './ResearchMapFlow.module.css';

interface ChapterData {
  label: string;
  id: string;
  litCount: number;
  isChapter: boolean;
  [key: string]: unknown;
}

function ChapterNode({data}: NodeProps): React.ReactElement {
  const d = data as unknown as ChapterData;
  return (
    <div
      className={`${styles.node} ${d.isChapter ? styles.chapterNode : styles.sectionNode}`}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <span className={styles.nodeId}>{d.id}</span>
      <span className={styles.nodeLabel}>{d.label}</span>
      <span className={styles.nodeMeta}>{d.litCount} �?/span>
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}

const nodeTypes = {chapter: ChapterNode};

function buildGraph(): {nodes: Node[]; edges: Edge[]} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 章节按列布局:每章一�?每列内部 section 垂直�?  treeData.forEach((chapter, colIdx) => {
    nodes.push({
      id: chapter.id,
      type: 'chapter',
      position: {x: colIdx * 280, y: 0},
      data: {
        id: chapter.id,
        label: chapter.titleZh,
        litCount: chapter.literatureCount,
        isChapter: true,
      },
    });
    if (chapter.children) {
      chapter.children.forEach((section, sIdx) => {
        nodes.push({
          id: section.id,
          type: 'chapter',
          position: {x: colIdx * 280, y: 90 + sIdx * 70},
          data: {
            id: section.id,
            label: section.titleZh,
            litCount: section.literatureCount,
            isChapter: false,
          },
        });
        edges.push({
          id: `${chapter.id}->${section.id}`,
          source: chapter.id,
          target: section.id,
          animated: false,
          style: {stroke: 'var(--ifm-color-emphasis-300)', strokeWidth: 1},
        });
      });
    }
  });

  // 跨章节弱关联(相邻章节用虚线连表示顺序)
  for (let i = 0; i < treeData.length - 1; i++) {
    const a = treeData[i];
    const b = treeData[i + 1];
    edges.push({
      id: `${a.id}~${b.id}`,
      source: `${a.id}`,
      target: `${b.id}`,
      label: '�?,
      labelStyle: {fill: 'var(--ifm-color-emphasis-500)', fontSize: 11},
      style: {stroke: 'var(--ifm-color-primary)', strokeWidth: 1, strokeDasharray: '4 4'},
      type: 'straight',
    });
  }
  return {nodes, edges};
}

function FlowInner(): React.ReactElement {
  const {fitView} = useReactFlow();
  const {nodes, edges} = useMemo(buildGraph, []);

  useEffect(() => {
    fitView({padding: 0.15, duration: 300});
  }, [fitView]);

  const onInit = useCallback(() => fitView({padding: 0.15}), [fitView]);

  return (
    <div className={styles.flow}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        proOptions={{hideAttribution: true}}
        minZoom={0.2}
        maxZoom={1.6}
        fitView
      >
        <Background gap={24} size={1} />
        <Controls position="bottom-right" />
        <MiniMap pannable zoomable className={styles.minimap} />
      </ReactFlow>
    </div>
  );
}

export default function ResearchMapFlow(): React.ReactElement {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}