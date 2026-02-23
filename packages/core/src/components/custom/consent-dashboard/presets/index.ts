/**
 * ConsentDashboard - All Presets
 */

import type { ConsentDashboardPreset, ConsentDashboardProps } from '../core';
import type { ComponentType } from 'react';
import { OverviewConsentDashboard } from './overview';
import { ManagerConsentDashboard } from './manager';
import { AuditConsentDashboard } from './audit';

export { OverviewConsentDashboard } from './overview';
export { ManagerConsentDashboard } from './manager';
export { AuditConsentDashboard } from './audit';

export const CONSENT_DASHBOARD_PRESETS: Record<ConsentDashboardPreset, ComponentType<ConsentDashboardProps>> = {
  overview: OverviewConsentDashboard,
  manager: ManagerConsentDashboard,
  audit: AuditConsentDashboard,
};
