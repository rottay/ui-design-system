'use client';

/**
 * @fileoverview DatePicker Modern engine: a read-only trigger that opens a
 * calendar dialog with date, month and year grids, range selection and optional
 * time. The grid geometry, week start, day labels and grid keyboard come from
 * the calendar kernel, the panel from the field overlay kernel, and state from
 * the interaction kernel; the Modern skin paints every part.
 *
 * @example
 * ```tsx
 * <DatePicker engine="modern" showTime showToday disabledDate={(d) => d < today} />
 * ```
 *
 * @module DatePicker/engines/modern
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type {
  DatePickerMode,
  DatePickerPlacement,
  DatePickerProps,
  RangePickerProps,
} from '../../contracts';
import {
  FieldOverlayPanel,
  useFieldOverlay,
} from '../../../../runtime/overlay/field-overlay';
import type { OverlayPlacement } from '../../../../runtime/overlay/positioning';
import { resolveReadingDirectionIsRtl } from '../../../../runtime/collection/roving-focus';
import { partAttributes, useFieldAction, useInteractionState } from '@/foundation/behavior';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationBackIcon } from '@/graphics/icons/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/semantic/generated/roles/navigation-forward';
import { TimeDateIcon } from '@/graphics/icons/semantic/generated/roles/time-date';
import { TimeTimestampIcon } from '@/graphics/icons/semantic/generated/roles/time-timestamp';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import {
  DAYS_SHORT,
  MONTHS_FULL,
  MONTHS_SHORT,
  pad2,
  isSameDay,
  isDateInRange,
  parseDateValue,
  formatDisplay,
  formatCalendarDate,
  generateCalendarGrid,
  resolveEnabledCalendarKeyDate,
  resolveWeekStartsOn,
  weekdayOrder,
} from '../../runtime/calendar';

import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';

/** Date-only strings are UTC by spec; parse them in the local zone instead. */
const parseLocalDateValue = (value: Date | string | null | undefined): Date | null => {
  if (typeof value === 'string') {
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value.trim());
    if (m) {
      const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const d = new Date(0);
      // setFullYear keeps years 0000-0099 out of the 1900 window; the round-trip rejects rollovers.
      d.setFullYear(year, month - 1, day);
      d.setHours(0, 0, 0, 0);
      const roundTrips =
        d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
      return roundTrips ? d : null;
    }
  }
  return parseDateValue(value);
};

/** The contract's corner placements in the overlay kernel's logical vocabulary. */
const OVERLAY_PLACEMENT: Readonly<Record<DatePickerPlacement, OverlayPlacement>> = {
  bottomLeft: 'bottom-start',
  bottomRight: 'bottom-end',
  topLeft: 'top-start',
  topRight: 'top-end',
};

/** English floor for the `components.datepicker.*` catalog keys, so the field renders without a provider. */
const EN_FALLBACK: Readonly<Record<string, string>> = {
  'datepicker.placeholder': 'Select date',
  'datepicker.today': 'Today',
  'datepicker.now': 'Now',
  'datepicker.clear_date': 'Clear date',
  'datepicker.clear_dates': 'Clear dates',
  'datepicker.start_date': 'Start date',
  'datepicker.end_date': 'End date',
  'datepicker.previous_month': 'Previous month',
  'datepicker.next_month': 'Next month',
  'datepicker.previous_year': 'Previous year',
  'datepicker.next_year': 'Next year',
  'datepicker.previous_decade': 'Previous decade',
  'datepicker.next_decade': 'Next decade',
  'datepicker.date_picker': 'Date picker',
  'datepicker.calendar_dates': 'Calendar dates',
  'datepicker.hour': 'Hour',
  'datepicker.minute': 'Minute',
};

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const;

interface DatePickerCopy {
  t: (key: string) => string;
  /** A catalog label with its own floor; a missing key never reaches the screen. */
  label: (key: string, fallback: string) => string;
  locale: string | undefined;
}

function useDatePickerCopy(): DatePickerCopy {
  const i18n = useOptionalTranslation('components');
  const label = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved.endsWith(key) || resolved.startsWith('i18n:missing:')) return fallback;
    return resolved;
  };
  return { t: (key) => label(key, EN_FALLBACK[key] ?? key), label, locale: i18n?.locale };
}

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

type GovernedButtonPart = 'nav-button' | 'cell' | 'today-button';

interface GovernedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  part: GovernedButtonPart;
  stateDisabled?: boolean;
}

