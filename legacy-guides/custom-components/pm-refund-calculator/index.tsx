/**
 * PmRefundCalculator - Main Export
 * Calculate refund amounts with prorated billing, usage adjustments, and fees
 */

import type { PmRefundCalculatorProps } from './core';
import { PM_REFUND_CALCULATOR_DEFAULTS } from './core';
import { PM_REFUND_CALCULATOR_PRESETS } from './presets';

export { type PmRefundCalculatorProps, type PmRefundCalculatorPreset, PM_REFUND_CALCULATOR_DEFAULTS } from './core';
export * from './presets';

export function PmRefundCalculator(props: PmRefundCalculatorProps): React.ReactElement {
  const preset = props.preset ?? PM_REFUND_CALCULATOR_DEFAULTS.preset ?? 'calculator';
  const PresetComponent = PM_REFUND_CALCULATOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmRefundCalculator.displayName = 'PmRefundCalculator';
