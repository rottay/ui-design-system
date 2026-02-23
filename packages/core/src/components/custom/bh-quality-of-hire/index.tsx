/**
 * BhQualityOfHire - Main Export
 * Dashboard widget tracking quality of hire metrics and recent hire performance.
 */

import type { BhQualityOfHireProps } from './core';
import { BH_QUALITY_OF_HIRE_DEFAULTS } from './core';
import { BH_QUALITY_OF_HIRE_PRESETS } from './presets';

export {
  type BhQualityOfHireProps,
  type BhQualityOfHirePreset,
  type QualityOfHireData,
  type HireQuality,
  type QohDimension,
  BH_QUALITY_OF_HIRE_DEFAULTS,
} from './core';
export * from './presets';

export function BhQualityOfHire(props: BhQualityOfHireProps): React.ReactElement {
  const preset = props.preset ?? BH_QUALITY_OF_HIRE_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_QUALITY_OF_HIRE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhQualityOfHire.displayName = 'BhQualityOfHire';

export { CompactBhQualityOfHire } from './presets';
