/**
 * BhProctoringSeverity - All Presets
 */

import type { BhProctoringSeverityPreset, BhProctoringSeverityProps } from '../core';
import type { ComponentType } from 'react';
import { DonutBhProctoringSeverity } from './donut';
import { BarsBhProctoringSeverity } from './bars';

export { DonutBhProctoringSeverity } from './donut';
export { BarsBhProctoringSeverity } from './bars';

export const BH_PROCTORING_SEVERITY_PRESETS: Record<BhProctoringSeverityPreset, ComponentType<BhProctoringSeverityProps>> = {
  'donut': DonutBhProctoringSeverity,
  'bars': BarsBhProctoringSeverity,
};
