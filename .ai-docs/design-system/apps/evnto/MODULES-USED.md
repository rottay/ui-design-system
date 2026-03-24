# app-evnto - Modules Used

> **Evnto - Events & Ticketing Application**

---

## Overview

`app-evnto` is the events and ticketing application that handles event management, ticket sales, bar operations, staff management, payments, and Web3 features.

---

## Domain Modules

| Module | Import | Description | Use Cases |
|--------|--------|-------------|-----------|
| **@rottay/dm-events** | `import { ... } from '@rottay/events'` | Event management, ticketing | 83 |
| **@rottay/dm-bar** | `import { ... } from '@rottay/bar'` | Bar operations, inventory | 76 |
| **@rottay/dm-staff** | `import { ... } from '@rottay/staff'` | Staff scheduling, payroll | 70 |
| **@rottay/dm-payments** | `import { ... } from '@rottay/payments'` | Payment processing | 20 |
| **@rottay/dm-web3** | `import { ... } from '@rottay/web3'` | NFTs, tokens, blockchain | 46 |

**Total Domain Use Cases: 295**

---

## Platform Modules

| Module | Import | Use Case |
|--------|--------|----------|
| **@rottay/auth** | `import { ... } from '@rottay/auth'` | Authentication |
| **@rottay/identity** | `import { ... } from '@rottay/identity'` | User profiles |
| **@rottay/tenancy** | `import { ... } from '@rottay/tenancy'` | Multi-tenancy |
| **@rottay/permissions** | `import { ... } from '@rottay/permissions'` | RBAC |
| **@rottay/compliance** | `import { ... } from '@rottay/compliance'` | Gaming regulations, Crypto compliance |
| **@rottay/navigation** | `import { ... } from '@rottay/navigation'` | App navigation |
| **@rottay/notifications** | `import { ... } from '@rottay/notifications'` | Email, SMS, Push notifications |

---

## Core

```typescript
import {
  success,
  error,
  type TenantContext,
  type UseCaseResult,
  logger,
  db,
  // Errors
  ValidationError,
  NotFoundError,
  ConflictError,
  // QR Service
  getQRService,
  // ...
} from '@rottay/core';
```

---

## Design System

```typescript
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Table,
  Modal,
  Card,
  Badge,
  // ...
} from '@rottay/design-system';
```

---

## Key Features

### Events (dm-events)
- **Event Management** - Create and manage events
- **Ticket Sales** - Multiple ticket types, pricing tiers
- **Waitlists** - Waitlist and presale management
- **Check-in** - QR code check-in at events
- **Live Sessions** - Live streaming, chat, song requests
- **Analytics** - Event performance metrics

### Bar (dm-bar)
- **Point of Sale** - Order taking and processing
- **Inventory** - Stock management, alerts
- **Recipes** - Product recipes and costing
- **Purchase Orders** - Supplier orders
- **Dynamic Pricing** - Event-based pricing

### Staff (dm-staff)
- **Staff Profiles** - Skills, certifications
- **Scheduling** - Shift management, swap requests
- **Time Tracking** - Check-in/out, breaks
- **Credentials** - Access badges, zone permissions
- **Payroll** - Earnings calculation, settlements

### Payments (dm-payments)
- **Payment Processing** - Cards, PayPal, MercadoPago
- **Subscriptions** - Recurring billing
- **Refunds** - Refund processing
- **Payouts** - Staff and vendor payments
- **Crypto** - On/off ramp integration

### Web3 (dm-web3)
- **NFT Tickets** - NFT-based event tickets
- **Tokens** - Loyalty tokens, rewards
- **Staking** - Token staking pools
- **Wallets** - Custodial and smart wallets
- **Certificates** - Verifiable NFT certificates

---

## Module Integration Example

```typescript
// Event ticket purchase with NFT minting
import { makePurchaseTicketUseCase } from '@rottay/dm-events';
import { makeCreatePaymentUseCase } from '@rottay/dm-payments';
import { makeMintBadgeUseCase } from '@rottay/dm-web3';

// 1. Create payment (payments)
const payment = await createPayment.execute({
  amount: ticketPrice,
  currency: 'USD',
  method: 'card',
}, context);

// 2. Purchase ticket (events)
const ticket = await purchaseTicket.execute({
  eventId,
  ticketTypeId,
  paymentId: payment.data.id,
}, context);

// 3. Mint NFT ticket (web3)
const nft = await mintBadge.execute({
  walletAddress: user.walletAddress,
  type: 'ticket',
  metadata: {
    eventId,
    ticketId: ticket.data.id,
  },
}, context);
```

---

## Event Day Operations

```typescript
// Staff check-in and bar order flow
import { makeCheckInUseCase } from '@rottay/dm-staff';
import { makeCreateBarOrderUseCase } from '@rottay/dm-bar';
import { makeCheckInTicketUseCase } from '@rottay/dm-events';

// 1. Staff checks in for shift
await staffCheckIn.execute({ shiftId }, context);

// 2. Attendee checks in with ticket QR
await ticketCheckIn.execute({ qrCode }, context);

// 3. Attendee orders at bar
await createBarOrder.execute({
  items: [{ productId, quantity: 2 }],
  posId,
}, context);
```
