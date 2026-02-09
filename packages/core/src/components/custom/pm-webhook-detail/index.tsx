/**
 * PmWebhookDetail - Main Export
 * Inspect webhook event details with headers, payload, response, and delivery info
 */

import type { PmWebhookDetailProps } from './core';
import { PM_WEBHOOK_DETAIL_DEFAULTS } from './core';
import { PM_WEBHOOK_DETAIL_PRESETS } from './presets';

export { type PmWebhookDetailProps, type PmWebhookDetailPreset, PM_WEBHOOK_DETAIL_DEFAULTS } from './core';
export * from './presets';

export function PmWebhookDetail(props: PmWebhookDetailProps): React.ReactElement {
  const preset = props.preset ?? PM_WEBHOOK_DETAIL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_WEBHOOK_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmWebhookDetail.displayName = 'PmWebhookDetail';
