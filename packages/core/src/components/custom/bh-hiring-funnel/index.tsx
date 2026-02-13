/**
 * BhHiringFunnel - Main Export
 * Interactive funnel chart showing pipeline stages with click-to-drill
 */

import type { BhHiringFunnelProps } from './core';
import { BH_HIRING_FUNNEL_DEFAULTS } from './core';
import { BH_HIRING_FUNNEL_PRESETS } from './presets';

export {
  type BhHiringFunnelProps,
  type BhHiringFunnelPreset,
  type FunnelStage,
  BH_HIRING_FUNNEL_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhHiringFunnel component
 * Renders the appropriate preset based on the preset prop
 */
export function BhHiringFunnel(props: BhHiringFunnelProps): React.ReactElement {
  const preset = props.preset ?? BH_HIRING_FUNNEL_DEFAULTS.preset ?? 'funnel';
  const PresetComponent = BH_HIRING_FUNNEL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhHiringFunnel.displayName = 'BhHiringFunnel';
