/**
 * @fileoverview Segmented Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Segmented component.
 *
 * @remarks
 * The engine stamps anatomy (`data-part` hooks) and radiogroup state; the
 * modern skin (`modern/skin/segmented.css`) owns 100% of layout and paint.
 * No DaisyUI classes, no Tailwind utilities, no inline style objects.
 * Segments render as an inline-flex group with connected border-radius and a
 * framed selected indicator.
 *
 * Keyboard contract (APG radiogroup, owned by the roving-focus kernel): one
 * roving tab stop (the selected option, else the first enabled one), Arrow
 * keys move and select (Left/Right mirror in RTL), Home/End jump to the edges,
 * disabled options are skipped. The family owns the value; the kernel owns the
 * tab model and the direction mapping.
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
 * @module Segmented/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

"use client";

import React, { useState } from "react";
import type { SegmentedProps, SegmentedOption } from "../../contracts";
import { SEGMENTED_DEFAULTS } from "../../contracts";
import { useRovingFocus } from "@/ui/primitives/runtime/collection/roving-focus";

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Segmented component.
 *
 * @description
 * Custom segmented implementation on the token/skin channel: the engine owns
 * state, anatomy and the radiogroup keyboard contract; `segmented.css` owns
 * every painted pixel.
 *
 * @remarks
 * **Implementation Details:**
 * - Supports both controlled and uncontrolled modes
 * - Normalizes simple options to SegmentedOption objects
 * - Handles individual option disabled states
 * - Roving tabindex + Arrow/Home/End navigation (RTL-mirrored) delegated to
 *   the shared roving-focus kernel
 *
 * **Accessibility:**
 * - `role="radiogroup"` / `role="radio"` with `aria-checked`
 * - Single tab stop; arrows move focus AND select
 * - Focus ring painted by the skin on `:focus-visible`
 *
 * @param props - {@link SegmentedProps}
 * @returns The rendered Segmented control
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
      ariaLabel,
      className = "",
      style,
      "data-part": dataPart,
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
      typeof opt === "object" ? opt : { label: opt, value: opt }
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
    // Roving tabindex + arrow navigation (APG radiogroup, kernel-owned)
    // ---------------------------------------------------------------------------

    /**
     * The collection's identity is the option value, so the tab stop is
     * DERIVED state (the selection) and the kernel stays controlled: it
     * resolves and reports, the family owns the value.
     */
    const optionIds = normalizedOptions.map((opt) => String(opt.value));

    const roving = useRovingFocus({
      ids: optionIds,
      // Both axes navigate: the vertical arrows are the radiogroup's
      // direction-neutral pair, the horizontal ones mirror under RTL.
      orientation: "both",
      disabledIds: normalizedOptions
        .filter((opt) => disabled || opt.disabled)
        .map((opt) => String(opt.value)),
      activeId: currentValue === undefined ? undefined : String(currentValue),
      // APG radiogroup: arrows move the selection with the focus.
      onActiveChange: (id) => {
        const option = normalizedOptions.find((opt) => String(opt.value) === id);
        if (option) handleClick(option.value);
      },
    });

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-segmented rottay-segmented--modern ${className}`.trim()}
        style={style}
        data-part={dataPart ?? "root"}
        data-size={size}
        data-block={block || undefined}
        data-disabled={disabled || undefined}
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {normalizedOptions.map((opt) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;
          // Explicit attributes: the inline-paint ratchet fails closed on a
          // spread of an unresolvable call result; this bag is focus wiring
          // policed by the kernel's own zero-pinned counter.
          const itemProps = roving.getItemProps(String(opt.value));

          return (
            <button
              key={String(opt.value)}
              ref={itemProps.ref}
              tabIndex={itemProps.tabIndex}
              onKeyDown={itemProps.onKeyDown}
              onFocus={itemProps.onFocus}
              type="button"
              className={opt.className || undefined}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
              data-part="option"
              data-selected={isActive}
              data-disabled={isDisabled || undefined}
              role="radio"
              aria-checked={isActive}
              aria-label={opt.ariaLabel}
            >
              {opt.icon && <span data-part="icon">{opt.icon}</span>}
              <span data-part="label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Segmented.displayName = "Segmented.Modern";

export default Segmented;
