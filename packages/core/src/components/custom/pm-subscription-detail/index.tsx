/**
 * PmSubscriptionDetail - Main Export
 * View subscription details with billing history, usage, and plan changes
 */

import type { PmSubscriptionDetailProps } from './core';
import { PM_SUBSCRIPTION_DETAIL_DEFAULTS } from './core';
import { PM_SUBSCRIPTION_DETAIL_PRESETS } from './presets';

export { type PmSubscriptionDetailProps, type PmSubscriptionDetailPreset, PM_SUBSCRIPTION_DETAIL_DEFAULTS } from './core';
export * from './presets';

export function PmSubscriptionDetail(props: PmSubscriptionDetailProps): React.ReactElement {
  const preset = props.preset ?? PM_SUBSCRIPTION_DETAIL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_SUBSCRIPTION_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmSubscriptionDetail.displayName = 'PmSubscriptionDetail';
