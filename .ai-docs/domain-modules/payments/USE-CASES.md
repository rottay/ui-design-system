# dm-payments - Use Cases

> **Payment Processing, Subscriptions and Crypto**

**Total: 20 use cases (13 mutations, 7 queries) + 7 orchestrators | 20 zero-arg factories (100% coverage)**

**REVIEW-2026 Result Pattern**: ALL 20 use cases migrated (13 mutations + 7 queries). Uses `this.createSuccessResult()` / `this.createErrorResult()` inherited from `BaseMutationUseCase` / `BaseQueryUseCase`. Beta module (v0.2.3). Areas: payment, subscription, refund, payout, crypto. ~6.2K LOC.

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [Payment](#payment)
  - [Subscription](#subscription)
  - [Refund](#refund)
  - [Payout](#payout)
  - [Crypto](#crypto)
- [Queries](#queries)
  - [Payment Queries](#payment-queries)
  - [Refund Queries](#refund-queries)
  - [Crypto Queries](#crypto-queries)
  - [Provider Queries](#provider-queries)
- [Orchestrators](#orchestrators)
- [Entities](#entities)
  - [Payment Status](#payment-status)
  - [Subscription Status](#subscription-status)
  - [Supported Providers](#supported-providers)
- [Related](#related)

---

## Overview

The **dm-payments** module handles all financial transactions within the platform, providing a unified interface for:

- **Payment Processing**: Create, capture, and manage payments through multiple providers (Stripe, PayPal, MercadoPago)
- **Subscription Management**: Full lifecycle management for recurring billing including pause, resume, and cancellation
- **Refund Handling**: Process full and partial refunds with automatic provider routing
- **Payout Distribution**: Manage payments to third parties (staff, venues, partners)
- **Crypto Transactions**: On-ramp (fiat to crypto) and off-ramp (crypto to fiat) operations via MoonPay and Transak

The module implements a provider-agnostic architecture with automatic fallback mechanisms to ensure transaction reliability.

---

## Mutations

### Payment

| Use Case | Description | Class |
|----------|-------------|-------|
| create-payment | Creates a new payment | `CreatePaymentUseCase` |
| update-payment-status | Updates payment status | `UpdatePaymentStatusUseCase` |
| capture-payment | Captures an authorized payment | `CapturePaymentUseCase` |
| cancel-payment | Cancels a payment | `CancelPaymentUseCase` |

### Subscription

| Use Case | Description | Class |
|----------|-------------|-------|
| create-subscription | Creates a subscription | `CreateSubscriptionUseCase` |
| update-subscription | Updates a subscription | `UpdateSubscriptionUseCase` |
| pause-subscription | Pauses a subscription | `PauseSubscriptionUseCase` |
| resume-subscription | Resumes a subscription | `ResumeSubscriptionUseCase` |
| cancel-subscription | Cancels a subscription | `CancelSubscriptionUseCase` |

### Refund

| Use Case | Description | Class |
|----------|-------------|-------|
| create-refund | Creates a refund | `CreateRefundUseCase` |

### Payout

| Use Case | Description | Class |
|----------|-------------|-------|
| create-payout | Creates a payout to third party | `CreatePayoutUseCase` |

### Crypto

| Use Case | Description | Class |
|----------|-------------|-------|
| create-on-ramp | Creates on-ramp (fiat to crypto) | `CreateOnRampUseCase` |
| create-off-ramp | Creates off-ramp (crypto to fiat) | `CreateOffRampUseCase` |

---

## Queries

### Payment Queries

| Use Case | Description | Class |
|----------|-------------|-------|
| get-payment | Gets payment by ID | `GetPaymentUseCase` |
| list-payments | Lists payments | `ListPaymentsUseCase` |

### Refund Queries

| Use Case | Description | Class |
|----------|-------------|-------|
| get-refund | Gets refund by ID | `GetRefundUseCase` |

### Crypto Queries

| Use Case | Description | Class |
|----------|-------------|-------|
| get-supported-assets | Gets supported crypto assets | `GetSupportedAssetsUseCase` |
| get-crypto-quote | Gets crypto quote | `GetCryptoQuoteUseCase` |
| get-quote | Gets quote for transaction | `GetQuoteUseCase` |

### Provider Queries

| Use Case | Description | Class |
|----------|-------------|-------|
| get-available-providers | Lists available providers | `GetAvailableProvidersUseCase` |

---

## Orchestrators

| Orchestrator | Description |
|--------------|-------------|
| `PaymentOrchestrator` | Coordinates complete payment flow |
| `SubscriptionOrchestrator` | Manages subscription lifecycle |
| `RefundOrchestrator` | Coordinates refunds |
| `PayoutOrchestrator` | Manages payouts to third parties |
| `CryptoOrchestrator` | Coordinates crypto transactions |
| `FallbackOrchestrator` | Handles fallback between providers |
| `ProviderOperationOrchestrator` | Coordinates operations with providers |

---

## Entities

### Payment Status

```typescript
type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'captured'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';
```

### Subscription Status

```typescript
type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'past_due'
  | 'cancelled'
  | 'expired';
```

### Supported Providers

```typescript
const paymentProviders = [
  'stripe',       // Cards, ACH
  'paypal',       // PayPal
  'mercadopago',  // LatAm
  'moonpay',      // Crypto on/off ramp
  'transak',      // Crypto on/off ramp
];
```

---

## Related

| Module | Relationship |
|--------|--------------|
| [dm-events](../events/USE-CASES.md) | Event ticket purchases, event entry payments |
| [dm-bar](../bar/USE-CASES.md) | Bar tab payments, drink orders |
| [dm-staff](../staff/USE-CASES.md) | Staff payouts, commission payments |
| [dm-web3](../web3/USE-CASES.md) | Crypto wallet integration, token payments |
