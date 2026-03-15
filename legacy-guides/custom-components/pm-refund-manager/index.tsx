/**
 * PmRefundManager - Main Export
 * Process and track refunds with reason codes, approval workflows, and status
 */

import type { PmRefundManagerProps } from './core';
import { PM_REFUND_MANAGER_DEFAULTS } from './core';
import { PM_REFUND_MANAGER_PRESETS } from './presets';

export { type PmRefundManagerProps, type PmRefundManagerPreset, PM_REFUND_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PmRefundManager(props: PmRefundManagerProps): React.ReactElement {
  const preset = props.preset ?? PM_REFUND_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PM_REFUND_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmRefundManager.displayName = 'PmRefundManager';
