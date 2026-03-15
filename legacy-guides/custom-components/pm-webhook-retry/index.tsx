/**
 * PmWebhookRetry - Main Export
 * Manage webhook retry queue with failed deliveries, scheduling, and batch retry
 */

import type { PmWebhookRetryProps } from './core';
import { PM_WEBHOOK_RETRY_DEFAULTS } from './core';
import { PM_WEBHOOK_RETRY_PRESETS } from './presets';

export { type PmWebhookRetryProps, type PmWebhookRetryPreset, PM_WEBHOOK_RETRY_DEFAULTS } from './core';
export * from './presets';

export function PmWebhookRetry(props: PmWebhookRetryProps): React.ReactElement {
  const preset = props.preset ?? PM_WEBHOOK_RETRY_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_WEBHOOK_RETRY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmWebhookRetry.displayName = 'PmWebhookRetry';
