/**
 * PmPayoutManager - Main Export
 * Manage payouts to recipients with scheduling, batching, and status tracking
 */

import type { PmPayoutManagerProps } from './core';
import { PM_PAYOUT_MANAGER_DEFAULTS } from './core';
import { PM_PAYOUT_MANAGER_PRESETS } from './presets';

export { type PmPayoutManagerProps, type PmPayoutManagerPreset, PM_PAYOUT_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PmPayoutManager(props: PmPayoutManagerProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYOUT_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PM_PAYOUT_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPayoutManager.displayName = 'PmPayoutManager';
