/**
 * ConsentDashboard - Main Export
 * Automatically selects preset based on props
 */

import type { ConsentDashboardProps } from './core';
import { CONSENT_DASHBOARD_DEFAULTS } from './core';
import { CONSENT_DASHBOARD_PRESETS } from './presets';

export { type ConsentDashboardProps, type ConsentDashboardPreset, type ConsentRecord, type ConsentAuditEntry, type ConsentSummary, type ConsentStatus, type ConsentPurpose, CONSENT_DASHBOARD_DEFAULTS } from './core';
export { getConsentStatusColors, getPurposeIcon } from './core';
export * from './presets';

/**
 * ConsentDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function ConsentDashboard(props: ConsentDashboardProps): React.ReactElement {
  const preset = props.preset ?? CONSENT_DASHBOARD_DEFAULTS.preset ?? 'overview';
  const PresetComponent = CONSENT_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

ConsentDashboard.displayName = 'ConsentDashboard';

export { OverviewConsentDashboard, ManagerConsentDashboard, AuditConsentDashboard } from './presets';
