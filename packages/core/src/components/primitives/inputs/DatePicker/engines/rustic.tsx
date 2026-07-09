'use client';

/**
 * @fileoverview DatePicker Rustic Engine (Vanilla CSS) - Rottay Design System.
 * Zero-dependency calendar picker styled entirely through CSS custom properties
 * (`--ds-datepicker-*`). Uses `createPortal` to render the calendar panel at
 * `document.body`, escaping overflow:hidden ancestors. Supports date/month/year
 * pickers, time selection, ranges, disabled dates, keyboard nav, and ARIA.
 *
 * @example
 * ```tsx
 * <DatePicker engine="rustic" picker="date" showTime showToday />
 * ```
 *
 * @module RusticDatePicker
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
  type CalendarDay,
} from '../utils/calendar';

// ---------------------------------------------------------------------------
// Size configuration using CSS variables
// Rustic engine uses CSS custom properties with hardcoded fallbacks throughout,
// so tenant theming works at the CSS layer without any JavaScript re-renders.
// ---------------------------------------------------------------------------

const SIZE_CONFIG: Record<string, { padding: string; fontSize: string; minWidth: string }> = {
  small: {
    padding: 'var(--ds-datepicker-sm-padding, 4px 8px)',
    fontSize: 'var(--ds-datepicker-sm-font-size, 12px)',
    minWidth: '160px',
  },
  default: {
    padding: 'var(--ds-datepicker-md-padding, 6px 12px)',
    fontSize: 'var(--ds-datepicker-md-font-size, 14px)',
    minWidth: '180px',
  },
  large: {
    padding: 'var(--ds-datepicker-lg-padding, 8px 16px)',
    fontSize: 'var(--ds-datepicker-lg-font-size, 15px)',
    minWidth: '200px',
  },
};

// ---------------------------------------------------------------------------
// Inline SVG icons -- rustic engine inlines all icons to avoid any dependency
// on @ant-design/icons or other icon libraries, keeping the bundle minimal.
// aria-hidden="true" on each SVG prevents screen readers from announcing them.
// ---------------------------------------------------------------------------

const CalendarSvg: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
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

const ChevronLeftSvg: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightSvg: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ClockSvg: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ---------------------------------------------------------------------------
// Shared inline styles (CSS-variable based)
// The border color cascade: validation status > focus > default. This ordering
// ensures error/warning states are always visible even when the input is focused.
// ---------------------------------------------------------------------------

function getBorderColor(
  status: string | undefined,
  isFocused: boolean,
): string {
  if (status === 'error') return 'var(--ds-datepicker-error-border, var(--ds-color-error))';
  if (status === 'warning') return 'var(--ds-datepicker-warning-border, var(--ds-color-warning))';
  if (isFocused) return 'var(--ds-datepicker-border-focus, var(--ds-color-primary-500))';
  return 'var(--ds-datepicker-border, var(--ds-color-border))';
}

// ---------------------------------------------------------------------------
// Rustic CalendarPanel (portal-based dropdown)
// ---------------------------------------------------------------------------

interface RusticCalendarPanelProps {
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
  focusedDate: Date | null;
  onFocusedDateChange: (d: Date) => void;
  onPanelChange?: (date: Date, mode: DatePickerMode) => void;
  position: { top: number; left: number };
  panelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Portal-rendered calendar panel used by both DatePickerBase and RangePicker.
 *
 * Mounts at `document.body` via `createPortal` so it is never clipped by
 * parent overflow rules. Supports date grid, month picker, year picker,
 * optional time selection, keyboard navigation, and range highlighting.
 * All colors use `--ds-datepicker-*` CSS variables with hardcoded fallbacks.
 */
