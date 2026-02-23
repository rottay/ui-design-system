/**
 * BhApprovalQueue - All Presets
 */

import type { BhApprovalQueuePreset, BhApprovalQueueProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhApprovalQueue } from './standard';

export { StandardBhApprovalQueue } from './standard';

export const BH_APPROVAL_QUEUE_PRESETS: Record<BhApprovalQueuePreset, ComponentType<BhApprovalQueueProps>> = {
  standard: StandardBhApprovalQueue,
};
