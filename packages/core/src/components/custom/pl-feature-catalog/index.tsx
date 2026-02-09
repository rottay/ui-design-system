/**
 * PlFeatureCatalog - Main Export
 * Browse and manage all feature flags with status, targeting rules, and usage stats
 */

import type { PlFeatureCatalogProps } from './core';
import { PL_FEATURE_CATALOG_DEFAULTS } from './core';
import { PL_FEATURE_CATALOG_PRESETS } from './presets';

export { type PlFeatureCatalogProps, type PlFeatureCatalogPreset, PL_FEATURE_CATALOG_DEFAULTS } from './core';
export * from './presets';

export function PlFeatureCatalog(props: PlFeatureCatalogProps): React.ReactElement {
  const preset = props.preset ?? PL_FEATURE_CATALOG_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_FEATURE_CATALOG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlFeatureCatalog.displayName = 'PlFeatureCatalog';