const RusticCalendarPanel: React.FC<RusticCalendarPanelProps> = ({
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
  position,
  panelRef,
}) => {
  const { t } = useTranslation('components');
  const today = useMemo(() => new Date(), []);

  // Navigation
  const handlePrevMonth = () => {
    const nm = viewMonth === 0 ? 11 : viewMonth - 1;
    const ny = viewMonth === 0 ? viewYear - 1 : viewYear;
    onViewChange(ny, nm);
  };
  const handleNextMonth = () => {
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    onViewChange(ny, nm);
  };
  const handlePrevYear = () => onViewChange(viewYear - 1, viewMonth);
  const handleNextYear = () => onViewChange(viewYear + 1, viewMonth);

  // Keyboard
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const base = focusedDate || selectedDate || today;
      const newDate = getKeyboardNavDate(base, e.key);
      if (newDate) {
        e.preventDefault();
        onFocusedDateChange(newDate);
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
    },
    [focusedDate, selectedDate, today, viewMonth, viewYear, onFocusedDateChange, onViewChange, onDateSelect, disabledDate],
  );

  // -- Shared panel styles --
  // The panel is portal-rendered at document.body level with absolute positioning
  // so it escapes any overflow:hidden ancestors. zIndex 1050 sits above modals.
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    zIndex: 1050,
    padding: '12px',
    backgroundColor: 'var(--ds-datepicker-panel-bg, var(--ds-color-bg-elevated))',
    borderRadius: 'var(--ds-datepicker-panel-radius, 8px)',
    boxShadow: 'var(--ds-datepicker-panel-shadow, var(--ds-shadow-lg))',
    border: '1px solid var(--ds-datepicker-panel-border, var(--ds-color-border))',
    fontFamily: 'var(--ds-font-family-base, sans-serif)',
    width: '280px',
    animation: 'rottay-dp-panel-in var(--ds-personality-animation-entrance-duration, 0.15s) cubic-bezier(0.16, 1, 0.3, 1)',
    transformOrigin: 'top center',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  };

  const navBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: 'var(--ds-datepicker-radius, 8px)',
    color: 'var(--ds-datepicker-nav-color, var(--ds-color-text-secondary))',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s, box-shadow 0.2s',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '14px',
    color: 'var(--ds-datepicker-header-color, var(--ds-color-text-primary))',
  };

  const dayHeaderStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    marginBottom: '4px',
  };

  const dayHeaderCellStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--ds-datepicker-day-header-color, var(--ds-color-text-tertiary))',
    padding: '4px 0',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  };

  // Cell style function is computed per-cell to handle the layered visual states:
  // selected, range endpoint, in-range fill, today indicator, focused, disabled.
  // Each state uses CSS variables so tenant themes override colors automatically.
  const getCellStyle = (cell: CalendarDay, isSelected: boolean, isFocused: boolean, inRange: boolean, isEndpoint: boolean): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    borderRadius: 'var(--ds-datepicker-cell-radius, 4px)',
    border: cell.isToday && !isSelected && !isEndpoint
      ? '1px solid var(--ds-datepicker-today-border, var(--ds-color-primary-500))'
      : isFocused
        ? '2px solid var(--ds-datepicker-focus-ring, var(--ds-color-primary-500))'
        : 'none',
    backgroundColor: isSelected || isEndpoint
      ? 'var(--ds-datepicker-selected-bg, var(--ds-color-primary-500))'
      : inRange && !isEndpoint
        ? 'var(--ds-datepicker-range-bg, var(--ds-color-primary-100))'
        : 'transparent',
    color: isSelected || isEndpoint
      ? 'var(--ds-datepicker-selected-color, var(--ds-color-text-inverse, var(--ds-color-bg-base)))'
      : !cell.isCurrentMonth
        ? 'var(--ds-datepicker-outside-color, var(--ds-color-text-tertiary))'
        : 'var(--ds-datepicker-cell-color, var(--ds-color-text-primary))',
    cursor: cell.isDisabled ? 'not-allowed' : 'pointer',
    opacity: cell.isDisabled ? 0.25 : 1,
    transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
    padding: 0,
    outline: 'none',
    margin: '0 auto',
    boxShadow: isSelected || isEndpoint
      ? 'var(--ds-datepicker-selected-shadow, 0 0 0 2px var(--ds-color-primary-200))'
      : 'none',
  });

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--ds-datepicker-panel-border, var(--ds-color-border))',
  };

  const footerBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--ds-datepicker-today-color, var(--ds-color-primary-500))',
    fontSize: '13px',
    padding: '4px 12px',
    borderRadius: 'var(--ds-datepicker-radius, 8px)',
    fontWeight: 500,
    transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, transform 0.15s',
  };

  const monthGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
  };

  const getMonthCellStyle = (isSelected: boolean, isCurrent: boolean): React.CSSProperties => ({
    padding: '10px 4px',
    textAlign: 'center',
    fontSize: '13px',
    borderRadius: 'var(--ds-datepicker-cell-radius, 4px)',
    border: isCurrent && !isSelected
      ? '1px solid var(--ds-datepicker-today-border, var(--ds-color-primary-500))'
      : 'none',
    backgroundColor: isSelected
      ? 'var(--ds-datepicker-selected-bg, var(--ds-color-primary-500))'
      : 'transparent',
    color: isSelected
      ? 'var(--ds-datepicker-selected-color, var(--ds-color-text-inverse, var(--ds-color-bg-base)))'
      : 'var(--ds-datepicker-cell-color, var(--ds-color-text-primary))',
    cursor: 'pointer',
    transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
    outline: 'none',
    boxShadow: isSelected ? 'var(--ds-datepicker-selected-shadow, 0 0 0 2px var(--ds-color-primary-200))' : 'none',
  });

  const timeRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 4px',
    borderTop: '1px solid var(--ds-datepicker-panel-border, var(--ds-color-border))',
  };

  const selectStyle: React.CSSProperties = {
    padding: '2px 4px',
    fontSize: '13px',
    border: '1px solid var(--ds-datepicker-border, var(--ds-color-border))',
    borderRadius: 'var(--ds-datepicker-radius, 8px)',
    backgroundColor: 'var(--ds-datepicker-bg, var(--ds-color-bg-elevated))',
    color: 'var(--ds-datepicker-color, var(--ds-color-text-primary))',
    width: '56px',
    outline: 'none',
    transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
  };

  // -- Month picker --
  // All picker modes use createPortal to render at document.body, escaping
  // overflow:hidden from modals or scroll areas. The panel is absolutely
  // positioned using coordinates computed from the trigger's bounding rect.
  if (picker === 'month') {
    return createPortal(
      <div ref={panelRef} style={panelStyle} role="dialog" aria-label="Month picker">
        <div style={headerStyle}>
          <button type="button" style={navBtnStyle} onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            <ChevronLeftSvg />
          </button>
          <span style={headerTitleStyle}>{viewYear}</span>
          <button type="button" style={navBtnStyle} onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            <ChevronRightSvg />
          </button>
        </div>
        <div style={monthGridStyle}>
          {MONTHS_SHORT.map((m, i) => {
            const isSelected = selectedDate
              ? selectedDate.getMonth() === i && selectedDate.getFullYear() === viewYear
              : false;
            const isCurrent = today.getMonth() === i && today.getFullYear() === viewYear;
            return (
              <button
                key={m}
                type="button"
                style={getMonthCellStyle(isSelected, isCurrent)}
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
          <div style={{ ...footerStyle, fontSize: '12px' }}>{renderExtraFooter()}</div>
        )}
      </div>,
      document.body,
    );
  }

  // -- Year picker --
  if (picker === 'year') {
    const startYear = Math.floor(viewYear / 10) * 10;
    return createPortal(
      <div ref={panelRef} style={panelStyle} role="dialog" aria-label="Year picker">
        <div style={headerStyle}>
          <button type="button" style={navBtnStyle} onClick={() => onViewChange(viewYear - 10, viewMonth)} aria-label={t('datepicker.previous_decade')}>
            <ChevronLeftSvg />
          </button>
          <span style={headerTitleStyle}>{startYear} - {startYear + 9}</span>
          <button type="button" style={navBtnStyle} onClick={() => onViewChange(viewYear + 10, viewMonth)} aria-label={t('datepicker.next_decade')}>
            <ChevronRightSvg />
          </button>
        </div>
        <div style={monthGridStyle}>
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
                  ...getMonthCellStyle(isSelected, isCurrent),
                  opacity: isOutOfRange ? 0.4 : 1,
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
          <div style={{ ...footerStyle, fontSize: '12px' }}>{renderExtraFooter()}</div>
        )}
      </div>,
      document.body,
    );
  }

  // -- Date picker grid --
  const grid = generateCalendarGrid(viewYear, viewMonth, disabledDate);

  return createPortal(
    <div ref={panelRef} style={panelStyle} role="dialog" aria-label={t('datepicker.date_picker')}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button type="button" style={navBtnStyle} onClick={handlePrevYear} aria-label={t('datepicker.previous_year')}>
            &#171;
          </button>
          <button type="button" style={navBtnStyle} onClick={handlePrevMonth} aria-label={t('datepicker.previous_month')}>
            <ChevronLeftSvg />
          </button>
        </div>
        <span style={headerTitleStyle}>
          {MONTHS_FULL[viewMonth]} {viewYear}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button type="button" style={navBtnStyle} onClick={handleNextMonth} aria-label={t('datepicker.next_month')}>
            <ChevronRightSvg />
          </button>
          <button type="button" style={navBtnStyle} onClick={handleNextYear} aria-label={t('datepicker.next_year')}>
            &#187;
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={dayHeaderStyle} role="row">
        {DAYS_SHORT.map((d) => (
          <div key={d} style={dayHeaderCellStyle} role="columnheader" aria-label={d}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        style={gridStyle}
        role="grid"
        tabIndex={0}
        onKeyDown={handleGridKeyDown}
        aria-label={t('datepicker.calendar_dates')}
      >
        {grid.map((cell, idx) => {
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          const isFocusedCell = focusedDate ? isSameDay(cell.date, focusedDate) : false;
          const inRange = isDateInRange(cell.date, rangeStart ?? null, rangeEnd ?? null);
          const isEndpoint =
            (rangeStart && isSameDay(cell.date, rangeStart)) ||
            (rangeEnd && isSameDay(cell.date, rangeEnd));

          const defaultNode = <span>{cell.day}</span>;
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
              tabIndex={isFocusedCell ? 0 : -1}
              style={getCellStyle(cell, isSelected, isFocusedCell, inRange, !!isEndpoint)}
              onClick={() => {
                if (!cell.isDisabled) onDateSelect(cell.date);
              }}
              // Hover effects are applied via inline style mutations instead of CSS
              // :hover because inline styles (needed for CSS variable theming) have
              // higher specificity than pseudo-classes in stylesheets.
              onMouseEnter={(e) => {
                if (!cell.isDisabled) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  if (!isSelected && !isEndpoint) {
                    e.currentTarget.style.backgroundColor =
                      'var(--ds-datepicker-cell-hover-bg, var(--ds-color-primary-50))';
                  }
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                if (!isSelected && !isEndpoint && !inRange) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Time picker */}
      {showTime && (
        <div style={timeRowStyle}>
          <ClockSvg />
          <select
            style={selectStyle}
            value={hours}
            onChange={(e) => onHoursChange(Number(e.target.value))}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                'var(--ds-datepicker-border-focus, var(--ds-color-primary-500))';
              e.currentTarget.style.boxShadow =
                'var(--ds-datepicker-shadow-focus, 0 0 0 3px var(--ds-color-primary-100), 0 0 8px var(--ds-color-primary-200))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                'var(--ds-datepicker-border, var(--ds-color-border))';
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label={t('datepicker.hour')}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{pad2(i)}</option>
            ))}
          </select>
          <span style={{ fontWeight: 600, color: 'var(--ds-datepicker-color, var(--ds-color-text-primary))' }}>:</span>
          <select
            style={selectStyle}
            value={minutes}
            onChange={(e) => onMinutesChange(Number(e.target.value))}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                'var(--ds-datepicker-border-focus, var(--ds-color-primary-500))';
              e.currentTarget.style.boxShadow =
                'var(--ds-datepicker-shadow-focus, 0 0 0 3px var(--ds-color-primary-100), 0 0 8px var(--ds-color-primary-200))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                'var(--ds-datepicker-border, var(--ds-color-border))';
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label={t('datepicker.minute')}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>{pad2(i)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Footer */}
      <div style={footerStyle}>
        {showToday && (
          <button
            type="button"
            style={footerBtnStyle}
            onClick={onTodayClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--ds-datepicker-today-hover-bg, var(--ds-color-primary-50))';
              e.currentTarget.style.boxShadow =
                'var(--ds-datepicker-today-hover-shadow, var(--ds-shadow-sm))';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {showTime && showNow ? t('datepicker.now') : t('datepicker.today')}
          </button>
        )}
        {renderExtraFooter && (
          <div style={{ fontSize: '12px' }}>{renderExtraFooter()}</div>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ---------------------------------------------------------------------------
// DatePickerBase (Rustic)
// ---------------------------------------------------------------------------

/**
 * Rustic (Vanilla CSS) DatePicker engine.
 *
 * Renders a read-only input with a portal-based `RusticCalendarPanel`. All
 * styling uses CSS custom properties so tenant themes work at the CSS layer
 * without JavaScript re-renders. Supports controlled/uncontrolled usage,
 * date/month/year picker modes, time selection, and disabled date predicates.
 *
 * @param props - Rottay DatePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the text input element.
 * @returns The rendered vanilla-CSS DatePicker with portal calendar.
 */
const DatePickerBase = React.forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => {
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
  const [isFocused, setIsFocused] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });

  const selectedDate = isControlled ? parseDateValue(value) : internalDate;
  const isOpen = isOpenControlled ? controlledOpen! : internalOpen;

  const initialView = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  // Sync view
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

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );

  // Position update
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      let top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX;
      if (placement.includes('Right')) left = rect.right + window.scrollX;
      if (placement.includes('top')) top = rect.top + window.scrollY - 4;
      setPanelPosition({ top, left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, placement]);

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

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, setOpen]);

  // Date selection
  const handleDateSelect = useCallback(
    (date: Date) => {
      const finalDate = showTime
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes)
        : date;
      const dateStr = formatDisplay(finalDate, format, picker, showTime);
      if (!isControlled) setInternalDate(finalDate);
      onChange?.(finalDate, dateStr);
      setFocusedDate(null);
      if (!showTime) setOpen(false);
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

  // Display
  const displayText = formatDisplay(selectedDate, format, picker, showTime);
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

  // Class names
  const containerClasses = [
    'rottay-datepicker',
    'rottay-datepicker--rustic',
    `rottay-datepicker--${size}`,
    status && `rottay-datepicker--${status}`,
    disabled && 'rottay-datepicker--disabled',
    isFocused && 'rottay-datepicker--focused',
    className,
  ].filter(Boolean).join(' ');

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    padding: sizeConfig.padding,
    paddingRight: '2.5rem',
    fontSize: sizeConfig.fontSize,
    border: `1px solid ${getBorderColor(status, isFocused)}`,
    borderRadius: 'var(--ds-datepicker-radius, 8px)',
    outline: 'none',
    transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    minWidth: sizeConfig.minWidth,
    backgroundColor: disabled
      ? 'var(--ds-datepicker-bg-disabled, var(--ds-color-bg-secondary))'
      : 'var(--ds-datepicker-bg, var(--ds-color-bg-elevated))',
    color: 'var(--ds-datepicker-color, var(--ds-color-text-primary))',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: isFocused
      ? 'var(--ds-datepicker-shadow-focus, 0 0 0 3px var(--ds-color-primary-100), 0 0 8px var(--ds-color-primary-200))'
      : 'none',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '8px',
    color: 'var(--ds-datepicker-icon-color, var(--ds-color-text-tertiary))',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  };

  const clearBtnStyle: React.CSSProperties = {
    position: 'absolute',
    right: '28px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--ds-datepicker-clear-color, var(--ds-color-text-tertiary))',
    fontSize: sizeConfig.fontSize,
    padding: '0 4px',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <>
      <div ref={triggerRef} className={containerClasses} style={wrapperStyle}>
        <input
          ref={setInputRef}
          type="text"
          readOnly
          style={inputStyle}
          value={displayText}
          disabled={disabled}
          placeholder={displayPlaceholder}
          autoFocus={autoFocus}
          id={id}
          name={name}
          onClick={() => !disabled && !readOnly && setOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
            style={clearBtnStyle}
            onClick={handleClear}
            tabIndex={-1}
            aria-label={t('datepicker.clear_date')}
          >
            ×
          </button>
        )}
        <span style={iconStyle} aria-hidden="true">
          <CalendarSvg />
        </span>
      </div>

      {isOpen && typeof document !== 'undefined' && (
        <RusticCalendarPanel
          panelRef={panelRef}
          position={panelPosition}
          selectedDate={selectedDate}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onViewChange={(y, m) => { setViewYear(y); setViewMonth(m); }}
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
      )}

      {/* Rustic animations */}
      <style>{`
        @keyframes rottay-dp-panel-in {
          from { opacity: 0; transform: scaleY(0.95) translateY(-4px); }
          to { opacity: 1; transform: scaleY(1) translateY(0); }
        }
      `}</style>
    </>
  );
});

DatePickerBase.displayName = 'DatePicker.Rustic';

// ---------------------------------------------------------------------------
// RangePicker (Rustic)
// ---------------------------------------------------------------------------

/**
 * Rustic (Vanilla CSS) RangePicker engine.
 *
 * Renders two styled inputs (start/end) sharing a single portal-based
 * `RusticCalendarPanel`. Uses the same ping-pong selection pattern as the
 * modern engine: first click sets start, second click sets end and closes.
 * Range highlighting between endpoints is handled by the calendar panel.
 *
 * @param props - Rottay RangePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the wrapper div element.
 * @returns The rendered vanilla-CSS RangePicker with portal calendar.
 */
const RangePicker = React.forwardRef<HTMLDivElement, RangePickerProps>((props, ref) => {
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
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });

  const startDate = isControlled ? parseDateValue(value?.[0]) : internalStart;
  const endDate = isControlled ? parseDateValue(value?.[1]) : internalEnd;
  const isOpen = isOpenControlled ? controlledOpen! : internalOpen;

  const initialView = startDate || new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  // Refs
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Position
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      let top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX;
      if (placement.includes('Right')) left = rect.right + window.scrollX;
      if (placement.includes('top')) top = rect.top + window.scrollY - 4;
      setPanelPosition({ top, left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, placement]);

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

  // Range selection ping-pong: first click fills activeInput ('start' or
  // 'end'), then flips to the other side. After both endpoints are set and
  // showTime is off, the panel auto-closes.
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
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

  const containerClasses = [
    'rottay-datepicker-range',
    'rottay-datepicker-range--rustic',
    `rottay-datepicker-range--${size}`,
    status && `rottay-datepicker-range--${status}`,
    disabled && 'rottay-datepicker-range--disabled',
    className,
  ].filter(Boolean).join(' ');

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const getInputStyle = (inputType: 'start' | 'end'): React.CSSProperties => ({
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    border: `1px solid ${getBorderColor(status, activeInput === inputType && isOpen)}`,
    borderRadius: 'var(--ds-datepicker-radius, 8px)',
    outline: 'none',
    transition: 'var(--ds-datepicker-transition, border-color 0.2s, box-shadow 0.2s)',
    minWidth: sizeConfig.minWidth,
    backgroundColor: disabled
      ? 'var(--ds-datepicker-bg-disabled, var(--ds-color-bg-secondary))'
      : 'var(--ds-datepicker-bg, var(--ds-color-bg-elevated))',
    color: 'var(--ds-datepicker-color, var(--ds-color-text-primary))',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: activeInput === inputType && isOpen
      ? 'var(--ds-datepicker-shadow-focus, 0 0 0 2px var(--ds-color-primary-100))'
      : 'none',
  });

  const separatorStyle: React.CSSProperties = {
    color: 'var(--ds-datepicker-separator-color, var(--ds-color-text-tertiary))',
  };

  const clearBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--ds-datepicker-clear-color, var(--ds-color-text-tertiary))',
    fontSize: sizeConfig.fontSize,
    padding: '0 4px',
    transition: 'color 0.2s',
  };

  return (
    <>
      <div
        ref={(node) => {
          (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={containerClasses}
        style={wrapperStyle}
        id={id}
      >
        <input
          type="text"
          readOnly
          style={getInputStyle('start')}
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
        <span style={separatorStyle}>{separator}</span>
        <input
          type="text"
          readOnly
          style={getInputStyle('end')}
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
            style={clearBtnStyle}
            onClick={handleClear}
            tabIndex={-1}
            aria-label={t('datepicker.clear_dates')}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && typeof document !== 'undefined' && (
        <RusticCalendarPanel
          panelRef={panelRef}
          position={panelPosition}
          selectedDate={activeInput === 'start' ? startDate : endDate}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onViewChange={(y, m) => { setViewYear(y); setViewMonth(m); }}
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
      )}
    </>
  );
});

RangePicker.displayName = 'DatePicker.RangePicker.Rustic';

// ---------------------------------------------------------------------------
// Compound export -- Object.assign merges RangePicker onto DatePickerBase so
// consumers can use `DatePicker.RangePicker` while DatePicker itself remains
// a valid forwardRef component with proper displayName.
// ---------------------------------------------------------------------------

export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
