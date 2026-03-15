/**
 * PmPayoutDetail - Main Export
 * View payout details with recipient info, bank details, and transfer timeline
 */

import type { PmPayoutDetailProps } from './core';
import { PM_PAYOUT_DETAIL_DEFAULTS } from './core';
import { PM_PAYOUT_DETAIL_PRESETS } from './presets';

export { type PmPayoutDetailProps, type PmPayoutDetailPreset, PM_PAYOUT_DETAIL_DEFAULTS } from './core';
export * from './presets';

export function PmPayoutDetail(props: PmPayoutDetailProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYOUT_DETAIL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_PAYOUT_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPayoutDetail.displayName = 'PmPayoutDetail';
