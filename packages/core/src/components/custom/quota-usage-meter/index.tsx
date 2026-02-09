/**
 * QuotaUsageMeter - Main Export
 * Automatically selects preset based on props
 */

import type { QuotaUsageMeterProps } from './core';
import { QUOTA_USAGE_METER_DEFAULTS } from './core';
import { QUOTA_USAGE_METER_PRESETS } from './presets';

export { type QuotaUsageMeterProps, type QuotaUsageMeterPreset, type QuotaItem, type QuotaStatus, QUOTA_USAGE_METER_DEFAULTS } from './core';
export * from './presets';

/**
 * QuotaUsageMeter component
 * Renders the appropriate preset based on the preset prop
 */
export function QuotaUsageMeter(props: QuotaUsageMeterProps): React.ReactElement {
  const preset = props.preset ?? QUOTA_USAGE_METER_DEFAULTS.preset ?? 'bars';
  const PresetComponent = QUOTA_USAGE_METER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

QuotaUsageMeter.displayName = 'QuotaUsageMeter';

export { BarsQuotaUsageMeter, CardsQuotaUsageMeter, CompactQuotaUsageMeter } from './presets';
