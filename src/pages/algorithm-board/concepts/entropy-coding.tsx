import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('entropy-coding');
if (!concept) throw new Error('Missing concept: entropy-coding');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
