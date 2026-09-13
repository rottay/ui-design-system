'use client';

/**
 * @fileoverview TimePicker Modern Engine -- governed column panel with a
 * read-only text trigger. Hour/minute/second columns resolve their option
 * domains from the contract (steps, disabledTime, hideDisabledOptions,
 * show* flags); 12-hour mode adds a catalog-driven AM/PM meridiem strip.
 * Keyboard: per-column roving tab stop; arrows, edges and type-ahead come from
 * the listbox kernel and the column hop from roving-focus's reading direction.
 * The panel is placed by the field overlay kernel; the skin owns every paint.
 *
 * B5-03: the trigger clock glyph resolves through the semantic icon corpus
 * (`time.timestamp`); the local SVG is retired.
 *
 * @module TimePicker/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { partAttributes, useFieldAction, useInteractionState } from '@/foundation/behavior';
import { isTypeaheadKey, resolveListboxTarget, resolveTypeaheadTarget } from '../../../../runtime/collection/listbox';
import { resolveNavigationIntent, resolveReadingDirectionIsRtl } from '../../../../runtime/collection/roving-focus';
import type { OverlayPlacement } from '../../../../runtime/overlay/positioning';
import type { TypeaheadState } from '../../../../runtime/collection/typeahead';
import type { TimePickerProps, TimeRangePickerProps, TimePickerPlacement } from '../../contracts';
import {
  FieldOverlayPanel,
  useFieldOverlay,
} from '../../../../runtime/overlay/field-overlay';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { TimeTimestampIcon } from '@/graphics/icons/semantic/generated/roles/time-timestamp';

/** The contract's corner placements in the overlay kernel's logical vocabulary. */
const OVERLAY_PLACEMENT: Readonly<Record<TimePickerPlacement, OverlayPlacement>> = {
  bottomLeft: 'bottom-start',
  bottomRight: 'bottom-end',
  topLeft: 'top-start',
  topRight: 'top-end',
};

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

const columnTypeahead = new WeakMap<HTMLElement, TypeaheadState>();

/**
 * APG column keyboard contract: each column is a listbox strip with a roving tab
 * stop (the selected option). The listbox kernel moves focus with the arrows,
 * edges and type-ahead; the horizontal intent hops to the sibling column in the
 * reading direction. Focus moves only; selection commits on activation.
 */
function handleColumnKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
  const column = event.currentTarget;
  const target = event.target as HTMLElement | null;
  const current = target?.closest<HTMLButtonElement>('[data-part="time-option"]');
  if (!current) return;
  const options = Array.from(column.querySelectorAll<HTMLButtonElement>('[data-part="time-option"]'));
  const activeIndex = options.indexOf(current);
  const isItemSelectable = (index: number) => !options[index]?.disabled;

  const vertical = resolveListboxTarget(event.key, { activeIndex, itemCount: options.length, isItemSelectable });
  if (vertical !== null) {
    event.preventDefault();
    if (vertical >= 0) options[vertical]?.focus();
    return;
  }

  const intent = resolveNavigationIntent(event.key, { orientation: 'horizontal', rtl: resolveReadingDirectionIsRtl(column) });
  if (intent === 'next' || intent === 'previous') {
    const panel = column.closest('[data-part="panel"]');
    const columns = Array.from(panel?.querySelectorAll<HTMLElement>('[data-part="time-column"]') ?? []);
    const sibling = columns[columns.indexOf(column) + (intent === 'next' ? 1 : -1)];
    if (!sibling) return;
    event.preventDefault();
    const stop = sibling.querySelector<HTMLElement>('[data-part="time-option"][data-selected="true"]')
      ?? sibling.querySelector<HTMLElement>('[data-part="time-option"]:not([disabled])');
    stop?.focus();
    return;
  }

  if (!isTypeaheadKey(event)) return;
  const result = resolveTypeaheadTarget(columnTypeahead.get(column) ?? { buffer: '', lastKeyTime: 0 }, event.key, {
    activeIndex,
    itemCount: options.length,
    isItemSelectable,
    getItemText: (index) => options[index]?.textContent ?? undefined,
    now: Date.now(),
  });
  columnTypeahead.set(column, result.state);
  if (result.index >= 0) {
    event.preventDefault();
    options[result.index]?.focus();
  }
}

interface TimeOptionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  part: 'time-option' | 'now-button';
}

