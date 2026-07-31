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
import type { TimePickerProps, TimeRangePickerProps, TimePickerPlacement } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../../runtime/overlay/portal-scope';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

/**
 * Hook-local `tOr`: catalogue value with an English floor -- when the
 * catalogue entry has not landed yet the provider echoes the full key, which
 * must never reach visible copy or an aria-label.
 */
function useTimePickerTranslation(): (key: string, fallback: string) => string {
  const i18n = useOptionalTranslation('components');
  return (key, fallback) => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
}

/** Maps the canonical `sm | md | lg` size step to inline style dimensions. */
const sizeStyleMap: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
  sm: { height: 'var(--ds-input-sm-height, 32px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', padding: '4px var(--ds-input-sm-padding-x, 10px)' },
  md: { height: 'var(--ds-input-md-height, 40px)', fontSize: 'var(--ds-input-md-font-size, 14px)', padding: '6px var(--ds-input-md-padding-x, 12px)' },
  lg: { height: 'var(--ds-input-lg-height, 44px)', fontSize: 'var(--ds-input-lg-font-size, 15px)', padding: '8px var(--ds-input-lg-padding-x, 14px)' },
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

/**
 * APG column keyboard contract: each column is a strip with a roving tab
 * stop (the selected option). ArrowUp/ArrowDown move focus between options
 * (wrapping), Home/End jump to the edges. Focus moves only -- selection
 * commits on activation (click / Enter / Space via the native button),
 * matching the DatePicker grid idiom.
 */
function handleColumnKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
  const { key } = event;
  if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
  const column = event.currentTarget;
  const target = event.target as HTMLElement | null;
  if (!target || target.closest('[data-part="time-option"]') === null) return;
  const options = Array.from(column.querySelectorAll<HTMLElement>('[data-part="time-option"]'));
  if (options.length === 0) return;
  event.preventDefault();
  const currentIndex = options.indexOf(target.closest('[data-part="time-option"]') as HTMLElement);
  let nextIndex = 0;
  if (key === 'Home') nextIndex = 0;
  else if (key === 'End') nextIndex = options.length - 1;
  else if (currentIndex >= 0) {
    nextIndex = (currentIndex + (key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
  }
  options[nextIndex]?.focus();
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
  const tOr = useTimePickerTranslation();
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
    overflow: 'hidden',
  };

  const colStyle: React.CSSProperties = {
    overflowY: 'auto',
    height: 'var(--ds-time-column-height, 200px)',
    padding: 'var(--ds-spacing-1, 4px) 2px',
  };

  const dividerStyle: React.CSSProperties = {
    inlineSize: 1,
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
    textTransform: 'uppercase' as const,
    letterSpacing: 'var(--ds-letter-spacing-wide, 0.025em)',
    textAlign: 'center' as const,
    flex: 1,
  };

  const itemStyle: React.CSSProperties = {
    width: 44,
    height: 'var(--ds-input-sm-height, 32px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-input-sm-font-size, 13px)',
    cursor: 'pointer',
    margin: '1px auto',
  };

  return (
    <div data-part="panel" className="rottay-timepicker__panel" style={panelStyle}>
      {/* Column headers */}
      <div data-part="header" style={headerStyle}>
        <span style={labelStyle}>{tOr('timepicker.hours_label', 'Hr')}</span>
        <span style={{ ...labelStyle, flex: 0, inlineSize: 1 }} />
        <span style={labelStyle}>{tOr('timepicker.minutes_label', 'Min')}</span>
        {showSeconds && (
          <>
            <span style={{ ...labelStyle, flex: 0, inlineSize: 1 }} />
            <span style={labelStyle}>{tOr('timepicker.seconds_label', 'Sec')}</span>
          </>
        )}
      </div>

      {/* Scrollable columns */}
      <div style={{ display: 'flex', padding: 'var(--ds-spacing-1, 4px)' }}>
        {/* Hours column */}
        <div ref={hoursRef} data-part="time-column" style={colStyle} onKeyDown={handleColumnKeyDown}>
          {Array.from({ length: 24 }, (_, i) => (
            <button
              key={i}
              type="button"
              data-part="time-option"
              data-selected={i === hours || undefined}
              tabIndex={i === hours ? 0 : -1}
              style={itemStyle}
              onClick={() => onSelect(i, minutes, seconds)}
            >
              {pad2(i)}
            </button>
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Minutes column */}
        <div ref={minutesRef} data-part="time-column" style={colStyle} onKeyDown={handleColumnKeyDown}>
          {Array.from({ length: 60 }, (_, i) => (
            <button
              key={i}
              type="button"
              data-part="time-option"
              data-selected={i === minutes || undefined}
              tabIndex={i === minutes ? 0 : -1}
              style={itemStyle}
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
            <div ref={secondsRef} data-part="time-column" style={colStyle} onKeyDown={handleColumnKeyDown}>
              {Array.from({ length: 60 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  data-part="time-option"
                  data-selected={i === seconds || undefined}
                  tabIndex={i === seconds ? 0 : -1}
                  style={itemStyle}
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
              cursor: 'pointer',
            }}
            onClick={onNowClick}
          >
            {tOr('timepicker.now', 'Now')}
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
  const tOr = useTimePickerTranslation();
  const {
    value,
    defaultValue,
    // Default must match TIME_PICKER_DEFAULTS.format so all engines emit the
    // same string shape when the caller does not configure a format.
    format = 'HH:mm:ss',
    disabled = false,
    size = 'default',
    status,
    placeholder: placeholderProp,
    allowClear = true,
    showNow = true,
    placement = 'bottomLeft',
    onChange,
    className = '',
    style,
    autoFocus,
    id,
    name,
  } = props;

  // Explicit prop wins; otherwise the localized placeholder with the
  // historical English default as the floor.
  const placeholder = placeholderProp ?? tOr('timepicker.placeholder', 'Select time');

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
  // The panel leaves the trigger's DOM ancestry when it portals, so the
  // tenant/locale scope has to be re-stamped around it. `usePortalScope`
  // needs the anchor as state (a ref would not re-render when it lands), so
  // the trigger publishes to both.
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
    (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setAnchorEl(node);
  }, []);
  const portalScope = usePortalScope(anchorEl);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );

  // Fixed position for portal popup. Top placements subtract the PANEL's
  // measured height and *Right placements align the panel's inline end with
  // the trigger's (DatePicker precedent); the panel ref lands with the same
  // commit that opens it, so it is readable inside the effect.
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ds-spacing-1') || '4', 10) || 4;
      // Responsive law: never let the panel overflow the viewport's inline
      // end. 208 is the worst-case panel footprint (three 44px option columns
      // + dividers + padding, coarse floors included).
      const PANEL_MAX_FOOTPRINT = 208;
      let top = rect.bottom + gap;
      let left = rect.left;
      if (placement.includes('top')) {
        top = rect.top - gap - (panelRect?.height ?? 0);
      }
      if (placement.includes('Right')) {
        left = rect.right - (panelRect?.width ?? PANEL_MAX_FOOTPRINT);
      }
      left = Math.max(gap, Math.min(left, window.innerWidth - PANEL_MAX_FOOTPRINT - gap));
      setPos({ top, left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, placement]);

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

  // Escape key: closes and RETURNS FOCUS to the trigger input (DatePicker/
  // Dropdown precedent) -- the panel unmounts on close, so without this the
  // focus would drop to <body>.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.focus();
      }
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

  // readOnly blocks keystroke editing only; change events still reach the
  // input (autofill, form libraries, programmatic dispatch) and must commit
  // through the same path as a panel selection.
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) {
      if (!isControlled) setInternalTime(null);
      onChange?.(null, '');
      return;
    }
    const parsed = parseTime(raw);
    if (parsed) handleSelect(parsed.h, parsed.m, parsed.s);
  }, [isControlled, onChange, handleSelect]);

  const sizeStyle = sizeStyleMap[toCanonicalSize(size) ?? 'md'];

  return (
    <>
      <div ref={setTriggerRef} data-part="root" className={`rottay-timepicker rottay-timepicker--modern ${className}`} style={style}>
        <input
          ref={setInputRef}
          type="text"
          readOnly
          data-part="trigger-input"
          data-status={status ?? 'default'}
          style={{
            boxSizing: 'border-box',
            paddingInlineEnd: 48,
            ...sizeStyle,
          }}
          value={displayText}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          id={id}
          name={name}
          onChange={handleInputChange}
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
            style={{ position: 'absolute', insetInlineEnd: 28, top: '50%', cursor: 'pointer', padding: 'var(--ds-spacing-1, 4px)', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleClear}
            tabIndex={-1}
            aria-label={tOr('timepicker.clear', 'Clear')}
          >
            <ActionCloseIcon decorative size={14} />
          </button>
        )}
        <span
          data-part="clock-icon"
          style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', pointerEvents: 'none', display: 'flex' }}
          aria-hidden="true"
        >
          <ClockIcon />
        </span>
      </div>

      {/* Panel goes through the shared overlay substrate: the target resolves
          as explicit container > active top-layer host > shared
          `#rottay-portal-root`, so the panel stays visible when the field is
          inside a `showModal()` dialog. `PortalScope` carries the tenant/
          theme/direction lineage across the portal boundary. */}
      {isOpen && (
        <Portal>
          <PortalScope snapshot={portalScope}>
            <div
              ref={panelRef}
              data-placement={placement}
              style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 'var(--ds-timepicker-z-index, 1050)' }}
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
            </div>
          </PortalScope>
        </Portal>
      )}
    </>
  );
});

TimePickerBase.displayName = 'TimePicker.Modern';

