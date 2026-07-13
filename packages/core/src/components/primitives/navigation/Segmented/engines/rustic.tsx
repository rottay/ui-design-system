/**
 * @fileoverview Segmented Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Segmented component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless, zero-dependency engine that uses only vanilla
 * HTML, CSS, and React. It provides the smallest bundle size and maximum
 * control over styling and behavior.
 *
 * **Key Features:**
 * - Zero external dependencies (no UI library)
 * - Maximum accessibility control
 * - Smallest bundle footprint
 * - Full CSS custom property support
 * - Semantic HTML structure
 *
 * **When to Use Rustic:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Rustic heavily uses CSS custom properties for theming.
 * Override these properties in your tenant theme:
 * - Background color: #f5f5f5 (container), #fff (active)
 * - Active color: #1677ff
 * - Shadow: 0 2px 8px rgba(0,0,0,0.08)
 *
 * **Size Mapping:**
 * | Size | Padding | Font Size |
 * |------|---------|-----------|
 * | small | 4px 8px | 12px |
 * | middle | 6px 12px | 14px |
 * | large | 8px 16px | 16px |
 *
 * @example Basic Usage
 * ```tsx
 * import { Segmented } from '@rottay/design-system';
 *
 * <Segmented
 *   engine="rustic"
 *   options={['Daily', 'Weekly', 'Monthly']}
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * <Segmented
 *   engine="rustic"
 *   options={['Option A', 'Option B']}
 *   style={{
 *     backgroundColor: '#e0e0e0',
 *     borderRadius: '8px',
 *   }}
 * />
 * ```
 *
 * @example With Icons
 * ```tsx
 * <Segmented
 *   engine="rustic"
 *   options={[
 *     { label: 'List', value: 'list', icon: <ListIcon /> },
 *     { label: 'Grid', value: 'grid', icon: <GridIcon /> },
 *   ]}
 *   value={viewMode}
 *   onChange={setViewMode}
 * />
 * ```
 *
 * @see {@link SegmentedProps} - Component props interface
 * @see {@link ClassicSegmented} - Ant Design alternative
 * @see {@link ModernSegmented} - DaisyUI alternative
 * @module Segmented/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState } from 'react';
import type { SegmentedProps, SegmentedOption } from '../Segmented.types';
import { SEGMENTED_DEFAULTS } from '../Segmented.types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Inline styles for the Rustic segmented component.
 * Uses CSS-in-JS approach for zero-dependency styling.
 *
 * @remarks
 * These styles provide a clean, minimal appearance that can be
 * customized via the `style` prop or CSS custom properties.
 *
 * @internal
 */
const styles = {
  /** Container wrapper - inline flex with rounded background */
  container: {
    display: 'inline-flex',
    backgroundColor: 'var(--ds-segmented-bg, var(--ds-color-neutral-100, #f5f5f5))',
    borderRadius: 'var(--ds-segmented-radius, 8px)',
    padding: 'var(--ds-segmented-padding, 2px)',
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
    borderRadius: 'var(--ds-segmented-item-radius, 4px)',
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

  /** Active/selected state - elevated with primary color */
  buttonActive: {
    backgroundColor: 'var(--ds-segmented-active-bg, #fff)',
    boxShadow: 'var(--ds-segmented-active-shadow, 0 2px 8px rgba(0,0,0,0.08))',
    color: 'var(--ds-segmented-active-color, var(--ds-color-primary-500, #1677ff))',
    fontWeight: 500,
  } as React.CSSProperties,

  /** Disabled state - muted appearance */
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Segmented component.
 *
 * @description
 * Pure vanilla implementation using only HTML, CSS, and React.
 * Provides complete control over styling through inline styles.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses flexbox for layout structure
 * - Supports both controlled and uncontrolled modes
 * - Normalizes simple options to SegmentedOption objects
 * - Handles individual option disabled states
 *
 * **Accessibility Features:**
 * - Native `<button>` elements for keyboard support
 * - `disabled` attribute for disabled options
 * - Visual feedback for active and hover states
 * - Focus styles via browser defaults
 *
 * **Styling Approach:**
 * Uses inline styles with a CSS-in-JS pattern. All styles are defined
 * in the `styles` object and combined based on component state.
 *
 * @param props - {@link SegmentedProps}
 * @returns The rendered vanilla Segmented control
 *
 * @example
 * ```tsx
 * <RusticSegmented
 *   options={['Daily', 'Weekly', 'Monthly']}
 *   value={period}
 *   onChange={(val) => setPeriod(val)}
 *   size="middle"
 *   block={false}
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
        // Merge container base, optional block-mode override, and consumer styles.
        // Spread order ensures consumer `style` prop wins over internal defaults.
        style={{ ...styles.container, ...(block ? styles.containerBlock : {}), ...style }}
        data-part="root"
      >
        {normalizedOptions.map((opt) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={String(opt.value)}
              type="button"
              // Style cascade: base button -> size -> active overlay -> disabled overlay.
              // Later spreads override earlier ones, so disabled always takes effect.
              style={{
                ...styles.button,
                ...sizeStyles,
                ...(isActive ? styles.buttonActive : {}),
                ...(isDisabled ? styles.buttonDisabled : {}),
              }}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
              data-part="option"
              data-selected={isActive}
              data-disabled={isDisabled || undefined}
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
Segmented.displayName = 'Segmented.Rustic';

export default Segmented;
