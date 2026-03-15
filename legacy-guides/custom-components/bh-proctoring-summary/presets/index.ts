/**
 * BhProctoringSummary - All Presets
 */

import type { BhProctoringSummaryPreset, BhProctoringSummaryProps } from '../core';
import type { ComponentType } from 'react';
import { CardBhProctoringSummary } from './card';
import { InlineBhProctoringSummary } from './inline';

export { CardBhProctoringSummary } from './card';
export { InlineBhProctoringSummary } from './inline';

export const BH_PROCTORING_SUMMARY_PRESETS: Record<BhProctoringSummaryPreset, ComponentType<BhProctoringSummaryProps>> = {
  'card': CardBhProctoringSummary,
  'inline': InlineBhProctoringSummary,
};
