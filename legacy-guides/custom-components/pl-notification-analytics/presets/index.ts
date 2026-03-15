/**
 * PlNotificationAnalytics - All Presets
 */

export { DashboardPlNotificationAnalytics } from './dashboard';
export { ReportPlNotificationAnalytics } from './report';

import type { PlNotificationAnalyticsPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlNotificationAnalyticsProps } from '../core';
import { DashboardPlNotificationAnalytics } from './dashboard';
import { ReportPlNotificationAnalytics } from './report';

export const PL_NOTIFICATION_ANALYTICS_PRESETS: Record<PlNotificationAnalyticsPreset, ComponentType<PlNotificationAnalyticsProps>> = {
  dashboard: DashboardPlNotificationAnalytics,
  report: ReportPlNotificationAnalytics,
};
