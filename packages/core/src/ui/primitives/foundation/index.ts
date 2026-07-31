/**
 * @fileoverview Primitive foundation barrel export.
 * Engine-agnostic building blocks that other primitives compose. They sit
 * below the component categories so a capability shared by several of them
 * never has to be rebuilt, and never becomes a sideways dependency between
 * peer categories.
 */

export { ResizeHandle, RESIZE_HANDLE_DEFAULTS } from './ResizeHandle';
export type {
  ResizeHandleAnatomy,
  ResizeHandleArrowPolicy,
  ResizeHandleIntent,
  ResizeHandleOrientation,
  ResizeHandleProps,
} from './ResizeHandle';

export {
  DAYS_SHORT,
  MONTHS_FULL,
  MONTHS_SHORT,
  applyFormat,
  daysInMonthCount,
  firstDayOfMonth,
  formatDateStr,
  formatDisplay,
  formatTimeStr,
  generateCalendarGrid,
  getKeyboardNavDate,
  isDateInRange,
  isSameDay,
  pad2,
  parseDateValue,
  stripTime,
} from './calendar';
export type { CalendarDay } from './calendar';
