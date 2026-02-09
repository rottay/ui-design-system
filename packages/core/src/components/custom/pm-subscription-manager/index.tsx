/**
 * PmSubscriptionManager - Main Export
 * Manage subscriptions with plan info, billing cycles, and renewal status
 */

import type { PmSubscriptionManagerProps } from './core';
import { PM_SUBSCRIPTION_MANAGER_DEFAULTS } from './core';
import { PM_SUBSCRIPTION_MANAGER_PRESETS } from './presets';

export { type PmSubscriptionManagerProps, type PmSubscriptionManagerPreset, PM_SUBSCRIPTION_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PmSubscriptionManager(props: PmSubscriptionManagerProps): React.ReactElement {
  const preset = props.preset ?? PM_SUBSCRIPTION_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PM_SUBSCRIPTION_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmSubscriptionManager.displayName = 'PmSubscriptionManager';
