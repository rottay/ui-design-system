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
 * Keyboard contract (hand-rolled per family, APG radiogroup): one roving tab
 * stop (the selected option, else the first enabled one), Arrow keys move and
 * select (Left/Right mirror in RTL), Home/End jump to the edges, disabled
 * options are skipped.
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

import React, { useRef, useState } from "react";
import type { SegmentedProps, SegmentedOption } from "../../contracts";
import { SEGMENTED_DEFAULTS } from "../../contracts";

/**
 * Reading-direction probe for the RTL-mirrored arrow contract. The nearest
 * explicit `dir` wins; otherwise the document direction applies.
 */
function isRtlContext(el: HTMLElement): boolean {
  const scoped = el.closest("[dir]");
  if (scoped) return scoped.getAttribute("dir") === "rtl";
  return document.documentElement.dir === "rtl";
}

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
 * - Roving tabindex + Arrow/Home/End navigation (RTL-mirrored), hand-rolled
 *   per family (no shared collection hook exists in this wave)
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
    // Roving tabindex + arrow navigation (APG radiogroup)
    // ---------------------------------------------------------------------------

    /** Live option buttons, in DOM order, for focus movement. */
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    /** Indexes of the options the user can actually reach. */
    const enabledIndexes = normalizedOptions
      .map((opt, index) => (disabled || opt.disabled ? -1 : index))
      .filter((index) => index >= 0);

    const selectedIndex = normalizedOptions.findIndex((opt) => opt.value === currentValue);

    /** The one tab stop: the selected option when reachable, else the first enabled. */
    const tabStopIndex =
      selectedIndex >= 0 && enabledIndexes.includes(selectedIndex)
        ? selectedIndex
        : enabledIndexes[0] ?? -1;

    /** Move focus to an enabled option and select it (arrows select, per APG). */
    const focusAndSelect = (index: number) => {
      optionRefs.current[index]?.focus();
      handleClick(normalizedOptions[index].value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const position = enabledIndexes.indexOf(index);
      if (position === -1) return;

      const last = enabledIndexes.length - 1;
      const rtl = isRtlContext(event.currentTarget);
      let target: number | undefined;

      switch (event.key) {
        case "ArrowRight":
          target = enabledIndexes[position + (rtl ? -1 : 1)] ?? enabledIndexes[rtl ? last : 0];
          break;
        case "ArrowLeft":
          target = enabledIndexes[position + (rtl ? 1 : -1)] ?? enabledIndexes[rtl ? 0 : last];
          break;
        case "ArrowDown":
          target = enabledIndexes[position + 1] ?? enabledIndexes[0];
          break;
        case "ArrowUp":
          target = enabledIndexes[position - 1] ?? enabledIndexes[last];
          break;
        case "Home":
          target = enabledIndexes[0];
          break;
        case "End":
          target = enabledIndexes[last];
          break;
        default:
          return;
      }

      event.preventDefault();
      if (target !== undefined && target !== index) focusAndSelect(target);
    };

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
        {normalizedOptions.map((opt, index) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={String(opt.value)}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              className={opt.className || undefined}
              onClick={() => handleClick(opt.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              disabled={isDisabled}
              tabIndex={index === tabStopIndex ? 0 : -1}
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