/** A panel button whose hover, press, focus and disabled state the interaction kernel decides. */
function GovernedButton({ part, stateDisabled, onFocus, onBlur, children, ...rest }: GovernedButtonProps) {
  const button = useInteractionState({ disabled: stateDisabled });
  return (
    <button
      type="button"
      {...rest}
      {...partAttributes(part, button.state)}
      onPointerEnter={(event) => {
        button.handlers.onPointerEnter(event);
        rest.onPointerEnter?.(event);
      }}
      onPointerLeave={button.handlers.onPointerLeave}
      onPointerDown={button.handlers.onPointerDown}
      onPointerUp={button.handlers.onPointerUp}
      onFocus={(event) => {
        button.handlers.onFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        button.handlers.onBlur(event);
        onBlur?.(event);
      }}
    >
      {children}
    </button>
  );
}

function ClearAction({ label, onClear, children }: { label: string; onClear: (event: React.MouseEvent) => void; children: React.ReactNode }) {
  const action = useFieldAction();
  return (
    <button
      type="button"
      onClick={onClear}
      tabIndex={-1}
      aria-label={label}
      {...partAttributes('clear-button', action.state)}
      onPointerEnter={action.handlers.onPointerEnter}
      onPointerLeave={action.handlers.onPointerLeave}
      onPointerDown={action.handlers.onPointerDown}
      onPointerUp={action.handlers.onPointerUp}
      onPointerCancel={action.handlers.onPointerCancel}
      onFocus={action.handlers.onFocus}
      onBlur={action.handlers.onBlur}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TimePickerPanel sub-component
// ---------------------------------------------------------------------------

interface TimePickerPanelProps {
  hours: number;
  minutes: number;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
}

// Native selects keep time selection reliable on mobile; the skin paints the column.
const TimePickerPanel: React.FC<TimePickerPanelProps> = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}) => {
  const { t } = useDatePickerCopy();
  return (
    <div data-part="time-column">
      <TimeTimestampIcon decorative size={14} />
      <select
        data-part="time-select"
        value={hours}
        onChange={(e) => onHoursChange(Number(e.target.value))}
        aria-label={t('datepicker.hour')}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>{pad2(i)}</option>
        ))}
      </select>
      <span data-part="time-separator">:</span>
      <select
        data-part="time-select"
        value={minutes}
        onChange={(e) => onMinutesChange(Number(e.target.value))}
        aria-label={t('datepicker.minute')}
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>{pad2(i)}</option>
        ))}
      </select>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CalendarPanel sub-component
// ---------------------------------------------------------------------------

interface CalendarPanelProps {
  selectedDate: Date | null;
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  onDateSelect: (date: Date) => void;
  disabledDate?: (d: Date) => boolean;
  picker: string;
  showTime: boolean;
  hours: number;
  minutes: number;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
  showToday: boolean;
  showNow: boolean;
  onTodayClick: () => void;
  renderExtraFooter?: () => React.ReactNode;
  cellRender?: (current: Date, info: { originNode: React.ReactNode; today: Date; range?: 'start' | 'end' }) => React.ReactNode;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  /** The uncommitted end under the pointer while the second endpoint is picked; never painted as committed. */
  rangePreviewEnd?: Date | null;
  onCellHover?: (date: Date) => void;
  focusedDate: Date | null;
  onFocusedDateChange: (d: Date) => void;
  onPanelChange?: (date: Date, mode: DatePickerMode) => void;
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  superPrevIcon?: React.ReactNode;
  superNextIcon?: React.ReactNode;
}

const PANEL_CLASS = 'ds-date-picker-panel ds-date-picker-panel--modern';

