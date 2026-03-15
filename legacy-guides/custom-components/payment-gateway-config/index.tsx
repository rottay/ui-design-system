import type { PaymentGatewayConfigProps } from './core';
import { PAYMENT_GATEWAY_CONFIG_DEFAULTS } from './core';
import { PAYMENT_GATEWAY_CONFIG_PRESETS } from './presets';

export {
  type PaymentGatewayConfigProps,
  type PaymentGatewayConfigPreset,
  type PaymentGateway,
  type GatewayProvider,
  type GatewayStatus,
  PAYMENT_GATEWAY_CONFIG_DEFAULTS,
} from './core';
export { getStatusColors, getProviderIcon, formatVolume } from './core';
export * from './presets';

export function PaymentGatewayConfig(props: PaymentGatewayConfigProps): React.ReactElement {
  const preset = props.preset ?? PAYMENT_GATEWAY_CONFIG_DEFAULTS.preset ?? 'overview';
  const PresetComponent = PAYMENT_GATEWAY_CONFIG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PaymentGatewayConfig.displayName = 'PaymentGatewayConfig';
export { OverviewPaymentGatewayConfig, SetupPaymentGatewayConfig } from './presets';