/** A column cell or the Now action whose hover, focus and disabled state the interaction kernel decides. */
function TimeOptionButton({ part, disabled, onFocus, onBlur, children, ...rest }: TimeOptionButtonProps) {
  const cell = useInteractionState({ disabled });
  return (
    <button
      type="button"
      disabled={disabled}
      {...rest}
      {...partAttributes(part, cell.state)}
      onPointerEnter={cell.handlers.onPointerEnter}
      onPointerLeave={cell.handlers.onPointerLeave}
      onPointerDown={cell.handlers.onPointerDown}
      onPointerUp={cell.handlers.onPointerUp}
      onFocus={(event) => {
        cell.handlers.onFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        cell.handlers.onBlur(event);
        onBlur?.(event);
      }}
    >
      {children}
    </button>
  );
}

function TimeClearButton({ label, onClear, children }: { label: string; onClear: (event: React.MouseEvent) => void; children: React.ReactNode }) {
  const action = useFieldAction();
  return (
    <button
      type="button"
      onClick={onClear}
      tabIndex={-1}
      aria-label={label}
      {...partAttributes('clear-button', action.state)}
      onPointerEnter={action.handlers.onPointerEnter}
      onPointerLeave={action.handlers.onPointerLeave}
      onPointerDown={action.handlers.onPointerDown}
      onPointerUp={action.handlers.onPointerUp}
      onPointerCancel={action.handlers.onPointerCancel}
      onFocus={action.handlers.onFocus}
      onBlur={action.handlers.onBlur}
    >
      {children}
    </button>
  );
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
      className="ds-time-picker-panel"
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
              role="listbox"
              aria-label={col.label}
              onKeyDown={handleColumnKeyDown}
            >
              {col.options.map((opt) => (
                <TimeOptionButton
                  key={opt.value}
                  part="time-option"
                  role="option"
                  aria-selected={opt.value === col.selected}
                  data-selected={opt.value === col.selected || undefined}
                  data-disabled={opt.disabled || undefined}
                  disabled={opt.disabled || undefined}
                  aria-disabled={opt.disabled || undefined}
                  tabIndex={opt.value === col.selected ? 0 : -1}
                  onClick={() => commitOption(col.key, opt.value)}
                >
                  {cellRender ? cellRender(opt.value, { type: col.key }) : pad2(opt.value)}
                </TimeOptionButton>
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
              role="listbox"
              aria-label={meridiemLabel}
              onKeyDown={handleColumnKeyDown}
            >
              {(['am', 'pm'] as const).map((mer) => (
                <TimeOptionButton
                  key={mer}
                  part="time-option"
                  role="option"
                  aria-selected={meridiem === mer}
                  data-selected={meridiem === mer || undefined}
                  tabIndex={meridiem === mer ? 0 : -1}
                  onClick={() => onMeridiemChange(mer)}
                >
                  {mer === 'am' ? amLabel : pmLabel}
                </TimeOptionButton>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Now button */}
      {showNow && (
        <div data-part="footer">
          <TimeOptionButton part="now-button" onClick={onNowClick}>
            {tOr('timepicker.now', 'Now')}
          </TimeOptionButton>
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
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  // The panel carries both this engine's measuring ref and the kernel's
  // containment element.
  const setPanelNode = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    setPanelEl(node);
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);
  // The panel leaves the trigger's DOM ancestry when it portals, so the
  // tenant/locale scope has to be re-stamped around it. The kernel
  // needs the anchor as state (a ref would not re-render when it lands), so
  // the trigger publishes to both.
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
    (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setAnchorEl(node);
  }, []);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );


  // One overlay contract: the kernel's shared Escape router and shared
  // capture-phase outside-pointer watcher replace this engine's two private
  // document listeners. Both dismissals RETURN FOCUS to the trigger input --
  // the panel unmounts on close, so focus would otherwise drop to <body>. The
  // measured placement below stays this engine's own, so the surface is
  // declared `viewport` and the kernel contributes the canonical band.
  const dismissPanel = useCallback(() => {
    setOpen(false);
    inputRef.current?.focus();
  }, [setOpen]);

  const overlay = useFieldOverlay({
    kind: 'dropdown',
    open: isOpen,
    anchor: anchorEl,
    panel: panelEl,
    placement: OVERLAY_PLACEMENT[placement],
    offset: 4,
    flip: true,
    modal: true,
    lockScroll: false,
    restoreFocus: false,
    onDismiss: dismissPanel,
    dismissOnOutsidePointer: true,
  });

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

  const trigger = useInteractionState({ disabled });
  const triggerSize = toCanonicalSize(size) ?? 'md';

  return (
    <>
      <div ref={setTriggerRef} data-part="root" className={`ds-time-picker ds-time-picker--modern ${className}`} style={style}>
        <input
          ref={setInputRef}
          type="text"
          readOnly
          {...partAttributes('trigger-input', trigger.state)}
          onPointerEnter={trigger.handlers.onPointerEnter}
          onPointerLeave={trigger.handlers.onPointerLeave}
          onPointerDown={trigger.handlers.onPointerDown}
          onPointerUp={trigger.handlers.onPointerUp}
          onFocus={trigger.handlers.onFocus}
          onBlur={trigger.handlers.onBlur}
          data-status={status ?? 'default'}
          data-variant={effectiveVariant}
          data-size={triggerSize}
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
          // The placeholder is only a LAST-RESORT name: with an `id` an
          // external <label for> owns the name, and aria-label would outrank it.
          aria-label={id ? undefined : placeholder}
        />
        {allowClear && displayText && !disabled && (
          <TimeClearButton label={tOr('timepicker.clear', 'Clear')} onClear={handleClear}>
            {clearIcon ?? <ActionCloseIcon decorative size={14} />}
          </TimeClearButton>
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
          inside a `showModal()` dialog. The kernel carries the tenant/
          theme/direction lineage across the portal boundary. */}
      {isOpen && (
        <FieldOverlayPanel overlay={overlay}>
            <div
              {...overlay.panelProps}
              ref={setPanelNode}
              data-part="popup"
              data-placement={placement}
              className={popupClassName}
              style={{
                ...overlay.panelProps.style,
                ...popupStyle,
              }}
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
        </FieldOverlayPanel>
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
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  // The panel carries both this engine's measuring ref and the kernel's
  // containment element.
  const setPanelNode = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    setPanelEl(node);
  }, []);
  // See TimePickerBase: the portaled panel needs the anchor as state so the
  // scope snapshot re-resolves once the trigger lands. The callback must be
  // stable -- an inline ref arrow is re-created every render, so React would
  // detach (null) and re-attach it each commit and the setState would loop.
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
    (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setAnchorEl(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [ref]);


  // One overlay contract (TimePickerBase rationale above). Dismissal returns
  // focus to the range input currently being filled.
  const dismissPanel = useCallback(() => {
    setOpen(false);
    triggerRef.current
      ?.querySelector<HTMLElement>(`[data-range-input='${activeInput}']`)
      ?.focus();
  }, [setOpen, activeInput]);

  const overlay = useFieldOverlay({
    kind: 'dropdown',
    open: isOpen,
    anchor: anchorEl,
    panel: panelEl,
    placement: OVERLAY_PLACEMENT[placement],
    offset: 4,
    flip: true,
    modal: true,
    lockScroll: false,
    restoreFocus: false,
    onDismiss: dismissPanel,
    dismissOnOutsidePointer: true,
  });

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

  const startField = useInteractionState({ disabled });
  const endField = useInteractionState({ disabled });
  const rangeSize = toCanonicalSize(size) ?? 'md';

  return (
    <>
      <div
        ref={setTriggerRef}
        data-part="root"
        className={`ds-time-picker-range ds-time-picker-range--modern ${className}`}
        style={style}
        id={id}
      >
        <input
          type="text"
          readOnly
          {...partAttributes('trigger-input', startField.state)}
          onPointerEnter={startField.handlers.onPointerEnter}
          onPointerLeave={startField.handlers.onPointerLeave}
          onPointerDown={startField.handlers.onPointerDown}
          onPointerUp={startField.handlers.onPointerUp}
          onFocus={startField.handlers.onFocus}
          onBlur={startField.handlers.onBlur}
          data-range-input="start"
          data-status={status ?? 'default'}
          data-variant={effectiveVariant}
          data-active={(activeInput === 'start' && isOpen) || undefined}
          data-size={rangeSize}
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
          {...partAttributes('trigger-input', endField.state)}
          onPointerEnter={endField.handlers.onPointerEnter}
          onPointerLeave={endField.handlers.onPointerLeave}
          onPointerDown={endField.handlers.onPointerDown}
          onPointerUp={endField.handlers.onPointerUp}
          onFocus={endField.handlers.onFocus}
          onBlur={endField.handlers.onBlur}
          data-range-input="end"
          data-status={status ?? 'default'}
          data-variant={effectiveVariant}
          data-active={(activeInput === 'end' && isOpen) || undefined}
          data-size={rangeSize}
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
          <TimeClearButton label={tOr('timepicker.clear', 'Clear')} onClear={handleClear}>
            {clearIcon ?? <ActionCloseIcon decorative size={12} />}
          </TimeClearButton>
        )}
      </div>

      {/* Shared overlay substrate -- see TimePickerBase. */}
      {isOpen && (
        <FieldOverlayPanel overlay={overlay}>
            <div
              {...overlay.panelProps}
              ref={setPanelNode}
              data-part="popup"
              data-placement={placement}
              className={popupClassName}
              style={{
                ...overlay.panelProps.style,
                ...popupStyle,
              }}
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
        </FieldOverlayPanel>
      )}
    </>
  );
});

TimeRangePicker.displayName = 'TimePicker.RangePicker.Modern';

export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
