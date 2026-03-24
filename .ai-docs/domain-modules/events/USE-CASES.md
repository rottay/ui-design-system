# dm-events - Use Cases

> **Event Management and Ticketing**

**Total: 83 use cases (43 mutations, 40 queries) | 83 zero-arg factories (100% coverage) | 143 files**

> **REVIEW-2026 Result Pattern Migration**: Complete. All 83 use cases (143 files) return `Result<T>` using `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. ~58K LOC.

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [event](#event)
  - [venue](#venue)
  - [artist](#artist)
  - [lineup](#lineup)
  - [stage](#stage)
  - [ticket-type](#ticket-type)
  - [ticket](#ticket)
  - [waitlist](#waitlist)
  - [resale](#resale)
  - [season-pass](#season-pass)
  - [live-session](#live-session)
  - [media](#media)
  - [analytics](#analytics)
  - [finance](#finance)
- [Queries](#queries)
  - [event (query)](#event-1)
  - [venue (query)](#venue-1)
  - [artist (query)](#artist-1)
  - [ticket-type (query)](#ticket-type-1)
  - [ticket (query)](#ticket-1)
  - [check-in](#check-in)
  - [waitlist (query)](#waitlist-1)
  - [resale (query)](#resale-1)
  - [season-pass (query)](#season-pass-1)
  - [live-session (query)](#live-session-1)
  - [media (query)](#media-1)
  - [analytics (query)](#analytics-1)
  - [finance (query)](#finance-1)
  - [zone-capacity](#zone-capacity)
- [Entities](#entities)
- [Related](#related)

---

## Overview

The **dm-events** module handles complete event lifecycle management and ticketing operations for the platform. It provides comprehensive functionality for:

- **Event Management**: Create, publish, and manage events with full status workflow (draft, scheduled, published, selling, sold out, in progress, completed, cancelled)
- **Venue & Stage Management**: Configure venues with multiple stages and zone capacities
- **Artist & Lineup**: Manage artist profiles and event lineups
- **Ticketing**: Full ticket lifecycle including purchase, transfer, cancellation, and check-in with QR code support
- **Waitlist & Presale**: Manage waitlists with presale codes for exclusive access
- **Resale Marketplace**: Secondary market for ticket resales with controlled listings
- **Season Passes**: Multi-event passes with eligibility verification
- **Live Sessions**: Real-time event features including chat, song requests, and tips
- **Media**: Event media upload, moderation, and reactions
- **Analytics**: Dashboards, snapshots, predictions, and benchmarks
- **Finance**: Budget management and expense tracking

---

## Mutations

### event
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates new event | EventCreateUseCase |
| update | Updates event | EventUpdateUseCase |
| publish | Publishes event | EventPublishUseCase |
| cancel | Cancels event | EventCancelUseCase |

### venue
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates venue | VenueCreateUseCase |
| update | Updates venue | VenueUpdateUseCase |

### artist
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Registers artist | ArtistCreateUseCase |
| update | Updates artist | ArtistUpdateUseCase |

### lineup
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates event lineup | LineupCreateUseCase |
| update | Updates lineup | LineupUpdateUseCase |

### stage
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates stage | StageCreateUseCase |
| update | Updates stage | StageUpdateUseCase |

### ticket-type
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates ticket type | TicketTypeCreateUseCase |
| update | Updates ticket type | TicketTypeUpdateUseCase |
| delete | Deletes ticket type | TicketTypeDeleteUseCase |

### ticket
| Use Case | Description | Class |
|----------|-------------|-------|
| purchase | Purchases ticket | TicketPurchaseUseCase |
| transfer | Transfers ticket | TicketTransferUseCase |
| cancel | Cancels ticket | TicketCancelUseCase |
| check-in | Records entry | TicketCheckInUseCase |

### waitlist
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates waitlist | WaitlistCreateUseCase |
| join | Joins waitlist | WaitlistJoinUseCase |
| leave | Leaves waitlist | WaitlistLeaveUseCase |
| use-presale-code | Uses presale code | WaitlistUsePresaleCodeUseCase |

### resale
| Use Case | Description | Class |
|----------|-------------|-------|
| create-listing | Creates resale listing | ResaleCreateListingUseCase |
| purchase-listing | Purchases from resale | ResalePurchaseListingUseCase |
| cancel-listing | Cancels listing | ResaleCancelListingUseCase |

### season-pass
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates season pass | SeasonPassCreateUseCase |
| purchase | Purchases pass | SeasonPassPurchaseUseCase |
| transfer | Transfers pass | SeasonPassTransferUseCase |
| use | Uses pass at event | SeasonPassUseUseCase |

### live-session
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates live session | LiveSessionCreateUseCase |
| start | Starts session | LiveSessionStartUseCase |
| end | Ends session | LiveSessionEndUseCase |
| send-message | Sends chat message | LiveSessionSendMessageUseCase |
| create-song-request | Creates song request | LiveSessionCreateSongRequestUseCase |
| send-tip | Sends tip | LiveSessionSendTipUseCase |

### media
| Use Case | Description | Class |
|----------|-------------|-------|
| upload | Uploads media | MediaUploadUseCase |
| moderate | Moderates content | MediaModerateUseCase |
| react | Reacts to media | MediaReactUseCase |

### analytics
| Use Case | Description | Class |
|----------|-------------|-------|
| create-snapshot | Creates analytics snapshot | AnalyticsCreateSnapshotUseCase |
| create-prediction | Creates prediction | AnalyticsCreatePredictionUseCase |
| record-actual | Records actual data | AnalyticsRecordActualUseCase |
| update-dashboard | Updates dashboard | AnalyticsUpdateDashboardUseCase |

### finance
| Use Case | Description | Class |
|----------|-------------|-------|
| create-budget | Creates budget | FinanceCreateBudgetUseCase |
| approve-budget | Approves budget | FinanceApproveBudgetUseCase |
| create-expense | Records expense | FinanceCreateExpenseUseCase |
| approve-expense | Approves expense | FinanceApproveExpenseUseCase |

---

## Queries

### event
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets event by ID | EventGetByIdUseCase |
| get-by-slug | Gets event by slug | EventGetBySlugUseCase |
| list | Lists events | EventListUseCase |

### venue
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets venue by ID | VenueGetByIdUseCase |
| list | Lists venues | VenueListUseCase |

### artist
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets artist by ID | ArtistGetByIdUseCase |
| list | Lists artists | ArtistListUseCase |

### ticket-type
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets type by ID | TicketTypeGetByIdUseCase |
| list-by-event | Lists by event | TicketTypeListByEventUseCase |

### ticket
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets ticket by ID | TicketGetByIdUseCase |
| get-by-qr-code | Gets by QR code | TicketGetByQrCodeUseCase |
| list-by-owner | Lists user tickets | TicketListByOwnerUseCase |

### check-in
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets check-in by ID | CheckInGetByIdUseCase |
| list-by-event | Lists by event | CheckInListByEventUseCase |
| get-stats | Check-in statistics | CheckInGetStatsUseCase |

### waitlist
| Use Case | Description | Class |
|----------|-------------|-------|
| list-entries | Lists entries | WaitlistListEntriesUseCase |
| get-position | Gets position in list | WaitlistGetPositionUseCase |
| validate-presale-code | Validates presale code | WaitlistValidatePresaleCodeUseCase |

### resale
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets listing by ID | ResaleGetByIdUseCase |
| list-by-event | Lists by event | ResaleListByEventUseCase |

### season-pass
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets pass by ID | SeasonPassGetByIdUseCase |
| list | Lists passes | SeasonPassListUseCase |
| check-event-eligibility | Check event eligibility for user | CheckEventEligibilityUseCase |

### live-session
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets session by ID | LiveSessionGetByIdUseCase |
| get-active | Gets active sessions | LiveSessionGetActiveUseCase |
| list-messages | Lists messages | LiveSessionListMessagesUseCase |
| list-requests | Lists song requests | LiveSessionListRequestsUseCase |

### media
| Use Case | Description | Class |
|----------|-------------|-------|
| list-by-event | Lists media by event | MediaListByEventUseCase |
| list-pending | Lists pending moderation | MediaListPendingUseCase |

### analytics
| Use Case | Description | Class |
|----------|-------------|-------|
| get-dashboard | Gets dashboard | AnalyticsGetDashboardUseCase |
| get-snapshots | Gets snapshots | AnalyticsGetSnapshotsUseCase |
| get-predictions | Gets predictions | AnalyticsGetPredictionsUseCase |
| get-benchmarks | Gets benchmarks | AnalyticsGetBenchmarksUseCase |

### finance
| Use Case | Description | Class |
|----------|-------------|-------|
| get-budget-summary | Budget summary | FinanceGetBudgetSummaryUseCase |
| list-expenses | Lists expenses | FinanceListExpensesUseCase |

### zone-capacity
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-event | Zone capacity by event | ZoneCapacityGetByEventUseCase |

---

## Entities

### Event Status

```typescript
type EventStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'selling'
  | 'sold_out'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
```

### Ticket Status

```typescript
type TicketStatus =
  | 'reserved'       // Temporarily reserved
  | 'confirmed'      // Purchase confirmed
  | 'checked_in'     // Registered at event
  | 'used'           // Fully used
  | 'cancelled'      // Cancelled
  | 'refunded'       // Refunded
  | 'transferred';   // Transferred to another user
```

---

## Related

| Module | Relationship |
|--------|--------------|
| [dm-bar](../bar/USE-CASES.md) | Bar operations at event venues; order management during events |
| [dm-staff](../staff/USE-CASES.md) | Staff scheduling and management for events; check-in personnel |
| [dm-payments](../payments/USE-CASES.md) | Payment processing for ticket purchases, resales, and tips |
| [dm-web3](../web3/USE-CASES.md) | NFT tickets, blockchain verification, and tokenized season passes |
