# dm-events - Entities

> **Entidades del módulo de eventos y ticketing**

---

## Entidades Principales

### Event

```typescript
interface Event {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  slug: string;
  description: string;
  type: EventType;
  status: EventStatus;
  venueId: string;
  dates: EventDate[];
  ticketTypes: string[];
  lineupId?: string;
  coverImageUrl?: string;
  galleryUrls: string[];
  settings: EventSettings;
  publishedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type EventType =
  | 'concert'
  | 'festival'
  | 'conference'
  | 'party'
  | 'sports'
  | 'theater'
  | 'exhibition'
  | 'other';

interface EventSettings {
  maxTicketsPerUser: number;
  transfersAllowed: boolean;
  resaleAllowed: boolean;
  resaleMaxMarkup: number;
  waitlistEnabled: boolean;
  seasonPassAccepted: boolean;
}
```

### Venue

```typescript
interface Venue {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  address: Address;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  zones: VenueZone[];
  amenities: string[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface VenueZone {
  id: string;
  name: string;
  capacity: number;
  type: 'general' | 'vip' | 'backstage' | 'press';
}
```

### Ticket

```typescript
interface SeatInfo {
  section?: string;
  row?: string;
  seat?: string;
  gate?: string;
  entrance?: string;
}

interface Ticket {
  id: string;
  tenantId: string;
  companyId: string;
  eventId: string;
  ticketTypeId: string;
  purchaseId: string;

  // Ownership
  ownerId: string;           // Alias for currentOwnerId (domain convenience)
  currentOwnerId: string;    // Maps to DB current_owner_id
  ownerEmail: string;        // Stored in metadata JSONB
  ownerName: string;         // Stored in metadata JSONB
  originalOwnerId: string;

  // Codes
  qrCode: string;
  barcode?: string;

  // Status
  status: TicketStatus;      // 'valid' | 'used' | 'transferred' | 'cancelled' | 'refunded'

  // Check-in (stored in metadata JSONB)
  checkedInAt?: Date;
  checkedInBy?: string;
  checkInMethod?: CheckInMethod;
  checkInLocation?: string;

  // Transfer tracking
  transferCount: number;
  maxTransfers: number;
  lastTransferredAt?: Date;

  // Usage & validity
  usedAt?: Date;
  validFrom: Date;
  validUntil: Date;

  // Seating
  seatInfo?: SeatInfo;       // JSONB { section, row, seat, gate, entrance }
  seatNumber?: string;       // Derived from seatInfo.seat
  seatRow?: string;          // Derived from seatInfo.row
  seatSection?: string;      // Derived from seatInfo.section
  zoneId?: string;           // FK to venue_zones

  // Additional data
  metadata?: Record<string, unknown>;  // JSONB for extensible data

  // Audit
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### TicketType

```typescript
interface TicketType {
  id: string;
  tenantId: string;
  eventId: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  quantity: number;
  sold: number;
  reserved: number;
  maxPerUser: number;
  saleStartAt: Date;
  saleEndAt: Date;
  zoneId?: string;
  benefits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Waitlist

```typescript
interface Waitlist {
  id: string;
  tenantId: string;
  eventId: string;
  ticketTypeId?: string;
  status: WaitlistStatus;
  maxSize: number;
  currentSize: number;
  presaleCodes: PresaleCode[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type WaitlistStatus = 'open' | 'closed' | 'processing';

interface PresaleCode {
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
}
```

### WaitlistEntry

```typescript
interface WaitlistEntry {
  id: string;
  waitlistId: string;
  userId: string;
  position: number;
  status: WaitlistEntryStatus;
  notifiedAt?: Date;
  convertedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

type WaitlistEntryStatus =
  | 'waiting'
  | 'notified'
  | 'converted'
  | 'expired'
  | 'cancelled';
```

### ResaleListing

```typescript
interface ResaleListing {
  id: string;
  tenantId: string;
  ticketId: string;
  sellerId: string;
  price: {
    amount: number;
    currency: string;
  };
  status: ResaleStatus;
  buyerId?: string;
  soldAt?: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type ResaleStatus = 'active' | 'sold' | 'cancelled' | 'expired';
```

### SeasonPass

```typescript
interface SeasonPass {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  eventIds: string[];
  price: {
    amount: number;
    currency: string;
  };
  benefits: string[];
  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  isTransferable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### LiveSession

```typescript
interface LiveSession {
  id: string;
  tenantId: string;
  eventId: string;
  stageId?: string;
  name: string;
  status: LiveSessionStatus;
  startedAt?: Date;
  endedAt?: Date;
  viewerCount: number;
  settings: LiveSessionSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type LiveSessionStatus = 'scheduled' | 'live' | 'ended';

interface LiveSessionSettings {
  chatEnabled: boolean;
  tipsEnabled: boolean;
  songRequestsEnabled: boolean;
  moderationEnabled: boolean;
}
```

### Artist

```typescript
interface Artist {
  id: string;
  tenantId: string;
  name: string;
  bio: string;
  genre: string[];
  imageUrl?: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Lineup

```typescript
interface Lineup {
  id: string;
  tenantId: string;
  eventId: string;
  slots: LineupSlot[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface LineupSlot {
  artistId: string;
  stageId: string;
  startTime: Date;
  endTime: Date;
  isHeadliner: boolean;
}
```

---

## Entidades Adicionales

### Stage

```typescript
interface Stage {
  id: string;
  tenantId: string;
  venueId: string;
  name: string;
  description?: string;
  capacity: number;
  type: 'main' | 'secondary' | 'vip' | 'outdoor';
  equipment: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### EventDate

```typescript
interface EventDate {
  id: string;
  tenantId: string;
  eventId: string;
  date: Date;
  doorsOpenAt: Date;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'cancelled' | 'postponed' | 'completed';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### EventBudget

```typescript
interface EventBudget {
  id: string;
  tenantId: string;
  eventId: string;
  category: string;
  description: string;
  estimatedAmount: number;
  actualAmount?: number;
  currency: string;
  status: 'draft' | 'approved' | 'spent';
  approvedBy?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Expense

```typescript
interface Expense {
  id: string;
  tenantId: string;
  eventId: string;
  budgetId?: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  vendor?: string;
  receiptUrl?: string;
  paidAt?: Date;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ArtistContract

```typescript
interface ArtistContract {
  id: string;
  tenantId: string;
  eventId: string;
  artistId: string;
  terms: string;
  fee: number;
  currency: string;
  depositAmount?: number;
  depositPaidAt?: Date;
  requirements: string[];
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  signedAt?: Date;
  documentUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### TicketPurchase

```typescript
interface TicketPurchase {
  id: string;
  tenantId: string;
  eventId: string;
  userId: string;
  tickets: string[];
  totalAmount: number;
  currency: string;
  paymentId?: string;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  purchasedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### PresaleCode

```typescript
interface PresaleCode {
  id: string;
  tenantId: string;
  eventId: string;
  waitlistId?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ResaleTransaction

```typescript
interface ResaleTransaction {
  id: string;
  tenantId: string;
  listingId: string;
  ticketId: string;
  sellerId: string;
  buyerId: string;
  salePrice: number;
  platformFee: number;
  sellerPayout: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  completedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### CheckIn

```typescript
interface CheckIn {
  id: string;
  tenantId: string;
  eventId: string;
  ticketId: string;
  userId: string;
  zoneId?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  method: 'qr' | 'nfc' | 'manual';
  location?: {
    latitude: number;
    longitude: number;
  };
  staffId?: string;
  isActive: boolean;
  createdAt: Date;
}
```

### AccessLog

```typescript
interface AccessLog {
  id: string;
  tenantId: string;
  eventId: string;
  userId?: string;
  ticketId?: string;
  credentialId?: string;
  zoneId: string;
  action: 'entry' | 'exit';
  timestamp: Date;
  method: 'qr' | 'nfc' | 'facial' | 'manual';
  deviceId?: string;
  staffId?: string;
  isActive: boolean;
  createdAt: Date;
}
```

### ZoneCapacity

```typescript
interface ZoneCapacity {
  id: string;
  tenantId: string;
  eventId: string;
  zoneId: string;
  maxCapacity: number;
  currentOccupancy: number;
  status: 'available' | 'near_capacity' | 'full';
  lastUpdatedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  tenantId: string;
  sessionId: string;
  eventId: string;
  userId: string;
  content: string;
  type: 'text' | 'emoji' | 'gif' | 'system';
  replyToId?: string;
  isModerated: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}
```

### SongRequest

```typescript
interface SongRequest {
  id: string;
  tenantId: string;
  sessionId: string;
  eventId: string;
  userId: string;
  songTitle: string;
  artistName?: string;
  spotifyUri?: string;
  message?: string;
  tipAmount?: number;
  tipCurrency?: string;
  status: 'pending' | 'approved' | 'rejected' | 'played';
  playedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Tip

```typescript
interface Tip {
  id: string;
  tenantId: string;
  eventId: string;
  sessionId?: string;
  userId: string;
  recipientId: string;
  recipientType: 'artist' | 'dj' | 'staff';
  amount: number;
  currency: string;
  cryptoAmount?: string;
  cryptoAsset?: string;
  message?: string;
  paymentId?: string;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### MediaItem

```typescript
interface MediaItem {
  id: string;
  tenantId: string;
  eventId: string;
  uploaderId: string;
  type: 'photo' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  duration?: number;
  size: number;
  mimeType: string;
  status: 'processing' | 'ready' | 'failed';
  moderationStatus: 'pending' | 'approved' | 'rejected';
  isPublic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### MediaReaction

```typescript
interface MediaReaction {
  id: string;
  tenantId: string;
  mediaItemId: string;
  userId: string;
  type: 'like' | 'love' | 'fire' | 'clap';
  isActive: boolean;
  createdAt: Date;
}
```

### ScreenContent

```typescript
interface ScreenContent {
  id: string;
  tenantId: string;
  eventId: string;
  screenId: string;
  type: 'image' | 'video' | 'text' | 'html' | 'feed';
  content: string;
  duration?: number;
  order: number;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  isLive: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### RealtimeDashboard

```typescript
interface RealtimeDashboard {
  id: string;
  tenantId: string;
  eventId: string;
  attendance: number;
  ticketsSold: number;
  revenue: number;
  currency: string;
  activeZones: Record<string, number>;
  barSales: number;
  tipsTotal: number;
  lastUpdatedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### AnalyticsSnapshot

```typescript
interface AnalyticsSnapshot {
  id: string;
  tenantId: string;
  eventId: string;
  snapshotType: 'hourly' | 'daily' | 'final';
  timestamp: Date;
  metrics: {
    attendance: number;
    peakAttendance: number;
    ticketsSold: number;
    revenue: number;
    barRevenue: number;
    tipsRevenue: number;
    avgTicketPrice: number;
    checkInRate: number;
  };
  isActive: boolean;
  createdAt: Date;
}
```

### Prediction

```typescript
interface Prediction {
  id: string;
  tenantId: string;
  eventId: string;
  type: 'attendance' | 'revenue' | 'demand';
  predictedValue: number;
  confidenceLevel: number;
  model: string;
  features: Record<string, unknown>;
  actualValue?: number;
  accuracy?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Benchmark

```typescript
interface Benchmark {
  id: string;
  tenantId: string;
  eventId: string;
  comparisonEventIds: string[];
  metric: string;
  eventValue: number;
  benchmarkValue: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### DiscountCode

```typescript
interface DiscountCode {
  id: string;
  tenantId: string;
  companyId: string;
  eventId?: string;              // Nullable - null means global/tenant-wide
  code: string;
  name: string;
  description?: string;
  discountType: string;          // PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y
  discountValue: number;
  maxUses?: number;              // Nullable - null means unlimited
  currentUses: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  applicableTicketTypes: string[]; // JSONB array of ticket type IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### TicketTransfer

```typescript
interface TicketTransfer {
  id: string;
  tenantId: string;
  companyId: string;
  ticketId: string;
  fromUserId: string;
  toUserId?: string;             // Populated when transfer is accepted
  toEmail?: string;              // For pending transfers to non-registered users
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  initiatedAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  message?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### TrackVote

```typescript
interface TrackVote {
  id: string;
  tenantId: string;
  companyId: string;
  sessionId: string;
  requestId: string;
  userId: string;
  voteType: 'upvote' | 'downvote';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### VisualReaction

```typescript
interface VisualReaction {
  id: string;
  tenantId: string;
  companyId: string;
  sessionId: string;
  userId: string;
  userName: string;
  reactionType: string;          // fire, heart, clap, mind_blown, dance
  positionX?: number;            // 0.0000 to 1.0000 (percentage of screen width)
  positionY?: number;            // 0.0000 to 1.0000 (percentage of screen height)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ExpenseCategory

```typescript
interface ExpenseCategory {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description?: string;
  code: string;                  // Unique per tenant
  parentCategoryId?: string;     // Self-reference for hierarchy
  budgetLimit?: number;
  color?: string;                // Hex color code
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Invoice

```typescript
interface Invoice {
  id: string;
  tenantId: string;
  companyId: string;
  eventId?: string;
  invoiceNumber: string;
  invoiceType: string;           // receivable, payable
  partyType?: string;            // customer, vendor, sponsor, artist
  partyId?: string;
  partyName: string;
  partyEmail?: string;
  partyAddress?: string;
  partyTaxId?: string;
  invoiceDate: Date;
  dueDate: Date;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  sentAt?: Date;
  paidAt?: Date;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
  documentUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### InvoiceItem

```typescript
interface InvoiceItem {
  id: string;
  tenantId: string;
  companyId: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### RevenueEntry

```typescript
interface RevenueEntry {
  id: string;
  tenantId: string;
  companyId: string;
  eventId: string;
  revenueType: string;           // tickets, merchandise, sponsorship, other
  description?: string;
  sourceType?: string;           // ticket_sale, merchandise_sale, sponsor_payment
  sourceId?: string;
  grossAmount: number;
  feesAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  revenueDate: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### SeasonPassHolder

```typescript
interface SeasonPassHolder {
  id: string;
  tenantId: string;
  companyId: string;
  seasonPassId: string;
  purchaseId?: string;
  userId: string;
  email: string;
  name?: string;
  qrCode: string;
  qrCodeUrl?: string;
  status: 'active' | 'suspended' | 'expired' | 'cancelled';
  eventsAttended: number;
  purchasedAt: Date;
  expiresAt?: Date;
  transferredFrom?: string;      // Original holder's userId if transferred
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### SeasonPassUsage

```typescript
interface SeasonPassUsage {
  id: string;
  tenantId: string;
  companyId: string;
  holderId: string;
  eventId: string;
  checkInId?: string;
  usedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### PresaleCodeUsage

```typescript
interface PresaleCodeUsage {
  id: string;
  tenantId: string;
  companyId: string;
  presaleCodeId: string;
  purchaseId?: string;
  userId: string;
  email: string;
  discountApplied: number;       // In cents
  usedAt: Date;
  ipAddress?: string;            // IPv6 compatible
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

---

## Relaciones

```
Event         1──*  TicketType
Event         1──1  Venue
Event         1──1  Lineup
Event         1──*  LiveSession
Event         1──*  Waitlist
Event         1──*  EventDate
Event         1──*  EventBudget
Event         1──*  Stage
Event         1──*  CheckIn
Event         1──*  MediaItem
Event         1──1  RealtimeDashboard
Event         1──*  AnalyticsSnapshot
TicketType    1──*  Ticket
Ticket        1──1  ResaleListing
Ticket        1──*  TicketPurchase
Waitlist      1──*  WaitlistEntry
Waitlist      1──*  PresaleCode
ResaleListing 1──1  ResaleTransaction
Lineup        *──*  Artist (via LineupSlot)
Artist        1──*  ArtistContract
SeasonPass    *──*  Event
LiveSession   1──*  ChatMessage
LiveSession   1──*  SongRequest
LiveSession   1──*  Tip
Venue         1──*  VenueZone
VenueZone     1──*  ZoneCapacity
VenueZone     1──*  AccessLog
MediaItem     1──*  MediaReaction
TicketTransfer *──1 Ticket
DiscountCode   *──1 Event (optional)
Invoice        1──* InvoiceItem
Invoice        *──1 Event (optional)
ExpenseCategory 1──* Expense
ExpenseCategory 1──* ExpenseCategory (self-ref hierarchy)
RevenueEntry   *──1 Event
SeasonPass     1──* SeasonPassHolder
SeasonPassHolder 1──* SeasonPassUsage
PresaleCode    1──* PresaleCodeUsage
TrackVote      *──1 SongRequest
TrackVote      *──1 LiveSession
VisualReaction *──1 LiveSession
```

---

## Database Tables

> Complete mapping of domain entities to their actual PostgreSQL table names.
> All tables are created via `withSchema()` factory in multi-tenant schemas.

| # | Entity | DB Table | Key Columns | Notes |
|---|--------|----------|-------------|-------|
| 1 | Venue | `event_venues` | id, tenant_id, company_id, name, city, capacity | Unique on (tenant_id, name) |
| 2 | VenueZone | `event_venue_zones` | id, tenant_id, venue_id, name, capacity, type | Unique on (venue_id, name) |
| 3 | Event | `event_events` | id, tenant_id, company_id, venue_id, slug, status, start_date, end_date | Unique on (tenant_id, slug) |
| 4 | EventDate | `event_dates` | id, tenant_id, event_id, date, doors_open_at, start_time, end_time, status | Multi-day event support |
| 5 | Stage | `event_stages` | id, tenant_id, event_id, name, capacity, type | Unique on (event_id, name) |
| 6 | Artist | `event_artists` | id, tenant_id, name, bio, genre, image_url, social_links | Indexed on (tenant_id, name) |
| 7 | Lineup | `event_lineups` | id, tenant_id, event_id, artist_id, stage_id, event_date_id, start_time, end_time, is_headliner | Junction: Artist-Stage-EventDate |
| 8 | TicketType | `event_ticket_types` | id, tenant_id, event_id, name, price, quantity, sold, phase, sale_start_date, sale_end_date | Unique on (event_id, name) |
| 9 | Ticket | `event_tickets` | id, tenant_id, event_id, ticket_type_id, purchase_id, current_owner_id, qr_code, status, metadata (JSONB) | Unique on qr_code |
| 10 | TicketPurchase | `event_ticket_purchases` | id, tenant_id, event_id, user_id, status, payment_status, total_amount, purchased_at | Ticket sales records |
| 11 | DiscountCode | `event_discount_codes` | id, tenant_id, company_id, event_id, code, discount_type, discount_value, max_uses, current_uses, valid_from, valid_until | Unique on (tenant_id, code) |
| 12 | TicketTransfer | `event_ticket_transfers` | id, tenant_id, ticket_id, from_user_id, to_user_id, to_email, status, expires_at | Transfer history & pending |
| 13 | ResaleListing | `event_resale_listings` | id, tenant_id, ticket_id, seller_id, original_price, asking_price, status (enum), platform_fee_percentage, seller_receives | Uses resale_listing_status enum |
| 14 | ResaleTransaction | `event_resale_transactions` | id, tenant_id, listing_id, ticket_id, seller_id, buyer_id, sale_price, platform_fee, seller_payout, payment_status (enum), transfer_status (enum) | Uses resale_payment_status & resale_transfer_status enums |
| 15 | CheckIn | `event_check_ins` | id, tenant_id, event_id, ticket_id, zone_id, check_in_time, checked_in_by | Check-in tracking |
| 16 | AccessLog | `event_access_logs` | id, tenant_id, event_id, ticket_id, action, timestamp, from_zone_id, to_zone_id | Zone entry/exit log |
| 17 | ZoneCapacity | `event_zone_capacities` | id, tenant_id, event_id, zone_id, max_capacity, current_occupancy, status | Unique on (event_id, zone_id) |
| 18 | MediaItem | `event_media_items` | id, tenant_id, event_id, user_id, media_type, url, moderation_status | Attendee uploads |
| 19 | MediaReaction | `event_media_reactions` | id, tenant_id, media_item_id, user_id, type | Unique on (user_id, media_item_id) |
| 20 | ScreenContent | `event_screen_content` | id, tenant_id, event_id, stage_id, content_type, start_time, end_time | Visual content scheduling |
| 21 | LiveSession | `event_live_sessions` | id, tenant_id, event_id, artist_id, stage_id, status, scheduled_start | DJ/artist live sessions |
| 22 | ChatMessage | `event_chat_messages` | id, tenant_id, session_id, user_id, content, type | Live session chat |
| 23 | SongRequest | `event_song_requests` | id, tenant_id, session_id, user_id, song_title, artist_name, status, upvotes | Attendee song requests |
| 24 | Tip | `event_tips` | id, tenant_id, session_id, user_id, artist_id, amount, payment_method, payment_status | Tips to artists/DJs |
| 25 | TrackVote | `event_track_votes` | id, tenant_id, session_id, request_id, user_id, vote_type | Unique on (request_id, user_id) |
| 26 | VisualReaction | `event_visual_reactions` | id, tenant_id, session_id, user_id, user_name, reaction_type, position_x, position_y | Animated screen reactions |
| 27 | EventBudget | `event_budgets` | id, tenant_id, event_id, status | Financial budgets |
| 28 | ExpenseCategory | `event_expense_categories` | id, tenant_id, company_id, name, code, parent_category_id, budget_limit, sort_order | Unique on (tenant_id, code); self-referencing hierarchy |
| 29 | Expense | `event_expenses` | id, tenant_id, budget_id, category_id, status, expense_date | Event expenditures |
| 30 | RevenueEntry | `event_revenue_entries` | id, tenant_id, event_id, revenue_type, source_type, source_id, gross_amount, fees_amount, net_amount, revenue_date | Revenue tracking |
| 31 | ArtistContract | `event_artist_contracts` | id, tenant_id, event_id, artist_id, status | Artist booking contracts |
| 32 | Invoice | `event_invoices` | id, tenant_id, event_id, invoice_number, invoice_type, party_name, subtotal, total_amount, status, due_date | Unique on (tenant_id, invoice_number) |
| 33 | InvoiceItem | `event_invoice_items` | id, tenant_id, invoice_id, description, quantity, unit_price, subtotal, total, sort_order | Invoice line items |
| 34 | Waitlist | `event_waitlists` | id, tenant_id, event_id, ticket_type_id, status | Event waitlists |
| 35 | WaitlistEntry | `event_waitlist_entries` | id, tenant_id, waitlist_id, user_id, position, status | Waitlist positions |
| 36 | PresaleCode | `event_presale_codes` | id, tenant_id, event_id, code, max_uses, valid_from, valid_until | Unique on (tenant_id, code) |
| 37 | PresaleCodeUsage | `event_presale_code_usages` | id, tenant_id, presale_code_id, purchase_id, user_id, email, discount_applied, used_at, ip_address | Presale code usage tracking |
| 38 | AnalyticsSnapshot | `event_analytics_snapshots` | id, tenant_id, event_id, snapshot_type, snapshot_category, captured_at | Periodic metrics snapshots |
| 39 | Prediction | `event_predictions` | id, tenant_id, event_id, prediction_type, target_date, generated_at | ML-based predictions |
| 40 | Benchmark | `event_benchmarks` | id, tenant_id, event_id, comparison_event_id, benchmark_type, metric_name, calculated_at | Cross-event benchmarking |
| 41 | RealtimeDashboardState | `event_realtime_dashboard_states` | id, tenant_id, event_id, last_updated_at | Unique on event_id; live dashboard state |
| 42 | SeasonPass | `event_season_passes` | id, tenant_id, name, status, valid_from, valid_until | Multi-event passes |
| 43 | SeasonPassHolder | `event_season_pass_holders` | id, tenant_id, season_pass_id, purchase_id, user_id, email, qr_code, status, events_attended | Unique on qr_code |
| 44 | SeasonPassUsage | `event_season_pass_usages` | id, tenant_id, holder_id, event_id, check_in_id, used_at | Season pass event claims |

### Schema-Specific Enums

| Enum Name | Values | Used By |
|-----------|--------|---------|
| `resale_listing_status` | ACTIVE, SOLD, CANCELLED, EXPIRED | `event_resale_listings.status` |
| `resale_payment_status` | PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED | `event_resale_transactions.payment_status` |
| `resale_transfer_status` | PENDING, COMPLETED, FAILED | `event_resale_transactions.transfer_status` |
