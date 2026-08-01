'use client';

/**
 * @fileoverview TimePicker Modern Engine -- governed column panel with a
 * read-only text trigger. Hour/minute/second columns resolve their option
 * domains from the contract (steps, disabledTime, hideDisabledOptions,
 * show* flags); 12-hour mode adds a catalog-driven AM/PM meridiem strip.
 * Keyboard: per-column roving tab stop, arrows/Home/End, ArrowLeft/Right hop
 * between columns (mirrored under RTL). Popup geometry remains inline while
 * the standalone modern skin owns paint/state across the portal boundary.
 *
 * B5-03: the trigger clock glyph resolves through the semantic icon corpus
 * (`time.timestamp`); the local SVG is retired.
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
import { TimeTimestampIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-timestamp';

/** Reading-direction probe (Segmented/Tree/Calendar engine idiom). */
function isRtlContext(el: HTMLElement): boolean {
  const scoped = el.closest('[dir]');
  if (scoped) return scoped.getAttribute('dir') === 'rtl';
  return document.documentElement.dir === 'rtl';
}

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

/** Pads a number to 2 digits. */
const pad2 = (n: number): string => String(n).padStart(2, '0');

/** The trigger clock resolves through the governed semantic corpus
    (`time.timestamp` -- the same Phosphor Clock glyph the retired local SVG
    drew), so tenant icon packs stay authoritative. */
const ClockIcon = () => <TimeTimestampIcon decorative size={16} />;

/** One selectable cell of a time column (value in DISPLAY units). */
interface TimeOption {
  value: number;
  disabled: boolean;
}

/** Builds a column's options from the value domain, honoring step intervals
    and the disabled-set (`hideDisabled` drops them from the list entirely). */
