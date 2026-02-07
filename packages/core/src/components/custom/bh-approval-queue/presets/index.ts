/**
 * BhApprovalQueue - All Presets
 */

import type { BhApprovalQueuePreset } from '../core';
import { StandardBhApprovalQueue } from './standard';

export { StandardBhApprovalQueue } from './standard';

export const BH_APPROVAL_QUEUE_PRESETS: Record<BhApprovalQueuePreset, React.ComponentType<any>> = {
  standard: StandardBhApprovalQueue,
};
