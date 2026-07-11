import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('decoder-synchronization');
if (!concept) throw new Error('Missing concept: decoder-synchronization');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
