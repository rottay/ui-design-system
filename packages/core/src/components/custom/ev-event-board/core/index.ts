/**
 * EvEventBoard - Core Interface
 * Event listing board with multi-view
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvEventBoardPreset = 'grid' | 'table';

export interface EventCard {
  id: string;
  name: string;
  coverImage?: string;
  date: Date;
  endDate?: Date;
  venue: string;
  status: "draft" | "published" | "live" | "completed" | "cancelled";
  ticketsSold: number;
  capacity: number;
  revenue: number;
}

export interface EventFilter {
  status?: string;
  venue?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface EvEventBoardProps extends EngineAwareProps {
  preset?: EvEventBoardPreset;
  events?: EventCard[];
  filters?: EventFilter;
  onEventClick?: (eventId: string) => void;
  onCreateEvent?: () => void;
  onFilterChange?: (filters: EventFilter) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_EVENT_BOARD_DEFAULTS: Partial<EvEventBoardProps> = {
  preset: 'grid',

};
