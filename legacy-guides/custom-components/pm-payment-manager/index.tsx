/**
 * PmPaymentManager - Main Export
 * Manage payments with filtering, status tracking, and batch operations
 */

import type { PmPaymentManagerProps } from './core';
import { PM_PAYMENT_MANAGER_DEFAULTS } from './core';
import { PM_PAYMENT_MANAGER_PRESETS } from './presets';

export { type PmPaymentManagerProps, type PmPaymentManagerPreset, PM_PAYMENT_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PmPaymentManager(props: PmPaymentManagerProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYMENT_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PM_PAYMENT_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPaymentManager.displayName = 'PmPaymentManager';
