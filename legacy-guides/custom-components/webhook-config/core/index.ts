import type { EngineAwareProps } from '../../../../types';

export type WebhookConfigPreset = 'standard' | 'compact';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookEvent {
  key: string;
  label: string;
  category?: string;
}

export interface DeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  responseCode?: number;
  duration?: number;
}

export interface WebhookConfigProps extends EngineAwareProps {
  preset?: WebhookConfigPreset;
  webhooks: Webhook[];
  events: WebhookEvent[];
  deliveryLogs?: DeliveryLog[];
  onCreate?: () => void;
  onDelete?: (webhookId: string) => void;
  onToggle?: (webhookId: string) => void;
  onTest?: (webhookId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const WEBHOOK_CONFIG_DEFAULTS = {
  preset: 'standard' as WebhookConfigPreset,
  webhooks: [],
  events: [],
  deliveryLogs: [],
};
