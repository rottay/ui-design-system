'use client';

/**
 * MapView<T> - Pattern Component
 *
 * Placeholder map container with marker list display.
 * Designed to be extended with Leaflet/Mapbox by consumers.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { MapViewProps } from './types';

export type { MapViewProps, MapMarker } from './types';

export const PatternMapView = createEngineComponent<MapViewProps<any>>(
  'PatternMapView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
