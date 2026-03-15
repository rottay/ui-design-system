/**
 * BhWorkflowNotification - All Presets
 */

import type { BhWorkflowNotificationPreset, BhWorkflowNotificationProps } from '../core';
import type { ComponentType } from 'react';
import { ConfigBhWorkflowNotification } from './config';
import { CompactBhWorkflowNotification } from './compact';

export { ConfigBhWorkflowNotification } from './config';
export { CompactBhWorkflowNotification } from './compact';

export const BH_WORKFLOW_NOTIFICATION_PRESETS: Record<BhWorkflowNotificationPreset, ComponentType<BhWorkflowNotificationProps>> = {
  'config': ConfigBhWorkflowNotification,
  'compact': CompactBhWorkflowNotification,
};
