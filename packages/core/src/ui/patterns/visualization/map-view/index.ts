'use client';

/**
 * @fileoverview MapView pattern -- engine-aware placeholder map container
 * with marker list display. Designed for Leaflet/Mapbox extension by consumers.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { MapViewProps } from './contracts';

export type { MapViewProps, MapMarker } from './contracts';

export const PatternMapView = createEngineComponent<MapViewProps<any>>(
  'PatternMapView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
