/**
 * StaffEvaluations - Main Export
 * Performance review form with ratings and radar chart visualization
 */

import type { StaffEvaluationsProps } from './core';
import { STAFF_EVALUATIONS_DEFAULTS } from './core';
import { STAFF_EVALUATIONS_PRESETS } from './presets';

export {
  type StaffEvaluationsProps,
  type StaffEvaluationsPreset,
  type EvaluationRecord,
  type EvaluationCategory,
  STAFF_EVALUATIONS_DEFAULTS,
} from './core';
export * from './presets';

export function StaffEvaluations(props: StaffEvaluationsProps): React.ReactElement {
  const preset = props.preset ?? STAFF_EVALUATIONS_DEFAULTS.preset ?? 'form';
  const PresetComponent = STAFF_EVALUATIONS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffEvaluations.displayName = 'StaffEvaluations';

export { FormStaffEvaluations, SummaryStaffEvaluations } from './presets';
