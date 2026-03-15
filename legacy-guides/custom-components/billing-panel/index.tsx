import type { BillingPanelProps } from './core';
import { BILLING_PANEL_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { BillingPanelProps, BillingPanelPreset, Invoice, PaymentMethod, SubscriptionPlan } from './core';
export { BILLING_PANEL_DEFAULTS } from './core';

export function BillingPanel(props: BillingPanelProps): React.ReactElement {
  const preset = props.preset ?? BILLING_PANEL_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

BillingPanel.displayName = 'BillingPanel';
