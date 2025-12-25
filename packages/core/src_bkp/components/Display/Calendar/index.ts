/**
 * Calendar Component Exports
 */

export { Calendar } from './Calendar';

export type {
  CalendarMode,
  CalendarHeaderRenderInfo,
  CalendarProps,
  CalendarLocale,
} from './types';

export {
  getDaysInMonth,
  getFirstDayOfMonth,
  getCalendarGrid,
  getMonthsGrid,
  isSameDay,
  isSameMonth,
  isToday,
  formatMonth,
  formatYear,
  DEFAULT_WEEKDAYS,
  DEFAULT_MONTHS,
} from './types';

// Engine exports for direct usage
export { default as TitanCalendar } from './engines/titan';
export { default as HermesCalendar } from './engines/hermes';
export { default as ApolloCalendar } from './engines/apollo';
export { default as AthenaCalendar } from './engines/athena';
