/**
 * PmPaymentMethodSelector - Main Export
 * Select payment methods including cards, bank transfers, and digital wallets
 */

import type { PmPaymentMethodSelectorProps } from './core';
import { PM_PAYMENT_METHOD_SELECTOR_DEFAULTS } from './core';
import { PM_PAYMENT_METHOD_SELECTOR_PRESETS } from './presets';

export { type PmPaymentMethodSelectorProps, type PmPaymentMethodSelectorPreset, PM_PAYMENT_METHOD_SELECTOR_DEFAULTS } from './core';
export * from './presets';

export function PmPaymentMethodSelector(props: PmPaymentMethodSelectorProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYMENT_METHOD_SELECTOR_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PM_PAYMENT_METHOD_SELECTOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPaymentMethodSelector.displayName = 'PmPaymentMethodSelector';
