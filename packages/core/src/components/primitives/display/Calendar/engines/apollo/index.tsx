'use client';

/**
 * @fileoverview Calendar Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS calendar implementation with maximum accessibility.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free calendar using only
 * inline styles and semantic HTML elements.
 *
 * **Implementation Details:**
 * - CSS Grid for layout
 * - Inline styles for all visual properties
 * - Native Date object handling
 * - ARIA attributes for accessibility
 * - Keyboard navigation support
 *
 * **Accessibility Features:**
 * - `role="application"` on container
 * - `role="grid"` on calendar grid
 * - `role="gridcell"` on day/month cells
 * - `aria-selected` on selected items
 * - `aria-disabled` on disabled items
 * - `aria-label` on navigation buttons
 *
 * **CSS Custom Properties:**
 * - `--primary-color` - Primary theme color
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility compliance
 *
 * @example Basic Usage
 * ```tsx
 * import { Calendar } from '@rottay/design-system';
 *
 * <Calendar
 *   engine="apollo"
 *   fullscreen={false}
 *   onChange={(date) => console.log(date)}
 * />
 * ```
 *
 * @see {@link Calendar} for the main component
 * @module Calendar/engines/apollo
 * @category Display
 * @package @rottay/design-system
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { CalendarProps, CalendarMode } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const styles = {
  container: {
    backgroundColor: 'var(--ds-calendar-bg, #fff)',
    borderRadius: 'var(--ds-calendar-radius, 8px)',
    padding: 'var(--ds-calendar-padding, 16px)',
    boxShadow: 'var(--ds-calendar-shadow, 0 2px 8px rgba(0, 0, 0, 0.1))',
  },
  containerFullscreen: {
    width: '100%',
  },
  containerCompact: {
    width: 'var(--ds-calendar-compact-width, 320px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--ds-calendar-header-margin, 16px)',
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  navButton: {
    padding: '4px 8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 'var(--ds-calendar-nav-radius, 4px)',
    fontSize: '16px',
    color: 'var(--ds-calendar-nav-color, #666)',
  },
  modeButton: {
    padding: '4px 12px',
    border: '1px solid var(--ds-calendar-border, #d9d9d9)',
    background: 'var(--ds-calendar-bg, #fff)',
    cursor: 'pointer',
    borderRadius: 'var(--ds-calendar-nav-radius, 4px)',
    fontSize: '14px',
  },
  modeButtonActive: {
    backgroundColor: 'var(--ds-calendar-primary, var(--ds-color-primary-500, #1890ff))',
    color: 'var(--ds-calendar-primary-text, #fff)',
    borderColor: 'var(--ds-calendar-primary, var(--ds-color-primary-500, #1890ff))',
  },
  daysHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '8px',
  },
  dayHeader: {
    textAlign: 'center' as const,
    fontSize: 'var(--ds-calendar-header-font-size, 12px)',
    fontWeight: 500,
    color: 'var(--ds-calendar-header-color, #666)',
    padding: '8px',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  dayCell: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--ds-calendar-cell-radius, 8px)',
    cursor: 'pointer',
    position: 'relative' as const,
    border: 'none',
    background: 'transparent',
    transition: 'var(--ds-calendar-transition, background-color 0.2s)',
  },
  dayCellToday: {
    border: '1px solid var(--ds-calendar-primary, var(--ds-color-primary-500, #1890ff))',
  },
  dayCellSelected: {
    backgroundColor: 'var(--ds-calendar-primary, var(--ds-color-primary-500, #1890ff))',
    color: 'var(--ds-calendar-primary-text, #fff)',
  },
  dayCellDisabled: {
    opacity: 'var(--ds-calendar-disabled-opacity, 0.3)',
    cursor: 'not-allowed',
  },
  monthsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  monthCell: {
    padding: '16px',
    borderRadius: 'var(--ds-calendar-cell-radius, 8px)',
    textAlign: 'center' as const,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    transition: 'var(--ds-calendar-transition, background-color 0.2s)',
  },
  monthCellCurrent: {
    border: '1px solid var(--ds-calendar-primary, var(--ds-color-primary-500, #1890ff))',
  },
  monthCellSelected: {
    backgroundColor: 'var(--ds-calendar-primary, var(--ds-color-primary-500, #1890ff))',
    color: 'var(--ds-calendar-primary-text, #fff)',
  },
};

const parseDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  return typeof value === 'string' ? new Date(value) : value;
};

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

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date>(() => parseDate(defaultValue));
  const [mode, setMode] = useState<CalendarMode>(modeProp || defaultMode);
  const [hovered, setHovered] = useState<string | null>(null);

  const currentDate = isControlled ? parseDate(value) : internalValue;
  const today = new Date();

  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

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

  const handleModeChange = (newMode: CalendarMode) => {
    setMode(newMode);
    onPanelChange?.(currentDate, newMode);
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const containerStyle = {
    ...styles.container,
    ...(fullscreen ? styles.containerFullscreen : styles.containerCompact),
    ...style,
  };

  return (
    <div ref={ref} className={className} style={containerStyle} id={id} role="application" aria-label="Calendar">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerNav}>
          <button
            style={{ ...styles.navButton, ...(hovered === 'prevYear' ? { backgroundColor: 'var(--ds-calendar-hover-bg, #f5f5f5)' } : {}) }}
            onClick={() => setViewYear((y) => y - 1)}
            onMouseEnter={() => setHovered('prevYear')}
            onMouseLeave={() => setHovered(null)}
            aria-label="Previous year"
          >
            «
          </button>
          {mode === 'month' && (
            <button
              style={{ ...styles.navButton, ...(hovered === 'prevMonth' ? { backgroundColor: 'var(--ds-calendar-hover-bg, #f5f5f5)' } : {}) }}
              onClick={handlePrevMonth}
              onMouseEnter={() => setHovered('prevMonth')}
              onMouseLeave={() => setHovered(null)}
              aria-label="Previous month"
            >
              ‹
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{ ...styles.modeButton, ...(mode === 'month' ? styles.modeButtonActive : {}) }}
            onClick={() => handleModeChange('month')}
          >
            {MONTHS[viewMonth]} {viewYear}
          </button>
          <button
            style={{ ...styles.modeButton, ...(mode === 'year' ? styles.modeButtonActive : {}) }}
            onClick={() => handleModeChange('year')}
          >
            Year
          </button>
        </div>

        <div style={styles.headerNav}>
          {mode === 'month' && (
            <button
              style={{ ...styles.navButton, ...(hovered === 'nextMonth' ? { backgroundColor: 'var(--ds-calendar-hover-bg, #f5f5f5)' } : {}) }}
              onClick={handleNextMonth}
              onMouseEnter={() => setHovered('nextMonth')}
              onMouseLeave={() => setHovered(null)}
              aria-label="Next month"
            >
              ›
            </button>
          )}
          <button
            style={{ ...styles.navButton, ...(hovered === 'nextYear' ? { backgroundColor: 'var(--ds-calendar-hover-bg, #f5f5f5)' } : {}) }}
            onClick={() => setViewYear((y) => y + 1)}
            onMouseEnter={() => setHovered('nextYear')}
            onMouseLeave={() => setHovered(null)}
            aria-label="Next year"
          >
            »
          </button>
        </div>
      </div>

      {mode === 'month' ? (
        <>
          {/* Day headers */}
          <div style={styles.daysHeader} role="row">
            {DAYS.map((day) => (
              <div key={day} style={styles.dayHeader} role="columnheader">
                {fullscreen ? day : day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={styles.daysGrid} role="grid">
            {/* Empty cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, currentDate);
              const isDisabled = isDateDisabled(date);
              const cellKey = `day-${day}`;

              return (
                <button
                  key={day}
                  style={{
                    ...styles.dayCell,
                    ...(isToday && !isSelected ? styles.dayCellToday : {}),
                    ...(isSelected ? styles.dayCellSelected : {}),
                    ...(isDisabled ? styles.dayCellDisabled : {}),
                    ...(hovered === cellKey && !isDisabled && !isSelected ? { backgroundColor: 'var(--ds-calendar-hover-bg, #f5f5f5)' } : {}),
                  }}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHovered(cellKey)}
                  onMouseLeave={() => setHovered(null)}
                  disabled={isDisabled}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                >
                  <span style={{ fontSize: fullscreen ? '14px' : '12px' }}>{day}</span>
                  {dateCellRender && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dateCellRender(date)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* Year view - show months */
        <div style={styles.monthsGrid} role="grid">
          {MONTHS.map((month, i) => {
            const date = new Date(viewYear, i, 1);
            const isCurrentMonth = i === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = i === currentDate.getMonth() && viewYear === currentDate.getFullYear();
            const cellKey = `month-${i}`;

            return (
              <button
                key={month}
                style={{
                  ...styles.monthCell,
                  ...(isCurrentMonth && !isSelected ? styles.monthCellCurrent : {}),
                  ...(isSelected ? styles.monthCellSelected : {}),
                  ...(hovered === cellKey && !isSelected ? { backgroundColor: 'var(--ds-calendar-hover-bg, #f5f5f5)' } : {}),
                }}
                onClick={() => handleMonthClick(i)}
                onMouseEnter={() => setHovered(cellKey)}
                onMouseLeave={() => setHovered(null)}
                role="gridcell"
                aria-selected={isSelected}
              >
                <span style={{ fontSize: fullscreen ? '14px' : '12px' }}>{month}</span>
                {monthCellRender && (
                  <div style={{ marginTop: '4px', fontSize: '10px' }}>
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

Calendar.displayName = 'Calendar.Apollo';

export default Calendar;
