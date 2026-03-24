# App Evnto

> **Complete event management and ticketing application**

## What It Does

Evnto is the events vertical application providing end-to-end event management. It handles event creation, ticket sales, check-in, bar operations, staff scheduling, payments, and Web3 integration for NFT tickets. The platform supports both physical and virtual events with live streaming capabilities.

## Target Users

- Event organizers
- Venue managers
- Bar staff
- Event attendees
- Artists/performers

## Key Features

- Event creation and publishing
- Ticket sales and check-in
- Bar and POS operations
- Staff scheduling and payroll
- Live streaming sessions
- NFT tickets and badges
- Payment processing
- Real-time analytics

## Modules Used

| Module | Purpose |
|--------|---------|
| [Events](../../domain-modules/events/) | Event management |
| [Bar](../../domain-modules/bar/) | Bar operations |
| [Staff](../../domain-modules/staff/) | Staff management |
| [Payments](../../domain-modules/payments/) | Payment processing |
| [Web3](../../domain-modules/web3/) | NFT tickets |
| [Auth](../../platform/auth/) | User authentication |
| [Identity](../../platform/identity/) | User profiles |
| [Notifications](../../platform/notifications/) | Event communications |

## Tech Stack

- Next.js 14 (App Router)
- React Server Components
- @rottay/design-system
- tRPC for API
- Real-time with WebSockets
- Web3 integration (wagmi, viem)

## Structure

```
apps/evnto/
├── app/                 # Next.js app directory
│   ├── (auth)/         # Auth pages
│   ├── (organizer)/    # Organizer dashboard
│   │   ├── events/     # Event management
│   │   ├── tickets/    # Ticket management
│   │   ├── staff/      # Staff scheduling
│   │   └── analytics/  # Event analytics
│   ├── (attendee)/     # Attendee experience
│   ├── (bar)/          # Bar/POS interface
│   └── (live)/         # Live streaming
├── components/         # App-specific components
├── lib/               # Utilities
└── styles/            # Global styles
```

## REVIEW-2026 Changes

### Console Log Cleanup
- ~214 `console.log` statements removed from `src/`

### Code Health Metrics
- **Design System adoption**: 95.9% (140/146 TSX files import DS)
- **Server Action wrapper compliance**: N/A (no server action files with `.execute()` pattern)

## Related Apps

- [Platform](../platform/) - Platform administration
- [BitHire](../bithire/) - Recruiting vertical
