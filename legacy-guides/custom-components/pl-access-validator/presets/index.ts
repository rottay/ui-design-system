/**
 * PlAccessValidator - All Presets
 */

export { CheckerPlAccessValidator } from './checker';
export { ReportPlAccessValidator } from './report';

import type { PlAccessValidatorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlAccessValidatorProps } from '../core';
import { CheckerPlAccessValidator } from './checker';
import { ReportPlAccessValidator } from './report';

export const PL_ACCESS_VALIDATOR_PRESETS: Record<PlAccessValidatorPreset, ComponentType<PlAccessValidatorProps>> = {
  checker: CheckerPlAccessValidator,
  report: ReportPlAccessValidator,
};
