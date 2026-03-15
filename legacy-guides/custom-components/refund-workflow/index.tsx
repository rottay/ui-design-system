/**
 * RefundWorkflow - Main Export
 * Automatically selects preset based on props
 */

import type { RefundWorkflowProps } from './core';
import { REFUND_WORKFLOW_DEFAULTS } from './core';
import { REFUND_WORKFLOW_PRESETS } from './presets';

export {
  type RefundWorkflowProps,
  type RefundWorkflowPreset,
  type RefundRequest,
  type RefundStatus,
  type RefundReason,
  REFUND_WORKFLOW_DEFAULTS,
} from './core';
export { getRefundStatusColors, getReasonLabel, formatCurrency } from './core';
export * from './presets';

/**
 * RefundWorkflow component
 * Renders the appropriate preset based on the preset prop
 */
export function RefundWorkflow(props: RefundWorkflowProps): React.ReactElement {
  const preset = props.preset ?? REFUND_WORKFLOW_DEFAULTS.preset ?? 'queue';
  const PresetComponent = REFUND_WORKFLOW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

RefundWorkflow.displayName = 'RefundWorkflow';

export { QueueRefundWorkflow, DetailRefundWorkflow } from './presets';
