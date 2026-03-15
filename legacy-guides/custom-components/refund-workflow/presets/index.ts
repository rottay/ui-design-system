/**
 * RefundWorkflow - All Presets
 */

import type { RefundWorkflowPreset } from '../core';
import type { ComponentType } from 'react';
import type { RefundWorkflowProps } from '../core';
import { QueueRefundWorkflow } from './queue';
import { DetailRefundWorkflow } from './detail';

export { QueueRefundWorkflow } from './queue';
export { DetailRefundWorkflow } from './detail';

export const REFUND_WORKFLOW_PRESETS: Record<RefundWorkflowPreset, ComponentType<RefundWorkflowProps>> = {
  queue: QueueRefundWorkflow,
  detail: DetailRefundWorkflow,
};
