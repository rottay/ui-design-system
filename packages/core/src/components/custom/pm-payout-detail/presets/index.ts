/**
 * PmPayoutDetail - All Presets
 */

export { PanelPmPayoutDetail } from './panel';
export { TimelinePmPayoutDetail } from './timeline';

import type { PmPayoutDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPayoutDetailProps } from '../core';
import { PanelPmPayoutDetail } from './panel';
import { TimelinePmPayoutDetail } from './timeline';

export const PM_PAYOUT_DETAIL_PRESETS: Record<PmPayoutDetailPreset, ComponentType<PmPayoutDetailProps>> = {
  panel: PanelPmPayoutDetail,
  timeline: TimelinePmPayoutDetail,
};
