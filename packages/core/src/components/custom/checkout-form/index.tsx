import React from 'react';
import type { CheckoutFormProps } from './core';
import { CHECKOUT_FORM_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { CheckoutFormProps, CheckoutFormPreset, CheckoutStep } from './core';
export { CHECKOUT_FORM_DEFAULTS } from './core';

export function CheckoutForm(props: CheckoutFormProps): React.ReactElement {
  const preset = props.preset ?? CHECKOUT_FORM_DEFAULTS.preset ?? 'multi-step';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
CheckoutForm.displayName = 'CheckoutForm';
