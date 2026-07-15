'use client';

/**
 * @fileoverview Rustic Calendar engine -- pure HTML/CSS (zero UI-library dependencies).
 *
 * Lightweight calendar using authored engine CSS, bounded runtime layout values,
 * `var(--ds-*)` custom properties, and semantic HTML. Supports month view (7-column CSS Grid),
 * year view (3-column month grid), controlled and uncontrolled value modes,
 * date disabling, and custom cell renderers -- all with rich ARIA attributes
 * (role="application", role="grid", role="gridcell", aria-selected, aria-disabled).
 *
 * Hover states are tracked in React state because inline styles cannot express
 * `:hover`. All visual properties are driven by CSS custom properties with
 * sensible fallbacks, so tenant themes can re-skin the calendar without JS changes.
 *
 * Engine: **Vanilla HTML + CSS custom properties**
 *
 * @example
 * ```tsx
 * <Calendar engine="rustic" fullscreen={false} onChange={(d) => console.log(d)} />
 * ```
 *
 * @module Calendar/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { CalendarProps, CalendarMode } from '../Calendar.types';

// English day/month labels. Localization is handled at a higher layer.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ---------------------------------------------------------------------------
// Style definitions using CSS custom properties with layered fallbacks.
// Each property resolves: component-specific var -> semantic DS var -> literal.
// This three-level cascade lets tenants override at any specificity level.
// ---------------------------------------------------------------------------
const styles = {
  container: {
    padding: 'var(--ds-calendar-padding, 16px)',
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
    cursor: 'pointer',
    fontSize: '16px',
  },
  modeButton: {
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '14px',
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
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'var(--ds-calendar-transition, background-color 0.2s)',
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
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'var(--ds-calendar-transition, background-color 0.2s)',
  },
};

// Normalizes the incoming value (Date, ISO string, or undefined) into a Date.
// Falls back to "now" so the calendar always has a valid reference date.
const parseDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  return typeof value === 'string' ? new Date(value) : value;
};

/**
 * Rustic Calendar engine -- dependency-free, inline-styled calendar.
 *
 * Uses CSS Grid for both month (7-col) and year (3-col) views. Hover effects
 * are managed via React state because inline styles cannot express `:hover`.
 * Supports controlled (`value`) and uncontrolled (`defaultValue`) modes.
 *
 * @param props - Unified DS CalendarProps (see Calendar.types.ts)
 * @returns A vanilla HTML calendar with role="application" ARIA semantics
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

  // Controlled vs uncontrolled: when `value` is provided, the consumer owns
  // the selected date. Otherwise internal state tracks the selection.
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date>(() => parseDate(defaultValue));
  const [mode, setMode] = useState<CalendarMode>(modeProp || defaultMode);

  const currentDate = isControlled ? parseDate(value) : internalValue;
  const today = new Date();

  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  // Day 0 of the *next* month gives the last day of the current month.
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // getDay() returns 0=Sunday..6=Saturday. Determines how many empty cells
  // precede the 1st of the month in the 7-column grid.
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

  // Selecting a month in year view both selects the date AND switches back to
  // month view, letting the user drill down from year -> month -> day.
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

  const handleModeChange = (newMode: CalendarMode) => {
    setMode(newMode);
    onPanelChange?.(currentDate, newMode);
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Fullscreen fills the parent container; compact mode constrains width
  // (default 320px via CSS var) for use in popovers or date picker dropdowns.
  const containerStyle = {
    ...styles.container,
    ...(fullscreen ? styles.containerFullscreen : styles.containerCompact),
    ...style,
  };
  return (
    <div ref={ref} className={`rottay-calendar rottay-calendar--rustic ${className ?? ''}`.trim()} data-part="root" data-mode={mode} style={containerStyle} id={id} role="application" aria-label="Calendar">
      {/* Header */}
      <div style={styles.header} data-part="header">
        <div style={styles.headerNav}>
          <button
            data-part="nav-button"
            data-direction="prev-year"
            style={styles.navButton}
            onClick={() => setViewYear((y) => y - 1)}
            aria-label="Previous year"
          >
            «
          </button>
          {mode === 'month' && (
            <button
              data-part="nav-button"
              data-direction="prev-month"
              style={styles.navButton}
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            data-part="mode-toggle"
            data-mode="month"
            data-active={mode === 'month' ? 'true' : 'false'}
            style={styles.modeButton}
            onClick={() => handleModeChange('month')}
          >
            {MONTHS[viewMonth]} {viewYear}
          </button>
          <button
            data-part="mode-toggle"
            data-mode="year"
            data-active={mode === 'year' ? 'true' : 'false'}
            style={styles.modeButton}
            onClick={() => handleModeChange('year')}
          >
            Year
          </button>
        </div>

        <div style={styles.headerNav}>
          {mode === 'month' && (
            <button
              data-part="nav-button"
              data-direction="next-month"
              style={styles.navButton}
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          )}
          <button
            data-part="nav-button"
            data-direction="next-year"
            style={styles.navButton}
            onClick={() => setViewYear((y) => y + 1)}
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
              <div key={day} style={styles.dayHeader} data-part="weekday-header" role="columnheader">
                {fullscreen ? day : day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={styles.daysGrid} data-part="grid" role="grid">
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

              return (
                <button
                  key={day}
                  data-part="cell"
                  data-selected={isSelected ? 'true' : 'false'}
                  data-today={isToday ? 'true' : 'false'}
                  data-disabled={isDisabled || undefined}
                  style={{
                    ...styles.dayCell,
                    ...(isDisabled ? styles.dayCellDisabled : {}),
                  }}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                >
                  <span style={{ fontSize: fullscreen ? '14px' : '12px' }}>{day}</span>
                  {dateCellRender && (
                    <div data-part="cell-content" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
        <div style={styles.monthsGrid} data-part="grid" role="grid">
          {MONTHS.map((month, i) => {
            const date = new Date(viewYear, i, 1);
            const isCurrentMonth = i === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = i === currentDate.getMonth() && viewYear === currentDate.getFullYear();

            return (
              <button
                key={month}
                data-part="cell"
                data-selected={isSelected ? 'true' : 'false'}
                data-today={isCurrentMonth ? 'true' : 'false'}
                style={styles.monthCell}
                onClick={() => handleMonthClick(i)}
                role="gridcell"
                aria-selected={isSelected}
              >
                <span style={{ fontSize: fullscreen ? '14px' : '12px' }}>{month}</span>
                {monthCellRender && (
                  <div data-part="cell-content" style={{ marginTop: '4px', fontSize: '10px' }}>
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

Calendar.displayName = 'Calendar.Rustic';

export default Calendar;
