/**
 * @fileoverview Segmented Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Segmented component.
 * A lightweight, utility-first alternative to the Classic engine.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine built on DaisyUI and Tailwind CSS.
 * It provides a smaller bundle size compared to Classic while maintaining
 * core segmented control functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DaisyUI component tokens
 * - Join component pattern for grouped buttons
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DaisyUI theme is preferred
 *
 * **Multi-Tenant Theming:**
 * Modern uses DaisyUI's color system with CSS custom properties.
 * Tenant themes can override:
 * - `--btn-color`: Button text color
 * - `--p`: Primary color for active state
 * - Other DaisyUI tokens
 *
 * **CSS Classes Used:**
 * | Class | Purpose |
 * |-------|---------|
 * | `join` | Container for joined buttons |
 * | `join-item` | Individual button in group |
 * | `btn` | Base button styling |
 * | `btn-sm/md/lg` | Size variants |
 * | `btn-active` | Active state |
 * | `btn-primary` | Primary color variant |
 * | `btn-disabled` | Disabled state |
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
const SIZE_CLASSES = {
  /** Compact size for toolbars */
  small: 'btn-sm',
  /** Standard size (default) */
  middle: 'btn-md',
  /** Large size for prominent actions */
  large: 'btn-lg',
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

    /** Resolve size-specific CSS class */
    const sizeClass = SIZE_CLASSES[size!] || SIZE_CLASSES.middle;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`join ${block ? 'w-full' : ''} ${className}`}
        style={style}
      >
        {normalizedOptions.map((opt) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={String(opt.value)}
              type="button"
              // btn-active + btn-primary together give the selected option a
              // filled primary appearance. btn-disabled greys out and prevents
              // pointer events at the DaisyUI level (complements the native disabled attr).
              className={`join-item btn ${sizeClass} ${isActive ? 'btn-active btn-primary' : ''} ${isDisabled ? 'btn-disabled' : ''} ${opt.className || ''}`}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
            >
              {opt.icon && <span className="mr-1">{opt.icon}</span>}
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
