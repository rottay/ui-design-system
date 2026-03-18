'use client';

/**
 * @fileoverview TimePicker Modern Engine -- DaisyUI/Tailwind with custom dropdown panel.
 * Uses a read-only text input that opens a custom hour/minute selection dropdown
 * on click (anywhere in the field). All popup panel styles are inline because
 * the panel renders in a portal outside the app's Tailwind scope.
 *
 * @module TimePicker/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TimePickerProps, TimeRangePickerProps } from '../TimePicker.types';

/** Maps DS size values to DaisyUI input size modifier classes. */
const sizeClasses: Record<string, string> = {
  small: 'input-sm',
  default: 'input-md',
  large: 'input-lg',
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
// TimePanel -- the dropdown with hour/minute columns (all inline styles)
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
    background: 'var(--ds-color-bg-elevated)',
    borderRadius: 12,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,.15), 0 4px 10px -5px rgba(0,0,0,.1)',
    border: '1px solid var(--ds-color-border)',
    fontFamily: 'inherit',
    animation: 'rottay-select-slide-in 0.15s ease-out',
    overflow: 'hidden',
  };

  const colStyle: React.CSSProperties = {
    overflowY: 'auto',
    height: 200,
    padding: '4px 2px',
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    background: 'var(--ds-color-border)',
    flexShrink: 0,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px 4px',
    gap: 8,
    borderBottom: '1px solid var(--ds-color-border)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ds-color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    textAlign: 'center' as const,
    flex: 1,
  };

  const getItemStyle = (isActive: boolean): React.CSSProperties => ({
    width: 44,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    borderRadius: 6,
    cursor: 'pointer',
    border: 'none',
    fontWeight: isActive ? 600 : 400,
    background: isActive ? 'var(--ds-color-primary)' : 'transparent',
    color: isActive ? 'var(--ds-color-white)' : 'var(--ds-color-text-primary)',
    transition: 'all 0.1s',
    margin: '1px auto',
    outline: 'none',
  });

  return (
    <div style={panelStyle}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes rottay-select-slide-in{from{opacity:0;transform:translateY(-4px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}` }} />

      {/* Column headers */}
      <div style={headerStyle}>
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
      <div style={{ display: 'flex', padding: '4px 4px' }}>
        {/* Hours column */}
        <div ref={hoursRef} style={colStyle}>
          {Array.from({ length: 24 }, (_, i) => (
            <button
              key={i}
              type="button"
              style={getItemStyle(i === hours)}
              onMouseEnter={(e) => {
                if (i !== hours) (e.currentTarget as HTMLElement).style.background = 'var(--ds-color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (i !== hours) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              onClick={() => onSelect(i, minutes, seconds)}
            >
              {pad2(i)}
            </button>
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Minutes column */}
        <div ref={minutesRef} style={colStyle}>
          {Array.from({ length: 60 }, (_, i) => (
            <button
              key={i}
              type="button"
              style={getItemStyle(i === minutes)}
              onMouseEnter={(e) => {
                if (i !== minutes) (e.currentTarget as HTMLElement).style.background = 'var(--ds-color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (i !== minutes) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
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
            <div ref={secondsRef} style={colStyle}>
              {Array.from({ length: 60 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  style={getItemStyle(i === seconds)}
                  onMouseEnter={(e) => {
                    if (i !== seconds) (e.currentTarget as HTMLElement).style.background = 'var(--ds-color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (i !== seconds) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
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
        <div style={{ borderTop: '1px solid var(--ds-color-border)', padding: '6px 8px' }}>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 6,
              border: 'none',
              background: 'var(--ds-color-primary)',
              color: 'var(--ds-color-white)',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
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
      setPos({ top: rect.bottom + 4, left: rect.left });
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

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

  return (
    <>
      <div ref={triggerRef} className={`relative w-full ${className}`} style={style}>
        <input
          ref={setInputRef}
          type="text"
          readOnly
          className={`input input-bordered w-full ${sizeClass} ${statusClass} cursor-pointer`}
          style={{ paddingRight: 48 }}
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
            style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: '50%', opacity: 0.5, color: 'var(--ds-color-text-primary)', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleClear}
            tabIndex={-1}
          >
            ×
          </button>
        )}
        <span
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ds-color-text-muted)', display: 'flex' }}
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
      setPos({ top: rect.bottom + 4, left: rect.left });
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

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';
  const activeTime = activeInput === 'start' ? displayValue[0] : displayValue[1];

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
          className={[
            `input input-bordered w-full ${sizeClass} cursor-pointer`,
            statusClass,
            activeInput === 'start' && isOpen ? 'ring-2 ring-primary' : '',
          ].join(' ')}
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
        <span className="text-base-content/60 shrink-0">{separator}</span>
        <input
          type="text"
          readOnly
          className={[
            `input input-bordered w-full ${sizeClass} cursor-pointer`,
            statusClass,
            activeInput === 'end' && isOpen ? 'ring-2 ring-primary' : '',
          ].join(' ')}
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
