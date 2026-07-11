import React from 'react';
import {RouteDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {routeBySlug} from '../../../data/compressorSystem';

const route = routeBySlug('cmix');
if (!route) throw new Error('Missing route: cmix');

export default function Page(): React.ReactElement {
  return <RouteDetailPage route={route} />;
}
