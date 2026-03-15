/**
 * BhGeographicMap - Main Export
 * Candidate geographic distribution visualization for BitHire ATS platform
 */

import type { BhGeographicMapProps } from './core';
import { BH_GEOGRAPHIC_MAP_DEFAULTS } from './core';
import { BH_GEOGRAPHIC_MAP_PRESETS } from './presets';

export {
  type BhGeographicMapProps,
  type BhGeographicMapPreset,
  type GeoRegion,
  BH_GEOGRAPHIC_MAP_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhGeographicMap component
 * Renders the appropriate preset based on the preset prop
 */
export function BhGeographicMap(props: BhGeographicMapProps): React.ReactElement {
  const preset = props.preset ?? BH_GEOGRAPHIC_MAP_DEFAULTS.preset ?? 'map';
  const PresetComponent = BH_GEOGRAPHIC_MAP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhGeographicMap.displayName = 'BhGeographicMap';

export { MapBhGeographicMap, CompactBhGeographicMap } from './presets';
