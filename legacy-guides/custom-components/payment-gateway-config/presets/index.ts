import type { PaymentGatewayConfigPreset, PaymentGatewayConfigProps } from '../core';
import type { ComponentType } from 'react';
import { OverviewPaymentGatewayConfig } from './overview';
import { SetupPaymentGatewayConfig } from './setup';

export { OverviewPaymentGatewayConfig } from './overview';
export { SetupPaymentGatewayConfig } from './setup';

export const PAYMENT_GATEWAY_CONFIG_PRESETS: Record<PaymentGatewayConfigPreset, ComponentType<PaymentGatewayConfigProps>> = {
  overview: OverviewPaymentGatewayConfig,
  setup: SetupPaymentGatewayConfig,
};
