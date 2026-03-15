/**
 * PmFeeBreakdown - Main Export
 * Display detailed fee breakdown with platform, processing, and tax components
 */

import type { PmFeeBreakdownProps } from './core';
import { PM_FEE_BREAKDOWN_DEFAULTS } from './core';
import { PM_FEE_BREAKDOWN_PRESETS } from './presets';

export { type PmFeeBreakdownProps, type PmFeeBreakdownPreset, PM_FEE_BREAKDOWN_DEFAULTS } from './core';
export * from './presets';

export function PmFeeBreakdown(props: PmFeeBreakdownProps): React.ReactElement {
  const preset = props.preset ?? PM_FEE_BREAKDOWN_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_FEE_BREAKDOWN_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmFeeBreakdown.displayName = 'PmFeeBreakdown';
