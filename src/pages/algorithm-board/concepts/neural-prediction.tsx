import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('neural-prediction');
if (!concept) throw new Error('Missing concept: neural-prediction');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
