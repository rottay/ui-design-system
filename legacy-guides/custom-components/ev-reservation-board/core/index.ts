/**
 * EvReservationBoard - Core Interface
 * Reservations kanban and calendar timeline for table management
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvReservationBoardPreset = 'kanban' | 'calendar';

export interface Reservation {
  id: string;
  guestName: string;
  guestPhone?: string;
  partySize: number;
  tableId?: string;
  tableLabel?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'requested' | 'confirmed' | 'seated' | 'completed' | 'no-show' | 'cancelled';
  notes?: string;
  vip?: boolean;
  occasion?: string;
}

export interface EvReservationBoardProps extends EngineAwareProps {
  preset?: EvReservationBoardPreset;
  reservations?: Reservation[];
  tables?: { id: string; label: string; capacity: number }[];
  selectedDate?: Date;
  onReservationClick?: (reservationId: string) => void;
  onStatusChange?: (reservationId: string, status: Reservation['status']) => void;
  onDateChange?: (date: Date) => void;
  onCreateReservation?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_RESERVATION_BOARD_DEFAULTS: Partial<EvReservationBoardProps> = {
  preset: 'kanban',
};
