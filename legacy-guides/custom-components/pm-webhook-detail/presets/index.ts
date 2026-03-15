/**
 * PmWebhookDetail - All Presets
 */

export { PanelPmWebhookDetail } from './panel';
export { RawPmWebhookDetail } from './raw';

import type { PmWebhookDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmWebhookDetailProps } from '../core';
import { PanelPmWebhookDetail } from './panel';
import { RawPmWebhookDetail } from './raw';

export const PM_WEBHOOK_DETAIL_PRESETS: Record<PmWebhookDetailPreset, ComponentType<PmWebhookDetailProps>> = {
  panel: PanelPmWebhookDetail,
  raw: RawPmWebhookDetail,
};