const CalendarPanel: React.FC<CalendarPanelProps> = ({
  selectedDate,
  viewYear,
  viewMonth,
  onViewChange,
  onDateSelect,
  disabledDate,
  picker,
  showTime,
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  showToday,
  showNow,
  onTodayClick,
  renderExtraFooter,
  cellRender,
  rangeStart,
  rangeEnd,
  rangePreviewEnd,
  onCellHover,
  focusedDate,
  onFocusedDateChange,
  onPanelChange,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
}) => {
  const { t, label, locale } = useDatePickerCopy();
  const today = useMemo(() => new Date(), []);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keyboard travel moves the tab stop; focus follows it only while focus is already inside the grid.
  useEffect(() => {
    if (!focusedDate) return;
    const gridEl = gridRef.current;
    if (!gridEl || !gridEl.contains(document.activeElement)) return;
    gridEl.querySelector<HTMLElement>("[data-part='cell'][tabindex='0']")?.focus();
  }, [focusedDate, viewYear, viewMonth]);

  const weekStart = resolveWeekStartsOn(locale);
  const weekdayNames = WEEKDAY_KEYS.map((key, index) => label(`calendar.weekdays.${key}`, DAYS_SHORT[index]));
  const orderedWeekdays = weekdayOrder(weekStart).map((weekday) => weekdayNames[weekday]);
  const monthNamesFull = MONTH_KEYS.map((key, index) => label(`calendar.months.${key}`, MONTHS_FULL[index]));
  const monthNamesShort = MONTH_KEYS.map((key, index) => label(`calendar.months_short.${key}`, MONTHS_SHORT[index]));

  const handlePrevMonth = () => {
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    onViewChange(newYear, newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    onViewChange(newYear, newMonth);
  };

  const handlePrevYear = () => onViewChange(viewYear - 1, viewMonth);
  const handleNextYear = () => onViewChange(viewYear + 1, viewMonth);

  const isDisabled = useCallback((date: Date) => Boolean(disabledDate?.(date)), [disabledDate]);

  // The APG date grid comes from the calendar kernel: the week edges follow the locale and the arrows the direction.
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const base = focusedDate || selectedDate || today;
      const rtl = resolveReadingDirectionIsRtl(e.currentTarget as HTMLElement);
      const newDate = resolveEnabledCalendarKeyDate(base, e, isDisabled, { rtl, weekStartsOn: weekStart });

      if (newDate) {
        e.preventDefault();
        onFocusedDateChange(newDate);
        if (newDate.getMonth() !== viewMonth || newDate.getFullYear() !== viewYear) {
          onViewChange(newDate.getFullYear(), newDate.getMonth());
        }
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isDisabled(base)) onDateSelect(base);
      }
    },
    [focusedDate, selectedDate, today, viewMonth, viewYear, onFocusedDateChange, onViewChange, onDateSelect, isDisabled, weekStart],
  );

  const grid = useMemo(
    () => generateCalendarGrid(viewYear, viewMonth, disabledDate, { weekStartsOn: weekStart }),
    [viewYear, viewMonth, disabledDate, weekStart],
  );

  // Every gridcell has an owning row: the 42 cells chunk into calendar weeks.
  const weekRows = useMemo(
    () =>
      Array.from({ length: Math.ceil(grid.length / 7) }, (_, week) => ({
        key: week,
        cells: grid.slice(week * 7, week * 7 + 7).map((cell, offset) => ({ cell, idx: week * 7 + offset })),
      })),
    [grid],
  );

  if (picker === 'month') {
    return (
      <div data-part="panel" data-mode="month" className={PANEL_CLASS} role="dialog" aria-label={t('datepicker.date_picker')}>
        <div data-part="header">
          <GovernedButton part="nav-button" onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            {superPrevIcon ?? <PreviousIcon />}
          </GovernedButton>
          <span data-part="panel-title">{viewYear}</span>
          <GovernedButton part="nav-button" onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            {superNextIcon ?? <NextIcon />}
          </GovernedButton>
        </div>
        <div data-part="grid">
          {monthNamesShort.map((m, i) => {
            const isSelected = selectedDate
              ? selectedDate.getMonth() === i && selectedDate.getFullYear() === viewYear
              : false;
            const isCurrent = today.getMonth() === i && today.getFullYear() === viewYear;
            return (
              <GovernedButton
                key={m}
                part="cell"
                data-selected={isSelected || undefined}
                data-today={isCurrent || undefined}
                onClick={() => {
                  const date = new Date(viewYear, i, 1);
                  onDateSelect(date);
                  onPanelChange?.(date, 'month');
                }}
              >
                {m}
              </GovernedButton>
            );
          })}
        </div>
        {renderExtraFooter && <div data-part="footer">{renderExtraFooter()}</div>}
      </div>
    );
  }

  if (picker === 'year') {
    const startYear = Math.floor(viewYear / 10) * 10;
    return (
      <div data-part="panel" data-mode="year" className={PANEL_CLASS} role="dialog" aria-label={t('datepicker.date_picker')}>
        <div data-part="header">
          <GovernedButton part="nav-button" onClick={() => onViewChange(viewYear - 10, viewMonth)} aria-label={t('datepicker.previous_decade')}>
            {superPrevIcon ?? <PreviousIcon />}
          </GovernedButton>
          <span data-part="panel-title">
            {startYear} - {startYear + 9}
          </span>
          <GovernedButton part="nav-button" onClick={() => onViewChange(viewYear + 10, viewMonth)} aria-label={t('datepicker.next_decade')}>
            {superNextIcon ?? <NextIcon />}
          </GovernedButton>
        </div>
        <div data-part="grid">
          {Array.from({ length: 12 }, (_, i) => {
            const yr = startYear - 1 + i;
            const isSelected = selectedDate ? selectedDate.getFullYear() === yr : false;
            const isCurrent = today.getFullYear() === yr;
            const isOutOfRange = i === 0 || i === 11;
            return (
              <GovernedButton
                key={yr}
                part="cell"
                data-selected={isSelected || undefined}
                data-today={isCurrent || undefined}
                data-decade-edge={isOutOfRange || undefined}
                onClick={() => {
                  const date = new Date(yr, 0, 1);
                  onDateSelect(date);
                  onPanelChange?.(date, 'year');
                }}
              >
                {yr}
              </GovernedButton>
            );
          })}
        </div>
        {renderExtraFooter && <div data-part="footer">{renderExtraFooter()}</div>}
      </div>
    );
  }

  // RangePicker always passes both range props, so their presence marks a range panel.
  const isRangePanel = rangeStart !== undefined || rangeEnd !== undefined;
  const previewEnd = !rangeEnd && rangeStart ? rangePreviewEnd ?? null : null;

  // Exactly one tabbable cell: the logical focus, else the selection, else today, else the first in-month day.
  const activeDate = focusedDate ?? selectedDate ?? today;
  const activeCellIndex = (() => {
    const match = grid.findIndex((c) => isSameDay(c.date, activeDate));
    if (match >= 0) return match;
    const firstInMonth = grid.findIndex((c) => c.isCurrentMonth);
    return firstInMonth >= 0 ? firstInMonth : 0;
  })();

  return (
    <div data-part="panel" data-mode="date" data-range={isRangePanel || undefined} className={PANEL_CLASS} role="dialog" aria-label={t('datepicker.date_picker')}>
      <div data-part="header">
        <div data-part="nav-group">
          <GovernedButton part="nav-button" onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            {superPrevIcon ?? <PreviousYearIcon />}
          </GovernedButton>
          <GovernedButton part="nav-button" onClick={handlePrevMonth} aria-label={t('datepicker.previous_month')}>
            {prevIcon ?? <PreviousIcon />}
          </GovernedButton>
        </div>
        <span data-part="panel-title">
          {monthNamesFull[viewMonth]} {viewYear}
        </span>
        <div data-part="nav-group">
          <GovernedButton part="nav-button" onClick={handleNextMonth} aria-label={t('datepicker.next_month')}>
            {nextIcon ?? <NextIcon />}
          </GovernedButton>
          <GovernedButton part="nav-button" onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            {superNextIcon ?? <NextYearIcon />}
          </GovernedButton>
        </div>
      </div>

      <div ref={gridRef} data-part="grid" role="grid" onKeyDown={handleGridKeyDown} aria-label={t('datepicker.calendar_dates')}>
        <div data-part="weekday-row" role="row">
          {orderedWeekdays.map((d) => (
            <div key={d} data-part="weekday-header" role="columnheader" aria-label={d}>
              {d}
            </div>
          ))}
        </div>

        {weekRows.map((week) => (
          <div key={week.key} data-part="week-row" role="row">
            {week.cells.map(({ cell, idx }) => {
              const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
              const inCommittedRange = isDateInRange(cell.date, rangeStart ?? null, rangeEnd ?? null);
              const inPreviewRange = !inCommittedRange && isDateInRange(cell.date, rangeStart ?? null, previewEnd);
              const isRangeStart = !!(rangeStart && isSameDay(cell.date, rangeStart));
              const isRangeEnd = !!(rangeEnd && isSameDay(cell.date, rangeEnd));
              const isEndpoint = isRangeStart || isRangeEnd;
              const endpointRange = isRangeStart ? ('start' as const) : isRangeEnd ? ('end' as const) : undefined;
              const originNode = cell.day;

              return (
                <GovernedButton
                  key={idx}
                  part="cell"
                  stateDisabled={cell.isDisabled}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={cell.isDisabled}
                  aria-current={cell.isToday ? 'date' : undefined}
                  aria-label={formatCalendarDate(cell.date, locale)}
                  tabIndex={idx === activeCellIndex ? 0 : -1}
                  data-today={cell.isToday || undefined}
                  data-selected={(isSelected || isEndpoint) || undefined}
                  data-in-range={inCommittedRange || undefined}
                  data-range-preview={inPreviewRange || undefined}
                  data-range-start={isRangeStart || undefined}
                  data-range-end={isRangeEnd || undefined}
                  data-disabled={cell.isDisabled || undefined}
                  data-outside-month={!cell.isCurrentMonth || undefined}
                  onPointerEnter={() => onCellHover?.(cell.date)}
                  onClick={() => {
                    if (!cell.isDisabled) onDateSelect(cell.date);
                  }}
                >
                  {cellRender ? cellRender(cell.date, { originNode, today, range: endpointRange }) : originNode}
                </GovernedButton>
              );
            })}
          </div>
        ))}
      </div>

      {showTime && (
        <TimePickerPanel
          hours={hours}
          minutes={minutes}
          onHoursChange={onHoursChange}
          onMinutesChange={onMinutesChange}
        />
      )}

      <div data-part="footer">
        {showToday && (
          <GovernedButton part="today-button" onClick={onTodayClick}>
            {showTime && showNow ? t('datepicker.now') : t('datepicker.today')}
          </GovernedButton>
        )}
        {renderExtraFooter && <div data-part="extra-footer">{renderExtraFooter()}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// DatePickerBase
// ---------------------------------------------------------------------------

/**
 * Modern DatePicker engine: a read-only input that opens the calendar dialog
 * through the field overlay kernel.
 */
const DatePickerBase = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => {
    const { t } = useDatePickerCopy();

    const {
      value,
      defaultValue,
      picker = 'date',
      format,
      showTime: showTimeProp = false,
      showToday = true,
      showNow = false,
      disabled = false,
      readOnly = false,
      size = 'default',
      status,
      placeholder,
      placement = 'bottomLeft',
      allowClear = true,
      open: controlledOpen,
      disabledDate,
      onChange,
      onOpenChange,
      onPanelChange,
      className = '',
      style,
      autoFocus,
      id,
      name,
      renderExtraFooter,
      cellRender,
      variant,
      bordered = true,
      suffixIcon,
      prevIcon,
      nextIcon,
      superPrevIcon,
      superNextIcon,
    } = props;

    // `bordered={false}` is the legacy alias of `variant='borderless'`; an explicit variant wins.
    const effectiveVariant = !bordered ? 'borderless' : variant ?? 'outlined';

    const displayPlaceholder = placeholder ?? t('datepicker.placeholder');
    const showTime = !!showTimeProp;
    const isControlled = value !== undefined;
    const isOpenControlled = controlledOpen !== undefined;

    const [internalDate, setInternalDate] = useState<Date | null>(() => parseLocalDateValue(defaultValue));
    const [internalOpen, setInternalOpen] = useState(false);
    const [focusedDate, setFocusedDate] = useState<Date | null>(null);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const selectedDate = isControlled ? parseLocalDateValue(value) : internalDate;
    const isOpen = isOpenControlled ? controlledOpen! : internalOpen;

    const initialView = selectedDate || new Date();
    const [viewYear, setViewYear] = useState(initialView.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialView.getMonth());

    useEffect(() => {
      if (selectedDate) {
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
        setHours(selectedDate.getHours());
        setMinutes(selectedDate.getMinutes());
      }
    }, [selectedDate]);

    const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // The overlay kernel needs the anchor as state: a ref would not re-render when it lands.
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const trigger = useInteractionState({ disabled });

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref],
    );

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    // Escape and an outside press return focus to the input: the panel unmounts on close.
    const dismissPanel = useCallback(() => {
      setOpen(false);
      inputRef.current?.focus();
    }, [setOpen]);

    const overlay = useFieldOverlay({
      kind: 'dropdown',
      open: isOpen,
      anchor: anchorEl,
      panel: panelEl,
      placement: OVERLAY_PLACEMENT[placement],
      offset: 4,
      flip: true,
      modal: true,
      lockScroll: false,
      restoreFocus: false,
      onDismiss: dismissPanel,
      dismissOnOutsidePointer: true,
    });

    // With showTime the chosen time survives a new day instead of resetting to midnight.
    const handleDateSelect = useCallback(
      (date: Date) => {
        const finalDate = showTime
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes)
          : date;
        const dateStr = formatDisplay(finalDate, format, picker, showTime);

        if (!isControlled) setInternalDate(finalDate);
        onChange?.(finalDate, dateStr);
        setFocusedDate(null);

        // With showTime the panel stays open for the time; otherwise it closes and focus returns to the input.
        if (!showTime) {
          setOpen(false);
          inputRef.current?.focus();
        }
      },
      [showTime, hours, minutes, format, picker, isControlled, onChange, setOpen],
    );

    const handleTodayClick = useCallback(() => {
      const now = new Date();
      handleDateSelect(now);
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }, [handleDateSelect]);

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) setInternalDate(null);
        onChange?.(null, '');
      },
      [isControlled, onChange],
    );

    const handleHoursChange = useCallback(
      (h: number) => {
        setHours(h);
        if (selectedDate) {
          const newDate = new Date(selectedDate);
          newDate.setHours(h);
          const dateStr = formatDisplay(newDate, format, picker, true);
          if (!isControlled) setInternalDate(newDate);
          onChange?.(newDate, dateStr);
        }
      },
      [selectedDate, format, picker, isControlled, onChange],
    );

    const handleMinutesChange = useCallback(
      (m: number) => {
        setMinutes(m);
        if (selectedDate) {
          const newDate = new Date(selectedDate);
          newDate.setMinutes(m);
          const dateStr = formatDisplay(newDate, format, picker, true);
          if (!isControlled) setInternalDate(newDate);
          onChange?.(newDate, dateStr);
        }
      },
      [selectedDate, format, picker, isControlled, onChange],
    );

    const displayText = formatDisplay(selectedDate, format, picker, showTime);
    const canonicalSize = toCanonicalSize(size) ?? 'md';

    return (
      <>
        <div
          ref={setAnchorEl}
          data-part="root"
          className={`ds-date-picker ds-date-picker--modern ${className}`}
          style={style}
        >
          <input
            ref={setInputRef}
            type="text"
            // Dates are chosen in the calendar, so the input never takes keystrokes.
            readOnly
            {...partAttributes('trigger-input', trigger.state)}
            onPointerEnter={trigger.handlers.onPointerEnter}
            onPointerLeave={trigger.handlers.onPointerLeave}
            onPointerDown={trigger.handlers.onPointerDown}
            onPointerUp={trigger.handlers.onPointerUp}
            onFocus={trigger.handlers.onFocus}
            onBlur={trigger.handlers.onBlur}
            data-status={status ?? 'default'}
            data-size={canonicalSize}
            data-variant={effectiveVariant}
            value={displayText}
            disabled={disabled}
            placeholder={displayPlaceholder}
            autoFocus={autoFocus}
            id={id}
            name={name}
            onClick={() => !disabled && !readOnly && setOpen(!isOpen)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled && !readOnly) {
                e.preventDefault();
                setOpen(!isOpen);
              }
            }}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            // With an id an external <label for> owns the name, so the placeholder is only the last resort.
            aria-label={id ? undefined : displayPlaceholder}
          />
          {allowClear && displayText && !disabled && (
            <ClearAction label={t('datepicker.clear_date')} onClear={handleClear}>
              <ActionCloseIcon decorative size={14} />
            </ClearAction>
          )}
          <span data-part="calendar-icon" aria-hidden="true">
            {suffixIcon ?? <TimeDateIcon decorative size={16} />}
          </span>
        </div>

        {isOpen && (
          <FieldOverlayPanel overlay={overlay}>
            <div
              {...overlay.panelProps}
              ref={setPanelEl}
              data-part="popup"
              data-placement={placement}
              style={overlay.panelProps.style}
            >
              <CalendarPanel
                selectedDate={selectedDate}
                viewYear={viewYear}
                viewMonth={viewMonth}
                onViewChange={(y, m) => {
                  setViewYear(y);
                  setViewMonth(m);
                }}
                onDateSelect={handleDateSelect}
                disabledDate={disabledDate}
                picker={picker}
                showTime={showTime}
                hours={hours}
                minutes={minutes}
                onHoursChange={handleHoursChange}
                onMinutesChange={handleMinutesChange}
                showToday={showToday}
                showNow={showNow}
                onTodayClick={handleTodayClick}
                renderExtraFooter={renderExtraFooter}
                cellRender={cellRender}
                focusedDate={focusedDate}
                onFocusedDateChange={setFocusedDate}
                onPanelChange={onPanelChange}
                prevIcon={prevIcon}
                nextIcon={nextIcon}
                superPrevIcon={superPrevIcon}
                superNextIcon={superNextIcon}
              />
            </div>
          </FieldOverlayPanel>
        )}
      </>
    );
  },
);

