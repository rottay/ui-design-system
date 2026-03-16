'use client';

/**
 * @fileoverview MapView pattern -- engine-aware placeholder map container
 * with marker list display. Designed for Leaflet/Mapbox extension by consumers.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { MapViewProps } from './MapView.types';

export type { MapViewProps, MapMarker } from './MapView.types';

export const PatternMapView = createEngineComponent<MapViewProps<any>>(
  'PatternMapView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