// ---------------------------------------------------------------------------
// TimeRangePicker
// ---------------------------------------------------------------------------

const TimeRangePicker = React.forwardRef<HTMLDivElement, TimeRangePickerProps>((props, ref) => {
  const tOr = useTimePickerTranslation();
  const {
    value,
    defaultValue,
    // Default must match TIME_PICKER_DEFAULTS.format so all engines emit the
    // same string shape when the caller does not configure a format.
    format = 'HH:mm:ss',
    disabled = false,
    size = 'default',
    status,
    placeholder: placeholderProp,
    separator = '→',
    showNow = true,
    placement = 'bottomLeft',
    onChange,
    className = '',
    style,
    id,
  } = props;

  // Explicit prop wins; otherwise localized labels with the historical
  // English defaults as the floor.
  const placeholder = placeholderProp ?? [
    tOr('timepicker.start_time', 'Start time'),
    tOr('timepicker.end_time', 'End time'),
  ];

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
  // See TimePickerBase: the portaled panel needs the anchor as state so the
  // scope snapshot re-resolves once the trigger lands. The callback must be
  // stable -- an inline ref arrow is re-created every render, so React would
  // detach (null) and re-attach it each commit and the setState would loop.
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const portalScope = usePortalScope(anchorEl);
  const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
    (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setAnchorEl(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [ref]);

  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ds-spacing-1') || '4', 10) || 4;
      // Responsive law: viewport clamp + measured top/Right placement -- see
      // TimePickerBase.
      const PANEL_MAX_FOOTPRINT = 208;
      let top = rect.bottom + gap;
      let left = rect.left;
      if (placement.includes('top')) {
        top = rect.top - gap - (panelRect?.height ?? 0);
      }
      if (placement.includes('Right')) {
        left = rect.right - (panelRect?.width ?? PANEL_MAX_FOOTPRINT);
      }
      left = Math.max(gap, Math.min(left, window.innerWidth - PANEL_MAX_FOOTPRINT - gap));
      setPos({ top, left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, placement]);

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

  // Escape: closes and RETURNS FOCUS to the range input currently being
  // filled (DatePicker precedent; the panel unmounts on close).
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        const active = triggerRef.current?.querySelector<HTMLElement>(
          `[data-range-input='${activeInput}']`,
        );
        active?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, activeInput]);

  const commitTime = useCallback((which: 'start' | 'end', time: { h: number; m: number; s: number }) => {
    const newValue = which === 'start'
      ? [time, displayValue[1]] as TimeTuple
      : [displayValue[0], time] as TimeTuple;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(
      [createDate(newValue[0]), createDate(newValue[1])],
      [
        newValue[0] ? formatTimeStr(newValue[0].h, newValue[0].m, newValue[0].s) : '',
        newValue[1] ? formatTimeStr(newValue[1].h, newValue[1].m, newValue[1].s) : '',
      ]
    );
  }, [displayValue, isControlled, onChange, showSeconds]);

  const handleSelect = useCallback((h: number, m: number, s: number) => {
    commitTime(activeInput, { h, m, s });
  }, [activeInput, commitTime]);

  // readOnly blocks keystroke editing only; change events still reach each
  // input and must commit against that specific input, not the panel's
  // activeInput, so an end-input change never lands on the start slot.
  const handleInputChange = (which: 'start' | 'end') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseTime(e.target.value);
      if (parsed) commitTime(which, parsed);
    };

  const handleNowClick = useCallback(() => {
    const now = new Date();
    handleSelect(now.getHours(), now.getMinutes(), now.getSeconds());
    setIsOpen(false);
  }, [handleSelect]);

  const rangeSizeStyle = sizeStyleMap[toCanonicalSize(size) ?? 'md'];
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
        ref={setTriggerRef}
        data-part="root"
        className={`rottay-timepicker-range rottay-timepicker-range--modern ${className}`}
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
          onChange={handleInputChange('start')}
          onClick={() => {
            if (!disabled) { setActiveInput('start'); setIsOpen(true); }
          }}
          role="combobox"
          aria-expanded={isOpen && activeInput === 'start'}
          aria-label={placeholder[0]}
        />
        <span data-part="separator">{separator}</span>
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
          onChange={handleInputChange('end')}
          onClick={() => {
            if (!disabled) { setActiveInput('end'); setIsOpen(true); }
          }}
          role="combobox"
          aria-expanded={isOpen && activeInput === 'end'}
          aria-label={placeholder[1]}
        />
      </div>

      {/* Shared overlay substrate -- see TimePickerBase. */}
      {isOpen && (
        <Portal>
          <PortalScope snapshot={portalScope}>
            <div
              ref={panelRef}
              data-placement={placement}
              style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 'var(--ds-timepicker-z-index, 1050)' }}
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
            </div>
          </PortalScope>
        </Portal>
      )}
    </>
  );
});

TimeRangePicker.displayName = 'TimePicker.RangePicker.Modern';

export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
