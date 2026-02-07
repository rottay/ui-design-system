import type { EngineAwareProps } from '../../../../types';

export type BillingPanelPreset = 'standard' | 'compact';

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  downloadUrl?: string;
}

export interface PaymentMethod {
  type: 'card' | 'bank' | 'paypal';
  last4: string;
  brand?: string;
  expiry?: string;
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features?: string[];
}

export interface BillingPanelProps extends EngineAwareProps {
  preset?: BillingPanelPreset;
  plan?: SubscriptionPlan;
  invoices?: Invoice[];
  paymentMethod?: PaymentMethod;
  onChangePlan?: () => void;
  onUpdatePayment?: () => void;
  onDownloadInvoice?: (invoiceId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BILLING_PANEL_DEFAULTS = {
  preset: 'standard' as BillingPanelPreset,
  invoices: [],
};
