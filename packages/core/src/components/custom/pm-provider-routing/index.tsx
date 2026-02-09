/**
 * PmProviderRouting - Main Export
 * Configure payment routing rules based on currency, amount, region, and provider
 */

import type { PmProviderRoutingProps } from './core';
import { PM_PROVIDER_ROUTING_DEFAULTS } from './core';
import { PM_PROVIDER_ROUTING_PRESETS } from './presets';

export { type PmProviderRoutingProps, type PmProviderRoutingPreset, PM_PROVIDER_ROUTING_DEFAULTS } from './core';
export * from './presets';

export function PmProviderRouting(props: PmProviderRoutingProps): React.ReactElement {
  const preset = props.preset ?? PM_PROVIDER_ROUTING_DEFAULTS.preset ?? 'editor';
  const PresetComponent = PM_PROVIDER_ROUTING_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmProviderRouting.displayName = 'PmProviderRouting';
