/**
 * EvAttendeeList - Core Interface
 * Attendee management list
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvAttendeeListPreset = 'table' | 'compact';

export interface AttendeeRecord {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  ticketNumber: string;
  purchaseDate: Date;
  checkInStatus: "pending" | "checked-in" | "no-show";
  zone?: string;
}

export interface AttendeeFilter {
  search?: string;
  ticketType?: string;
  checkInStatus?: string;
}

export interface EvAttendeeListProps extends EngineAwareProps {
  preset?: EvAttendeeListPreset;
  attendees?: AttendeeRecord[];
  filters?: AttendeeFilter;
  totalCount?: number;
  onAttendeeClick?: (id: string) => void;
  onFilterChange?: (filters: AttendeeFilter) => void;
  onExport?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ATTENDEE_LIST_DEFAULTS: Partial<EvAttendeeListProps> = {
  preset: 'table',

};
