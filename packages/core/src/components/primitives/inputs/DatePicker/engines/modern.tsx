'use client';

/**
 * @fileoverview DatePicker Modern Engine (DaisyUI/Tailwind) - Rottay Design System.
 * Full calendar UI built from DaisyUI classes and native DOM -- no Ant Design,
 * no dayjs dependency. Renders date/month/year grids with keyboard navigation,
 * range highlighting, optional time selection, and ARIA dialog semantics.
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
import { createPortal } from 'react-dom';
import type { DatePickerMode, DatePickerProps, RangePickerProps } from '../DatePicker.types';
import { useTranslation } from '../../../../../i18n';
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
} from '../utils/calendar';

// ---------------------------------------------------------------------------
// Size config
// ---------------------------------------------------------------------------

// DS size tokens mapped to inline style dimensions.
const sizeStyleMap: Record<string, React.CSSProperties> = {
  small: { height: 'var(--ds-input-sm-height, 2rem)', fontSize: 'var(--ds-input-sm-font-size, 13px)', padding: '4px var(--ds-input-sm-padding-x, 10px)' },
  default: { height: 'var(--ds-input-md-height, 2.5rem)', fontSize: 'var(--ds-input-md-font-size, 14px)', padding: '6px var(--ds-input-md-padding-x, 12px)' },
  large: { height: 'var(--ds-input-lg-height, 2.75rem)', fontSize: 'var(--ds-input-lg-font-size, 16px)', padding: '8px var(--ds-input-lg-padding-x, 14px)' },
};

// ---------------------------------------------------------------------------
// SVG Icons (inline to avoid extra deps)
// Modern engine uses inline SVGs instead of an icon library so that it stays
// self-contained -- no @ant-design/icons or heroicons dependency required.
// ---------------------------------------------------------------------------

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ---------------------------------------------------------------------------
// usePopoverPosition hook
// ---------------------------------------------------------------------------

// Custom positioning hook replaces a floating-ui dependency. It calculates
// absolute coordinates from the trigger's bounding rect and recomputes on
// scroll (captured phase to catch nested scrollable containers) and resize.
function usePopoverPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  placement: string = 'bottomLeft',
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
        top = rect.top - gap;
      }
      if (placement.includes('Right')) {
        left = rect.right;
      }

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
  }, [isOpen, placement, triggerRef]);

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
// All styles are inline because this component renders inside a portal.
const TimePickerPanel: React.FC<TimePickerPanelProps> = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2, 8px)', padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-3, 12px)', borderTop: '1px solid var(--ds-color-border)' }}>
    <ClockIcon />
    <select
      style={{ padding: '2px var(--ds-spacing-2, 8px)', border: '1px solid var(--ds-color-border)', borderRadius: 'var(--ds-radius-md, 6px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', height: 'var(--ds-input-sm-height, 28px)', background: 'var(--ds-color-bg-elevated)', color: 'var(--ds-color-text-primary)' }}
      value={hours}
      onChange={(e) => onHoursChange(Number(e.target.value))}
      aria-label="Hour"
    >
      {Array.from({ length: 24 }, (_, i) => (
        <option key={i} value={i}>{pad2(i)}</option>
      ))}
    </select>
    <span style={{ fontWeight: 700, color: 'var(--ds-color-text-primary)' }}>:</span>
    <select
      style={{ padding: '2px var(--ds-spacing-2, 8px)', border: '1px solid var(--ds-color-border)', borderRadius: 'var(--ds-radius-md, 6px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', height: 'var(--ds-input-sm-height, 28px)', background: 'var(--ds-color-bg-elevated)', color: 'var(--ds-color-text-primary)' }}
      value={minutes}
      onChange={(e) => onMinutesChange(Number(e.target.value))}
      aria-label="Minute"
    >
      {Array.from({ length: 60 }, (_, i) => (
        <option key={i} value={i}>{pad2(i)}</option>
      ))}
    </select>
  </div>
);

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
  // Shared inline styles for portal-rendered panels.
  // All styles must be inline because portal content renders outside the app's
  // Tailwind scope, so utility classes get purged. DaisyUI oklch vars are set
  // on :root and cascade to portals.
  // ---------------------------------------------------------------------------
  const panelStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-3, 12px)',
    background: 'var(--ds-color-bg-elevated)',
    borderRadius: 'var(--ds-radius-lg, 12px)',
    boxShadow: 'var(--ds-datepicker-panel-shadow, var(--ds-shadow-popover, var(--ds-card-shadow)))',
    border: '1px solid var(--ds-color-border)',
    width: 288,
    fontFamily: 'inherit',
    animation: 'rottay-select-slide-in var(--ds-motion-duration-fast, 0.15s) ease-out',
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
    borderRadius: 'var(--ds-radius-md, 6px)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--ds-color-text-primary)',
    fontSize: 'var(--ds-input-md-font-size, 14px)',
    transition: 'background var(--ds-motion-duration-fast, 0.15s)',
  };

  const gridCellStyle = (
    isSelected: boolean,
    isToday: boolean,
    isDisabled: boolean,
    isCurrentMonth: boolean,
    inRange: boolean,
    isEndpoint: boolean | null | undefined,
  ): React.CSSProperties => ({
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--ds-radius-md, 8px)',
    fontSize: 'var(--ds-input-sm-font-size, 13px)',
    border: isToday && !isSelected && !isEndpoint ? '1px solid var(--ds-color-primary)' : 'none',
    fontWeight: isToday || isSelected ? 600 : 400,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.2 : isCurrentMonth ? 1 : 0.3,
    background: isSelected || isEndpoint
      ? 'var(--ds-color-primary)'
      : inRange
        ? 'var(--ds-color-bg-hover)'
        : 'transparent',
    color: isSelected || isEndpoint
      ? 'var(--ds-color-white)'
      : 'var(--ds-color-text-primary)',
    transition: 'all var(--ds-motion-duration-fast, 0.15s)',
    outline: 'none',
  });

  const gridBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--ds-radius-md, 8px)',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 0',
    fontSize: 'var(--ds-input-sm-font-size, 13px)',
    transition: 'background var(--ds-motion-duration-fast, 0.15s)',
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
  };

  // Month picker mode
  if (picker === 'month') {
    return (
      <div style={{ ...panelStyle, width: 256 }}>
        <div style={headerStyle}>
          <button type="button" style={navBtnStyle} onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            <ChevronLeft />
          </button>
          <span style={{ fontWeight: 600, fontSize: 'var(--ds-input-md-font-size, 14px)', color: 'var(--ds-color-text-primary)' }}>{viewYear}</span>
          <button type="button" style={navBtnStyle} onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            <ChevronRight />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-1, 4px)' }}>
          {MONTHS_SHORT.map((m, i) => {
            const isSelected = selectedDate
              ? selectedDate.getMonth() === i && selectedDate.getFullYear() === viewYear
              : false;
            const isCurrent = today.getMonth() === i && today.getFullYear() === viewYear;
            return (
              <button
                key={m}
                type="button"
                style={{
                  ...gridBtnStyle,
                  padding: '8px 0',
                  background: isSelected ? 'var(--ds-color-primary)' : 'transparent',
                  color: isSelected ? 'var(--ds-color-white)' : 'var(--ds-color-text-primary)',
                  border: isCurrent && !isSelected ? '1px solid var(--ds-color-primary)' : 'none',
                  fontWeight: isSelected || isCurrent ? 600 : 400,
                  borderRadius: 'var(--ds-radius-md, 8px)',
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
          <div style={{ borderTop: '1px solid var(--ds-color-border)', marginTop: 'var(--ds-spacing-2, 8px)', paddingTop: 'var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-font-size-xs, 12px)' }}>
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
      <div style={{ ...panelStyle, width: 256 }}>
        <div style={headerStyle}>
          <button type="button" style={navBtnStyle} onClick={() => onViewChange(viewYear - 10, viewMonth)} aria-label={t('datepicker.previous_decade')}>
            <ChevronLeft />
          </button>
          <span style={{ fontWeight: 600, fontSize: 'var(--ds-input-md-font-size, 14px)', color: 'var(--ds-color-text-primary)' }}>
            {startYear} - {startYear + 9}
          </span>
          <button type="button" style={navBtnStyle} onClick={() => onViewChange(viewYear + 10, viewMonth)} aria-label={t('datepicker.next_decade')}>
            <ChevronRight />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-1, 4px)' }}>
          {Array.from({ length: 12 }, (_, i) => {
            const yr = startYear - 1 + i;
            const isSelected = selectedDate ? selectedDate.getFullYear() === yr : false;
            const isCurrent = today.getFullYear() === yr;
            const isOutOfRange = i === 0 || i === 11;
            return (
              <button
                key={yr}
                type="button"
                style={{
                  ...gridBtnStyle,
                  padding: '8px 0',
                  opacity: isOutOfRange ? 0.4 : 1,
                  background: isSelected ? 'var(--ds-color-primary)' : 'transparent',
                  color: isSelected ? 'var(--ds-color-white)' : 'var(--ds-color-text-primary)',
                  border: isCurrent && !isSelected ? '1px solid var(--ds-color-primary)' : 'none',
                  fontWeight: isSelected || isCurrent ? 600 : 400,
                  borderRadius: 'var(--ds-radius-md, 8px)',
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
          <div style={{ borderTop: '1px solid var(--ds-color-border)', marginTop: 'var(--ds-spacing-2, 8px)', paddingTop: 'var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-font-size-xs, 12px)' }}>
            {renderExtraFooter()}
          </div>
        )}
      </div>
    );
  }

  // Default: full day-level calendar grid (42 cells = 6 rows x 7 columns).
  const grid = generateCalendarGrid(viewYear, viewMonth, disabledDate);

  return (
    <div style={panelStyle} role="dialog" aria-label={t('datepicker.date_picker')}>
      {/* Header navigation */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button type="button" style={navBtnStyle} onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            «
          </button>
          <button type="button" style={navBtnStyle} onClick={handlePrevMonth} aria-label={t('datepicker.previous_month')}>
            <ChevronLeft />
          </button>
        </div>
        <span style={{ fontWeight: 600, fontSize: 'var(--ds-input-md-font-size, 14px)', color: 'var(--ds-color-text-primary)' }}>
          {MONTHS_FULL[viewMonth]} {viewYear}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button type="button" style={navBtnStyle} onClick={handleNextMonth} aria-label={t('datepicker.next_month')}>
            <ChevronRight />
          </button>
          <button type="button" style={navBtnStyle} onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            »
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 'var(--ds-spacing-1, 4px)' }} role="row">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            style={{ textAlign: 'center', fontSize: 'var(--ds-font-size-xs, 12px)', fontWeight: 500, color: 'var(--ds-color-text-muted)', padding: 'var(--ds-spacing-1, 4px) 0' }}
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

          return (
            <button
              key={idx}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={cell.isDisabled}
              aria-label={formatDateStr(cell.date)}
              tabIndex={isFocused ? 0 : -1}
              style={gridCellStyle(isSelected, cell.isToday, cell.isDisabled, cell.isCurrentMonth, inRange, isEndpoint)}
              onMouseEnter={(e) => {
                if (!cell.isDisabled && !isSelected && !isEndpoint) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--ds-color-bg-hover)';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!cell.isDisabled && !isSelected && !isEndpoint) {
                  (e.currentTarget as HTMLElement).style.background = inRange ? 'var(--ds-color-bg-hover)' : 'transparent';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }
              }}
              onClick={() => {
                if (!cell.isDisabled) onDateSelect(cell.date);
              }}
            >
              {cell.day}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--ds-spacing-2, 8px)', paddingTop: 'var(--ds-spacing-2, 8px)', borderTop: '1px solid var(--ds-color-border)' }}>
        {showToday && (
          <button
            type="button"
            style={{
              padding: '4px var(--ds-spacing-3, 12px)',
              fontSize: 'var(--ds-font-size-xs, 12px)',
              fontWeight: 500,
              borderRadius: 'var(--ds-radius-md, 6px)',
              border: 'none',
              background: 'var(--ds-color-primary)',
              color: 'var(--ds-color-white)',
              cursor: 'pointer',
              transition: 'opacity var(--ds-motion-duration-fast, 0.15s)',
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
 * Modern (DaisyUI/Tailwind) DatePicker engine.
 *
 * Renders a read-only input that opens a `CalendarPanel` popover on click.
 * Supports controlled and uncontrolled usage, date/month/year picker modes,
 * optional time selection, disabled dates, cell customization, and Today/Now
 * quick-select. The popover is absolutely positioned via `usePopoverPosition`.
 *
 * @param props - Rottay DatePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the text input element.
 * @returns The rendered DaisyUI-styled DatePicker with calendar popover.
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

    // Merge refs
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref],
    );

    // Popover position
    const popPos = usePopoverPosition(triggerRef, isOpen, placement);

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
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
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

    // Size / status styles
    const dateSizeStyle = sizeStyleMap[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
    const dateStatusStyle: React.CSSProperties = status === 'error'
      ? { borderColor: 'var(--ds-color-error)' }
      : status === 'warning'
        ? { borderColor: 'var(--ds-color-warning)' }
        : {};

    return (
      <>
        {/* Inline keyframes avoid requiring a global CSS file. The subtle
            translateY + scale gives a "growing from trigger" entrance feel. */}
        <style dangerouslySetInnerHTML={{ __html: `@keyframes rottay-select-slide-in{from{opacity:0;transform:translateY(-4px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}` }} />
        <div
          ref={triggerRef}
          className={`relative w-full ${className}`}
          style={style}
        >
          <input
            ref={setInputRef}
            type="text"
            // readOnly prevents keyboard input -- dates must be selected via the
            // calendar panel. paddingRight reserves space for the clear + calendar icons.
            readOnly
            className="w-full cursor-pointer"
            style={{
              border: '1px solid var(--ds-color-border)',
              borderRadius: 'var(--ds-radius-md)',
              background: 'var(--ds-color-bg-input, var(--ds-surface-control))',
              color: 'var(--ds-color-text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
              paddingRight: 48,
              ...dateSizeStyle,
              ...dateStatusStyle,
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
              style={{ position: 'absolute', right: 'var(--ds-spacing-4, 28px)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--ds-spacing-1, 4px)', borderRadius: '50%', opacity: 0.5, color: 'var(--ds-color-text-primary)', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleClear}
              tabIndex={-1}
              aria-label={t('datepicker.clear_date')}
            >
              ×
            </button>
          )}
          <span
            style={{ position: 'absolute', right: 'var(--ds-spacing-2, 10px)', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ds-color-text-muted)', display: 'flex' }}
            aria-hidden="true"
          >
            <CalendarIcon />
          </span>
        </div>

        {/* Calendar popover -- portalled to document.body to avoid
            ancestor overflow:hidden clipping. Uses fixed positioning
            based on trigger bounding rect. zIndex 1050 matches the DS
            overlay stacking layer (above modals at 1040). */}
        {isOpen && typeof document !== 'undefined' && createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: popPos.top,
              left: popPos.left,
              zIndex: 1050,
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
          </div>,
          document.body,
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
 * Modern (DaisyUI/Tailwind) RangePicker engine.
 *
 * Renders two read-only inputs (start/end) with a shared `CalendarPanel`.
 * Selection follows a ping-pong pattern: the first click sets the start
 * date and auto-advances focus to end; the second click sets the end date
 * and closes the popover. Range highlighting is applied between the two
 * endpoints in the calendar grid.
 *
 * @param props - Rottay RangePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the wrapper div element.
 * @returns The rendered DaisyUI-styled RangePicker with calendar popover.
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

    const popPos = usePopoverPosition(triggerRef, isOpen, placement);

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

    // Escape
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [isOpen, setOpen]);

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

    const rangeSizeStyle = sizeStyleMap[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
    const rangeStatusStyle: React.CSSProperties = status === 'error'
      ? { borderColor: 'var(--ds-color-error)' }
      : status === 'warning'
        ? { borderColor: 'var(--ds-color-warning)' }
        : {};

    const rangeInputBaseStyle: React.CSSProperties = {
      border: '1px solid var(--ds-color-border)',
      borderRadius: 'var(--ds-radius-md)',
      background: 'var(--ds-color-bg-input, var(--ds-surface-control))',
      color: 'var(--ds-color-text-primary)',
      outline: 'none',
      boxSizing: 'border-box' as const,
      width: '100%',
      cursor: 'pointer',
      ...rangeSizeStyle,
      ...rangeStatusStyle,
    };

    return (
      <>
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={`flex items-center gap-2 w-full ${className}`}
          style={style}
          id={id}
        >
          <input
            type="text"
            readOnly
            style={{
              ...rangeInputBaseStyle,
              ...(activeInput === 'start' && isOpen ? { boxShadow: '0 0 0 2px var(--ds-color-primary)' } : {}),
            }}
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
          <span className="shrink-0" style={{ color: 'var(--ds-color-text-secondary)' }}>{separator}</span>
          <input
            type="text"
            readOnly
            style={{
              ...rangeInputBaseStyle,
              ...(activeInput === 'end' && isOpen ? { boxShadow: '0 0 0 2px var(--ds-color-primary)' } : {}),
            }}
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
              style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-font-size-xs, 12px)', opacity: 0.5 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
              onClick={handleClear}
              tabIndex={-1}
              aria-label={t('datepicker.clear_dates')}
            >
              ×
            </button>
          )}
        </div>

        {isOpen && typeof document !== 'undefined' && createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: popPos.top,
              left: popPos.left,
              zIndex: 1050,
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
          </div>,
          document.body,
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
