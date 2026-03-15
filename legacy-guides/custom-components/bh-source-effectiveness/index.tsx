/**
 * BhSourceEffectiveness - Main Export
 * Grouped bars for volume+quality with line for hire rate
 */

import type { BhSourceEffectivenessProps } from './core';
import { BH_SOURCE_EFFECTIVENESS_DEFAULTS } from './core';
import { BH_SOURCE_EFFECTIVENESS_PRESETS } from './presets';

export {
  type BhSourceEffectivenessProps,
  type BhSourceEffectivenessPreset,
  type SourceMetrics,
  BH_SOURCE_EFFECTIVENESS_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhSourceEffectiveness component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSourceEffectiveness(props: BhSourceEffectivenessProps): React.ReactElement {
  const preset = props.preset ?? BH_SOURCE_EFFECTIVENESS_DEFAULTS.preset ?? 'detailed';
  const PresetComponent = BH_SOURCE_EFFECTIVENESS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSourceEffectiveness.displayName = 'BhSourceEffectiveness';
