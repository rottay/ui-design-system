/**
 * W3PaymentSession - Main Export
 * Track crypto payment session progress from initiation to confirmation
 */

import type { W3PaymentSessionProps } from './core';
import { W3_PAYMENT_SESSION_DEFAULTS } from './core';
import { W3_PAYMENT_SESSION_PRESETS } from './presets';

export { type W3PaymentSessionProps, type W3PaymentSessionPreset, W3_PAYMENT_SESSION_DEFAULTS } from './core';
export * from './presets';

export function W3PaymentSession(props: W3PaymentSessionProps): React.ReactElement {
  const preset = props.preset ?? W3_PAYMENT_SESSION_DEFAULTS.preset ?? 'tracker';
  const PresetComponent = W3_PAYMENT_SESSION_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3PaymentSession.displayName = 'W3PaymentSession';
