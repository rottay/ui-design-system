/**
 * EvSeatingChart - Core Interface
 * Large event seating with sections, rows, numbered seats, and price tiers
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvSeatingChartPreset = 'editor' | 'assignment';

export interface SeatingSection {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  tier: string;
  pricePerSeat: number;
  color: string;
}

export interface SeatInfo {
  id: string;
  sectionId: string;
  row: string;
  number: number;
  status: 'available' | 'reserved' | 'sold' | 'blocked' | 'vip';
  assignee?: string;
  ticketId?: string;
}

export interface EvSeatingChartProps extends EngineAwareProps {
  preset?: EvSeatingChartPreset;
  sections?: SeatingSection[];
  seats?: SeatInfo[];
  selectedSeatIds?: string[];
  onSeatClick?: (seatId: string) => void;
  onSectionClick?: (sectionId: string) => void;
  onAssign?: (seatId: string, guestName: string) => void;
  searchQuery?: string;
  className?: string;
  style?: CSSProperties;
}

export const EV_SEATING_CHART_DEFAULTS: Partial<EvSeatingChartProps> = {
  preset: 'editor',
};
