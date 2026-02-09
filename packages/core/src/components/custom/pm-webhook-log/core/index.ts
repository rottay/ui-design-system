/**
 * PmWebhookLog - Core Interface
 * View webhook delivery logs with payload inspection, status, and retry options
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmWebhookLogPreset = 'table' | 'timeline';

export type WebhookStatus = 'delivered' | 'failed' | 'pending' | 'retrying';
export interface WebhookLogItem {
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

export interface PmWebhookLogProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmWebhookLogPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: WebhookLogItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to retry */
  onRetry?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_WEBHOOK_LOG_DEFAULTS: Partial<PmWebhookLogProps> = {
  preset: 'table',
};
