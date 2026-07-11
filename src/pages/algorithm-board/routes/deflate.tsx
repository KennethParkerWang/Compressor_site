import React from 'react';
import {RouteDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {routeBySlug} from '../../../data/compressorSystem';

const route = routeBySlug('deflate');
if (!route) throw new Error('Missing route: deflate');

export default function Page(): React.ReactElement {
  return <RouteDetailPage route={route} />;
}
