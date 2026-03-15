/**
 * BhTokenUsageAnalytics - Main Export
 * AreaChart consumption, PieChart by category for BitHire ATS platform
 */

import type { BhTokenUsageAnalyticsProps } from './core';
import { BH_TOKEN_USAGE_ANALYTICS_DEFAULTS } from './core';
import { BH_TOKEN_USAGE_ANALYTICS_PRESETS } from './presets';

export {
  type BhTokenUsageAnalyticsProps,
  type BhTokenUsageAnalyticsPreset,
  type TokenUsagePoint,
  type TokenCategory,
  BH_TOKEN_USAGE_ANALYTICS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTokenUsageAnalytics component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTokenUsageAnalytics(props: BhTokenUsageAnalyticsProps): React.ReactElement {
  const preset = props.preset ?? BH_TOKEN_USAGE_ANALYTICS_DEFAULTS.preset ?? 'detailed';
  const PresetComponent = BH_TOKEN_USAGE_ANALYTICS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTokenUsageAnalytics.displayName = 'BhTokenUsageAnalytics';

export { DetailedBhTokenUsageAnalytics, CompactBhTokenUsageAnalytics } from './presets';
