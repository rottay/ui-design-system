/**
 * BhProctoringSeverity - All Presets
 */

import type { BhProctoringSeverityPreset } from '../core';
import { DonutBhProctoringSeverity } from './donut';
import { BarsBhProctoringSeverity } from './bars';

export { DonutBhProctoringSeverity } from './donut';
export { BarsBhProctoringSeverity } from './bars';

export const BH_PROCTORING_SEVERITY_PRESETS: Record<BhProctoringSeverityPreset, React.ComponentType<any>> = {
  'donut': DonutBhProctoringSeverity,
  'bars': BarsBhProctoringSeverity,
};
