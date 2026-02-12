/**
 * StaffEvaluations - All Presets
 */

export { FormStaffEvaluations } from './form';
export { SummaryStaffEvaluations } from './summary';

import type { StaffEvaluationsPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffEvaluationsProps } from '../core';
import { FormStaffEvaluations } from './form';
import { SummaryStaffEvaluations } from './summary';

export const STAFF_EVALUATIONS_PRESETS: Record<StaffEvaluationsPreset, ComponentType<StaffEvaluationsProps>> = {
  form: FormStaffEvaluations,
  summary: SummaryStaffEvaluations,
};
