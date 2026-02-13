/**
 * BhProctoringSummary - All Presets
 */

import type { BhProctoringSummaryPreset } from '../core';
import { CardBhProctoringSummary } from './card';
import { InlineBhProctoringSummary } from './inline';

export { CardBhProctoringSummary } from './card';
export { InlineBhProctoringSummary } from './inline';

export const BH_PROCTORING_SUMMARY_PRESETS: Record<BhProctoringSummaryPreset, React.ComponentType<any>> = {
  'card': CardBhProctoringSummary,
  'inline': InlineBhProctoringSummary,
};
