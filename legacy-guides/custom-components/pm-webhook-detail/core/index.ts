/**
 * PmWebhookDetail - Core Interface
 * Inspect webhook event details with headers, payload, response, and delivery info
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmWebhookDetailPreset = 'panel' | 'raw';

export type WebhookStatus = 'delivered' | 'failed' | 'pending' | 'retrying';
export interface WebhookDetailItem {
  id: string;
  event: string;
  url: string;
  status: WebhookStatus;
  statusCode?: number;
  attempts: number;
  payload?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface PmWebhookDetailProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmWebhookDetailPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: WebhookDetailItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to retry */
  onRetry?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_WEBHOOK_DETAIL_DEFAULTS: Partial<PmWebhookDetailProps> = {
  preset: 'panel',
};
