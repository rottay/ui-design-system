'use client';

/**
 * @fileoverview DatePicker Modern Engine - Rottay Design System.
 * Full token- and skin-driven calendar UI built from native DOM -- no Ant
 * Design, DaisyUI, or dayjs dependency. Renders date/month/year grids with
 * keyboard navigation, range highlighting, optional time selection, and ARIA
 * dialog semantics.
 * Positioning uses a lightweight hook instead of floating-ui.
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

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { DatePickerMode, DatePickerProps, RangePickerProps } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../../runtime/overlay/portal-scope';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { TimeDateIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-date';
import { TimeTimestampIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-timestamp';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import {
  DAYS_SHORT,
  MONTHS_FULL,
  MONTHS_SHORT,
  pad2,
  isSameDay,
  isDateInRange,
  parseDateValue,
  formatDateStr,
  formatDisplay,
  generateCalendarGrid,
  getKeyboardNavDate,
} from '../../runtime/calendar';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';

// ---------------------------------------------------------------------------
// Size config
// ---------------------------------------------------------------------------

// DS size tokens mapped to inline style dimensions, keyed by the canonical
// `sm | md | lg` step -- `toCanonicalSize` resolves any accepted spelling.
const sizeStyleMap: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
  sm: { height: 'var(--ds-input-sm-height, 2rem)', fontSize: 'var(--ds-input-sm-font-size, 13px)', padding: '4px var(--ds-input-sm-padding-x, 10px)' },
  md: { height: 'var(--ds-input-md-height, 2.5rem)', fontSize: 'var(--ds-input-md-font-size, 14px)', padding: '6px var(--ds-input-md-padding-x, 12px)' },
  lg: { height: 'var(--ds-input-lg-height, 2.75rem)', fontSize: 'var(--ds-input-lg-font-size, 15px)', padding: '8px var(--ds-input-lg-padding-x, 14px)' },
};

// All functional glyphs resolve through the semantic icon corpus. The double
// year affordance composes two logical navigation roles so tenant icon packs
// and RTL behavior remain authoritative.
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

// ---------------------------------------------------------------------------
// usePopoverPosition hook
// ---------------------------------------------------------------------------

// Custom positioning hook replaces a floating-ui dependency. It calculates
// absolute coordinates from the trigger's bounding rect and recomputes on
// scroll (captured phase to catch nested scrollable containers) and resize.
// Top placements subtract the PANEL's measured height: without it the panel's
// top edge parked at the trigger's top edge and the panel painted DOWN over
// the field (the measured panel ref arrives with the same commit that opens
// it, so it is readable inside the effect).
function usePopoverPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  placement: string = 'bottomLeft',
  panelRef?: React.RefObject<HTMLElement | null>,
) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      // Fixed positioning uses viewport-relative coordinates (no scrollY/scrollX)
      // Gap between trigger and dropdown for visual separation
      const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ds-spacing-1') || '4', 10) || 4;
      let top = rect.bottom + gap;
      let left = rect.left;

      if (placement.includes('top')) {
        const panelHeight = panelRef?.current?.getBoundingClientRect().height ?? 0;
        top = rect.top - gap - panelHeight;
      }
      if (placement.includes('Right')) {
        left = rect.right;
      }

      // Responsive law: never let the panel overflow the viewport's inline
      // end. 344 is the worst-case panel footprint (coarse-pointer day grid:
      // 7x44 cells + gaps + padding); clamping with the maximum keeps every
      // mode inside the viewport, at the cost of a slightly earlier clamp
      // for the narrower month/year panels.
      const PANEL_MAX_FOOTPRINT = 344;
      left = Math.max(gap, Math.min(left, window.innerWidth - PANEL_MAX_FOOTPRINT - gap));

      setPos({ top, left });
    };

    update();
    // Capture phase on scroll ensures we catch scrolls inside overflow containers
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, placement, triggerRef, panelRef]);

  return pos;
}

// ---------------------------------------------------------------------------
// TimePicker sub-component
// ---------------------------------------------------------------------------

interface TimePickerPanelProps {
  hours: number;
  minutes: number;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
}

// Time selection uses native <select> elements for reliable mobile behavior.
// Geometry stays inline; the standalone portal skin owns paint and state.
const TimePickerPanel: React.FC<TimePickerPanelProps> = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}) => {
  const { t } = useTranslation('components');
  return (
  <div data-part="time-column" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2, 8px)', padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-3, 12px)' }}>
    <TimeTimestampIcon decorative size={14} />
    <select
      style={{ padding: '2px var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', height: 'var(--ds-input-sm-height, 32px)' }}
      value={hours}
      onChange={(e) => onHoursChange(Number(e.target.value))}
      aria-label={t('datepicker.hour')}
    >
      {Array.from({ length: 24 }, (_, i) => (
        <option key={i} value={i}>{pad2(i)}</option>
      ))}
    </select>
    <span>:</span>
    <select
      style={{ padding: '2px var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', height: 'var(--ds-input-sm-height, 32px)' }}
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
// CalendarPanel sub-component (the dropdown calendar grid)
// ---------------------------------------------------------------------------

interface CalendarPanelProps {
  /** The currently selected date (for highlighting). */
  selectedDate: Date | null;
  /** View year/month state. */
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  /** Called when a date cell is clicked. */
  onDateSelect: (date: Date) => void;
  /** Disabled date predicate. */
  disabledDate?: (d: Date) => boolean;
  /** Picker mode. */
  picker: string;
  /** Show time picker. */
  showTime: boolean;
  /** Time state. */
  hours: number;
  minutes: number;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
  /** Show Today button. */
  showToday: boolean;
  /** Show Now button (for time mode). */
  showNow: boolean;
  /** Called when Today/Now is clicked. */
  onTodayClick: () => void;
  /** Extra footer renderer. */
  renderExtraFooter?: () => React.ReactNode;
  /** Cell render customization. */
  cellRender?: (current: Date, info: { originNode: React.ReactNode; today: Date; range?: 'start' | 'end' }) => React.ReactNode;
  /** Range mode: highlight dates between start and end. */
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  /** Focused date for keyboard navigation. */
  focusedDate: Date | null;
  onFocusedDateChange: (d: Date) => void;
  /** Panel change callback. */
  onPanelChange?: (date: Date, mode: DatePickerMode) => void;
}

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
  focusedDate,
  onFocusedDateChange,
  onPanelChange,
}) => {
  const { t } = useTranslation('components');
  const today = useMemo(() => new Date(), []);
  const gridRef = useRef<HTMLDivElement>(null);

  // Month navigation
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

  // Keyboard navigation on the grid
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const base = focusedDate || selectedDate || today;
      const newDate = getKeyboardNavDate(base, e.key);

      if (newDate) {
        e.preventDefault();
        onFocusedDateChange(newDate);
        // Update view if navigated out of current month
        if (newDate.getMonth() !== viewMonth || newDate.getFullYear() !== viewYear) {
          onViewChange(newDate.getFullYear(), newDate.getMonth());
        }
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const dateToSelect = focusedDate || base;
        if (!disabledDate || !disabledDate(dateToSelect)) {
          onDateSelect(dateToSelect);
        }
      }

      if (e.key === 'Escape') {
        // Let parent handle close
      }
    },
    [focusedDate, selectedDate, today, viewMonth, viewYear, onFocusedDateChange, onViewChange, onDateSelect, disabledDate],
  );

  // ---------------------------------------------------------------------------
  // Shared structural geometry for portal-rendered panels. Paint/state live in
  // the standalone panel skin because portal content sits outside the trigger
  // root. Tenant semantic channels are set on the DS root and still cascade
  // into the governed portal scope.
  // Panel width and the slide-in animation are skin-owned (per `data-mode`
  // channel + reduced-motion coverage); only token-based geometry stays here.
  // ---------------------------------------------------------------------------
  const panelStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-3, 12px)',
    fontFamily: 'inherit',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--ds-spacing-2, 8px)',
  };

  const navBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    cursor: 'pointer',
    fontSize: 'var(--ds-input-md-font-size, 14px)',
  };

  const gridCellStyle = (
    isDisabled: boolean,
  ): React.CSSProperties => ({
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-input-sm-font-size, 13px)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  });

  const gridBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '6px 0',
    fontSize: 'var(--ds-input-sm-font-size, 13px)',
  };

  // Month picker mode
  if (picker === 'month') {
    return (
      <div data-part="panel" data-mode="month" className="rottay-datepicker-panel rottay-datepicker-panel--modern" style={panelStyle}>
        <div data-part="header" style={headerStyle}>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            <PreviousIcon />
          </button>
          <span data-part="panel-title" style={{ fontSize: 'var(--ds-input-md-font-size, 14px)' }}>{viewYear}</span>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            <NextIcon />
          </button>
        </div>
        <div data-part="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-1, 4px)' }}>
          {MONTHS_SHORT.map((m, i) => {
            const isSelected = selectedDate
              ? selectedDate.getMonth() === i && selectedDate.getFullYear() === viewYear
              : false;
            const isCurrent = today.getMonth() === i && today.getFullYear() === viewYear;
            return (
              <button
                key={m}
                type="button"
                data-part="cell"
                data-selected={isSelected || undefined}
                data-today={isCurrent || undefined}
                style={{
                  ...gridBtnStyle,
                  padding: '8px 0',
                }}
                onClick={() => {
                  const date = new Date(viewYear, i, 1);
                  onDateSelect(date);
                  onPanelChange?.(date, 'month');
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
        {renderExtraFooter && (
          <div data-part="footer" style={{ marginTop: 'var(--ds-spacing-2, 8px)', paddingTop: 'var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-font-size-xs, 12px)' }}>
            {renderExtraFooter()}
          </div>
        )}
      </div>
    );
  }

  // Year picker mode
  if (picker === 'year') {
    const startYear = Math.floor(viewYear / 10) * 10;
    return (
      <div data-part="panel" data-mode="year" className="rottay-datepicker-panel rottay-datepicker-panel--modern" style={panelStyle}>
        <div data-part="header" style={headerStyle}>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={() => onViewChange(viewYear - 10, viewMonth)} aria-label={t('datepicker.previous_decade')}>
            <PreviousIcon />
          </button>
          <span data-part="panel-title" style={{ fontSize: 'var(--ds-input-md-font-size, 14px)' }}>
            {startYear} - {startYear + 9}
          </span>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={() => onViewChange(viewYear + 10, viewMonth)} aria-label={t('datepicker.next_decade')}>
            <NextIcon />
          </button>
        </div>
        <div data-part="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-1, 4px)' }}>
          {Array.from({ length: 12 }, (_, i) => {
            const yr = startYear - 1 + i;
            const isSelected = selectedDate ? selectedDate.getFullYear() === yr : false;
            const isCurrent = today.getFullYear() === yr;
            const isOutOfRange = i === 0 || i === 11;
            return (
              <button
                key={yr}
                type="button"
                data-part="cell"
                data-selected={isSelected || undefined}
                data-today={isCurrent || undefined}
                data-decade-edge={isOutOfRange || undefined}
                style={{
                  ...gridBtnStyle,
                  padding: '8px 0',
                }}
                onClick={() => {
                  const date = new Date(yr, 0, 1);
                  onDateSelect(date);
                  onPanelChange?.(date, 'year');
                }}
              >
                {yr}
              </button>
            );
          })}
        </div>
        {renderExtraFooter && (
          <div data-part="footer" style={{ marginTop: 'var(--ds-spacing-2, 8px)', paddingTop: 'var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-font-size-xs, 12px)' }}>
            {renderExtraFooter()}
          </div>
        )}
      </div>
    );
  }

  // Default: full day-level calendar grid (42 cells = 6 rows x 7 columns).
  const grid = generateCalendarGrid(viewYear, viewMonth, disabledDate);

  return (
    <div data-part="panel" data-mode="date" className="rottay-datepicker-panel rottay-datepicker-panel--modern" style={panelStyle} role="dialog" aria-label={t('datepicker.date_picker')}>
      {/* Header navigation */}
      <div data-part="header" style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            <PreviousYearIcon />
          </button>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={handlePrevMonth} aria-label={t('datepicker.previous_month')}>
            <PreviousIcon />
          </button>
        </div>
        <span data-part="panel-title" style={{ fontSize: 'var(--ds-input-md-font-size, 14px)' }}>
          {MONTHS_FULL[viewMonth]} {viewYear}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={handleNextMonth} aria-label={t('datepicker.next_month')}>
            <NextIcon />
          </button>
          <button type="button" data-part="nav-button" style={navBtnStyle} onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            <NextYearIcon />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 'var(--ds-spacing-1, 4px)' }} role="row">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            data-part="weekday-header"
            style={{ textAlign: 'center', fontSize: 'var(--ds-font-size-xs, 12px)', padding: 'var(--ds-spacing-1, 4px) 0' }}
            role="columnheader"
            aria-label={d}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        ref={gridRef}
        data-part="grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}
        role="grid"
        tabIndex={0}
        onKeyDown={handleGridKeyDown}
        aria-label={t('datepicker.calendar_dates')}
      >
        {grid.map((cell, idx) => {
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          const isFocused = focusedDate ? isSameDay(cell.date, focusedDate) : false;
          const inRange = isDateInRange(cell.date, rangeStart ?? null, rangeEnd ?? null);
          const isEndpoint =
            (rangeStart && isSameDay(cell.date, rangeStart)) ||
            (rangeEnd && isSameDay(cell.date, rangeEnd));
          const endpointRange = rangeStart && isSameDay(cell.date, rangeStart)
            ? 'start'
            : rangeEnd && isSameDay(cell.date, rangeEnd)
              ? 'end'
              : undefined;
          const originNode = cell.day;

          return (
            <button
              key={idx}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={cell.isDisabled}
              aria-label={formatDateStr(cell.date)}
              tabIndex={isFocused ? 0 : -1}
              data-part="cell"
              data-today={cell.isToday || undefined}
              data-selected={(isSelected || !!isEndpoint) || undefined}
              data-in-range={inRange || undefined}
              data-disabled={cell.isDisabled || undefined}
              data-outside-month={!cell.isCurrentMonth || undefined}
              style={gridCellStyle(cell.isDisabled)}
              onClick={() => {
                if (!cell.isDisabled) onDateSelect(cell.date);
              }}
            >
              {cellRender
                ? cellRender(cell.date, { originNode, today, range: endpointRange })
                : originNode}
            </button>
          );
        })}
      </div>

      {/* Time picker */}
      {showTime && (
        <TimePickerPanel
          hours={hours}
          minutes={minutes}
          onHoursChange={onHoursChange}
          onMinutesChange={onMinutesChange}
        />
      )}

      {/* Footer */}
      <div data-part="footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--ds-spacing-2, 8px)', paddingTop: 'var(--ds-spacing-2, 8px)' }}>
        {showToday && (
          <button
            type="button"
            data-part="today-button"
            style={{
              padding: '4px var(--ds-spacing-3, 12px)',
              fontSize: 'var(--ds-font-size-xs, 12px)',
              cursor: 'pointer',
            }}
            onClick={onTodayClick}
          >
            {showTime && showNow ? t('datepicker.now') : t('datepicker.today')}
          </button>
        )}
        {renderExtraFooter && (
          <div style={{ fontSize: 'var(--ds-font-size-xs, 12px)' }}>{renderExtraFooter()}</div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// DatePickerBase
// ---------------------------------------------------------------------------

/**
 * Modern token- and skin-driven DatePicker engine.
 *
 * Renders a read-only input that opens a `CalendarPanel` popover on click.
 * Supports controlled and uncontrolled usage, date/month/year picker modes,
 * optional time selection, disabled dates, cell customization, and Today/Now
 * quick-select. The popover is absolutely positioned via `usePopoverPosition`.
 *
 * @param props - Rottay DatePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the text input element.
 * @returns The rendered DatePicker with its governed calendar popover.
 */
const DatePickerBase = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => {
    const { t } = useTranslation('components');

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
    } = props;

    const displayPlaceholder = placeholder ?? t('datepicker.placeholder');
    const showTime = !!showTimeProp;
    // Controlled vs uncontrolled pattern: if value/open are explicitly passed
    // (even as null), the consumer owns that state. undefined means uncontrolled.
    const isControlled = value !== undefined;
    const isOpenControlled = controlledOpen !== undefined;

    // State
    const [internalDate, setInternalDate] = useState<Date | null>(() =>
      parseDateValue(defaultValue),
    );
    const [internalOpen, setInternalOpen] = useState(false);
    const [focusedDate, setFocusedDate] = useState<Date | null>(null);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const selectedDate = isControlled ? parseDateValue(value) : internalDate;
    const isOpen = isOpenControlled ? controlledOpen! : internalOpen;

    // Initialize view to selected date or today
    const initialView = selectedDate || new Date();
    const [viewYear, setViewYear] = useState(initialView.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialView.getMonth());

    // Sync view with selectedDate when it changes externally
    useEffect(() => {
      if (selectedDate) {
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
        setHours(selectedDate.getHours());
        setMinutes(selectedDate.getMinutes());
      }
    }, [selectedDate]);

    // Refs
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // The calendar leaves the trigger's DOM ancestry when it portals, so the
    // tenant/locale scope has to be re-stamped around it. `usePortalScope`
    // needs the anchor as state (a ref would not re-render when it lands), so
    // the trigger publishes to both.
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      setAnchorEl(node);
    }, []);
    const portalScope = usePortalScope(anchorEl);

    // Merge refs
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref],
    );

    // Popover position (measured: top placements subtract the panel height)
    const popPos = usePopoverPosition(triggerRef, isOpen, placement, panelRef);

    // Open/close
    const setOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    // Click-outside dismissal. Uses mousedown (not click) so the popover
    // closes before the external element's click handler fires -- this avoids
    // a flash where both the popover and the clicked element are active.
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          triggerRef.current && !triggerRef.current.contains(target) &&
          panelRef.current && !panelRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, setOpen]);

    // Global Escape key listener -- separate from click-outside so both
    // keyboard and pointer users get a consistent dismiss experience.
    // Escape also RETURNS FOCUS to the trigger input (Dropdown/Popover
    // precedent): the panel unmounts on close, so without this the focus
    // would drop to <body>.
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
          inputRef.current?.focus();
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [isOpen, setOpen]);

    // When showTime is active, we merge the time portion from the time picker
    // state into the selected calendar date. Without this, selecting a new day
    // would reset the previously chosen time to midnight.
    const handleDateSelect = useCallback(
      (date: Date) => {
        const finalDate = showTime
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes)
          : date;
        const dateStr = formatDisplay(finalDate, format, picker, showTime);

        if (!isControlled) setInternalDate(finalDate);
        onChange?.(finalDate, dateStr);
        setFocusedDate(null);

        // Keep the popover open when showTime is active so the user can
        // adjust hours/minutes after selecting the date, then dismiss manually.
        if (!showTime) {
          setOpen(false);
        }
      },
      [showTime, hours, minutes, format, picker, isControlled, onChange, setOpen],
    );

    // Today/Now
    const handleTodayClick = useCallback(() => {
      const now = new Date();
      handleDateSelect(now);
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }, [handleDateSelect]);

    // Clear
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) setInternalDate(null);
        onChange?.(null, '');
      },
      [isControlled, onChange],
    );

    // Time changes
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

    // Display text
    const displayText = formatDisplay(selectedDate, format, picker, showTime);

    // Size styles
    const canonicalSize = toCanonicalSize(size) ?? 'md';
    const dateSizeStyle = sizeStyleMap[canonicalSize];
    return (
      <>
        <div
          ref={setTriggerRef}
          data-part="root"
          className={`rottay-datepicker rottay-datepicker--modern ${className}`}
          style={style}
        >
          <input
            ref={setInputRef}
            type="text"
            // readOnly prevents keyboard input -- dates must be selected via the
            // calendar panel. paddingInlineEnd reserves space for the clear +
            // calendar icons (logical property: the icon pair flips under RTL).
            readOnly
            data-part="trigger-input"
            data-status={status ?? 'default'}
            data-size={canonicalSize}
            style={{
              boxSizing: 'border-box',
              paddingInlineEnd: 48,
              ...dateSizeStyle,
            }}
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
            // ARIA combobox pattern: the input acts as the trigger, the calendar
            // panel is the dialog popup. Screen readers announce the expanded state.
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label={displayPlaceholder}
          />
          {allowClear && displayText && !disabled && (
            <button
              type="button"
              data-part="clear-button"
              style={{ position: 'absolute', insetInlineEnd: 'var(--ds-spacing-4, 16px)', top: '50%', cursor: 'pointer', padding: 'var(--ds-spacing-1, 4px)', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleClear}
              tabIndex={-1}
              aria-label={t('datepicker.clear_date')}
            >
              <ActionCloseIcon decorative size={14} />
            </button>
          )}
          <span
            data-part="calendar-icon"
            style={{ position: 'absolute', insetInlineEnd: 'var(--ds-spacing-2, 8px)', top: '50%', pointerEvents: 'none', display: 'flex' }}
            aria-hidden="true"
          >
            <TimeDateIcon decorative size={16} />
          </span>
        </div>

        {/* Calendar popover -- rendered through the shared overlay substrate
            to avoid ancestor overflow:hidden clipping. The target resolves as
            explicit container > active top-layer host > shared
            `#rottay-portal-root`, so the calendar stays visible when the field
            sits inside a `showModal()` dialog. `PortalScope` carries the
            tenant/theme/direction lineage across the boundary. Positioning
            stays fixed off the trigger rect; zIndex 1050 matches the DS
            overlay stacking layer (above modals at 1040). */}
        {isOpen && (
          <Portal>
            <PortalScope snapshot={portalScope}>
          <div
            ref={panelRef}
            data-placement={placement}
            style={{
              position: 'fixed',
              top: popPos.top,
              left: popPos.left,
              zIndex: 'var(--ds-datepicker-z-index, 1050)',
            }}
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
            />
          </div>
            </PortalScope>
          </Portal>
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
 * Modern token- and skin-driven RangePicker engine.
 *
 * Renders two read-only inputs (start/end) with a shared `CalendarPanel`.
 * Selection follows a ping-pong pattern: the first click sets the start
 * date and auto-advances focus to end; the second click sets the end date
 * and closes the popover. Range highlighting is applied between the two
 * endpoints in the calendar grid.
 *
 * @param props - Rottay RangePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the wrapper div element.
 * @returns The rendered RangePicker with its governed calendar popover.
 */
const RangePicker = React.forwardRef<HTMLDivElement, RangePickerProps>(
  (props, ref) => {
    const { t } = useTranslation('components');

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
      separator = '-->',
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
    } = props;

    const displayPlaceholder = placeholder ?? [t('datepicker.start_date'), t('datepicker.end_date')];
    const showTime = !!showTimeProp;
    const isControlled = value !== undefined;
    const isOpenControlled = controlledOpen !== undefined;

    // State
    const [internalStart, setInternalStart] = useState<Date | null>(() =>
      defaultValue ? parseDateValue(defaultValue[0]) : null,
    );
    const [internalEnd, setInternalEnd] = useState<Date | null>(() =>
      defaultValue ? parseDateValue(defaultValue[1]) : null,
    );
    const [internalOpen, setInternalOpen] = useState(false);
    // Tracks which side of the range the calendar is filling. After selecting
    // a start date, we auto-advance to 'end' so the next click sets the end.
    const [activeInput, setActiveInput] = useState<'start' | 'end'>('start');
    const [focusedDate, setFocusedDate] = useState<Date | null>(null);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const startDate = isControlled ? parseDateValue(value?.[0]) : internalStart;
    const endDate = isControlled ? parseDateValue(value?.[1]) : internalEnd;
    const isOpen = isOpenControlled ? controlledOpen! : internalOpen;

    const initialView = startDate || new Date();
    const [viewYear, setViewYear] = useState(initialView.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialView.getMonth());

    // Refs
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    // See DatePickerBase: the portaled calendar needs the anchor as state so
    // the scope snapshot re-resolves once the trigger lands. The callback must
    // be stable -- an inline ref arrow is re-created every render, so React
    // would detach (null) and re-attach it each commit and the setState would
    // loop.
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const portalScope = usePortalScope(anchorEl);
    const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      setAnchorEl(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }, [ref]);

    const popPos = usePopoverPosition(triggerRef, isOpen, placement, panelRef);

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    // Click outside
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          triggerRef.current && !triggerRef.current.contains(target) &&
          panelRef.current && !panelRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, setOpen]);

    // Escape: closes and RETURNS FOCUS to the range input currently being
    // filled (the panel unmounts on close; without this focus drops to <body>).
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
          const active = triggerRef.current?.querySelector<HTMLElement>(
            `[data-range-input='${activeInput}']`,
          );
          active?.focus();
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [isOpen, setOpen, activeInput]);

    // Emit change
    const emitChange = useCallback(
      (s: Date | null, e: Date | null) => {
        const sStr = formatDisplay(s, format, picker, showTime);
        const eStr = formatDisplay(e, format, picker, showTime);
        onChange?.([s, e], [sStr, eStr]);
      },
      [format, picker, showTime, onChange],
    );

    // Range selection follows a ping-pong pattern: start -> end -> close.
    // The calendar stays open between selections so users see the range highlight.
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
          // Close after both ends are selected (unless time picker keeps it open)
          if (!showTime) setOpen(false);
        }
        setFocusedDate(null);
      },
      [activeInput, isControlled, endDate, startDate, showTime, emitChange, setOpen],
    );

    // Today
    const handleTodayClick = useCallback(() => {
      const now = new Date();
      handleDateSelect(now);
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }, [handleDateSelect]);

    // Clear
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
    const rangeSizeStyle = sizeStyleMap[canonicalSize];
    const rangeInputBaseStyle: React.CSSProperties = {
      boxSizing: 'border-box' as const,
      width: '100%',
      cursor: 'pointer',
      ...rangeSizeStyle,
    };

    return (
      <>
        <div
          ref={setTriggerRef}
          data-part="root"
          className={`rottay-datepicker-range rottay-datepicker-range--modern ${className}`}
          style={style}
          id={id}
        >
          <input
            type="text"
            readOnly
            data-part="trigger-input"
            data-range-input="start"
            data-status={status ?? 'default'}
            data-size={canonicalSize}
            data-active={(activeInput === 'start' && isOpen) || undefined}
            style={rangeInputBaseStyle}
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
            aria-label={displayPlaceholder[0]}
          />
          <span data-part="separator">{separator}</span>
          <input
            type="text"
            readOnly
            data-part="trigger-input"
            data-range-input="end"
            data-status={status ?? 'default'}
            data-size={canonicalSize}
            data-active={(activeInput === 'end' && isOpen) || undefined}
            style={rangeInputBaseStyle}
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
            aria-label={displayPlaceholder[1]}
          />
          {allowClear && (startText || endText) && !disabled && (
            <button
              type="button"
              data-part="clear-button"
              style={{ width: 24, height: 24, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-font-size-xs, 12px)' }}
              onClick={handleClear}
              tabIndex={-1}
              aria-label={t('datepicker.clear_dates')}
            >
              ×
            </button>
          )}
        </div>

        {/* Shared overlay substrate -- see DatePickerBase. */}
        {isOpen && (
          <Portal>
            <PortalScope snapshot={portalScope}>
          <div
            ref={panelRef}
            data-placement={placement}
            style={{
              position: 'fixed',
              top: popPos.top,
              left: popPos.left,
              zIndex: 'var(--ds-datepicker-z-index, 1050)',
            }}
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
              focusedDate={focusedDate}
              onFocusedDateChange={setFocusedDate}
              onPanelChange={onPanelChange}
            />
          </div>
            </PortalScope>
          </Portal>
        )}
      </>
    );
  },
);

RangePicker.displayName = 'DatePicker.RangePicker.Modern';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
