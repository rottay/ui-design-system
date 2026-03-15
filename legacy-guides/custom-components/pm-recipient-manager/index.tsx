/**
 * PmRecipientManager - Main Export
 * Manage payout recipients with bank accounts, verification, and payment history
 */

import type { PmRecipientManagerProps } from './core';
import { PM_RECIPIENT_MANAGER_DEFAULTS } from './core';
import { PM_RECIPIENT_MANAGER_PRESETS } from './presets';

export { type PmRecipientManagerProps, type PmRecipientManagerPreset, PM_RECIPIENT_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PmRecipientManager(props: PmRecipientManagerProps): React.ReactElement {
  const preset = props.preset ?? PM_RECIPIENT_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PM_RECIPIENT_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmRecipientManager.displayName = 'PmRecipientManager';
