import type { PaymentFormPreset, PaymentFormProps } from '../core';
import { StandardPreset } from './standard';
import { CompactPreset } from './compact';

export const PRESETS: Record<
  PaymentFormPreset,
  React.ComponentType<PaymentFormProps>
> = {
  standard: StandardPreset,
  compact: CompactPreset,
};
