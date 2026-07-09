/**
 * @fileoverview usePulseOnChange - Rottay Design System
 * @description Tracks a watched value and exposes a key that increments each
 * time it changes, so a consumer can key a `.ds-pulse-changed` element
 * (`tokens/css/foundation/animations/transitions.css`) on it and get a fresh
 * single-shot flash on every change. A CSS `animation` does not restart when
 * a value changes on the SAME DOM node -- only on that node's insertion --
 * so the `key`-driven remount below IS the retrigger mechanism, not a
 * side effect of it.
 *
 * Pairs with the `.ds-pulse-changed` utility for live-updating cells/rows
 * (`patterns/data/data-table` live cells, `patterns/communication/live-feed`
 * rows): ONE subtle flash per change, intensity-tunable via
 * `--ds-effect-intensity`, never looping.
 *
 * @module Patterns/Foundation/Hooks/usePulseOnChange
 * @category Patterns
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

// ============================================================================
// Hook
// ============================================================================

export interface UsePulseOnChangeResult {
  /**
   * Pass as the `key` of the flashing element. Incremented once per detected
   * change to `value` (compared with `Object.is`, same semantics as React's
   * own dependency comparison).
   */
  pulseKey: number;

  /**
   * Whether `value` has changed at least once since mount. Gates the
   * `ds-pulse-changed` class so the flash never plays on initial mount/load
   * -- only on a genuine live update to an already-displayed value.
   */
  hasPulsed: boolean;
}

/**
 * Detects changes to `value` across renders and returns a remount key for
 * driving a single-shot `.ds-pulse-changed` flash. Does not itself render or
 * touch the DOM; see {@link PulseValue} for the ready-to-use wrapper.
 *
 * @example
 * ```tsx
 * const { pulseKey, hasPulsed } = usePulseOnChange(row.status);
 * return (
 *   <span key={pulseKey} className={hasPulsed ? 'ds-pulse-changed' : undefined}>
 *     {row.status}
 *   </span>
 * );
 * ```
 */
export function usePulseOnChange<T>(value: T): UsePulseOnChangeResult {
  const previousRef = useRef(value);
  const [pulseKey, setPulseKey] = useState(0);
  const [hasPulsed, setHasPulsed] = useState(false);

  useEffect(() => {
    if (!Object.is(previousRef.current, value)) {
      previousRef.current = value;
      setPulseKey((key) => key + 1);
      setHasPulsed(true);
    }
  }, [value]);

  return { pulseKey, hasPulsed };
}

// ============================================================================
// PulseValue wrapper
// ============================================================================

export interface PulseValueProps {
  /** The value to watch. Any change (by `Object.is`) triggers one flash. */
  value: unknown;

  /** Rendered content. Typically a formatted display of `value` itself. */
  children: ReactNode;

  /** Additional CSS class name, preserved alongside `ds-pulse-changed`. */
  className?: string;

  /** Inline styles applied to the wrapper. */
  style?: CSSProperties;
}

/**
 * Ready-to-use wrapper that applies {@link usePulseOnChange} for the common
 * case: wrap a table cell's rendered value and it flashes once whenever the
 * value changes. Intended for the `col.render` extensibility point on
 * `patterns/data/data-table` columns (`foundation/types.ts` `Column.render`)
 * and for `patterns/communication/live-feed` item rendering, without either
 * pattern's engine needing to know about the pulse mechanism itself.
 *
 * @example
 * ```tsx
 * columns={[
 *   column('price', 'Price', {
 *     render: (value) => <PulseValue value={value}>{formatCurrency(value)}</PulseValue>,
 *   }),
 * ]}
 * ```
 */
export function PulseValue({ value, children, className, style }: PulseValueProps): React.ReactElement {
  const { pulseKey, hasPulsed } = usePulseOnChange(value);
  const pulseClassName = hasPulsed ? `ds-pulse-changed${className ? ` ${className}` : ''}` : className;

  return (
    <span key={pulseKey} className={pulseClassName} style={style}>
      {children}
    </span>
  );
}

PulseValue.displayName = 'PulseValue';
