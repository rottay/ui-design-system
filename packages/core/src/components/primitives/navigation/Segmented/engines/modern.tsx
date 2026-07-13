/**
 * @fileoverview Segmented Modern Engine - Rottay Design System
 * @description DS token inline-styled implementation of the Segmented component.
 *
 * @remarks
 * All styling uses DS token CSS custom properties (`--ds-*`). No DaisyUI
 * or Tailwind classes are used in runtime output. Segments render as an
 * inline-flex group with connected border-radius and an active primary
 * indicator.
 *
 * @example Basic Usage
 * ```tsx
 * import { Segmented } from '@rottay/design-system';
 *
 * <Segmented
 *   engine="modern"
 *   options={['Daily', 'Weekly', 'Monthly']}
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 *
 * @example Global Engine Configuration
 * ```tsx
 * import { EngineProvider, Segmented } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   <App>
 *     <Segmented options={['List', 'Grid']}>
 *       All segmented controls use Modern engine
 *     </Segmented>
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @example Block Mode
 * ```tsx
 * <Segmented
 *   engine="modern"
 *   options={['Option A', 'Option B', 'Option C']}
 *   block
 * />
 * ```
 *
 * @see {@link SegmentedProps} - Component props interface
 * @see {@link ClassicSegmented} - Ant Design alternative
 * @see {@link RusticSegmented} - Vanilla alternative
 * @see {@link https://daisyui.com/components/join} - DaisyUI Join docs
 * @module Segmented/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState } from 'react';
import type { SegmentedProps, SegmentedOption } from '../Segmented.types';
import { SEGMENTED_DEFAULTS } from '../Segmented.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size class mappings for Modern engine.
 * Maps semantic size names to DaisyUI button size classes.
 *
 * @internal
 */
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  /** Compact size for toolbars */
  small: { height: 32, padding: '0 12px', fontSize: 13 },
  /** Standard size (default) */
  middle: { height: 36, padding: '0 16px', fontSize: 14 },
  /** Large size for prominent actions */
  large: { height: 44, padding: '0 20px', fontSize: 16 },
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Segmented component.
 *
 * @description
 * Custom segmented implementation using DaisyUI classes and Tailwind utilities.
 * Uses the "join" component pattern for grouped buttons.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses DaisyUI's `join` component for button grouping
 * - Supports both controlled and uncontrolled modes
 * - Normalizes simple options to SegmentedOption objects
 * - Handles individual option disabled states
 *
 * **Accessibility:**
 * - Native button elements for keyboard support
 * - Visual feedback for active and disabled states
 * - Focus styles via Tailwind defaults
 *
 * @param props - {@link SegmentedProps}
 * @returns The rendered DaisyUI Segmented control
 *
 * @example
 * ```tsx
 * <ModernSegmented
 *   options={[
 *     { label: 'List', value: 'list', icon: <ListIcon /> },
 *     { label: 'Grid', value: 'grid', icon: <GridIcon /> },
 *   ]}
 *   value={viewMode}
 *   onChange={(val) => setViewMode(val)}
 *   size="middle"
 * />
 * ```
 */
export const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const {
      options,
      value,
      defaultValue,
      onChange,
      block = SEGMENTED_DEFAULTS.block,
      disabled = SEGMENTED_DEFAULTS.disabled,
      size = SEGMENTED_DEFAULTS.size,
      className = '',
      style,
    } = props;

    // ---------------------------------------------------------------------------
    // State Management
    // ---------------------------------------------------------------------------

    /**
     * Internal state for uncontrolled mode.
     * Only used when `value` prop is not provided.
     */
    const [internalValue, setInternalValue] = useState(defaultValue);

    /** Resolved current value - controlled or uncontrolled */
    const currentValue = value ?? internalValue;

    // ---------------------------------------------------------------------------
    // Options Normalization
    // ---------------------------------------------------------------------------

    /**
     * Normalize options array to SegmentedOption objects.
     * Converts simple strings/numbers to full option objects.
     */
    // Normalize primitive options (strings/numbers) into full option objects
    // so rendering logic can uniformly access `.label`, `.value`, `.icon`, etc.
    const normalizedOptions: SegmentedOption[] = options.map((opt) =>
      typeof opt === 'object' ? opt : { label: opt, value: opt }
    );

    // ---------------------------------------------------------------------------
    // Event Handlers
    // ---------------------------------------------------------------------------

    /**
     * Handle option click.
     * Updates internal state (uncontrolled) and calls onChange callback.
     */
    const handleClick = (optValue: string | number) => {
      if (disabled) return;
      if (value === undefined) setInternalValue(optValue);
      onChange?.(optValue);
    };

    // ---------------------------------------------------------------------------
    // Style Calculations
    // ---------------------------------------------------------------------------

    /** Resolve size-specific inline styles */
    const sizeStyle = SIZE_STYLES[size!] || SIZE_STYLES.middle;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={className}
        style={{ display: 'inline-flex', borderRadius: 'var(--ds-radius-md)', overflow: 'hidden', border: '1px solid var(--ds-color-border)', ...(block ? { width: '100%' } : {}), ...style }}
        data-part="root"
      >
        {normalizedOptions.map((opt) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={String(opt.value)}
              type="button"
              className={opt.className || undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                border: 'none',
                borderRadius: 0,
                fontWeight: isActive ? 600 : 400,
                ...sizeStyle,
                ...(isActive
                  ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' }
                  : { background: 'transparent', color: 'var(--ds-color-text-primary)' }),
                ...(isDisabled ? { opacity: 0.5, pointerEvents: 'none' as const } : {}),
              }}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
              data-part="option"
              data-selected={isActive}
              data-disabled={isDisabled || undefined}
            >
              {opt.icon && <span className="mr-1" data-part="icon">{opt.icon}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Segmented.displayName = 'Segmented.Modern';

export default Segmented;
