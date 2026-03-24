# Events Module (dm-events)

> **Complete event management and ticketing platform**

## What It Does

The Events module provides end-to-end event management including venue management, artist lineups, ticket sales, check-in, waitlists, resale marketplace, and live streaming sessions. It supports both physical and virtual events with comprehensive analytics.

The module handles ticket lifecycle from purchase through check-in, supports season passes, presale codes, and waitlist management. Live sessions enable real-time interaction with chat, song requests, and tipping during streamed events.

## When to Use

- **Event Creation**: Create and publish events
- **Ticket Sales**: Manage ticket types and sales
- **Check-in**: Process attendee entry
- **Waitlists**: Manage presale and waitlists
- **Resale**: Secondary ticket marketplace
- **Live Sessions**: Real-time streaming with chat

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Event** | Main event entity |
| **Venue** | Event location |
| **Ticket** | Purchased admission |
| **TicketType** | Ticket category/pricing |
| **Waitlist** | Pre-sale waiting list |
| **LiveSession** | Streaming session |
| **SeasonPass** | Multi-event pass |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 83 use cases (43 mutations + 40 queries), 143 files |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- all 83 use cases (143 files) migrated
- **Pattern**: All use cases now return `Result<T>` via `createSuccessResult(data)` and `createErrorResult(code, message, details)` from `@rottay/core` instead of throwing errors or returning manual `{ success: true/false }` objects
- **Codebase size**: ~58K LOC

## Import

```typescript
// Events
import { makeCreateEventUC, makePublishEventUC, makeCancelEventUC } from '@rottay/events';

// Tickets
import { makePurchaseTicketUC, makeTransferTicketUC, makeCheckInUC } from '@rottay/events';

// Waitlists
import { makeJoinWaitlistUC, makeUsePresaleCodeUC } from '@rottay/events';

// Live sessions
import { makeCreateLiveSessionUC, makeStartSessionUC, makeSendTipUC } from '@rottay/events';
```

## Event Status Flow

```typescript
type EventStatus =
  | 'draft'       // Being created
  | 'scheduled'   // Scheduled, not public
  | 'published'   // Public, not selling
  | 'selling'     // Tickets on sale
  | 'sold_out'    // No more tickets
  | 'in_progress' // Event happening
  | 'completed'   // Event finished
  | 'cancelled';  // Event cancelled
```

## Related Modules

- [Bar](../bar/) - Event bar/beverage sales
- [Staff](../staff/) - Event staffing
- [Payments](../payments/) - Ticket payments
- [Web3](../web3/) - NFT tickets
