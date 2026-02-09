/**
 * PmRefundCalculator - All Presets
 */

export { CalculatorPmRefundCalculator } from './calculator';
export { InlinePmRefundCalculator } from './inline';

import type { PmRefundCalculatorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmRefundCalculatorProps } from '../core';
import { CalculatorPmRefundCalculator } from './calculator';
import { InlinePmRefundCalculator } from './inline';

export const PM_REFUND_CALCULATOR_PRESETS: Record<PmRefundCalculatorPreset, ComponentType<PmRefundCalculatorProps>> = {
  calculator: CalculatorPmRefundCalculator,
  inline: InlinePmRefundCalculator,
};
