/**
 * PmPlanSelector - Main Export
 * Compare and select subscription plans with feature matrices and pricing tiers
 */

import type { PmPlanSelectorProps } from './core';
import { PM_PLAN_SELECTOR_DEFAULTS } from './core';
import { PM_PLAN_SELECTOR_PRESETS } from './presets';

export { type PmPlanSelectorProps, type PmPlanSelectorPreset, PM_PLAN_SELECTOR_DEFAULTS } from './core';
export * from './presets';

export function PmPlanSelector(props: PmPlanSelectorProps): React.ReactElement {
  const preset = props.preset ?? PM_PLAN_SELECTOR_DEFAULTS.preset ?? 'cards';
  const PresetComponent = PM_PLAN_SELECTOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPlanSelector.displayName = 'PmPlanSelector';
