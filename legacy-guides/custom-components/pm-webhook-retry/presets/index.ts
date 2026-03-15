/**
 * PmWebhookRetry - All Presets
 */

export { PanelPmWebhookRetry } from './panel';
export { QueuePmWebhookRetry } from './queue';

import type { PmWebhookRetryPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmWebhookRetryProps } from '../core';
import { PanelPmWebhookRetry } from './panel';
import { QueuePmWebhookRetry } from './queue';

export const PM_WEBHOOK_RETRY_PRESETS: Record<PmWebhookRetryPreset, ComponentType<PmWebhookRetryProps>> = {
  panel: PanelPmWebhookRetry,
  queue: QueuePmWebhookRetry,
};
