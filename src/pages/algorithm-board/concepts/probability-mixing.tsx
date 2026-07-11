import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('probability-mixing');
if (!concept) throw new Error('Missing concept: probability-mixing');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
