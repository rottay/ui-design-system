'use client';

/**
 * @fileoverview Modern Calendar engine -- unlayered skin owns paint AND layout.
 *
 * Lightweight calendar built with a CSS Grid layout and native `Date` objects
 * (no dayjs dependency, no Daisy classes). Supports month view (7-column day
 * grid) and year view (3-column month grid), controlled and uncontrolled value
 * modes, date disabling via `disabledDate`/`validRange`, custom cell renderers
 * for both day and month cells, and WAI-ARIA grid keyboard navigation (roving
 * tab stop; arrows +/-1/+/-7 days, +/-1/+/-3 months; PageUp/PageDown; Home/End;
 * Left/Right mirrored in RTL).
 *
 * Paint, header-control geometry AND grid layout live in the modern skin
 * (`runtime/engines/modern/skin/calendar.css`), keyed by `data-part` +
 * `data-selected`/`data-today`/`data-disabled`/`data-active`/`data-fullscreen`:
 * the skin is the single owner (selected/today/hover/press surfaces, focus
 * rings, nav-button geometry, the today-ring's border width). The former
 * Tailwind layout
 * utilities (`p-4`, `grid grid-cols-7`, `aspect-square`, ...) are drained; the
 * only class string left is the test-pinned inert `pointer-coarse:` bridge for
 * the compact coarse width, which the skin paints at the same value.
 * Navigation glyphs come from the semantic icon corpus and inherit tenant
 * icon packs; the icon facade is the SINGLE RTL mirror owner (no skin flip,
 * no markup branch), while the grid column flow mirrors natively under
 * `dir=rtl` and the keyboard layer swaps ArrowLeft/ArrowRight.
 *
 * LOCALE-SAFE GEOMETRY (B4-04): the first column of the week follows the
 * active catalog locale through a bounded CLDR table (Monday for es/fr/pt,
 * Saturday for ar, Sunday for en -- the no-provider floor, byte-identical to
 * the pre-locale behavior), and the day-cell accessible names render through
 * `Intl.DateTimeFormat` in the active locale (`toDateString()` stays the
 * English floor). Leading/trailing grid cells carry the adjacent month's days
 * as inert, muted `cell-spacer` parts (42 cells, six rows always), so month
 * navigation never re-heights the panel; today also stamps `aria-current` and
 * the view toggles `aria-pressed`.
 *
 * Engine: **skin (calendar.css) + data-part hooks**
 *
 * @example
 * ```tsx
 * <Calendar engine="modern" fullscreen={false} onChange={(d) => console.log(d)} />
 * ```
 *
 * @module Calendar/engines/modern
 * @category Display
 * @package @rottay/design-system
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { getKeyboardNavDate } from '../../../../foundation/calendar';
import type { CalendarProps, CalendarMode } from '../../contracts';

// Navigation glyphs always come from the semantic icon corpus. Year movement
// composes two instances of the same logical role; tenant icon packs and RTL
// mirroring therefore remain authoritative without a calendar-local SVG set.
const PreviousIcon = () => <NavigationBackIcon decorative size={16} />;
const NextIcon = () => <NavigationForwardIcon decorative size={16} />;
const PreviousYearIcon = () => (
  <span data-part="double-nav-icon" aria-hidden="true">
    <NavigationBackIcon decorative size={13} />
    <NavigationBackIcon decorative size={13} />
  </span>
);
const NextYearIcon = () => (
  <span data-part="double-nav-icon" aria-hidden="true">
    <NavigationForwardIcon decorative size={13} />
    <NavigationForwardIcon decorative size={13} />
  </span>
);

/** Reading-direction probe (Segmented/Tree engine idiom). */
function isRtlContext(el: HTMLElement): boolean {
  const scoped = el.closest('[dir]');
  if (scoped) return scoped.getAttribute('dir') === 'rtl';
  return document.documentElement.dir === 'rtl';
}

// English day/month fallback labels. Names resolve through the guarded
// `components` i18n channel (`calendar.weekdays.*` / `calendar.months.*` /
// `calendar.yearToggle`): with no I18nProvider — or until the locale JSONs
// land — a missing key echoes back the full key, the endsWith guard detects
// it, and these literals render, so behavior is byte-identical. The catalog
// channel (not Intl/toLocaleDateString) is deliberate: it keeps weekday and
// month names inside the same tenant-overridable dictionary as every other
// DS string, consistent with the K4-D/Mentions idiom.
const FALLBACK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FALLBACK_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const;

