/**
 * PmWebhookLog - All Presets
 */

export { TablePmWebhookLog } from './table';
export { TimelinePmWebhookLog } from './timeline';

import type { PmWebhookLogPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmWebhookLogProps } from '../core';
import { TablePmWebhookLog } from './table';
import { TimelinePmWebhookLog } from './timeline';

export const PM_WEBHOOK_LOG_PRESETS: Record<PmWebhookLogPreset, ComponentType<PmWebhookLogProps>> = {
  table: TablePmWebhookLog,
  timeline: TimelinePmWebhookLog,
};
