import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('reversible-transforms');
if (!concept) throw new Error('Missing concept: reversible-transforms');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
