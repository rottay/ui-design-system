/** Canonical event shape shared by calendars and scheduling surfaces. */
export interface CalendarEvent<T = unknown> {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  color?: string;
  allDay?: boolean;
  data?: T;
}
