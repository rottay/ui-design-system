import type { WebhookConfigProps } from './core';
import { WEBHOOK_CONFIG_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { WebhookConfigProps, WebhookConfigPreset, Webhook, WebhookEvent, DeliveryLog } from './core';
export { WEBHOOK_CONFIG_DEFAULTS } from './core';

export function WebhookConfig(props: WebhookConfigProps): React.ReactElement {
  const preset = props.preset ?? WEBHOOK_CONFIG_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

WebhookConfig.displayName = 'WebhookConfig';
