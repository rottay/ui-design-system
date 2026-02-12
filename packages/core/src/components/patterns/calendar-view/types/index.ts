import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface CalendarEvent<T = unknown> {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  color?: string;
  allDay?: boolean;
  data?: T;
}

export interface CalendarViewProps<T> extends PatternBaseProps {
  events: CalendarEvent<T>[];
  view?: 'month' | 'week' | 'day';
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  onEventClick?: (event: CalendarEvent<T>) => void;
  onDateClick?: (date: Date) => void;
  renderEvent?: (event: CalendarEvent<T>) => ReactNode;
  toolbar?: ReactNode;
  header?: ReactNode;
}
