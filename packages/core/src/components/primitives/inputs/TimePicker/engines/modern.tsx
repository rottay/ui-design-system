'use client';

/**
 * @fileoverview TimePicker Modern Engine -- DaisyUI/Tailwind with custom dropdown panel.
 * Uses a read-only text input that opens a custom hour/minute selection dropdown
 * on click (anywhere in the field). Popup geometry remains inline while the
 * standalone modern skin owns paint/state across the portal boundary.
 *
 * @module TimePicker/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TimePickerProps, TimeRangePickerProps } from '../TimePicker.types';

/** Maps DS size values to inline style dimensions. */
const sizeStyleMap: Record<string, React.CSSProperties> = {
  small: { height: 'var(--ds-input-sm-height, 32px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', padding: '4px var(--ds-input-sm-padding-x, 10px)' },
  default: { height: 'var(--ds-input-md-height, 40px)', fontSize: 'var(--ds-input-md-font-size, 14px)', padding: '6px var(--ds-input-md-padding-x, 12px)' },
  large: { height: 'var(--ds-input-lg-height, 44px)', fontSize: 'var(--ds-input-lg-font-size, 15px)', padding: '8px var(--ds-input-lg-padding-x, 14px)' },
};

/** Pads a number to 2 digits. */
const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Inline SVG clock icon. */
const ClockIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ---------------------------------------------------------------------------
// TimePanel -- inline geometry/layout; paint is owned by the modern skin.
// ---------------------------------------------------------------------------

interface TimePanelProps {
  hours: number;
  minutes: number;
  showSeconds: boolean;
  seconds: number;
  onSelect: (h: number, m: number, s: number) => void;
  onNowClick?: () => void;
  showNow: boolean;
}

