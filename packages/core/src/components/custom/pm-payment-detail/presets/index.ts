/**
 * PmPaymentDetail - All Presets
 */

export { PanelPmPaymentDetail } from './panel';
export { TimelinePmPaymentDetail } from './timeline';

import type { PmPaymentDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPaymentDetailProps } from '../core';
import { PanelPmPaymentDetail } from './panel';
import { TimelinePmPaymentDetail } from './timeline';

export const PM_PAYMENT_DETAIL_PRESETS: Record<PmPaymentDetailPreset, ComponentType<PmPaymentDetailProps>> = {
  panel: PanelPmPaymentDetail,
  timeline: TimelinePmPaymentDetail,
};
