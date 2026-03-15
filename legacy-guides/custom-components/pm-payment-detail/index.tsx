/**
 * PmPaymentDetail - Main Export
 * View payment details with transaction timeline, refund history, and metadata
 */

import type { PmPaymentDetailProps } from './core';
import { PM_PAYMENT_DETAIL_DEFAULTS } from './core';
import { PM_PAYMENT_DETAIL_PRESETS } from './presets';

export { type PmPaymentDetailProps, type PmPaymentDetailPreset, PM_PAYMENT_DETAIL_DEFAULTS } from './core';
export * from './presets';

export function PmPaymentDetail(props: PmPaymentDetailProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYMENT_DETAIL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_PAYMENT_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPaymentDetail.displayName = 'PmPaymentDetail';
