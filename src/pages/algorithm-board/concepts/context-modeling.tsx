import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('context-modeling');
if (!concept) throw new Error('Missing concept: context-modeling');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
