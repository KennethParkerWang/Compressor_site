import React, {useMemo, useState} from 'react';
import {Background, Controls, Handle, MiniMap, Position, ReactFlow, type Edge, type Node, type NodeProps} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {evolutionNodes} from '../../data/algorithmEvolution';
import styles from './resourcesPrototype.module.css';

type LineageData = {title: string; year: number; lane: string; role: string};

const selectedIds = ['shannon', 'huffman', 'lz77', 'lz78', 'deflate', 'bwt', 'paq', 'zstd', 'cmix', 'nncp'];

function LineageNode({data, selected}: NodeProps<Node<LineageData>>) {
  return (
    <article className={styles.lineageNode} data-selected={selected}>
      <Handle type="target" position={Position.Left} />
      <span>{data.year}</span><b>{data.title}</b><small>{data.lane}</small>
      <Handle type="source" position={Position.Right} />
    </article>
  );
}

export function AlgorithmLineage() {
  const [lane, setLane] = useState('all');
  const chosen = useMemo(() => {
    const direct = evolutionNodes.filter((item) => selectedIds.some((id) => item.id.toLowerCase().includes(id) || item.title.toLowerCase().includes(id)));
    const base = direct.length >= 6 ? direct : evolutionNodes.filter((item) => ['theory', 'entropy', 'dictionary', 'context', 'industrial', 'neural'].includes(item.lane)).slice(0, 18);
    return lane === 'all' ? base : base.filter((item) => item.lane === lane);
  }, [lane]);
  const nodes: Node<LineageData>[] = chosen.map((item, index) => ({
    id: item.id,
    type: 'lineage',
    position: {x: (item.year - 1940) * 10, y: (index % 5) * 110},
    data: {title: item.title, year: item.year, lane: item.lane, role: item.role},
  }));
  const ids = new Set(nodes.map((node) => node.id));
  const edges: Edge[] = chosen.flatMap((item) => item.influences.filter((target) => ids.has(target)).map((target) => ({
    id: `${item.id}-${target}`, source: item.id, target, animated: true, style: {stroke: '#2b6d55'},
  })));
  return (
    <div className={styles.lineageWrap}>
      <div className={styles.lineageFilters}>
        {['all', 'dictionary', 'context', 'industrial', 'neural'].map((item) => <button key={item} type="button" data-active={lane === item} onClick={() => setLane(item)}>{item}</button>)}
      </div>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={{lineage: LineageNode}} fitView minZoom={.25} maxZoom={1.8}>
        <Background color="#c9d0ca" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor="#2b6d55" maskColor="rgba(236,239,232,.7)" />
      </ReactFlow>
    </div>
  );
}
