'use client';

/**
 * @fileoverview DatePicker Modern Engine - Rottay Design System
 * @description Full calendar UI implementation using DaisyUI/Tailwind classes.
 * Supports date/month/year pickers, time selection, date ranges,
 * disabled dates, keyboard navigation, and ARIA accessibility.
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

const sizeClasses: Record<string, string> = {
  small: 'input-sm',
  default: 'input-md',
  large: 'input-lg',
};

const sizeTextClasses: Record<string, string> = {
  small: 'text-xs',
  default: 'text-sm',
  large: 'text-base',
};

// ---------------------------------------------------------------------------
// SVG Icons (inline to avoid extra deps)
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
      let top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX;

      if (placement.includes('top')) {
        top = rect.top + window.scrollY - 4; // will be adjusted by transform
      }
      if (placement.includes('Right')) {
        left = rect.right + window.scrollX;
      }

      setPos({ top, left });
    };

    update();
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

const TimePickerPanel: React.FC<TimePickerPanelProps> = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}) => (
  <div className="flex items-center gap-2 px-2 py-2 border-t border-base-300">
    <ClockIcon />
    <select
      className="select select-bordered select-xs w-16"
      value={hours}
      onChange={(e) => onHoursChange(Number(e.target.value))}
      aria-label="Hour"
    >
      {Array.from({ length: 24 }, (_, i) => (
        <option key={i} value={i}>{pad2(i)}</option>
      ))}
    </select>
    <span className="text-base-content font-bold">:</span>
    <select
      className="select select-bordered select-xs w-16"
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

  // Month picker mode
  if (picker === 'month') {
    return (
      <div className="p-3 bg-base-100 rounded-lg shadow-xl border border-base-300 w-64" style={{ animation: 'rottay-select-slide-in 0.15s ease-out' }}>
        <div className="flex items-center justify-between mb-3">
          <button type="button" className="btn btn-xs btn-ghost" onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            <ChevronLeft />
          </button>
          <span className="font-semibold text-sm text-base-content">{viewYear}</span>
          <button type="button" className="btn btn-xs btn-ghost" onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MONTHS_SHORT.map((m, i) => {
            const isSelected = selectedDate
              ? selectedDate.getMonth() === i && selectedDate.getFullYear() === viewYear
              : false;
            const isCurrent = today.getMonth() === i && today.getFullYear() === viewYear;
            return (
              <button
                key={m}
                type="button"
                className={[
                  'btn btn-sm',
                  isSelected ? 'btn-primary' : 'btn-ghost',
                  isCurrent && !isSelected ? 'border border-primary' : '',
                ].join(' ')}
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
          <div className="border-t border-base-300 mt-2 pt-2 text-xs">
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
      <div className="p-3 bg-base-100 rounded-lg shadow-xl border border-base-300 w-64" style={{ animation: 'rottay-select-slide-in 0.15s ease-out' }}>
        <div className="flex items-center justify-between mb-3">
          <button type="button" className="btn btn-xs btn-ghost" onClick={() => onViewChange(viewYear - 10, viewMonth)} aria-label={t('datepicker.previous_decade')}>
            <ChevronLeft />
          </button>
          <span className="font-semibold text-sm text-base-content">
            {startYear} - {startYear + 9}
          </span>
          <button type="button" className="btn btn-xs btn-ghost" onClick={() => onViewChange(viewYear + 10, viewMonth)} aria-label={t('datepicker.next_decade')}>
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, i) => {
            const yr = startYear - 1 + i;
            const isSelected = selectedDate ? selectedDate.getFullYear() === yr : false;
            const isCurrent = today.getFullYear() === yr;
            const isOutOfRange = i === 0 || i === 11;
            return (
              <button
                key={yr}
                type="button"
                className={[
                  'btn btn-sm',
                  isSelected ? 'btn-primary' : 'btn-ghost',
                  isCurrent && !isSelected ? 'border border-primary' : '',
                  isOutOfRange ? 'opacity-40' : '',
                ].join(' ')}
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
          <div className="border-t border-base-300 mt-2 pt-2 text-xs">
            {renderExtraFooter()}
          </div>
        )}
      </div>
    );
  }

  // Default: date picker grid
  const grid = generateCalendarGrid(viewYear, viewMonth, disabledDate);

  return (
    <div
      className="p-3 bg-base-100 rounded-lg shadow-xl border border-base-300 w-72"
      role="dialog"
      aria-label={t('datepicker.date_picker')}
      style={{ animation: 'rottay-select-slide-in 0.15s ease-out' }}
    >
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-0.5">
          <button type="button" className="btn btn-xs btn-ghost hover:btn-primary transition-all duration-200" onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            «
          </button>
          <button type="button" className="btn btn-xs btn-ghost hover:btn-primary transition-all duration-200" onClick={handlePrevMonth} aria-label={t('datepicker.previous_month')}>
            <ChevronLeft />
          </button>
        </div>
        <span className="font-semibold text-sm text-base-content">
          {MONTHS_FULL[viewMonth]} {viewYear}
        </span>
        <div className="flex items-center gap-0.5">
          <button type="button" className="btn btn-xs btn-ghost hover:btn-primary transition-all duration-200" onClick={handleNextMonth} aria-label={t('datepicker.next_month')}>
            <ChevronRight />
          </button>
          <button type="button" className="btn btn-xs btn-ghost hover:btn-primary transition-all duration-200" onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            »
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1" role="row">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-base-content/50 py-1"
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
        className="grid grid-cols-7 gap-0.5"
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

          const defaultNode = (
            <span className={cell.isCurrentMonth ? '' : 'opacity-30'}>
              {cell.day}
            </span>
          );

          const content = cellRender
            ? cellRender(cell.date, { originNode: defaultNode, today, range: undefined })
            : defaultNode;

          return (
            <button
              key={idx}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={cell.isDisabled}
              aria-label={formatDateStr(cell.date)}
              tabIndex={isFocused ? 0 : -1}
              className={[
                'w-9 h-9 flex items-center justify-center rounded-md text-xs transition-all duration-150',
                cell.isDisabled
                  ? 'opacity-20 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-primary/10 hover:scale-110',
                isSelected || isEndpoint
                  ? 'bg-primary text-primary-content hover:bg-primary/80 ring-2 ring-primary ring-offset-1 scale-105'
                  : '',
                inRange && !isEndpoint
                  ? 'bg-primary/10 transition-colors duration-200'
                  : '',
                cell.isToday && !isSelected && !isEndpoint
                  ? 'border border-primary font-semibold'
                  : '',
                isFocused
                  ? 'ring-2 ring-primary ring-offset-1'
                  : '',
              ].filter(Boolean).join(' ')}
              onClick={() => {
                if (!cell.isDisabled) onDateSelect(cell.date);
              }}
            >
              {content}
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
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-300">
        {showToday && (
          <button
            type="button"
            className="btn btn-xs btn-primary transition-all duration-200 hover:shadow-[0_0_12px_rgba(var(--p)/0.4)]"
            onClick={onTodayClick}
          >
            {showTime && showNow ? t('datepicker.now') : t('datepicker.today')}
          </button>
        )}
        {renderExtraFooter && (
          <div className="text-xs">{renderExtraFooter()}</div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// DatePickerBase
// ---------------------------------------------------------------------------

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

    // Escape key
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [isOpen, setOpen]);

    // Select a date
    const handleDateSelect = useCallback(
      (date: Date) => {
        const finalDate = showTime
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes)
          : date;
        const dateStr = formatDisplay(finalDate, format, picker, showTime);

        if (!isControlled) setInternalDate(finalDate);
        onChange?.(finalDate, dateStr);
        setFocusedDate(null);

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

    // Size / status classes
    const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
    const textClass = sizeTextClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
    const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes rottay-select-slide-in{from{opacity:0;transform:translateY(-4px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}` }} />
        <div
          ref={triggerRef}
          className={`relative inline-flex items-center ${className}`}
          style={style}
        >
          <input
            ref={setInputRef}
            type="text"
            readOnly
            className={`input input-bordered ${sizeClass} ${statusClass} ${textClass} cursor-pointer pr-16`}
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
            aria-label={displayPlaceholder}
          />
          {allowClear && displayText && !disabled && (
            <button
              type="button"
              className="absolute right-8 btn btn-xs btn-ghost btn-circle opacity-50 hover:opacity-100"
              onClick={handleClear}
              tabIndex={-1}
              aria-label={t('datepicker.clear_date')}
            >
              ×
            </button>
          )}
          <span
            className="absolute right-2 text-base-content/50 pointer-events-none"
            aria-hidden="true"
          >
            <CalendarIcon />
          </span>
        </div>

        {/* Calendar popover */}
        {isOpen && typeof document !== 'undefined' && (
          <div
            ref={panelRef}
            style={{
              position: 'absolute',
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
          </div>
        )}
      </>
    );
  },
);

