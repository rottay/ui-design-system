/**
 * PmWebhookRetry - Core Interface
 * Manage webhook retry queue with failed deliveries, scheduling, and batch retry
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmWebhookRetryPreset = 'panel' | 'queue';

export type WebhookStatus = 'delivered' | 'failed' | 'pending' | 'retrying';
export interface WebhookRetryItem {
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

export interface PmWebhookRetryProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmWebhookRetryPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: WebhookRetryItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to retry */
  onRetry?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_WEBHOOK_RETRY_DEFAULTS: Partial<PmWebhookRetryProps> = {
  preset: 'panel',
};