const TimePanel: React.FC<TimePanelProps> = ({
  hours,
  minutes,
  showSeconds,
  seconds,
  onSelect,
  onNowClick,
  showNow,
}) => {
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view on mount
  useEffect(() => {
    const scrollTo = (container: HTMLDivElement | null, index: number) => {
      if (!container) return;
      const item = container.children[index] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    };
    scrollTo(hoursRef.current, hours);
    scrollTo(minutesRef.current, minutes);
    if (showSeconds) scrollTo(secondsRef.current, seconds);
  }, []);

  const panelStyle: React.CSSProperties = {
    fontFamily: 'inherit',
    animation: 'ds-time-picker-slide-in var(--ds-motion-fast) ease-out',
    overflow: 'hidden',
  };

  const colStyle: React.CSSProperties = {
    overflowY: 'auto',
    height: 'var(--ds-time-column-height, 200px)',
    padding: 'var(--ds-spacing-1, 4px) 2px',
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    flexShrink: 0,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-3, 12px) var(--ds-spacing-1, 4px)',
    gap: 'var(--ds-spacing-2, 8px)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--ds-font-size-2xs, 11px)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 'var(--ds-letter-spacing-wide, 0.025em)',
    textAlign: 'center' as const,
    flex: 1,
  };

  const getItemStyle = (isActive: boolean): React.CSSProperties => ({
    width: 44,
    height: 'var(--ds-input-sm-height, 32px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-input-sm-font-size, 13px)',
    cursor: 'pointer',
    fontWeight: isActive ? 600 : 400,
    transition: 'all var(--ds-motion-fast)',
    margin: '1px auto',
  });

  return (
    <div data-part="panel" className="rottay-timepicker__panel" style={panelStyle}>
      {/* Column headers */}
      <div data-part="header" style={headerStyle}>
        <span style={labelStyle}>Hr</span>
        <span style={{ ...labelStyle, flex: 0, width: 1 }} />
        <span style={labelStyle}>Min</span>
        {showSeconds && (
          <>
            <span style={{ ...labelStyle, flex: 0, width: 1 }} />
            <span style={labelStyle}>Sec</span>
          </>
        )}
      </div>

      {/* Scrollable columns */}
      <div style={{ display: 'flex', padding: 'var(--ds-spacing-1, 4px)' }}>
        {/* Hours column */}
        <div ref={hoursRef} data-part="time-column" style={colStyle}>
          {Array.from({ length: 24 }, (_, i) => (
            <button
              key={i}
              type="button"
              data-part="time-option"
              data-selected={i === hours || undefined}
              style={getItemStyle(i === hours)}
              onClick={() => onSelect(i, minutes, seconds)}
            >
              {pad2(i)}
            </button>
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Minutes column */}
        <div ref={minutesRef} data-part="time-column" style={colStyle}>
          {Array.from({ length: 60 }, (_, i) => (
            <button
              key={i}
              type="button"
              data-part="time-option"
              data-selected={i === minutes || undefined}
              style={getItemStyle(i === minutes)}
              onClick={() => onSelect(hours, i, seconds)}
            >
              {pad2(i)}
            </button>
          ))}
        </div>

        {/* Seconds column (optional) */}
        {showSeconds && (
          <>
            <div style={dividerStyle} />
            <div ref={secondsRef} data-part="time-column" style={colStyle}>
              {Array.from({ length: 60 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  data-part="time-option"
                  data-selected={i === seconds || undefined}
                  style={getItemStyle(i === seconds)}
                  onClick={() => onSelect(hours, minutes, i)}
                >
                  {pad2(i)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Now button */}
      {showNow && (
        <div data-part="footer" style={{ padding: 'var(--ds-spacing-1-5, 6px) var(--ds-spacing-2, 8px)' }}>
          <button
            type="button"
            data-part="now-button"
            style={{
              width: '100%',
              padding: '4px var(--ds-spacing-3, 12px)',
              fontSize: 'var(--ds-font-size-xs, 12px)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity var(--ds-motion-fast)',
            }}
            onClick={onNowClick}
          >
            Now
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// TimePickerBase
// ---------------------------------------------------------------------------

const TimePickerBase = React.forwardRef<HTMLInputElement, TimePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    format = 'HH:mm',
    disabled = false,
    size = 'default',
    status,
    placeholder = 'Select time',
    allowClear = true,
    showNow = true,
    onChange,
    className = '',
    style,
    autoFocus,
    id,
    name,
  } = props;

  const parseTime = (val: Date | string | null | undefined): { h: number; m: number; s: number } | null => {
    if (!val) return null;
    if (typeof val === 'string') {
      const match = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (match) return { h: parseInt(match[1]), m: parseInt(match[2]), s: parseInt(match[3] || '0') };
      const date = new Date(val);
      if (!isNaN(date.getTime())) return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() };
      return null;
    }
    return { h: val.getHours(), m: val.getMinutes(), s: val.getSeconds() };
  };

  const showSeconds = format.includes('ss') || (format.includes('s') && !format.includes('ms'));

  const formatTimeStr = (h: number, m: number, s: number): string => {
    return showSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`;
  };

  const isControlled = value !== undefined;
  const [internalTime, setInternalTime] = useState<{ h: number; m: number; s: number } | null>(() => parseTime(defaultValue));
  const [isOpen, setIsOpen] = useState(false);

  const selectedTime = isControlled ? parseTime(value) : internalTime;
  const displayText = selectedTime ? formatTimeStr(selectedTime.h, selectedTime.m, selectedTime.s) : '';

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

  // Fixed position for portal popup
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ds-spacing-1') || '4', 10) || 4;
      setPos({ top: rect.bottom + gap, left: rect.left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  // Click-outside dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSelect = useCallback((h: number, m: number, s: number) => {
    const today = new Date();
    today.setHours(h, m, s, 0);
    const timeStr = formatTimeStr(h, m, s);
    if (!isControlled) setInternalTime({ h, m, s });
    onChange?.(today, timeStr);
  }, [isControlled, onChange, showSeconds]);

  const handleNowClick = useCallback(() => {
    const now = new Date();
    handleSelect(now.getHours(), now.getMinutes(), now.getSeconds());
    setIsOpen(false);
  }, [handleSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) setInternalTime(null);
    onChange?.(null, '');
  }, [isControlled, onChange]);

  const sizeStyle = sizeStyleMap[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];

  return (
    <>
      <div ref={triggerRef} data-part="root" className={`rottay-timepicker rottay-timepicker--modern relative w-full ${className}`} style={style}>
        <input
          ref={setInputRef}
          type="text"
          readOnly
          data-part="trigger-input"
          data-status={status ?? 'default'}
          className="w-full cursor-pointer"
          style={{
            boxSizing: 'border-box',
            paddingRight: 48,
            ...sizeStyle,
          }}
          value={displayText}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          id={id}
          name={name}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={placeholder}
        />
        {allowClear && displayText && !disabled && (
          <button
            type="button"
            data-part="clear-button"
            style={{ position: 'absolute', right: 28, top: '50%', cursor: 'pointer', padding: 'var(--ds-spacing-1, 4px)', opacity: 0.5, fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleClear}
            tabIndex={-1}
          >
            ×
          </button>
        )}
        <span
          data-part="clock-icon"
          style={{ position: 'absolute', right: 10, top: '50%', pointerEvents: 'none', display: 'flex' }}
          aria-hidden="true"
        >
          <ClockIcon />
        </span>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1050 }}
        >
          <TimePanel
            hours={selectedTime?.h ?? 0}
            minutes={selectedTime?.m ?? 0}
            seconds={selectedTime?.s ?? 0}
            showSeconds={showSeconds}
            onSelect={handleSelect}
            onNowClick={handleNowClick}
            showNow={showNow}
          />
        </div>,
        document.body,
      )}
    </>
  );
});

TimePickerBase.displayName = 'TimePicker.Modern';

// ---------------------------------------------------------------------------
// TimeRangePicker
// ---------------------------------------------------------------------------

const TimeRangePicker = React.forwardRef<HTMLDivElement, TimeRangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    format = 'HH:mm',
    disabled = false,
    size = 'default',
    status,
    placeholder = ['Start time', 'End time'],
    separator = '→',
    showNow = true,
    onChange,
    className = '',
    style,
    id,
  } = props;

  const parseTime = (val: Date | string | null | undefined): { h: number; m: number; s: number } | null => {
    if (!val) return null;
    if (typeof val === 'string') {
      const match = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (match) return { h: parseInt(match[1]), m: parseInt(match[2]), s: parseInt(match[3] || '0') };
      const date = new Date(val);
      if (!isNaN(date.getTime())) return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() };
      return null;
    }
    return { h: val.getHours(), m: val.getMinutes(), s: val.getSeconds() };
  };

  const showSeconds = format.includes('ss') || (format.includes('s') && !format.includes('ms'));

  const formatTimeStr = (h: number, m: number, s: number): string => {
    return showSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`;
  };

  const createDate = (t: { h: number; m: number; s: number } | null): Date | null => {
    if (!t) return null;
    const today = new Date();
    today.setHours(t.h, t.m, t.s, 0);
    return today;
  };

  type TimeTuple = [{ h: number; m: number; s: number } | null, { h: number; m: number; s: number } | null];
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<TimeTuple>(() => {
    if (defaultValue) return [parseTime(defaultValue[0]), parseTime(defaultValue[1])];
    return [null, null];
  });
  const [activeInput, setActiveInput] = useState<'start' | 'end'>('start');
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = isControlled
    ? [parseTime(value?.[0]), parseTime(value?.[1])] as TimeTuple
    : internalValue;

  const startText = displayValue[0] ? formatTimeStr(displayValue[0].h, displayValue[0].m, displayValue[0].s) : '';
  const endText = displayValue[1] ? formatTimeStr(displayValue[1].h, displayValue[1].m, displayValue[1].s) : '';

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ds-spacing-1') || '4', 10) || 4;
      setPos({ top: rect.bottom + gap, left: rect.left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSelect = useCallback((h: number, m: number, s: number) => {
    const newTime = { h, m, s };
    const newValue = activeInput === 'start'
      ? [newTime, displayValue[1]] as TimeTuple
      : [displayValue[0], newTime] as TimeTuple;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(
      [createDate(newValue[0]), createDate(newValue[1])],
      [
        newValue[0] ? formatTimeStr(newValue[0].h, newValue[0].m, newValue[0].s) : '',
        newValue[1] ? formatTimeStr(newValue[1].h, newValue[1].m, newValue[1].s) : '',
      ]
    );
  }, [activeInput, displayValue, isControlled, onChange, showSeconds]);

  const handleNowClick = useCallback(() => {
    const now = new Date();
    handleSelect(now.getHours(), now.getMinutes(), now.getSeconds());
    setIsOpen(false);
  }, [handleSelect]);

  const rangeSizeStyle = sizeStyleMap[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const activeTime = activeInput === 'start' ? displayValue[0] : displayValue[1];

  const rangeInputBaseStyle: React.CSSProperties = {
    boxSizing: 'border-box' as const,
    width: '100%',
    cursor: 'pointer',
    ...rangeSizeStyle,
  };

  return (
    <>
      <div
        ref={(node) => {
          (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        data-part="root"
        className={`rottay-timepicker-range rottay-timepicker-range--modern flex items-center gap-2 w-full ${className}`}
        style={style}
        id={id}
      >
        <input
          type="text"
          readOnly
          data-part="trigger-input"
          data-range-input="start"
          data-status={status ?? 'default'}
          data-active={(activeInput === 'start' && isOpen) || undefined}
          style={rangeInputBaseStyle}
          value={startText}
          disabled={disabled}
          placeholder={placeholder[0]}
          onClick={() => {
            if (!disabled) { setActiveInput('start'); setIsOpen(true); }
          }}
          role="combobox"
          aria-expanded={isOpen && activeInput === 'start'}
          aria-label={placeholder[0]}
        />
        <span data-part="separator" className="shrink-0">{separator}</span>
        <input
          type="text"
          readOnly
          data-part="trigger-input"
          data-range-input="end"
          data-status={status ?? 'default'}
          data-active={(activeInput === 'end' && isOpen) || undefined}
          style={rangeInputBaseStyle}
          value={endText}
          disabled={disabled}
          placeholder={placeholder[1]}
          onClick={() => {
            if (!disabled) { setActiveInput('end'); setIsOpen(true); }
          }}
          role="combobox"
          aria-expanded={isOpen && activeInput === 'end'}
          aria-label={placeholder[1]}
        />
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1050 }}
        >
          <TimePanel
            hours={activeTime?.h ?? 0}
            minutes={activeTime?.m ?? 0}
            seconds={activeTime?.s ?? 0}
            showSeconds={showSeconds}
            onSelect={handleSelect}
            onNowClick={handleNowClick}
            showNow={showNow}
          />
        </div>,
        document.body,
      )}
    </>
  );
});

TimeRangePicker.displayName = 'TimePicker.RangePicker.Modern';

export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
