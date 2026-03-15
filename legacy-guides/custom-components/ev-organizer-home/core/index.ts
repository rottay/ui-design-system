/**
 * EvOrganizerHome - Core Interface
 * Event organizer main dashboard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvOrganizerHomePreset = 'overview' | 'compact';

export interface EventKpi {
  label: string;
  value: string | number;
  trend: "up" | "down" | "flat";
  trendValue: number;
  icon?: ReactNode;
}

export interface UpcomingEvent {
  id: string;
  name: string;
  date: Date;
  venue: string;
  ticketsSold: number;
  capacity: number;
  status: "draft" | "published" | "live" | "completed";
}

export interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
}

export interface LineupSlot {
  id: string;
  artistName: string;
  stageName: string;
  startTime: Date;
  endTime: Date;
  confirmed: boolean;
}

export interface OrganizerAction {
  key: string;
  label: string;
  icon: ReactNode;
  description?: string;
  onClick?: () => void;
}

export interface EvOrganizerHomeProps extends EngineAwareProps {
  preset?: EvOrganizerHomePreset;
  organizerName?: string;
  kpis?: EventKpi[];
  upcomingEvents?: UpcomingEvent[];
  revenueSources?: RevenueSource[];
  lineupSlots?: LineupSlot[];
  quickActions?: OrganizerAction[];
  dateRangeLabel?: string;
  onEventClick?: (eventId: string) => void;
  onActionClick?: (actionKey: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ORGANIZER_HOME_DEFAULTS: Partial<EvOrganizerHomeProps> = {
  preset: 'overview',
  organizerName: 'Organizer',
  dateRangeLabel: 'Last 30 days',
};