DatePickerBase.displayName = 'DatePicker.Modern';

// ---------------------------------------------------------------------------
// RangePicker
// ---------------------------------------------------------------------------

/**
 * Modern RangePicker engine: two read-only inputs and one calendar. The first
 * pick sets the start and moves to the end; the second sets the end and closes.
 */
const RangePicker = React.forwardRef<HTMLDivElement, RangePickerProps>(
  (props, ref) => {
    const { t } = useDatePickerCopy();

    const {
      value,
      defaultValue,
      picker = 'date',
      format,
      showTime: showTimeProp = false,
      showToday = true,
      showNow = false,
      disabled = false,
      size = 'default',
      status,
      placeholder,
      // '~' is direction-neutral: an arrow would point the wrong way under RTL.
      separator = '~',
      placement = 'bottomLeft',
      allowClear = true,
      open: controlledOpen,
      disabledDate,
      onChange,
      onOpenChange,
      onPanelChange,
      className = '',
      style,
      id,
      renderExtraFooter,
      cellRender,
      variant,
      bordered = true,
      prevIcon,
      nextIcon,
      superPrevIcon,
      superNextIcon,
    } = props;

    const effectiveVariant = !bordered ? 'borderless' : variant ?? 'outlined';

    const displayPlaceholder = placeholder ?? [t('datepicker.start_date'), t('datepicker.end_date')];
    const showTime = !!showTimeProp;
    const isControlled = value !== undefined;
    const isOpenControlled = controlledOpen !== undefined;

    const [internalStart, setInternalStart] = useState<Date | null>(() =>
      defaultValue ? parseLocalDateValue(defaultValue[0]) : null,
    );
    const [internalEnd, setInternalEnd] = useState<Date | null>(() =>
      defaultValue ? parseLocalDateValue(defaultValue[1]) : null,
    );
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeInput, setActiveInput] = useState<'start' | 'end'>('start');
    const [focusedDate, setFocusedDate] = useState<Date | null>(null);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    // The date under the pointer while the end is picked previews the band; it is never committed paint.
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

    const startDate = isControlled ? parseLocalDateValue(value?.[0]) : internalStart;
    const endDate = isControlled ? parseLocalDateValue(value?.[1]) : internalEnd;
    const isOpen = isOpenControlled ? controlledOpen! : internalOpen;

    const initialView = startDate || new Date();
    const [viewYear, setViewYear] = useState(initialView.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialView.getMonth());

    const triggerRef = useRef<HTMLDivElement>(null);
    const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const startField = useInteractionState({ disabled });
    const endField = useInteractionState({ disabled });
    // A stable callback: an inline ref arrow would detach and re-attach every commit and loop the setState.
    const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      setAnchorEl(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }, [ref]);

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    // Dismissal returns focus to the range input currently being filled.
    const dismissPanel = useCallback(() => {
      setOpen(false);
      triggerRef.current
        ?.querySelector<HTMLElement>(`[data-range-input='${activeInput}']`)
        ?.focus();
    }, [setOpen, activeInput]);

    const overlay = useFieldOverlay({
      kind: 'dropdown',
      open: isOpen,
      anchor: anchorEl,
      panel: panelEl,
      placement: OVERLAY_PLACEMENT[placement],
      offset: 4,
      flip: true,
      modal: true,
      lockScroll: false,
      restoreFocus: false,
      onDismiss: dismissPanel,
      dismissOnOutsidePointer: true,
    });

    const emitChange = useCallback(
      (s: Date | null, e: Date | null) => {
        const sStr = formatDisplay(s, format, picker, showTime);
        const eStr = formatDisplay(e, format, picker, showTime);
        onChange?.([s, e], [sStr, eStr]);
      },
      [format, picker, showTime, onChange],
    );

    const handleDateSelect = useCallback(
      (date: Date) => {
        if (activeInput === 'start') {
          if (!isControlled) setInternalStart(date);
          setActiveInput('end');
          emitChange(date, endDate);
        } else {
          if (!isControlled) setInternalEnd(date);
          setActiveInput('start');
          emitChange(startDate, date);
          if (!showTime) {
            setOpen(false);
            // The panel unmounts with the clicked cell's focus inside; the filled end input takes it.
            triggerRef.current
              ?.querySelector<HTMLElement>("[data-range-input='end']")
              ?.focus();
          }
        }
        setFocusedDate(null);
        setHoveredDate(null);
      },
      [activeInput, isControlled, endDate, startDate, showTime, emitChange, setOpen],
    );

    const handleTodayClick = useCallback(() => {
      const now = new Date();
      handleDateSelect(now);
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }, [handleDateSelect]);

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) {
          setInternalStart(null);
          setInternalEnd(null);
        }
        onChange?.(null, ['', '']);
      },
      [isControlled, onChange],
    );

    const startText = formatDisplay(startDate, format, picker, showTime);
    const endText = formatDisplay(endDate, format, picker, showTime);
    const canonicalSize = toCanonicalSize(size) ?? 'md';

    return (
      <>
        <div
          ref={setTriggerRef}
          data-part="root"
          className={`ds-date-picker-range ds-date-picker-range--modern ${className}`}
          style={style}
          id={id}
        >
          <input
            type="text"
            readOnly
            {...partAttributes('trigger-input', startField.state)}
            onPointerEnter={startField.handlers.onPointerEnter}
            onPointerLeave={startField.handlers.onPointerLeave}
            onPointerDown={startField.handlers.onPointerDown}
            onPointerUp={startField.handlers.onPointerUp}
            onFocus={startField.handlers.onFocus}
            onBlur={startField.handlers.onBlur}
            data-range-input="start"
            data-status={status ?? 'default'}
            data-size={canonicalSize}
            data-variant={effectiveVariant}
            data-active={(activeInput === 'start' && isOpen) || undefined}
            value={startText}
            disabled={disabled}
            placeholder={displayPlaceholder[0]}
            onClick={() => {
              if (!disabled) {
                setActiveInput('start');
                setOpen(true);
              }
            }}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label={displayPlaceholder[0]}
          />
          <span data-part="separator" aria-hidden="true">{separator}</span>
          <input
            type="text"
            readOnly
            {...partAttributes('trigger-input', endField.state)}
            onPointerEnter={endField.handlers.onPointerEnter}
            onPointerLeave={endField.handlers.onPointerLeave}
            onPointerDown={endField.handlers.onPointerDown}
            onPointerUp={endField.handlers.onPointerUp}
            onFocus={endField.handlers.onFocus}
            onBlur={endField.handlers.onBlur}
            data-range-input="end"
            data-status={status ?? 'default'}
            data-size={canonicalSize}
            data-variant={effectiveVariant}
            data-active={(activeInput === 'end' && isOpen) || undefined}
            value={endText}
            disabled={disabled}
            placeholder={displayPlaceholder[1]}
            onClick={() => {
              if (!disabled) {
                setActiveInput('end');
                setOpen(true);
              }
            }}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label={displayPlaceholder[1]}
          />
          {allowClear && (startText || endText) && !disabled && (
            <ClearAction label={t('datepicker.clear_dates')} onClear={handleClear}>
              <ActionCloseIcon decorative size={12} />
            </ClearAction>
          )}
        </div>

        {isOpen && (
          <FieldOverlayPanel overlay={overlay}>
            <div
              {...overlay.panelProps}
              ref={setPanelEl}
              data-part="popup"
              data-placement={placement}
              style={overlay.panelProps.style}
            >
              <CalendarPanel
                selectedDate={activeInput === 'start' ? startDate : endDate}
                viewYear={viewYear}
                viewMonth={viewMonth}
                onViewChange={(y, m) => {
                  setViewYear(y);
                  setViewMonth(m);
                }}
                onDateSelect={handleDateSelect}
                disabledDate={disabledDate}
                picker={picker}
                showTime={showTime}
                hours={hours}
                minutes={minutes}
                onHoursChange={setHours}
                onMinutesChange={setMinutes}
                showToday={showToday}
                showNow={showNow}
                onTodayClick={handleTodayClick}
                renderExtraFooter={renderExtraFooter}
                cellRender={cellRender}
                rangeStart={startDate}
                rangeEnd={endDate}
                rangePreviewEnd={activeInput === 'end' ? hoveredDate : null}
                onCellHover={setHoveredDate}
                focusedDate={focusedDate}
                onFocusedDateChange={setFocusedDate}
                onPanelChange={onPanelChange}
                prevIcon={prevIcon}
                nextIcon={nextIcon}
                superPrevIcon={superPrevIcon}
                superNextIcon={superNextIcon}
              />
            </div>
          </FieldOverlayPanel>
        )}
      </>
    );
  },
);

RangePicker.displayName = 'DatePicker.RangePicker.Modern';

export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
