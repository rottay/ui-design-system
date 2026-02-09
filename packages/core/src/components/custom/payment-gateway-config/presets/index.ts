import type { PaymentGatewayConfigPreset } from '../core';
import { OverviewPaymentGatewayConfig } from './overview';
import { SetupPaymentGatewayConfig } from './setup';

export { OverviewPaymentGatewayConfig } from './overview';
export { SetupPaymentGatewayConfig } from './setup';

export const PAYMENT_GATEWAY_CONFIG_PRESETS: Record<PaymentGatewayConfigPreset, React.ComponentType<any>> = {
  overview: OverviewPaymentGatewayConfig,
  setup: SetupPaymentGatewayConfig,
};
