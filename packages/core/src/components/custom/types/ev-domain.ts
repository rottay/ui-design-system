/**
 * Evnto Domain Types
 * Aligned with dm-events + dm-staff + dm-bar domain models
 */

import type { AuditFields, Currency, DateRange, TrendIndicator } from './common';

/** Event status */
export type EvEventStatus = 'draft' | 'upcoming' | 'live' | 'completed' | 'cancelled';

/** Event type */
export type EvEventType = 'concert' | 'festival' | 'conference' | 'party' | 'sports' | 'corporate' | 'other';

/** Ticket status */
export type EvTicketStatus = 'available' | 'low-stock' | 'sold-out' | 'not-on-sale';

/** Check-in status */
export type EvCheckInStatus = 'pending' | 'checked-in' | 'checked-out' | 'no-show';

/** Staff role */
export type EvStaffRole = 'security' | 'bartender' | 'dj' | 'technician' | 'coordinator' | 'vip-host' | 'cleanup' | 'other';

/** Shift status */
export type EvShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'no-show';

/** Order status */
export type EvOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

/** Payment method */
export type EvPaymentMethod = 'cash' | 'card' | 'nfc' | 'wristband' | 'app';

/** Event entity */
export interface EvEvent extends AuditFields {
  id: string;
  name: string;
  description?: string;
  type: EvEventType;
  status: EvEventStatus;
  venueId: string;
  venueName: string;
  coverImageUrl?: string;
  startDate: Date;
  endDate: Date;
  doorsOpen?: Date;
  capacity: number;
  currentAttendees: number;
  ticketTypes: EvTicketType[];
  totalRevenue: Currency;
  totalTicketsSold: number;
}

/** Ticket type */
export interface EvTicketType {
  id: string;
  name: string;
  price: Currency;
  quantity: number;
  sold: number;
  status: EvTicketStatus;
  description?: string;
}

/** Venue entity */
export interface EvVenue {
  id: string;
  name: string;
  address: string;
  totalCapacity: number;
  zones: EvZone[];
  imageUrl?: string;
}

/** Venue zone */
export interface EvZone {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  type: 'general' | 'vip' | 'backstage' | 'bar' | 'stage' | 'entrance' | 'exit';
}

/** Lineup slot / artist */
export interface EvLineupSlot {
  id: string;
  artistName: string;
  genre?: string;
  imageUrl?: string;
  stageId: string;
  stageName: string;
  startTime: Date;
  endTime: Date;
  isHeadliner?: boolean;
}

/** Check-in record */
export interface EvCheckIn {
  id: string;
  attendeeId: string;
  attendeeName: string;
  ticketType: string;
  zone: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: EvCheckInStatus;
}

/** Staff member */
export interface EvStaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: EvStaffRole;
  skills: string[];
  availability: boolean;
  rating?: number;
  totalShifts: number;
}

/** Shift */
export interface EvShift extends AuditFields {
  id: string;
  staffId: string;
  staffName: string;
  eventId: string;
  role: EvStaffRole;
  zone?: string;
  startTime: Date;
  endTime: Date;
  status: EvShiftStatus;
  breakDuration?: number;
}

/** Bar product */
export interface EvBarProduct {
  id: string;
  name: string;
  category: 'beer' | 'cocktail' | 'wine' | 'spirit' | 'non-alcoholic' | 'food' | 'merch';
  price: Currency;
  imageUrl?: string;
  stockLevel: number;
  isAvailable: boolean;
  isPopular?: boolean;
}

/** Bar order */
export interface EvBarOrder extends AuditFields {
  id: string;
  items: EvOrderItem[];
  subtotal: Currency;
  tax: Currency;
  total: Currency;
  paymentMethod: EvPaymentMethod;
  status: EvOrderStatus;
  staffId: string;
  staffName: string;
  zoneId?: string;
}

/** Order item */
export interface EvOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Currency;
  total: Currency;
}

/** DJ session */
export interface EvDjSession {
  id: string;
  djName: string;
  stageId: string;
  stageName: string;
  startTime: Date;
  endTime: Date;
  genre: string;
  requestCount: number;
  tipTotal: Currency;
  trackCount: number;
}

/** Crowd flow data point */
export interface EvCrowdFlowPoint {
  zoneId: string;
  zoneName: string;
  timestamp: Date;
  count: number;
  capacity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

/** Sentiment data point */
export interface EvSentimentPoint {
  timestamp: Date;
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  sampleSize: number;
}

/** Revenue breakdown */
export interface EvRevenueBreakdown {
  source: 'tickets' | 'bar' | 'merch' | 'vip' | 'sponsorship';
  amount: Currency;
  percentage: number;
  trend: TrendIndicator;
}