function buildTimeOptions(
  values: number[],
  step: number,
  disabledValues: Set<number>,
  hideDisabled: boolean,
): TimeOption[] {
  const safeStep = Math.max(1, Math.floor(step) || 1);
  return values
    .filter((v) => v % safeStep === 0)
    .filter((v) => !(hideDisabled && disabledValues.has(v)))
    .map((v) => ({ value: v, disabled: disabledValues.has(v) }));
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const SIXTY = Array.from({ length: 60 }, (_, i) => i);

/** Display-hour (1-12) + meridiem -> 24h hour. */
const to24Hour = (displayHour: number, meridiem: 'am' | 'pm'): number =>
  meridiem === 'pm' ? (displayHour % 12) + 12 : displayHour % 12;

// ---------------------------------------------------------------------------
// TimePanel -- inline geometry/layout; paint is owned by the modern skin.
// ---------------------------------------------------------------------------

interface TimePanelProps {
  /** Selected values (hours always in 24h; the panel derives display units). */
  hours: number;
  minutes: number;
  seconds: number;
  showHour: boolean;
  showMinute: boolean;
  showSeconds: boolean;
  use12Hours: boolean;
  meridiem: 'am' | 'pm';
  hourOptions: TimeOption[];
  minuteOptions: TimeOption[];
  secondOptions: TimeOption[];
  amLabel: string;
  pmLabel: string;
  meridiemLabel: string;
  /** Display-unit selection: hour arrives 0-23 (24h) or 1-12 (12h). */
  onSelect: (h: number, m: number, s: number) => void;
  onMeridiemChange: (meridiem: 'am' | 'pm') => void;
  onNowClick?: () => void;
  showNow: boolean;
  cellRender?: (current: number, info: { type: 'hour' | 'minute' | 'second' }) => React.ReactNode;
  renderExtraFooter?: () => React.ReactNode;
}

/**
 * APG column keyboard contract: each column is a strip with a roving tab
 * stop (the selected option). ArrowUp/ArrowDown move focus between options
 * (wrapping), Home/End jump to the edges, ArrowLeft/ArrowRight hop to the
 * sibling column (mirrored under RTL, where the column flow flips). Focus
 * moves only -- selection commits on activation (click / Enter / Space via
 * the native button), matching the DatePicker grid idiom.
 */
function handleColumnKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
  const { key } = event;
  if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End' && key !== 'ArrowLeft' && key !== 'ArrowRight') return;
  const column = event.currentTarget;
  const target = event.target as HTMLElement | null;
  if (!target || target.closest('[data-part="time-option"]') === null) return;

  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const panel = column.closest('[data-part="panel"]');
    const columns = Array.from(panel?.querySelectorAll<HTMLElement>('[data-part="time-column"]') ?? []);
    const index = columns.indexOf(column);
    const direction = (key === 'ArrowRight' ? 1 : -1) * (isRtlContext(column) ? -1 : 1);
    const sibling = columns[index + direction];
    if (!sibling) return;
    event.preventDefault();
    const stop = sibling.querySelector<HTMLElement>('[data-part="time-option"][data-selected="true"]')
      ?? sibling.querySelector<HTMLElement>('[data-part="time-option"]:not([disabled])');
    stop?.focus();
    return;
  }

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
  showHour,
  showMinute,
  showSeconds,
  seconds,
  use12Hours,
  meridiem,
  hourOptions,
  minuteOptions,
  secondOptions,
  amLabel,
  pmLabel,
  meridiemLabel,
  onSelect,
  onMeridiemChange,
  onNowClick,
  showNow,
  cellRender,
  renderExtraFooter,
}) => {
  const tOr = useTimePickerTranslation();
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef<HTMLDivElement>(null);
  const meridiemRef = useRef<HTMLDivElement>(null);

  // Selected hour in the column's display units (12h mode renders 1-12).
  const selectedDisplayHour = use12Hours ? hours % 12 || 12 : hours;

  // Scroll selected item into view on mount
  useEffect(() => {
    const scrollTo = (container: HTMLDivElement | null, options: TimeOption[], selected: number) => {
      if (!container) return;
      const index = options.findIndex((o) => o.value === selected);
      const item = container.children[index] as HTMLElement | undefined;
      if (item) {
        item.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    };
    scrollTo(hoursRef.current, hourOptions, selectedDisplayHour);
    scrollTo(minutesRef.current, minuteOptions, minutes);
    if (showSeconds) scrollTo(secondsRef.current, secondOptions, seconds);
    if (use12Hours && meridiemRef.current) {
      const item = meridiemRef.current.children[meridiem === 'pm' ? 1 : 0] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, []);

  // Visible columns in contract order; the meridiem strip only exists in
  // 12h mode (never counted in the default 2/3-column layouts).
  const visibleColumns: Array<{
    key: 'hour' | 'minute' | 'second';
    label: string;
    options: TimeOption[];
    selected: number;
    ref: React.RefObject<HTMLDivElement | null>;
  }> = [];
  if (showHour) visibleColumns.push({ key: 'hour', label: tOr('timepicker.hours_label', 'Hr'), options: hourOptions, selected: selectedDisplayHour, ref: hoursRef });
  if (showMinute) visibleColumns.push({ key: 'minute', label: tOr('timepicker.minutes_label', 'Min'), options: minuteOptions, selected: minutes, ref: minutesRef });
  if (showSeconds) visibleColumns.push({ key: 'second', label: tOr('timepicker.seconds_label', 'Sec'), options: secondOptions, selected: seconds, ref: secondsRef });

  const commitOption = (columnKey: 'hour' | 'minute' | 'second', value: number) => {
    if (columnKey === 'hour') onSelect(value, minutes, seconds);
    else if (columnKey === 'minute') onSelect(selectedDisplayHour, value, seconds);
    else onSelect(selectedDisplayHour, minutes, value);
  };

  return (
    <div
      data-part="panel"
      className="rottay-timepicker__panel"
      // The trigger advertises `aria-haspopup="dialog"`, so the popup must
      // actually BE a dialog (APG relationship); the name resolves through
      // the catalog (timepicker.time_picker) with the English floor.
      role="dialog"
      aria-label={tOr('timepicker.time_picker', 'Time picker')}
    >
      {/* Column headers (one label per visible column, dividers mirrored) */}
      <div data-part="header">
        {visibleColumns.map((col, i) => (
          <React.Fragment key={col.key}>
            {i > 0 && <span data-part="label-separator" />}
            <span data-part="column-label">{col.label}</span>
          </React.Fragment>
        ))}
        {use12Hours && (
          <>
            {visibleColumns.length > 0 && <span data-part="label-separator" />}
            <span data-part="column-label">{meridiemLabel}</span>
          </>
        )}
      </div>

      {/* Scrollable columns */}
      <div data-part="columns">
        {visibleColumns.map((col, i) => (
          <React.Fragment key={col.key}>
            {i > 0 && <div data-part="column-divider" />}
            <div
              ref={col.ref}
              data-part="time-column"
              role="group"
              aria-label={col.label}
              onKeyDown={handleColumnKeyDown}
            >
              {col.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-part="time-option"
                  data-selected={opt.value === col.selected || undefined}
                  data-disabled={opt.disabled || undefined}
                  disabled={opt.disabled || undefined}
                  aria-disabled={opt.disabled || undefined}
                  tabIndex={opt.value === col.selected ? 0 : -1}
                  onClick={() => commitOption(col.key, opt.value)}
                >
                  {cellRender ? cellRender(opt.value, { type: col.key }) : pad2(opt.value)}
                </button>
              ))}
            </div>
          </React.Fragment>
        ))}

        {/* Meridiem column (12h mode only; AM/PM from the catalog) */}
        {use12Hours && (
          <>
            {visibleColumns.length > 0 && <div data-part="column-divider" />}
            <div
              ref={meridiemRef}
              data-part="time-column"
              data-column="meridiem"
              role="group"
              aria-label={meridiemLabel}
              onKeyDown={handleColumnKeyDown}
            >
              {(['am', 'pm'] as const).map((mer) => (
                <button
                  key={mer}
                  type="button"
                  data-part="time-option"
                  data-selected={meridiem === mer || undefined}
                  tabIndex={meridiem === mer ? 0 : -1}
                  onClick={() => onMeridiemChange(mer)}
                >
                  {mer === 'am' ? amLabel : pmLabel}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Now button */}
      {showNow && (
        <div data-part="footer">
          <button
            type="button"
            data-part="now-button"
            onClick={onNowClick}
          >
            {tOr('timepicker.now', 'Now')}
          </button>
        </div>
      )}

      {/* Contract extra footer (consumer content under the picker chrome) */}
      {renderExtraFooter && (
        <div data-part="extra-footer">
          {renderExtraFooter()}
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
    use12Hours = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    showHour = true,
    showMinute = true,
    showSecond = true,
    disabledTime,
    hideDisabledOptions = false,
    open: controlledOpen,
    onOpenChange,
    readOnly = false,
    popupClassName,
    popupStyle,
    renderExtraFooter,
    cellRender,
    clearIcon,
    suffixIcon,
    variant,
    bordered = true,
  } = props;

  // Explicit prop wins; otherwise the localized placeholder with the
  // historical English default as the floor.
  const placeholder = placeholderProp ?? tOr('timepicker.placeholder', 'Select time');

  // Frame-grammar discriminator for the skin: `bordered={false}` is the
  // legacy alias of `variant='borderless'` (the explicit variant wins).
  const effectiveVariant = !bordered ? 'borderless' : variant ?? 'outlined';

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

  // Seconds column: format-driven as before, now also gated by the contract
  // `showSecond` flag. Hour/minute columns follow their own contract flags.
  const showSeconds = (format.includes('ss') || (format.includes('s') && !format.includes('ms'))) && showSecond !== false;

  // Meridiem labels resolve through the catalog with the English floor; the
  // display string derives the suffix from the 24h selection.
  const amLabel = tOr('timepicker.am', 'AM');
  const pmLabel = tOr('timepicker.pm', 'PM');
  const meridiemLabel = tOr('timepicker.meridiem_label', 'AM/PM');

  const formatTimeStr = (h: number, m: number, s: number): string => {
    const base = showSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`;
    if (!use12Hours) return base;
    const h12 = h % 12 || 12;
    const base12 = showSeconds ? `${pad2(h12)}:${pad2(m)}:${pad2(s)}` : `${pad2(h12)}:${pad2(m)}`;
    return `${base12} ${h >= 12 ? pmLabel : amLabel}`;
  };

  const isControlled = value !== undefined;
  const [internalTime, setInternalTime] = useState<{ h: number; m: number; s: number } | null>(() => parseTime(defaultValue));
  // Controlled vs uncontrolled open (DatePicker parity): an explicit `open`
  // prop hands the state to the consumer; `onOpenChange` fires either way.
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpenControlled = controlledOpen !== undefined;
  const isOpen = isOpenControlled ? controlledOpen! : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const selectedTime = isControlled ? parseTime(value) : internalTime;
  const displayText = selectedTime ? formatTimeStr(selectedTime.h, selectedTime.m, selectedTime.s) : '';

  // Meridiem derives from the 24h selection; with no selection the last
  // picked meridiem persists so hour cells commit consistently.
  const [meridiemState, setMeridiemState] = useState<'am' | 'pm'>('am');
  const meridiem: 'am' | 'pm' = selectedTime ? (selectedTime.h >= 12 ? 'pm' : 'am') : meridiemState;

  // Contract option domains: step intervals + disabled sets (hideDisabledOptions
  // drops disabled cells from the list instead of painting them).
  const disabledConfig = disabledTime?.();
  const disabledHours = new Set(disabledConfig?.disabledHours?.() ?? []);
  const disabledMinutes = new Set(disabledConfig?.disabledMinutes?.(selectedTime?.h ?? 0) ?? []);
  const disabledSeconds = new Set(disabledConfig?.disabledSeconds?.(selectedTime?.h ?? 0, selectedTime?.m ?? 0) ?? []);
  const hourOptions = buildTimeOptions(use12Hours ? HOURS_12 : HOURS_24, hourStep, disabledHours, hideDisabledOptions);
  const minuteOptions = buildTimeOptions(SIXTY, minuteStep, disabledMinutes, hideDisabledOptions);
  const secondOptions = buildTimeOptions(SIXTY, secondStep, disabledSeconds, hideDisabledOptions);

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
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpen]);

  // Escape key: closes and RETURNS FOCUS to the trigger input (DatePicker/
  // Dropdown precedent) -- the panel unmounts on close, so without this the
  // focus would drop to <body>.
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

  const handleSelect = useCallback((h: number, m: number, s: number) => {
    const today = new Date();
    today.setHours(h, m, s, 0);
    const timeStr = formatTimeStr(h, m, s);
    if (!isControlled) setInternalTime({ h, m, s });
    onChange?.(today, timeStr);
  }, [isControlled, onChange, showSeconds, use12Hours, amLabel, pmLabel]);

  // Panel selections arrive in DISPLAY units: 12h hour cells (1-12) map
  // through the active meridiem; everything else is already 24h-ready.
  const handlePanelSelect = useCallback((hDisplay: number, m: number, s: number) => {
    handleSelect(use12Hours ? to24Hour(hDisplay, meridiem) : hDisplay, m, s);
  }, [handleSelect, use12Hours, meridiem]);

  // Meridiem flip keeps the displayed hour and remaps the 24h selection.
  const handleMeridiemChange = useCallback((mer: 'am' | 'pm') => {
    setMeridiemState(mer);
    if (selectedTime) {
      handleSelect(to24Hour(selectedTime.h % 12 || 12, mer), selectedTime.m, selectedTime.s);
    }
  }, [selectedTime, handleSelect]);

  const handleNowClick = useCallback(() => {
    const now = new Date();
    handleSelect(now.getHours(), now.getMinutes(), now.getSeconds());
    setOpen(false);
    // Focus return (APG): the panel unmounts on close and the Now button's
    // focus would drop to <body>; the trigger input owns the return focus
    // (the Escape path already does the same).
    inputRef.current?.focus();
  }, [handleSelect, setOpen]);

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

  const triggerSize = toCanonicalSize(size) ?? 'md';

  return (
    <>
      <div ref={setTriggerRef} data-part="root" className={`rottay-timepicker rottay-timepicker--modern ${className}`} style={style}>
        <input
          ref={setInputRef}
          type="text"
          readOnly
          data-part="trigger-input"
          data-status={status ?? 'default'}
          data-variant={effectiveVariant}
          data-size={triggerSize}
          // `boxSizing` stays inline: the modern-engine-advanced test reads
          // `trigger.style.boxSizing` (pin). Everything else is skin-owned.
          style={{ boxSizing: 'border-box' }}
          value={displayText}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          id={id}
          name={name}
          onChange={handleInputChange}
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
          aria-label={placeholder}
        />
        {allowClear && displayText && !disabled && (
          <button
            type="button"
            data-part="clear-button"
            onClick={handleClear}
            tabIndex={-1}
            aria-label={tOr('timepicker.clear', 'Clear')}
          >
            {clearIcon ?? <ActionCloseIcon decorative size={14} />}
          </button>
        )}
        <span
          data-part="clock-icon"
          aria-hidden="true"
        >
          {suffixIcon ?? <ClockIcon />}
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
              data-part="popup"
              data-placement={placement}
              className={popupClassName}
              style={{ top: pos.top, left: pos.left, ...popupStyle }}
            >
              <TimePanel
                hours={selectedTime?.h ?? 0}
                minutes={selectedTime?.m ?? 0}
                seconds={selectedTime?.s ?? 0}
                showHour={showHour !== false}
                showMinute={showMinute !== false}
                showSeconds={showSeconds}
                use12Hours={use12Hours}
                meridiem={meridiem}
                hourOptions={hourOptions}
                minuteOptions={minuteOptions}
                secondOptions={secondOptions}
                amLabel={amLabel}
                pmLabel={pmLabel}
                meridiemLabel={meridiemLabel}
                onSelect={handlePanelSelect}
                onMeridiemChange={handleMeridiemChange}
                onNowClick={handleNowClick}
                showNow={showNow}
                cellRender={cellRender}
                renderExtraFooter={renderExtraFooter}
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
    // Direction-neutral default (DatePicker contract convention: '~'). The
    // former '→' was a directional unicode glyph — wrong way under RTL and
    // outside the governed icon corpus (axis: zero functional unicode).
    separator = '~',
    showNow = true,
    placement = 'bottomLeft',
    onChange,
    className = '',
    style,
    id,
    allowClear = true,
    clearIcon,
    use12Hours = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    showHour = true,
    showMinute = true,
    showSecond = true,
    disabledTime,
    hideDisabledOptions = false,
    open: controlledOpen,
    onOpenChange,
    readOnly = false,
    order = false,
    popupClassName,
    popupStyle,
    renderExtraFooter,
    cellRender,
    variant,
    bordered = true,
  } = props;

  // Explicit prop wins; otherwise localized labels with the historical
  // English defaults as the floor.
  const placeholder = placeholderProp ?? [
    tOr('timepicker.start_time', 'Start time'),
    tOr('timepicker.end_time', 'End time'),
  ];

  // See TimePickerBase: legacy `bordered={false}` aliases variant borderless.
  const effectiveVariant = !bordered ? 'borderless' : variant ?? 'outlined';

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

  // Seconds column: format-driven as before, gated by the contract flag.
  const showSeconds = (format.includes('ss') || (format.includes('s') && !format.includes('ms'))) && showSecond !== false;

  const amLabel = tOr('timepicker.am', 'AM');
  const pmLabel = tOr('timepicker.pm', 'PM');
  const meridiemLabel = tOr('timepicker.meridiem_label', 'AM/PM');

  const formatTimeStr = (h: number, m: number, s: number): string => {
    const base = showSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`;
    if (!use12Hours) return base;
    const h12 = h % 12 || 12;
    const base12 = showSeconds ? `${pad2(h12)}:${pad2(m)}:${pad2(s)}` : `${pad2(h12)}:${pad2(m)}`;
    return `${base12} ${h >= 12 ? pmLabel : amLabel}`;
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
  // Controlled vs uncontrolled open -- see TimePickerBase.
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpenControlled = controlledOpen !== undefined;
  const isOpen = isOpenControlled ? controlledOpen! : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const displayValue = isControlled
    ? [parseTime(value?.[0]), parseTime(value?.[1])] as TimeTuple
    : internalValue;

  const startText = displayValue[0] ? formatTimeStr(displayValue[0].h, displayValue[0].m, displayValue[0].s) : '';
  const endText = displayValue[1] ? formatTimeStr(displayValue[1].h, displayValue[1].m, displayValue[1].s) : '';

  // Meridiem follows the ACTIVE input's selection (TimePickerBase law).
  const [meridiemState, setMeridiemState] = useState<'am' | 'pm'>('am');
  const activeTime0 = activeInput === 'start' ? displayValue[0] : displayValue[1];
  const meridiem: 'am' | 'pm' = activeTime0 ? (activeTime0.h >= 12 ? 'pm' : 'am') : meridiemState;

  const disabledConfig = disabledTime?.();
  const disabledHours = new Set(disabledConfig?.disabledHours?.() ?? []);
  const disabledMinutes = new Set(disabledConfig?.disabledMinutes?.(activeTime0?.h ?? 0) ?? []);
  const disabledSeconds = new Set(disabledConfig?.disabledSeconds?.(activeTime0?.h ?? 0, activeTime0?.m ?? 0) ?? []);
  const hourOptions = buildTimeOptions(use12Hours ? HOURS_12 : HOURS_24, hourStep, disabledHours, hideDisabledOptions);
  const minuteOptions = buildTimeOptions(SIXTY, minuteStep, disabledMinutes, hideDisabledOptions);
  const secondOptions = buildTimeOptions(SIXTY, secondStep, disabledSeconds, hideDisabledOptions);

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
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpen]);

  // Escape: closes and RETURNS FOCUS to the range input currently being
  // filled (DatePicker precedent; the panel unmounts on close).
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
  }, [isOpen, activeInput, setOpen]);

  const commitTime = useCallback((which: 'start' | 'end', time: { h: number; m: number; s: number }) => {
    let newValue = which === 'start'
      ? [time, displayValue[1]] as TimeTuple
      : [displayValue[0], time] as TimeTuple;
    // Contract `order`: with both ends set, keep the tuple chronological.
    // Off by default, so existing consumers see no behavior change.
    if (order && newValue[0] && newValue[1]) {
      const a = newValue[0].h * 3600 + newValue[0].m * 60 + newValue[0].s;
      const b = newValue[1].h * 3600 + newValue[1].m * 60 + newValue[1].s;
      if (a > b) newValue = [newValue[1], newValue[0]];
    }
    if (!isControlled) setInternalValue(newValue);
    onChange?.(
      [createDate(newValue[0]), createDate(newValue[1])],
      [
        newValue[0] ? formatTimeStr(newValue[0].h, newValue[0].m, newValue[0].s) : '',
        newValue[1] ? formatTimeStr(newValue[1].h, newValue[1].m, newValue[1].s) : '',
      ]
    );
  }, [displayValue, isControlled, onChange, showSeconds, order, use12Hours, amLabel, pmLabel]);

  // Panel selections arrive in DISPLAY units -- see TimePickerBase.
  const handlePanelSelect = useCallback((hDisplay: number, m: number, s: number) => {
    commitTime(activeInput, {
      h: use12Hours ? to24Hour(hDisplay, meridiem) : hDisplay,
      m,
      s,
    });
  }, [activeInput, commitTime, use12Hours, meridiem]);

  const handleMeridiemChange = useCallback((mer: 'am' | 'pm') => {
    setMeridiemState(mer);
    if (activeTime0) {
      commitTime(activeInput, { h: to24Hour(activeTime0.h % 12 || 12, mer), m: activeTime0.m, s: activeTime0.s });
    }
  }, [activeTime0, activeInput, commitTime]);

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
    commitTime(activeInput, { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() });
    setOpen(false);
    // Focus return (APG): the panel unmounts on close; the range input just
    // filled owns the return focus (the Escape path does the same).
    triggerRef.current
      ?.querySelector<HTMLElement>(`[data-range-input='${activeInput}']`)
      ?.focus();
  }, [commitTime, activeInput, setOpen]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) setInternalValue([null, null]);
    onChange?.(null, ['', '']);
  }, [isControlled, onChange]);

  const rangeSize = toCanonicalSize(size) ?? 'md';

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
          data-variant={effectiveVariant}
          data-active={(activeInput === 'start' && isOpen) || undefined}
          data-size={rangeSize}
          // `boxSizing` stays inline (pinned pattern); sizing is skin-owned
          // via `data-size`.
          style={{ boxSizing: 'border-box' }}
          value={startText}
          disabled={disabled}
          placeholder={placeholder[0]}
          onChange={handleInputChange('start')}
          onClick={() => {
            if (!disabled && !readOnly) { setActiveInput('start'); setOpen(true); }
          }}
          role="combobox"
          aria-expanded={isOpen && activeInput === 'start'}
          aria-haspopup="dialog"
          aria-label={placeholder[0]}
        />
        <span data-part="separator" aria-hidden="true">{separator}</span>
        <input
          type="text"
          readOnly
          data-part="trigger-input"
          data-range-input="end"
          data-status={status ?? 'default'}
          data-variant={effectiveVariant}
          data-active={(activeInput === 'end' && isOpen) || undefined}
          data-size={rangeSize}
          style={{ boxSizing: 'border-box' }}
          value={endText}
          disabled={disabled}
          placeholder={placeholder[1]}
          onChange={handleInputChange('end')}
          onClick={() => {
            if (!disabled && !readOnly) { setActiveInput('end'); setOpen(true); }
          }}
          role="combobox"
          aria-expanded={isOpen && activeInput === 'end'}
          aria-haspopup="dialog"
          aria-label={placeholder[1]}
        />
        {allowClear && (startText || endText) && !disabled && (
          <button
            type="button"
            data-part="clear-button"
            onClick={handleClear}
            tabIndex={-1}
            aria-label={tOr('timepicker.clear', 'Clear')}
          >
            {clearIcon ?? <ActionCloseIcon decorative size={12} />}
          </button>
        )}
      </div>

      {/* Shared overlay substrate -- see TimePickerBase. */}
      {isOpen && (
        <Portal>
          <PortalScope snapshot={portalScope}>
            <div
              ref={panelRef}
              data-part="popup"
              data-placement={placement}
              className={popupClassName}
              style={{ top: pos.top, left: pos.left, ...popupStyle }}
            >
              <TimePanel
                hours={activeTime0?.h ?? 0}
                minutes={activeTime0?.m ?? 0}
                seconds={activeTime0?.s ?? 0}
                showHour={showHour !== false}
                showMinute={showMinute !== false}
                showSeconds={showSeconds}
                use12Hours={use12Hours}
                meridiem={meridiem}
                hourOptions={hourOptions}
                minuteOptions={minuteOptions}
                secondOptions={secondOptions}
                amLabel={amLabel}
                pmLabel={pmLabel}
                meridiemLabel={meridiemLabel}
                onSelect={handlePanelSelect}
                onMeridiemChange={handleMeridiemChange}
                onNowClick={handleNowClick}
                showNow={showNow}
                cellRender={cellRender}
                renderExtraFooter={renderExtraFooter}
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
