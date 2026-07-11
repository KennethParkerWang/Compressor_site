import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('blocking-streaming');
if (!concept) throw new Error('Missing concept: blocking-streaming');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
