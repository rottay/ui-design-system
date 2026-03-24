# dm-payments - Entities

> **Entidades del módulo de pagos**

---

## Entidades Principales

### Payment

```typescript
interface Payment {
  id: string;
  tenantId: string;
  companyId: string;
  userId: string;
  externalId?: string;       // Provider ID
  provider: PaymentProvider;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata: Record<string, unknown>;
  refundedAmount: number;
  capturedAmount: number;
  fees?: {
    platform: number;
    provider: number;
    total: number;
  };
  billingDetails?: BillingDetails;
  errorCode?: string;
  errorMessage?: string;
  authorizedAt?: Date;
  capturedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type PaymentProvider =
  | 'stripe'
  | 'paypal'
  | 'mercadopago'
  | 'moonpay'
  | 'transak'
  | 'manual';

type PaymentMethod =
  | 'card'
  | 'bank_transfer'
  | 'paypal'
  | 'crypto'
  | 'cash'
  | 'check';

interface BillingDetails {
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  taxId?: string;
}
```

### Subscription

```typescript
interface Subscription {
  id: string;
  tenantId: string;
  companyId: string;
  userId: string;
  externalId?: string;
  provider: PaymentProvider;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  currency: string;
  interval: SubscriptionInterval;
  intervalCount: number;
  trialEnd?: Date;
  cancelAt?: Date;
  cancelledAt?: Date;
  pausedAt?: Date;
  resumeAt?: Date;
  paymentMethodId?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type SubscriptionInterval =
  | 'day'
  | 'week'
  | 'month'
  | 'year';
```

### Refund

```typescript
interface Refund {
  id: string;
  tenantId: string;
  paymentId: string;
  externalId?: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: RefundReason;
  description?: string;
  metadata: Record<string, unknown>;
  completedAt?: Date;
  failedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type RefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

type RefundReason =
  | 'duplicate'
  | 'fraudulent'
  | 'requested_by_customer'
  | 'service_not_provided'
  | 'other';
```

### Payout

```typescript
interface Payout {
  id: string;
  tenantId: string;
  companyId: string;
  recipientId: string;
  recipientType: 'staff' | 'vendor' | 'partner';
  externalId?: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  destination: PayoutDestination;
  description?: string;
  metadata: Record<string, unknown>;
  fees?: number;
  completedAt?: Date;
  failedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'in_transit'
  | 'completed'
  | 'failed'
  | 'cancelled';

type PayoutMethod =
  | 'bank_transfer'
  | 'paypal'
  | 'check'
  | 'crypto';

interface PayoutDestination {
  type: 'bank_account' | 'paypal' | 'crypto_wallet';
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  paypalEmail?: string;
  walletAddress?: string;
  chain?: string;
}
```

---

## Relaciones

```
Payment      1──*  Refund
Subscription 1──*  Payment (renewals)
User         1──*  Payment
User         1──*  Subscription
```

---

## Database Tables

All tables use the `payment_` prefix. Schema files located in `dm-payments/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Payment | `payment_transactions` | id, tenant_id, company_id, user_id, provider_id, provider_payment_id, payment_ref, payment_type, status, amount, currency, amount_usd, crypto_amount, crypto_symbol, chain_id, destination_address, tx_hash, fees (jsonb), customer_email, payment_method_type, idempotency_key, is_active | Main payment records. Supports fiat and crypto types. Unique on payment_ref and (tenant_id, idempotency_key). |
| Refund | `payment_refunds` | id, tenant_id, company_id, payment_id (FK -> payment_transactions), provider_id, provider_refund_id, status, reason, amount, currency, remaining_amount, is_active | FK cascade on payment_id. |
| Payout | `payment_payouts` | id, tenant_id, company_id, provider_id, provider_payout_id, payout_ref, status, payout_method, amount, currency, recipient_id, recipient_name, recipient_email, recipient_details (jsonb), fee_amount, net_amount, is_active | Unique on payout_ref. Supports bank, card, pix, sepa, ach, wire, crypto, paypal methods. |
| SubscriptionPlan | `payment_subscription_plans` | id, tenant_id, company_id, name, code, description, features (jsonb), is_active | Unique on (tenant_id, code). |
| SubscriptionPrice | `payment_subscription_prices` | id, tenant_id, plan_id (FK -> subscription_plans), name, amount, currency, billing_interval, billing_interval_count, trial_days, is_active | FK cascade on plan_id. |
| Subscription | `payment_subscriptions` | id, tenant_id, company_id, customer_id, provider_id, provider_subscription_id, status, plan_id (FK), price_id (FK), billing_interval, amount, currency, current_period_start, current_period_end, cancel_at_period_end, is_active | References both plans and prices. |
| WebhookEvent | `payment_webhook_events` | id, tenant_id, provider_id, provider_event_id, event_type, payment_id, refund_id, payout_id, subscription_id, status, attempts, last_error, raw_payload (jsonb), signature, signature_verified | Unique on (provider_id, provider_event_id). |
| ProviderConfig | `payment_provider_configs` | id, tenant_id, company_id, provider_id, is_enabled, priority, is_sandbox, encrypted_credentials, webhook_url, traffic_weight, load_balancing_enabled, max_transactions_per_minute, custom_settings (jsonb), is_active | Unique on (tenant_id, company_id, provider_id). Tenant-level provider overrides. |
| GlobalProviderConfig | `payment_global_provider_configs` | id, provider_id, traffic_weight, load_balancing_enabled, max_transactions_per_minute, max_amount_per_hour, is_enabled, health_status, feature_flags (jsonb), is_active | System-wide defaults. Unique on provider_id. Overridden by tenant configs. |
