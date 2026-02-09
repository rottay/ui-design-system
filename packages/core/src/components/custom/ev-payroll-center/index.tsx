/**
 * EvPayrollCenter - Main Export
 * Staff payroll center
 * Automatically selects preset based on props
 */

import type { EvPayrollCenterProps } from './core';
import { EV_PAYROLL_CENTER_DEFAULTS } from './core';
import { EV_PAYROLL_CENTER_PRESETS } from './presets';

export {
  type EvPayrollCenterProps,
  type EvPayrollCenterPreset,
  type PayrollRecord as EvPayrollCenterPayrollRecord,
  type SettlementInfo as EvPayrollCenterSettlementInfo,
  EV_PAYROLL_CENTER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvPayrollCenter component
 * Renders the appropriate preset based on the preset prop
 */
export function EvPayrollCenter(props: EvPayrollCenterProps): React.ReactElement {
  const preset = props.preset ?? EV_PAYROLL_CENTER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_PAYROLL_CENTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvPayrollCenter.displayName = 'EvPayrollCenter';

export { OverviewEvPayrollCenter, DetailEvPayrollCenter } from './presets';
