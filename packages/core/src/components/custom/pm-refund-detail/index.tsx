/**
 * PmRefundDetail - Main Export
 * View refund details with original payment link, processing timeline, and notes
 */

import type { PmRefundDetailProps } from './core';
import { PM_REFUND_DETAIL_DEFAULTS } from './core';
import { PM_REFUND_DETAIL_PRESETS } from './presets';

export { type PmRefundDetailProps, type PmRefundDetailPreset, PM_REFUND_DETAIL_DEFAULTS } from './core';
export * from './presets';

export function PmRefundDetail(props: PmRefundDetailProps): React.ReactElement {
  const preset = props.preset ?? PM_REFUND_DETAIL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_REFUND_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmRefundDetail.displayName = 'PmRefundDetail';
