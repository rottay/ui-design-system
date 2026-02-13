/**
 * BhGeographicMap - All Presets
 */

import type { BhGeographicMapPreset } from '../core';
import { MapBhGeographicMap } from './map';
import { CompactBhGeographicMap } from './compact';

export { MapBhGeographicMap } from './map';
export { CompactBhGeographicMap } from './compact';

export const BH_GEOGRAPHIC_MAP_PRESETS: Record<BhGeographicMapPreset, React.ComponentType<any>> = {
  'map': MapBhGeographicMap,
  'compact': CompactBhGeographicMap,
};
