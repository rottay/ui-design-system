/**
 * BhScorecardDetail - All Presets
 */

import type { BhScorecardDetailPreset } from '../core';
import { PanelBhScorecardDetail } from './panel';
import { CompactBhScorecardDetail } from './compact';
import { FullBhScorecardDetail } from './full';
import { SummaryBhScorecardDetail } from './summary';

export { PanelBhScorecardDetail } from './panel';
export { CompactBhScorecardDetail } from './compact';
export { FullBhScorecardDetail } from './full';
export { SummaryBhScorecardDetail } from './summary';

export const BH_SCORECARD_DETAIL_PRESETS: Record<BhScorecardDetailPreset, React.ComponentType<any>> = {
  'panel': PanelBhScorecardDetail,
  'compact': CompactBhScorecardDetail,
  'full': FullBhScorecardDetail,
  'summary': SummaryBhScorecardDetail,
};
