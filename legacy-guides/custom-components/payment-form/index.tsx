import type { PaymentFormProps } from './core';
import { PAYMENT_FORM_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { PaymentFormProps, PaymentFormPreset, PaymentData } from './core';
export { PAYMENT_FORM_DEFAULTS } from './core';

export function PaymentForm(props: PaymentFormProps): React.ReactElement {
  const preset = props.preset ?? PAYMENT_FORM_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

PaymentForm.displayName = 'PaymentForm';
