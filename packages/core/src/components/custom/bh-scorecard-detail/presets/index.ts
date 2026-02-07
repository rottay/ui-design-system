/**
 * BhScorecardDetail - All Presets
 */

import type { BhScorecardDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhScorecardDetailProps } from '../core';
import { FullBhScorecardDetail } from './full';
import { SummaryBhScorecardDetail } from './summary';

export { FullBhScorecardDetail } from './full';
export { SummaryBhScorecardDetail } from './summary';

export const BH_SCORECARD_DETAIL_PRESETS: Record<BhScorecardDetailPreset, ComponentType<BhScorecardDetailProps>> = {
  full: FullBhScorecardDetail,
  summary: SummaryBhScorecardDetail,
};
