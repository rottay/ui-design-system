/**
 * EvEventDetail - Core Interface
 * Detailed event view with stats
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvEventDetailPreset = 'full' | 'compact';

export interface EventInfo {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  venue: string;
  dates: Array<{ date: Date;
  startTime: string;
  endTime: string }>;
  status: "draft" | "published" | "live" | "completed";
  organizer: string;
}

export interface TicketSalesSummary {
  totalSold: number;
  totalCapacity: number;
  revenue: number;
  byType: Array<{ type: string;
  sold: number;
  total: number;
  price: number }>;
}

export interface CheckInProgress {
  checkedIn: number;
  total: number;
  rate: number;
}

export interface EvEventDetailProps extends EngineAwareProps {
  preset?: EvEventDetailPreset;
  event?: EventInfo;
  ticketSales?: TicketSalesSummary;
  checkInProgress?: CheckInProgress;
  onEdit?: () => void;
  onManageTickets?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_EVENT_DETAIL_DEFAULTS: Partial<EvEventDetailProps> = {
  preset: 'full',

};
