import type { CalendarEvent } from '../../../contracts';

/** A bare `YYYY-MM-DD` payload: a calendar date, not an instant. */
const DATE_ONLY_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Normalize a Date or ISO string into a YYYY-MM-DD key for event lookup. */
export function toDateKey(d: Date | string): string {
  if (typeof d === 'string') {
    // `new Date('2026-03-05')` is UTC midnight, so `getDate()` reports the
    // previous day everywhere west of UTC. A date-only payload names a
    // calendar day: keep its own digits instead of re-projecting it.
    const dateOnly = DATE_ONLY_ISO.exec(d);
    if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  }
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Sort key for an event: the numeric instant of its start. */
export function startTime(d: Date | string): number {
  const dateOnly = typeof d === 'string' ? DATE_ONLY_ISO.exec(d) : null;
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    ).getTime();
  }
  const value = typeof d === 'string' ? new Date(d) : d;
  const time = value.getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** One actual hour between local midnights; repeated wall hours keep separate keys. */
export interface HourSlot {
  key: string;
  date: Date;
  end: number;
  clock: number;
  occurrence: number;
}

/** A local civil day and its real, possibly 23/25-hour, interval. */
export interface TimeDay {
  date: Date;
  start: number;
  end: number;
  slots: Map<string, HourSlot>;
}

/** Enumerate real hourly instants without manufacturing a missing DST hour. */
export function timeDay(date: Date): TimeDay {
  const first = new Date(date);
  first.setHours(0, 0, 0, 0);
  const next = new Date(first);
  next.setDate(next.getDate() + 1);
  const slots = new Map<string, HourSlot>();
  const occurrences = new Map<number, number>();
  // Walk instants between local midnights: DST days contain 23 or 25 hours.
  for (let stamp = first.getTime(); stamp < next.getTime(); stamp += 60 * 60 * 1000) {
    const value = new Date(stamp);
    const clock = value.getHours() * 60 + value.getMinutes();
    const occurrence = occurrences.get(clock) ?? 0;
    occurrences.set(clock, occurrence + 1);
    const key = `${clock}:${occurrence}`;
    slots.set(key, { key, date: value, end: Math.min(stamp + 60 * 60 * 1000, next.getTime()), clock, occurrence });
  }
  return { date: first, start: first.getTime(), end: next.getTime(), slots };
}

/** Private grid geometry for a clipped timed entry and its overlap lane. */
export interface TimedEntry<T> {
  event: CalendarEvent<T>;
  slotKey: string;
  offset: number;
  span: number;
  start: number;
  end: number;
  orderStart: number;
  orderEnd: number;
  lane: number;
  lanes: number;
}

/** Date-only values name calendar days, independent of the viewer’s UTC offset. */
export function isAllDay<T>(event: CalendarEvent<T>): boolean {
  return event.allDay === true || (event.allDay !== false && typeof event.start === 'string' && DATE_ONLY_ISO.test(event.start));
}

/** Invalid timestamps never become a real epoch entry in a time grid. */
function eventInstant(value: Date | string): number | undefined {
  const civil = typeof value === 'string' ? DATE_ONLY_ISO.exec(value) : null;
  const parsed = civil ? new Date(0) : new Date(value);
  if (civil) {
    const [, year, month, day] = civil;
    parsed.setFullYear(Number(year), Number(month) - 1, Number(day));
    parsed.setHours(0, 0, 0, 0);
    if (parsed.getFullYear() !== Number(year) || parsed.getMonth() !== Number(month) - 1 || parsed.getDate() !== Number(day)) return undefined;
  }
  const stamp = parsed.getTime();
  return Number.isFinite(stamp) ? stamp : undefined;
}

/** Clip timed intervals to one day; point entries retain a minimum visible footprint. */
export function timeEntries<T>(day: TimeDay, events: CalendarEvent<T>[], rowIndices: Map<string, number>): TimedEntry<T>[] {
  const position = (stamp: number): number => {
    for (const slot of day.slots.values()) {
      if (stamp < slot.end) {
        return (rowIndices.get(slot.key) ?? 0) + (stamp - slot.date.getTime()) / (slot.end - slot.date.getTime());
      }
    }
    const last = Array.from(day.slots.values()).pop();
    return last ? (rowIndices.get(last.key) ?? 0) + 1 : 0;
  };
  const entries: TimedEntry<T>[] = [];
  for (const event of events) {
    if (isAllDay(event)) continue;
    const start = eventInstant(event.start);
    const suppliedEnd = event.end === undefined ? start : eventInstant(event.end);
    if (start === undefined || suppliedEnd === undefined) continue;
    const end = Math.max(start, suppliedEnd);
    if (end === start ? start < day.start || start >= day.end : start >= day.end || end <= day.start) continue;
    const clippedStart = Math.max(start, day.start);
    const clippedEnd = Math.min(end, day.end);
    const slot = Array.from(day.slots.values()).find((value) => clippedStart >= value.date.getTime() && clippedStart < value.end);
    if (!slot) continue;
    const startPosition = position(clippedStart);
    const dayEndPosition = position(day.end);
    // Keep a minimum footprint inside the day; labels and callbacks keep real times.
    const visualStart = Math.min(startPosition, Math.max(0, dayEndPosition - 0.5));
    const span = Math.min(dayEndPosition - visualStart, Math.max(0.5, position(clippedEnd) - visualStart));
    entries.push({ event, slotKey: slot.key, offset: visualStart - (rowIndices.get(slot.key) ?? 0), span, start: visualStart, end: visualStart + span, orderStart: start, orderEnd: end, lane: 0, lanes: 1 });
  }
  entries.sort((a, b) => a.start - b.start || a.end - b.end || a.orderStart - b.orderStart || a.orderEnd - b.orderEnd);
  let group: TimedEntry<T>[] = [];
  let groupEnd = 0;
  const laneEnds = new Map<number, number>();
  const finishGroup = () => {
    for (const entry of group) entry.lanes = laneEnds.size;
    group = [];
    laneEnds.clear();
  };
  for (const entry of entries) {
    if (entry.start >= groupEnd) finishGroup();
    let lane = 0;
    while ((laneEnds.get(lane) ?? -Infinity) > entry.start) lane += 1;
    entry.lane = lane;
    laneEnds.set(lane, entry.end);
    groupEnd = group.length === 0 ? entry.end : Math.max(groupEnd, entry.end);
    group.push(entry);
  }
  finishGroup();
  return entries;
}
