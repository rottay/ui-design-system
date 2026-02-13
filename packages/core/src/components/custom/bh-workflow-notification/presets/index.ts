/**
 * BhWorkflowNotification - All Presets
 */

import type { BhWorkflowNotificationPreset } from '../core';
import { ConfigBhWorkflowNotification } from './config';
import { CompactBhWorkflowNotification } from './compact';

export { ConfigBhWorkflowNotification } from './config';
export { CompactBhWorkflowNotification } from './compact';

export const BH_WORKFLOW_NOTIFICATION_PRESETS: Record<BhWorkflowNotificationPreset, React.ComponentType<any>> = {
  'config': ConfigBhWorkflowNotification,
  'compact': CompactBhWorkflowNotification,
};
