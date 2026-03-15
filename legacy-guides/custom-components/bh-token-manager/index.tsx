/**
 * BhTokenManager - Main Export
 * Token & Billing Dashboard for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTokenManagerProps } from './core';
import { BH_TOKEN_MANAGER_DEFAULTS } from './core';
import { BH_TOKEN_MANAGER_PRESETS } from './presets';

export {
  type BhTokenManagerProps,
  type BhTokenManagerPreset,
  type TokenBalanceSummary,
  type ConsumptionDataPoint,
  type CostBreakdownItem,
  type TeamQuota,
  type TokenTransactionDisplay,
  type AlertConfig,
  type ForecastPoint,
  BH_TOKEN_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTokenManager component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTokenManager(props: BhTokenManagerProps): React.ReactElement {
  const preset = props.preset ?? BH_TOKEN_MANAGER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = BH_TOKEN_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTokenManager.displayName = 'BhTokenManager';

export { OverviewBhTokenManager, DetailedBhTokenManager } from './presets';
