/**
 * PmSubscriptionCreate - Main Export
 * Create new subscriptions with plan selection, billing, and trial configuration
 */

import type { PmSubscriptionCreateProps } from './core';
import { PM_SUBSCRIPTION_CREATE_DEFAULTS } from './core';
import { PM_SUBSCRIPTION_CREATE_PRESETS } from './presets';

export { type PmSubscriptionCreateProps, type PmSubscriptionCreatePreset, PM_SUBSCRIPTION_CREATE_DEFAULTS } from './core';
export * from './presets';

export function PmSubscriptionCreate(props: PmSubscriptionCreateProps): React.ReactElement {
  const preset = props.preset ?? PM_SUBSCRIPTION_CREATE_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = PM_SUBSCRIPTION_CREATE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmSubscriptionCreate.displayName = 'PmSubscriptionCreate';
