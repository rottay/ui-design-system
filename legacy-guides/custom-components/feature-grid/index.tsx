/**
 * FeatureGrid - Main Export
 */

import type { FeatureGridProps } from './core';
import { FEATURE_GRID_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { FeatureGridProps, FeatureGridPreset, FeatureItem } from './core';
export { FEATURE_GRID_DEFAULTS } from './core';

export function FeatureGrid(props: FeatureGridProps): React.ReactElement {
  const preset = props.preset ?? FEATURE_GRID_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

FeatureGrid.displayName = 'FeatureGrid';
