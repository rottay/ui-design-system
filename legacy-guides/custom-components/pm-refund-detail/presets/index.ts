/**
 * PmRefundDetail - All Presets
 */

export { PanelPmRefundDetail } from './panel';
export { TimelinePmRefundDetail } from './timeline';

import type { PmRefundDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmRefundDetailProps } from '../core';
import { PanelPmRefundDetail } from './panel';
import { TimelinePmRefundDetail } from './timeline';

export const PM_REFUND_DETAIL_PRESETS: Record<PmRefundDetailPreset, ComponentType<PmRefundDetailProps>> = {
  panel: PanelPmRefundDetail,
  timeline: TimelinePmRefundDetail,
};
