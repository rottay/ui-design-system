/**
 * @fileoverview Segmented Base Component - Rottay Design System
 * @description Base/fallback implementation for the Segmented component.
 * Provides a minimal structure when no engine is available.
 *
 * @remarks
 * The BaseSegmented serves as a fallback implementation used when:
 * - No engine is configured in the application
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires a minimal markup
 *
 * **Important:** This is NOT the recommended way to use the Segmented.
 * For full functionality, use the Segmented with an engine:
 * - **Titan**: Full-featured with Ant Design styling and animations
 * - **Hermes**: Utility-first with Tailwind/DaisyUI
 * - **Apollo**: Zero-dependency vanilla implementation
 *
 * **Multi-Tenant Integration:**
 * The base component respects tenant-specific CSS variables but
 * provides minimal styling. Engine implementations add the visual
 * polish expected in production applications.
 *
 * @example Direct Usage (Not Recommended)
 * ```tsx
 * import { BaseSegmented } from '@rottay/design-system/components/primitives/navigation/Segmented/base';
 *
 * // Only use directly for testing or edge cases
 * <BaseSegmented
 *   options={['Option A', 'Option B']}
 *   value="Option A"
 *   onChange={(val) => console.log(val)}
 * />
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Segmented } from '@rottay/design-system';
 *
 * // Always prefer the main Segmented export
 * <Segmented
 *   options={['Daily', 'Weekly', 'Monthly']}
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 *
 * @see {@link SegmentedProps} - Component props interface
 * @see {@link TitanSegmented} - Ant Design implementation
 * @see {@link HermesSegmented} - DaisyUI implementation
 * @see {@link ApolloSegmented} - Vanilla implementation
 * @module Segmented/Base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState } from 'react';
import type { SegmentedProps, SegmentedOption } from '../types';
import { SEGMENTED_DEFAULTS } from '../types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Inline styles for the base segmented component.
 * Uses CSS-in-JS approach for zero-dependency styling.
 *
 * @internal
 */
const styles = {
  /** Container wrapper - inline flex with rounded background */
  container: {
    display: 'inline-flex',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    padding: '2px',
  } as React.CSSProperties,

  /** Block mode - full width flex */
  containerBlock: {
    display: 'flex',
    width: '100%',
  } as React.CSSProperties,

  /** Base button styles - shared across all options */
  button: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  } as React.CSSProperties,

  /** Small size variant */
  buttonSmall: { padding: '4px 8px', fontSize: '12px' },

  /** Middle size variant (default) */
  buttonMiddle: { padding: '6px 12px', fontSize: '14px' },

  /** Large size variant */
  buttonLarge: { padding: '8px 16px', fontSize: '16px' },

  /** Active/selected state */
  buttonActive: {
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    color: '#1677ff',
    fontWeight: 500,
  } as React.CSSProperties,

  /** Disabled state */
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Base Segmented component - minimal fallback implementation.
 *
 * @description
 * Provides a functional segmented control with basic styling.
 * Uses inline styles for zero-dependency operation.
 *
 * @remarks
 * - Forwards ref to the container div for DOM access
 * - Supports both controlled and uncontrolled modes
 * - Normalizes simple options to SegmentedOption objects
 * - Handles individual option disabled states
 *
 * **Features:**
 * - Size variants (small, middle, large)
 * - Block mode for full-width layout
 * - Icon support in options
 * - Disabled state (global and per-option)
 *
 * @param props - {@link SegmentedProps}
 * @param ref - Forwarded ref to the container div
 * @returns A fully functional segmented control component
 *
 * @internal This component is primarily for internal use.
 * Use the main `Segmented` export for application development.
 */
export const BaseSegmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
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
      className,
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

    /** Resolve size-specific button styles */
    const sizeStyles = size === 'small' ? styles.buttonSmall : size === 'large' ? styles.buttonLarge : styles.buttonMiddle;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={className}
        style={{ ...styles.container, ...(block ? styles.containerBlock : {}), ...style }}
      >
        {normalizedOptions.map((opt) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={String(opt.value)}
              type="button"
              style={{
                ...styles.button,
                ...sizeStyles,
                ...(isActive ? styles.buttonActive : {}),
                ...(isDisabled ? styles.buttonDisabled : {}),
              }}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
BaseSegmented.displayName = 'BaseSegmented';

export default BaseSegmented;
