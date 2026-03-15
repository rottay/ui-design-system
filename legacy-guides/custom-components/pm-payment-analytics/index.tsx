/**
 * PmPaymentAnalytics - Main Export
 * Analyze payment trends with volume, success rates, and method distribution
 */

import type { PmPaymentAnalyticsProps } from './core';
import { PM_PAYMENT_ANALYTICS_DEFAULTS } from './core';
import { PM_PAYMENT_ANALYTICS_PRESETS } from './presets';

export { type PmPaymentAnalyticsProps, type PmPaymentAnalyticsPreset, PM_PAYMENT_ANALYTICS_DEFAULTS } from './core';
export * from './presets';

export function PmPaymentAnalytics(props: PmPaymentAnalyticsProps): React.ReactElement {
  const preset = props.preset ?? PM_PAYMENT_ANALYTICS_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = PM_PAYMENT_ANALYTICS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmPaymentAnalytics.displayName = 'PmPaymentAnalytics';
