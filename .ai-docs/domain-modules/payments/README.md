# Payments Module (dm-payments)

> **Unified payment processing with subscriptions and crypto support**

## What It Does

The Payments module provides unified payment processing across multiple providers including Stripe, PayPal, MercadoPago, and crypto on/off-ramps. It handles one-time payments, subscriptions, refunds, and payouts to third parties.

The module abstracts provider differences behind a consistent interface, with automatic fallback capabilities and health monitoring. It supports both fiat and cryptocurrency transactions through integrated on/off-ramp providers.

## When to Use

- **Payment Processing**: Process one-time payments
- **Subscriptions**: Manage recurring billing
- **Refunds**: Process payment refunds
- **Payouts**: Pay staff or partners
- **Crypto**: On-ramp (buy) and off-ramp (sell) crypto

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Payment** | Payment transaction |
| **Subscription** | Recurring billing |
| **Refund** | Payment refund |
| **Payout** | Outbound payment |
| **OnRamp** | Fiat to crypto conversion |
| **OffRamp** | Crypto to fiat conversion |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 20 use cases + 7 orchestrators |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Payments
import { makeCreatePaymentUC, makeCapturePaymentUC, makeCancelPaymentUC } from '@rottay/payments';

// Subscriptions
import { makeCreateSubscriptionUC, makePauseSubscriptionUC, makeCancelSubscriptionUC } from '@rottay/payments';

// Refunds
import { makeCreateRefundUC } from '@rottay/payments';

// Crypto
import { makeCreateOnRampUC, makeCreateOffRampUC, makeGetCryptoQuoteUC } from '@rottay/payments';
```

## Payment Status Flow

```typescript
type PaymentStatus =
  | 'pending'            // Awaiting processing
  | 'processing'         // Being processed
  | 'authorized'         // Authorized, not captured
  | 'captured'           // Payment captured
  | 'completed'          // Fully complete
  | 'failed'             // Payment failed
  | 'cancelled'          // Payment cancelled
  | 'refunded'           // Fully refunded
  | 'partially_refunded';// Partial refund
```

## Supported Providers

```typescript
const paymentProviders = [
  'stripe',      // Cards, ACH
  'paypal',      // PayPal
  'mercadopago', // LatAm payments
  'moonpay',     // Crypto on/off ramp
  'transak',     // Crypto on/off ramp
];
```

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- ALL 20 use cases migrated (13 mutations + 7 queries)
- **Module stage**: Beta (v0.2.3)
- **Codebase**: ~6.2K LOC
- **Pattern**: All use cases return `Result<T>` using `this.createSuccessResult()` / `this.createErrorResult()` inherited from `BaseMutationUseCase` / `BaseQueryUseCase`
- **Previous pattern**: Mixed throwing errors and manual `{ success: true/false }` objects
- **Areas covered**: payment, subscription, refund, payout, crypto

## Audit Changes (2026-02-06)

### Webhook Handler Split

The 3,361-line webhook handler has been split into 5 focused files:

| File | Responsibility |
|------|---------------|
| `stripe.ts` | Stripe webhook event processing |
| `crypto.ts` | Crypto payment webhook processing |
| `mercadopago.ts` | MercadoPago webhook processing |
| `moonpay.ts` | MoonPay webhook processing |
| `processor.ts` | Shared webhook processing logic and routing |

### Idempotency

Payment, refund, and payout mutations are now wrapped with idempotency protection to prevent duplicate processing:

- **IdempotencyPort**: Interface for idempotency key storage and lookup
- **IdempotencyService**: Database-backed implementation of idempotency key management
- **Wrapper**: Decorates mutation use cases; if an idempotency key has been seen, the original result is returned without re-execution

## Session 2026-02-06 Changes

- **4 deprecated event type aliases cleaned**: Removed legacy event type aliases that duplicated canonical event names in the event registry
- **ESLint v9 flat config**: Migrated from `.eslintrc.json` to ESLint v9 flat config (`eslint.config.js`). Legacy `.eslintrc.json` deleted.

## Related Modules

- [Events](../events/) - Ticket payments
- [Bar](../bar/) - Order payments
- [Staff](../staff/) - Payroll processing
- [Web3](../web3/) - Crypto transactions
