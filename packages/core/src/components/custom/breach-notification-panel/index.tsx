/**
 * BreachNotificationPanel - Main Export
 * Automatically selects preset based on props
 */

import type { BreachNotificationPanelProps } from './core';
import { BREACH_NOTIFICATION_PANEL_DEFAULTS } from './core';
import { BREACH_NOTIFICATION_PANEL_PRESETS } from './presets';

export { type BreachNotificationPanelProps, type BreachNotificationPanelPreset, type BreachIncident, type BreachNotification, type BreachTimelineEvent, type BreachSeverity, type BreachStatus, type BreachCategory, type AffectedData, BREACH_NOTIFICATION_PANEL_DEFAULTS } from './core';
export { getBreachSeverityColors, getBreachStatusColors, getCategoryLabel } from './core';
export * from './presets';

/**
 * BreachNotificationPanel component
 * Renders the appropriate preset based on the preset prop
 */
export function BreachNotificationPanel(props: BreachNotificationPanelProps): React.ReactElement {
  const preset = props.preset ?? BREACH_NOTIFICATION_PANEL_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BREACH_NOTIFICATION_PANEL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BreachNotificationPanel.displayName = 'BreachNotificationPanel';

export { TimelineBreachNotificationPanel, NotificationBreachNotificationPanel, SummaryBreachNotificationPanel } from './presets';
