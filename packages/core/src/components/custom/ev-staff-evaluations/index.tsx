/**
 * EvStaffEvaluations - Main Export
 * Staff evaluation/review system
 * Automatically selects preset based on props
 */

import type { EvStaffEvaluationsProps } from './core';
import { EV_STAFF_EVALUATIONS_DEFAULTS } from './core';
import { EV_STAFF_EVALUATIONS_PRESETS } from './presets';

export {
  type EvStaffEvaluationsProps,
  type EvStaffEvaluationsPreset,
  type EvaluationRecord as EvStaffEvaluationsEvaluationRecord,
  type EvaluationForm as EvStaffEvaluationsEvaluationForm,
  EV_STAFF_EVALUATIONS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvStaffEvaluations component
 * Renders the appropriate preset based on the preset prop
 */
export function EvStaffEvaluations(props: EvStaffEvaluationsProps): React.ReactElement {
  const preset = props.preset ?? EV_STAFF_EVALUATIONS_DEFAULTS.preset ?? 'form';
  const PresetComponent = EV_STAFF_EVALUATIONS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvStaffEvaluations.displayName = 'EvStaffEvaluations';

export { FormEvStaffEvaluations, SummaryEvStaffEvaluations } from './presets';
