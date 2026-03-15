/**
 * BhClientDetail - Main Export
 * Client dashboard with positions and revenue for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhClientDetailProps } from './core';
import { BH_CLIENT_DETAIL_DEFAULTS } from './core';
import { BH_CLIENT_DETAIL_PRESETS } from './presets';

export {
  type BhClientDetailProps,
  type BhClientDetailPreset,
  type ClientPosition,
  type RevenuePoint,
  BH_CLIENT_DETAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhClientDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhClientDetail(props: BhClientDetailProps): React.ReactElement {
  const preset = props.preset ?? BH_CLIENT_DETAIL_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_CLIENT_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhClientDetail.displayName = 'BhClientDetail';

export { DashboardBhClientDetail, CompactBhClientDetail } from './presets';
