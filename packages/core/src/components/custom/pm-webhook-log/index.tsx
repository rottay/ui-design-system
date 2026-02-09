/**
 * PmWebhookLog - Main Export
 * View webhook delivery logs with payload inspection, status, and retry options
 */

import type { PmWebhookLogProps } from './core';
import { PM_WEBHOOK_LOG_DEFAULTS } from './core';
import { PM_WEBHOOK_LOG_PRESETS } from './presets';

export { type PmWebhookLogProps, type PmWebhookLogPreset, PM_WEBHOOK_LOG_DEFAULTS } from './core';
export * from './presets';

export function PmWebhookLog(props: PmWebhookLogProps): React.ReactElement {
  const preset = props.preset ?? PM_WEBHOOK_LOG_DEFAULTS.preset ?? 'table';
  const PresetComponent = PM_WEBHOOK_LOG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmWebhookLog.displayName = 'PmWebhookLog';
