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
import { revealSelectedOption } from "../../runtime/reveal";
import { composeRefs } from "@/ui/primitives/foundation/compose-refs";

/**
 * Pre-paint on the client, inert on the server. The reveal must land BEFORE the
 * browser paints or the user sees the control jump; `useEffect` fires after
 * paint and produces exactly that flash. React warns on `useLayoutEffect`
 * during SSR, so the server takes the no-op branch — there is no layout to
 * measure there anyway.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
      // This family reveals the active option itself, so the reveal must be the
      // SINGLE scroll authority: native focus-scroll walks ancestors this
      // component deliberately never touches. Declaring both is the opt-in
      // contract; declaring only `ownsReveal` warns in development.
      ownsReveal: true,
      preventScroll: true,
      // APG radiogroup: arrows move the selection with the focus.
      onActiveChange: (id) => {
        const option = normalizedOptions.find((opt) => String(opt.value) === id);
        if (option) handleClick(option.value);
      },
    });

    // ---------------------------------------------------------------------------
    // Reveal the selected option inside the scrollport.
    //
    // The root scrolls rather than clipping (see the skin's overflow-x rule and
    // its stated pagination.css precedent). That CSS half was carried over; the
    // behavioural half was not, and the gap is a real defect measured at 280px:
    // arrow navigation moves selection Review -> Offer -> Closed and correctly
    // sets aria-checked, tabIndex and :focus-visible, but the scrollport stays
    // at scrollLeft 0 of a possible 54, so `Closed` sits at 254..318 while the
    // visible root is 12..268. Keyboard could focus and SELECT an option the
    // user cannot see.
    //
    // Native focus-scroll does not cover this: it fires only when DOM focus
    // moves, so a controlled `value` change from outside the component strands a
    // newly selected option off-edge with nothing revealing it. The reveal must
    // therefore key off the ACTIVE VALUE, not off focus.
    //
    // TWO CORRECTIONS TO THE FIRST VERSION OF THIS FIX, both found by audit and
    // both invisible from the edit site:
    //
    //   1. It called `selected.scrollIntoView({ block: 'nearest', inline:
    //      'nearest' })`. `'nearest'` minimises each individual scroll but does
    //      NOT confine the operation to one element: scrollIntoView walks the
    //      whole ancestor chain and may scroll any scrollable ancestor and the
    //      document. A leaf control that yanks the page on selection is a worse
    //      defect than the one being fixed, and whether it happens depends on
    //      the consuming page, so no amount of care in this file would reveal
    //      it. The reveal is now a scrollport-local delta applied only to this
    //      root's own scrollLeft — see `runtime/reveal`. Nothing else is written
    //      to, so nothing else can move, and the block axis is never touched
    //      because the skin hides it and a hidden overflow the user cannot
    //      scroll back is a one-way shift. (The Tabs family still uses
    //      scrollIntoView and carries the same hazard; that is another family's
    //      file and is recorded rather than changed here.)
    //
    //   2. It depended on `currentValue` alone. Selection is not the only thing
    //      that can clip an option: if the container shrinks, or labels grow, or
    //      the option list changes while the selection stays put, the selected
    //      option is re-clipped with nothing to reveal it. The deps now include
    //      the option identity list, and a ResizeObserver watches the scrollport
    //      and EVERY option so a pure resize re-reveals — see the observer set
    //      below for why the selected option alone is not enough.
    //
    // It also ran in `useEffect`, i.e. after paint, so the reveal was a visible
    // jump. It is a layout effect now.
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    // Identity of the option set, not its object identity: a parent that
    // rebuilds the array every render must not retrigger, but a real change to
    // the values must. JSON serialization rather than a joined string: any
    // separator character CAN legally appear inside an option value, including
    // NUL — the first version of this line joined on a literal NUL on exactly
    // that false assumption, which both left a collision open and turned this
    // source file into a binary blob that `grep -I` silently skipped.
    const optionsKey = JSON.stringify(optionIds);

    // TWO EFFECTS, because they answer two different questions.
    //
    // The REVEAL runs on every committed render and takes no dependency array.
    // A dependency list can only name things observable during render, and the
    // reveal's correctness depends on things that are not: an ancestor toggling
    // `dir` on a locale change re-renders this component with an identical value
    // and identical options, yet the scroll ORIGIN and the physical placement of
    // every option have just inverted. Nothing resizes, so the observer never
    // fires either, and a deps-keyed effect would leave the selection stranded
    // at the mirrored offset. Running unconditionally cannot loop: the reveal
    // writes `scrollLeft`, and a scroll write schedules no React render.
    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (root) revealSelectedOption(root);
    });

    // The OBSERVER answers the opposite case — geometry changing with no render
    // at all — so it is keyed, to avoid tearing down and rebuilding a subscription
    // on every commit.
    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (!root || typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver(() => revealSelectedOption(root));

      // Observe the scrollport AND EVERY option, not just the selected one.
      // When a PRECEDING SIBLING grows it pushes the selected option along the
      // inline axis, so the selection is re-clipped while neither the root's nor
      // the selected option's own border box changes size. Nothing would fire. A
      // resize observer reports SIZE, never POSITION, so the only way to catch a
      // position change caused by a sibling is to watch the sibling.
      observer.observe(root);
      for (const option of root.querySelectorAll<HTMLElement>('[data-part="option"]')) {
        observer.observe(option);
      }

      return () => observer.disconnect();
    }, [currentValue, optionsKey]);

    // CROSS-VERSION callback-ref detach, composed by the shared `compose-refs`.
    //
    // The peer range is `^18 || ^19` and the majors disagree about what a
    // callback ref may RETURN: React 19 treats a returned function as the detach
    // cleanup, React 18.3 console.errors on any returned function. A previous
    // version of this wrapper always returned a cleanup, so every Segmented
    // under the supported React 18 peer logged an error even with no forwarded
    // ref at all. The composed callback now returns nothing on either major.
    //
    // It lives in a SHARED unit because that invariant cannot be asserted from a
    // test running on one React version — React owns the call site and discards
    // the return value — and because every family faces the identical question.
    // A per-family copy would mean each one re-deciding it independently.
    const forwardedCleanupRef = React.useRef<(() => void) | undefined>(undefined);

    const setRoot = React.useMemo(
      () =>
        composeRefs<HTMLDivElement>(ref, {
          own: rootRef,
          forwardedCleanup: forwardedCleanupRef,
        }),
      [ref]
    );

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={setRoot}
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
