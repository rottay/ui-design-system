/**
 * EvStaffEvaluations - All Presets
 */

export { FormEvStaffEvaluations } from './form';
export { SummaryEvStaffEvaluations } from './summary';

import type { EvStaffEvaluationsPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvStaffEvaluationsProps } from '../core';
import { FormEvStaffEvaluations } from './form';
import { SummaryEvStaffEvaluations } from './summary';

export const EV_STAFF_EVALUATIONS_PRESETS: Record<EvStaffEvaluationsPreset, ComponentType<EvStaffEvaluationsProps>> = {
  form: FormEvStaffEvaluations,
  summary: SummaryEvStaffEvaluations,
};
