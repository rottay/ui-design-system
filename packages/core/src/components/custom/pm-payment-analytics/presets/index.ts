/**
 * PmPaymentAnalytics - All Presets
 */

export { DashboardPmPaymentAnalytics } from './dashboard';
export { CompactPmPaymentAnalytics } from './compact';

import type { PmPaymentAnalyticsPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPaymentAnalyticsProps } from '../core';
import { DashboardPmPaymentAnalytics } from './dashboard';
import { CompactPmPaymentAnalytics } from './compact';

export const PM_PAYMENT_ANALYTICS_PRESETS: Record<PmPaymentAnalyticsPreset, ComponentType<PmPaymentAnalyticsProps>> = {
  dashboard: DashboardPmPaymentAnalytics,
  compact: CompactPmPaymentAnalytics,
};
