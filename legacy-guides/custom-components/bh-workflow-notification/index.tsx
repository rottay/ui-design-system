/**
 * BhWorkflowNotification - Main Export
 * Notification configuration for workflow triggers for BitHire ATS platform
 */

import type { BhWorkflowNotificationProps } from './core';
import { BH_WORKFLOW_NOTIFICATION_DEFAULTS } from './core';
import { BH_WORKFLOW_NOTIFICATION_PRESETS } from './presets';

export {
  type BhWorkflowNotificationProps,
  type BhWorkflowNotificationPreset,
  type NotificationRule,
  BH_WORKFLOW_NOTIFICATION_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhWorkflowNotification component
 * Renders the appropriate preset based on the preset prop
 */
export function BhWorkflowNotification(props: BhWorkflowNotificationProps): React.ReactElement {
  const preset = props.preset ?? BH_WORKFLOW_NOTIFICATION_DEFAULTS.preset ?? 'config';
  const PresetComponent = BH_WORKFLOW_NOTIFICATION_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhWorkflowNotification.displayName = 'BhWorkflowNotification';

export { ConfigBhWorkflowNotification, CompactBhWorkflowNotification } from './presets';
