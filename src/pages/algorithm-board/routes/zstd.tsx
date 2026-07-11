import React from 'react';
import {RouteDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {routeBySlug} from '../../../data/compressorSystem';

const route = routeBySlug('zstd');
if (!route) throw new Error('Missing route: zstd');

export default function Page(): React.ReactElement {
  return <RouteDetailPage route={route} />;
}
