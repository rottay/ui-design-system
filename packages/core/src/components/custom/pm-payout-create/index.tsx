/**
 * PmPayoutCreate - Main Export
 * Create payouts with recipient selection, amount, and transfer method options
 */

import type { PmPayoutCreateProps } from './core';
import { PM_PAYOUT_CREATE_DEFAULTS } from './core';
import { PM_PAYOUT_CREATE_PRESETS } from './presets';

export { type PmPayoutCreateProps, type PmPayoutCreatePreset, PM_PAYOUT_CREATE_DEFAULTS } from './core';
export * from './presets';

export function PmPayoutCreate(props: PmPayoutCreateProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYOUT_CREATE_DEFAULTS.preset ?? 'form';
  const PresetComponent = PM_PAYOUT_CREATE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPayoutCreate.displayName = 'PmPayoutCreate';