DatePickerBase.displayName = 'DatePicker.Modern';

// ---------------------------------------------------------------------------
// RangePicker
// ---------------------------------------------------------------------------

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

    // Select a date in range mode
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

    const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
    const textClass = sizeTextClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
    const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

    return (
      <>
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={`inline-flex items-center gap-2 ${className}`}
          style={style}
          id={id}
        >
          <input
            type="text"
            readOnly
            className={[
              `input input-bordered ${sizeClass} ${textClass} cursor-pointer`,
              statusClass,
              activeInput === 'start' && isOpen ? 'ring-2 ring-primary' : '',
            ].join(' ')}
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
          <span className="text-base-content/60">{separator}</span>
          <input
            type="text"
            readOnly
            className={[
              `input input-bordered ${sizeClass} ${textClass} cursor-pointer`,
              statusClass,
              activeInput === 'end' && isOpen ? 'ring-2 ring-primary' : '',
            ].join(' ')}
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
              className="btn btn-xs btn-ghost btn-circle opacity-50 hover:opacity-100"
              onClick={handleClear}
              tabIndex={-1}
              aria-label={t('datepicker.clear_dates')}
            >
              ×
            </button>
          )}
        </div>

        {isOpen && typeof document !== 'undefined' && (
          <div
            ref={panelRef}
            style={{
              position: 'absolute',
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
          </div>
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
