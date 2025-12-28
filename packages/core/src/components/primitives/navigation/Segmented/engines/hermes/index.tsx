/**
 * @fileoverview Segmented Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Segmented component.
 * A lightweight, utility-first alternative to the Titan engine.
 *
 * @remarks
 * **Engine Overview:**
 * Hermes is the utility-first engine built on DaisyUI and Tailwind CSS.
 * It provides a smaller bundle size compared to Titan while maintaining
 * core segmented control functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DaisyUI component tokens
 * - Join component pattern for grouped buttons
 *
 * **When to Use Hermes:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DaisyUI theme is preferred
 *
 * **Multi-Tenant Theming:**
 * Hermes uses DaisyUI's color system with CSS custom properties.
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
 *   engine="hermes"
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
 * <EngineProvider engine="hermes">
 *   <App>
 *     <Segmented options={['List', 'Grid']}>
 *       All segmented controls use Hermes engine
 *     </Segmented>
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @example Block Mode
 * ```tsx
 * <Segmented
 *   engine="hermes"
 *   options={['Option A', 'Option B', 'Option C']}
 *   block
 * />
 * ```
 *
 * @see {@link SegmentedProps} - Component props interface
 * @see {@link TitanSegmented} - Ant Design alternative
 * @see {@link ApolloSegmented} - Vanilla alternative
 * @see {@link https://daisyui.com/components/join} - DaisyUI Join docs
 * @module Segmented/Engines/Hermes
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState } from 'react';
import type { SegmentedProps, SegmentedOption } from '../../types';
import { SEGMENTED_DEFAULTS } from '../../types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size class mappings for Hermes engine.
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
 * Hermes Engine implementation of the Segmented component.
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
 * <HermesSegmented
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
Segmented.displayName = 'Segmented.Hermes';

export default Segmented;
