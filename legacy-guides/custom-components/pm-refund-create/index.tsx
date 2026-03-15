/**
 * PmRefundCreate - Main Export
 * Initiate refunds with amount selection, reason codes, and partial refund support
 */

import type { PmRefundCreateProps } from './core';
import { PM_REFUND_CREATE_DEFAULTS } from './core';
import { PM_REFUND_CREATE_PRESETS } from './presets';

export { type PmRefundCreateProps, type PmRefundCreatePreset, PM_REFUND_CREATE_DEFAULTS } from './core';
export * from './presets';

export function PmRefundCreate(props: PmRefundCreateProps): React.ReactElement {
  const preset = props.preset ?? PM_REFUND_CREATE_DEFAULTS.preset ?? 'form';
  const PresetComponent = PM_REFUND_CREATE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmRefundCreate.displayName = 'PmRefundCreate';
