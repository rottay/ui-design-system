/**
 * PmPaymentStatus - Main Export
 * Track payment processing status through authorization, capture, and settlement
 */

import type { PmPaymentStatusProps } from './core';
import { PM_PAYMENT_STATUS_DEFAULTS } from './core';
import { PM_PAYMENT_STATUS_PRESETS } from './presets';

export { type PmPaymentStatusProps, type PmPaymentStatusPreset, PM_PAYMENT_STATUS_DEFAULTS } from './core';
export * from './presets';

export function PmPaymentStatus(props: PmPaymentStatusProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYMENT_STATUS_DEFAULTS.preset ?? 'tracker';
  const PresetComponent = PM_PAYMENT_STATUS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPaymentStatus.displayName = 'PmPaymentStatus';
