/**
 * PmPaymentCreate - Main Export
 * Create new payments with amount, currency, recipient, and method selection
 */

import type { PmPaymentCreateProps } from './core';
import { PM_PAYMENT_CREATE_DEFAULTS } from './core';
import { PM_PAYMENT_CREATE_PRESETS } from './presets';

export { type PmPaymentCreateProps, type PmPaymentCreatePreset, PM_PAYMENT_CREATE_DEFAULTS } from './core';
export * from './presets';

export function PmPaymentCreate(props: PmPaymentCreateProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYMENT_CREATE_DEFAULTS.preset ?? 'form';
  const PresetComponent = PM_PAYMENT_CREATE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPaymentCreate.displayName = 'PmPaymentCreate';
