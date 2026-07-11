import React from 'react';
import {RouteDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {routeBySlug} from '../../../data/compressorSystem';

const route = routeBySlug('xz-lzma2');
if (!route) throw new Error('Missing route: xz-lzma2');

export default function Page(): React.ReactElement {
  return <RouteDetailPage route={route} />;
}
