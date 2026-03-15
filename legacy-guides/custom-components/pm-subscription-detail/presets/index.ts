/**
 * PmSubscriptionDetail - All Presets
 */

export { PanelPmSubscriptionDetail } from './panel';
export { TimelinePmSubscriptionDetail } from './timeline';

import type { PmSubscriptionDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmSubscriptionDetailProps } from '../core';
import { PanelPmSubscriptionDetail } from './panel';
import { TimelinePmSubscriptionDetail } from './timeline';

export const PM_SUBSCRIPTION_DETAIL_PRESETS: Record<PmSubscriptionDetailPreset, ComponentType<PmSubscriptionDetailProps>> = {
  panel: PanelPmSubscriptionDetail,
  timeline: TimelinePmSubscriptionDetail,
};
