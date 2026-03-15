/**
 * BhGeographicMap - All Presets
 */

import type { BhGeographicMapPreset, BhGeographicMapProps } from '../core';
import type { ComponentType } from 'react';
import { MapBhGeographicMap } from './map';
import { CompactBhGeographicMap } from './compact';

export { MapBhGeographicMap } from './map';
export { CompactBhGeographicMap } from './compact';

export const BH_GEOGRAPHIC_MAP_PRESETS: Record<BhGeographicMapPreset, ComponentType<BhGeographicMapProps>> = {
  'map': MapBhGeographicMap,
  'compact': CompactBhGeographicMap,
};
