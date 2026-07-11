import React from 'react';
import {ConceptDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {conceptBySlug} from '../../../data/compressorSystem';

const concept = conceptBySlug('dictionary-parsing');
if (!concept) throw new Error('Missing concept: dictionary-parsing');

export default function Page(): React.ReactElement {
  return <ConceptDetailPage concept={concept} />;
}
