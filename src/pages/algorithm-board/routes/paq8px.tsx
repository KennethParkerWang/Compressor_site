import React from 'react';
import {RouteDetailPage} from '../../../components/compression-system/CompressionDetailPage';
import {routeBySlug} from '../../../data/compressorSystem';

const route = routeBySlug('paq8px');
if (!route) throw new Error('Missing route: paq8px');

export default function Page(): React.ReactElement {
  return <RouteDetailPage route={route} />;
}
