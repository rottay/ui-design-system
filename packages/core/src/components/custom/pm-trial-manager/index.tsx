/**
 * PmTrialManager - Main Export
 * Manage trial periods with conversion tracking, extension options, and expiration alerts
 */

import type { PmTrialManagerProps } from './core';
import { PM_TRIAL_MANAGER_DEFAULTS } from './core';
import { PM_TRIAL_MANAGER_PRESETS } from './presets';

export { type PmTrialManagerProps, type PmTrialManagerPreset, PM_TRIAL_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PmTrialManager(props: PmTrialManagerProps): React.ReactElement {
  const preset = props.preset ?? PM_TRIAL_MANAGER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = PM_TRIAL_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmTrialManager.displayName = 'PmTrialManager';