// First column of the week per catalog locale (bounded CLDR table over the
// five supported locales): ISO Monday for es/fr/pt, Saturday for ar, Sunday
// for en. The no-provider floor is Sunday (0) -- identical to the historical
// Sunday-first grid. A fixed table (not Intl weekInfo) keeps the geometry
// deterministic across ICU builds and jsdom.
const WEEK_START_BY_LOCALE: Record<string, number> = { en: 0, es: 1, fr: 1, pt: 1, ar: 6 };

// Normalizes the incoming value (Date, ISO string, or undefined) into a Date.
// Falls back to "now" so the calendar always has a valid reference date.
const parseDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  return typeof value === 'string' ? new Date(value) : value;
};

/**
 * Modern Calendar backed by Tailwind utilities + the family skin -- no
 * external date library, no Daisy classes.
 *
 * Uses a 7-column CSS Grid for month view and a 3-column grid for year view.
 * Supports controlled (`value`) and uncontrolled (`defaultValue`) modes,
 * custom day/month cell renderers, and date disabling via `disabledDate` or
 * `validRange`.
 *
 * @param props - Unified DS CalendarProps (see Calendar.types.ts)
 * @returns A skin-painted calendar component
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  const {
    value,
    defaultValue,
    mode: modeProp,
    defaultMode = 'month',
    fullscreen = true,
    validRange,
    disabledDate,
    dateCellRender,
    monthCellRender,
    onPanelChange,
    onChange,
    onSelect,
    className = '',
    style,
    id,
  } = props;

  // Guarded i18n channel (K4-B): names resolve through the `components`
  // catalog when an I18nProvider is mounted, else the English fallback tables
  // above (missing key echoes the full key, endsWith guard detects it).
  const i18n = useOptionalTranslation('components');
  const calendarLabel = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
  const days = WEEKDAY_KEYS.map((key, index) =>
    calendarLabel(`calendar.weekdays.${key}`, FALLBACK_DAYS[index]),
  );
  const months = MONTH_KEYS.map((key, index) =>
    calendarLabel(`calendar.months.${key}`, FALLBACK_MONTHS[index]),
  );
  const yearToggleLabel = calendarLabel('calendar.yearToggle', 'Year');
  // Accessible names for the icon-only nav buttons (a bare chevron is not an
  // accessible name). The visual content is the governed semantic icon; the
  // icon facade owns RTL mirroring (no skin flip, no markup branch).
  const navLabels = {
    prevYear: calendarLabel('calendar.navPrevYear', 'Previous year'),
    prevMonth: calendarLabel('calendar.navPrevMonth', 'Previous month'),
    nextMonth: calendarLabel('calendar.navNextMonth', 'Next month'),
    nextYear: calendarLabel('calendar.navNextYear', 'Next year'),
  };

  // B4-04 locale-safe geometry: the week grid starts on the locale's first
  // weekday (bounded CLDR table above; Sunday stays the no-provider floor) and
  // the day-cell accessible names render in the active locale. The header
  // weekday order rotates with the same offset, so columns and headers always
  // agree; RTL mirroring stays visual (grid auto-flow under dir=rtl).
  const weekStart = WEEK_START_BY_LOCALE[i18n?.locale ?? ''] ?? 0;
  const orderedDays = weekStart === 0 ? days : [...days.slice(weekStart), ...days.slice(0, weekStart)];
  const fullDateFormatter = useMemo(
    () => (i18n?.locale ? new Intl.DateTimeFormat(i18n.locale, { dateStyle: 'full' }) : null),
    [i18n?.locale],
  );

  // Controlled vs uncontrolled: when `value` is provided, the consumer owns
  // the selected date and we read from it on every render. Otherwise internal
  // state tracks the selection.
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date>(() => parseDate(defaultValue));
  const [mode, setMode] = useState<CalendarMode>(modeProp || defaultMode);

  const currentDate = isControlled ? parseDate(value) : internalValue;
  const today = new Date();

  // viewYear/viewMonth track which month page is displayed, independent of
  // the selected date. This lets the user browse to future/past months without
  // changing the selection.
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  // Day 0 of the *next* month gives the last day of the current month.
  // This is a standard JS Date trick to get the count of days.
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // getDay() returns 0=Sunday..6=Saturday. Rebased by the locale's week start,
  // this tells us how many leading cells belong to the previous month in the
  // 7-column grid.
  const firstDayOfMonth = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  // B4-04 stable six-row geometry: the grid always renders 42 cells. Leading
  // and trailing cells carry the adjacent months' days as INERT muted spacers
  // (aria-hidden, never focusable, never clickable), so month navigation never
  // re-heights the panel and the viewed month keeps its calendar context --
  // the same outside-day grammar as the shared `generateCalendarGrid` helper.
  const leadingOutsideCount = (firstDayOfMonth - weekStart + 7) % 7;
  const prevMonthDays = useMemo(() => {
    return new Date(viewYear, viewMonth, 0).getDate();
  }, [viewYear, viewMonth]);
  const trailingOutsideCount = 42 - leadingOutsideCount - daysInMonth;

  const isDateDisabled = useCallback((date: Date) => {
    if (disabledDate && disabledDate(date)) return true;
    if (validRange) {
      const [start, end] = validRange;
      if (date < start || date > end) return true;
    }
    return false;
  }, [disabledDate, validRange]);

  const handleDateClick = useCallback((day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    if (isDateDisabled(date)) return;

    if (!isControlled) {
      setInternalValue(date);
    }
    onChange?.(date);
    onSelect?.(date, { source: 'date' });
  }, [viewYear, viewMonth, isControlled, onChange, onSelect, isDateDisabled]);

  // Selecting a month in year view both selects the date AND switches back to
  // month view, so the user can drill down from year -> month -> day in sequence.
  const handleMonthClick = useCallback((month: number) => {
    const date = new Date(viewYear, month, 1);
    setViewMonth(month);

    if (!isControlled) {
      setInternalValue(date);
    }
    onChange?.(date);
    onSelect?.(date, { source: 'month' });
    setMode('month');
    onPanelChange?.(date, 'month');
  }, [viewYear, isControlled, onChange, onSelect, onPanelChange]);

  // Month navigation wraps around the year boundary: going before January
  // decrements the year and sets month to December, and vice versa.
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePrevYear = () => setViewYear((y) => y - 1);
  const handleNextYear = () => setViewYear((y) => y + 1);

  const handleModeChange = (newMode: CalendarMode) => {
    setMode(newMode);
    onPanelChange?.(currentDate, newMode);
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // -- APG grid keyboard navigation -------------------------------------------
  // Roving tab stop per grid: day cells track a focused DATE (default: the
  // selected day, else today when visible, else the 1st); year-view cells
  // track a focused month index. Arrows ±1/±7 (day) and ±1/±3 (year),
  // PageUp/PageDown, Home/End -- the day arithmetic is shared with DatePicker
  // (`getKeyboardNavDate`). In RTL the column flow mirrors, so Left/Right
  // swap. Focus moves programmatically after the roving stop updates.
  // Disabled days are skipped during keyboard travel and never carry the tab
  // stop (see `tabStopDate`), so the grid is never keyboard-stranded.
  const dayGridRef = useRef<HTMLDivElement>(null);
  const yearGridRef = useRef<HTMLDivElement>(null);
  const keyboardNavRef = useRef(false);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [focusedMonthIndex, setFocusedMonthIndex] = useState<number | null>(null);

  const anchorDate = focusedDate
    ?? (isSameDay(currentDate, new Date(viewYear, viewMonth, currentDate.getDate())) ? currentDate : null)
    ?? (today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today : null)
    ?? new Date(viewYear, viewMonth, 1);
  const anchorMonthIndex = focusedMonthIndex
    ?? (currentDate.getFullYear() === viewYear ? currentDate.getMonth() : 0);

  // A DISABLED anchor would leave the grid with no tab stop at all (a
  // disabled button cannot hold focus), making the grid keyboard-unreachable
  // -- e.g. a selected date outside `validRange`. Fall the stop back to the
  // first enabled day of the viewed month (APG: exactly one focusable cell).
  let tabStopDate = anchorDate;
  if (isDateDisabled(anchorDate)) {
    for (let day = 1; day <= daysInMonth; day++) {
      const candidate = new Date(viewYear, viewMonth, day);
      if (!isDateDisabled(candidate)) {
        tabStopDate = candidate;
        break;
      }
    }
  }

  const focusCurrentStop = useCallback((grid: HTMLDivElement | null) => {
    grid?.querySelector<HTMLElement>("[data-part='cell'][tabindex='0']")?.focus();
  }, []);

  const handleDayGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const rtl = isRtlContext(e.currentTarget as HTMLElement);
      const key = rtl && e.key === 'ArrowRight'
        ? 'ArrowLeft'
        : rtl && e.key === 'ArrowLeft'
          ? 'ArrowRight'
          : e.key;
      const next = getKeyboardNavDate(anchorDate, key);
      if (!next) return;
      e.preventDefault();
      keyboardNavRef.current = true;
      // Disabled dates are real `disabled` buttons: they cannot take focus,
      // so arrow/Page/Home/End navigation SKIPS over them (bounded walk in
      // the same direction) instead of stranding focus on a dead cell. If
      // every reachable date in that direction is disabled, the key is a
      // no-op and focus stays put.
      let target = next;
      let guard = 0;
      while (isDateDisabled(target) && guard < 370) {
        const stepped = getKeyboardNavDate(target, key);
        if (!stepped) break;
        target = stepped;
        guard++;
      }
      if (isDateDisabled(target)) {
        keyboardNavRef.current = false;
        return;
      }
      setFocusedDate(target);
      if (target.getFullYear() !== viewYear || target.getMonth() !== viewMonth) {
        setViewYear(target.getFullYear());
        setViewMonth(target.getMonth());
      }
    },
    [anchorDate, viewYear, viewMonth, isDateDisabled],
  );

  const handleYearGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const rtl = isRtlContext(e.currentTarget as HTMLElement);
      const key = rtl && e.key === 'ArrowRight'
        ? 'ArrowLeft'
        : rtl && e.key === 'ArrowLeft'
          ? 'ArrowRight'
          : e.key;
      let nextIndex: number | null = null;
      if (key === 'ArrowRight') nextIndex = Math.min(anchorMonthIndex + 1, 11);
      else if (key === 'ArrowLeft') nextIndex = Math.max(anchorMonthIndex - 1, 0);
      else if (key === 'ArrowDown') nextIndex = Math.min(anchorMonthIndex + 3, 11);
      else if (key === 'ArrowUp') nextIndex = Math.max(anchorMonthIndex - 3, 0);
      else if (key === 'Home') nextIndex = 0;
      else if (key === 'End') nextIndex = 11;
      if (nextIndex === null || nextIndex === anchorMonthIndex) return;
      e.preventDefault();
      keyboardNavRef.current = true;
      setFocusedMonthIndex(nextIndex);
    },
    [anchorMonthIndex],
  );

  // Move DOM focus only when the roving stop changed via the keyboard (a
  // pointer click already owns its focus).
  useEffect(() => {
    if (!keyboardNavRef.current) return;
    keyboardNavRef.current = false;
    focusCurrentStop(mode === 'month' ? dayGridRef.current : yearGridRef.current);
  }, [focusedDate, focusedMonthIndex, viewYear, viewMonth, mode, focusCurrentStop]);

  // Fullscreen fills the parent container; compact mode constrains to 320px
  // for use in popovers, sidebars, or date picker dropdowns. The compact
  // widths are skin-owned (`data-fullscreen`); the pinned coarse utility
  // string stays as an inert bridge (pass1-premium pin) while the skin's
  // coarse rule paints the same 22.75rem.
  const containerClass = fullscreen ? '' : 'pointer-coarse:w-[22.75rem]';

  return (
    <div
      ref={ref}
      className={`rottay-calendar rottay-calendar--modern ${containerClass} ${className}`}
      data-part="root"
      data-mode={mode}
      data-fullscreen={fullscreen ? 'true' : 'false'}
      style={style}
      id={id}
    >
      {/* Header */}
      <div data-part="header">
        <div>
          <button type="button" data-part="nav-button" data-direction="prev-year" aria-label={navLabels.prevYear} onClick={handlePrevYear}><PreviousYearIcon /></button>
          {mode === 'month' && <button type="button" data-part="nav-button" data-direction="prev-month" aria-label={navLabels.prevMonth} onClick={handlePrevMonth}><PreviousIcon /></button>}
        </div>
        <div>
          <button
            type="button"
            data-part="mode-toggle"
            data-mode="month"
            data-active={mode === 'month' ? 'true' : 'false'}
            aria-pressed={mode === 'month'}
            onClick={() => handleModeChange('month')}
          >
            {months[viewMonth]} {viewYear}
          </button>
          <button
            type="button"
            data-part="mode-toggle"
            data-mode="year"
            data-active={mode === 'year' ? 'true' : 'false'}
            aria-pressed={mode === 'year'}
            onClick={() => handleModeChange('year')}
          >
            {yearToggleLabel}
          </button>
        </div>
        <div>
          {mode === 'month' && <button type="button" data-part="nav-button" data-direction="next-month" aria-label={navLabels.nextMonth} onClick={handleNextMonth}><NextIcon /></button>}
          <button type="button" data-part="nav-button" data-direction="next-year" aria-label={navLabels.nextYear} onClick={handleNextYear}><NextYearIcon /></button>
        </div>
      </div>

      {mode === 'month' ? (
        <>
          {/* Day headers (locale-rotated with the week start). APG grammar
              (the DatePicker idiom): the row is a `row` and each header a
              named `columnheader` -- the accessible name keeps the full
              weekday label even in compact mode, where only the first
              letter renders. */}
          <div data-part="weekday-row" role="row">
            {orderedDays.map((day) => (
              <div key={day} data-part="weekday-header" role="columnheader" aria-label={day}>
                {fullscreen ? day : day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Days grid (APG: roving stop + arrow/PageUp/Home navigation) */}
          <div
            ref={dayGridRef}
            data-part="grid"
            role="grid"
            aria-label={calendarLabel('calendar.gridLabel', 'Dates grid')}
            onKeyDown={handleDayGridKeyDown}
          >
            {/* Leading cells: previous month's tail days (inert, muted) */}
            {Array.from({ length: leadingOutsideCount }).map((_, i) => (
              <div key={`outside-prev-${i}`} data-part="cell-spacer" data-outside-month="true" aria-hidden="true">
                <span>{prevMonthDays - leadingOutsideCount + 1 + i}</span>
              </div>
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, currentDate);
              const isDisabled = isDateDisabled(date);
              const isTabStop = isSameDay(date, tabStopDate);

              return (
                <button
                  key={day}
                  type="button"
                  data-part="cell"
                  role="gridcell"
                  data-selected={isSelected ? 'true' : 'false'}
                  data-today={isToday ? 'true' : 'false'}
                  data-disabled={isDisabled || undefined}
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={fullDateFormatter ? fullDateFormatter.format(date) : date.toDateString()}
                  tabIndex={isTabStop && !isDisabled ? 0 : -1}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                >
                  <span>{day}</span>
                  {dateCellRender && (
                    <div data-part="cell-content">
                      {dateCellRender(date)}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Trailing cells: next month's head days (inert, muted) -- the
                grid always totals 42 cells, so the panel never re-heights
                between months. */}
            {Array.from({ length: trailingOutsideCount }).map((_, i) => (
              <div key={`outside-next-${i}`} data-part="cell-spacer" data-outside-month="true" aria-hidden="true">
                <span>{i + 1}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Year view - show months (APG: roving stop + arrow/Home navigation) */
        <div
          ref={yearGridRef}
          data-part="grid"
          role="grid"
          aria-label={calendarLabel('calendar.monthsGridLabel', 'Months grid')}
          onKeyDown={handleYearGridKeyDown}
        >
          {months.map((month, i) => {
            const date = new Date(viewYear, i, 1);
            const isCurrentMonth = i === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = i === currentDate.getMonth() && viewYear === currentDate.getFullYear();

            return (
              <button
                key={month}
                type="button"
                data-part="cell"
                role="gridcell"
                data-selected={isSelected ? 'true' : 'false'}
                data-today={isCurrentMonth ? 'true' : 'false'}
                aria-selected={isSelected}
                tabIndex={i === anchorMonthIndex ? 0 : -1}
                onClick={() => handleMonthClick(i)}
              >
                <span>{month}</span>
                {monthCellRender && (
                  <div data-part="cell-content">
                    {monthCellRender(date)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

Calendar.displayName = 'Calendar.Modern';

export default Calendar;
