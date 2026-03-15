/**
 * BhProctoringSeverity - Main Export
 * Interactive visualization of events grouped by severity
 */

import type { BhProctoringSeverityProps } from './core';
import { BH_PROCTORING_SEVERITY_DEFAULTS } from './core';
import { BH_PROCTORING_SEVERITY_PRESETS } from './presets';

export {
  type BhProctoringSeverityProps,
  type BhProctoringSeverityPreset,
  type ProctoringEventSeverity,
  type ProctoringEventSeverityValue,
  type SeverityCount,
  BH_PROCTORING_SEVERITY_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringSeverity component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringSeverity(props: BhProctoringSeverityProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_SEVERITY_DEFAULTS.preset ?? 'donut';
  const PresetComponent = BH_PROCTORING_SEVERITY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringSeverity.displayName = 'BhProctoringSeverity';

export { DonutBhProctoringSeverity, BarsBhProctoringSeverity } from './presets';
