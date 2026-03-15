/**
 * PmRevenueDashboard - All Presets
 */

export { DashboardPmRevenueDashboard } from './dashboard';
export { ReportPmRevenueDashboard } from './report';

import type { PmRevenueDashboardPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmRevenueDashboardProps } from '../core';
import { DashboardPmRevenueDashboard } from './dashboard';
import { ReportPmRevenueDashboard } from './report';

export const PM_REVENUE_DASHBOARD_PRESETS: Record<PmRevenueDashboardPreset, ComponentType<PmRevenueDashboardProps>> = {
  dashboard: DashboardPmRevenueDashboard,
  report: ReportPmRevenueDashboard,
};
