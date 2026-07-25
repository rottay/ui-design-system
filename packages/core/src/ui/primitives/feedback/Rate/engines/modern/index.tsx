/**
 * @fileoverview Rate Modern Engine - Rottay Design System
 * @description Token-driven, skin-painted implementation of the Rate component.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the premium Rottay-native engine. All paint lives in the
 * `rate.css` modern skin (layer `rottay-engines`), keyed on the public
 * anatomy (`data-part`, `data-size`, `data-state`, `data-focused`,
 * `data-disabled`, `data-readonly`); this file owns semantics and behavior
 * only. No DaisyUI classes are consumed -- the `rating`/`rating-{size}`
 * projection was drained in the K2-V pass, which also fixed the malformed
 * inline size hatch (`var(--ds-rate-md-size)px`, invalid CSS) that had made
 * Daisy the de-facto sizing owner.
 *
 * **Key Features:**
 * - Coherent APG radio-group composite (K2 remediation): `role="radiogroup"`
 *   root + `span role="radio"` stars -- no native radio inputs and no
 *   `<label>` semantics (a `<label role="radio">` wrapping a native radio was
 *   invalid per ARIA-in-HTML and split the widget across two competing
 *   models)
 * - Roving tabindex on the radios (W6): exactly one star is tabbable -- the
 *   checked one, or the first when the value is 0 -- the radiogroup root is
 *   never a tab stop, and arrows move focus together with the selection.
 *   The checked radio announces the committed VALUE, preserving half-point
 *   identity (2.5 reads as "2.5 stars", never "third star")
 * - Single hidden `type="hidden"` input mirrors the committed value for
 *   native form participation (stable `useId` group name); `type="hidden"`
 *   carries no ARIA semantics, so the composite model stays pure
 * - Exactly one `aria-checked="true"` radio (the star the committed value
 *   rounds to), computed from the committed value -- never the hover preview
 * - Custom star SVG for consistent cross-browser rendering
 * - Half-star support via overlay technique
 * - Full keyboard navigation with a skin-painted focus ring
 * - Localized accessible names (English fallback)
 *
 * @example Basic Usage
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * <Rate engine="modern" defaultValue={3} />
 * ```
 *
 * @see {@link RateProps} - Component props interface
 * @see {@link ClassicRate} - Ant Design alternative
 * @see {@link RusticRate} - Vanilla alternative
 * @module Rate/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import type { RateProps, RateCharacterProps } from '../../contracts';
import { RATE_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Rate component.
 *
 * @description
 * Skin-painted implementation: APG radio-group composite (`span role="radio"`
 * stars inside a `role="radiogroup"` root), a single hidden form carrier for
 * native forms, custom half-star overlay, keyboard navigation. Paint (size,
 * fill, hover scale, focus ring, transitions) belongs to the `rate.css`
 * modern skin.
 *
 * @param props - {@link RateProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered token-skinned Rate component
 *
 * @example
 * ```tsx
 * <ModernRate
 *   defaultValue={3}
 *   allowHalf
 *   count={5}
 *   size="lg"
 *   onChange={(value) => console.log('Selected:', value)}
 * />
 * ```
 */
export const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  (props: RateProps, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      value,
      defaultValue = RATE_DEFAULTS.defaultValue,
      count = RATE_DEFAULTS.count,
      allowHalf = RATE_DEFAULTS.allowHalf,
      allowClear = RATE_DEFAULTS.allowClear,
      disabled = RATE_DEFAULTS.disabled,
      readOnly = RATE_DEFAULTS.readOnly,
      onChange,
      onHoverChange,
      character,
      className = '',
      style,
      tooltips,
      autoFocus,
      keyboard = RATE_DEFAULTS.keyboard,
      size = RATE_DEFAULTS.size,
      activeColor,
      inactiveColor,
      direction = RATE_DEFAULTS.direction,
      // Omit engine prop
      engine: _engine,
      ...restProps
    } = props;

    const i18n = useOptionalTranslation('components');
    /**
     * Localized label with an English floor: when the catalogue entry has not
     * landed yet the provider echoes the full key, which must never reach an
     * aria-label.
     */
    const tOr = (key: string, fallback: string, params?: Record<string, string | number>): string => {
      const resolved = i18n?.t(key, params);
      if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
      return resolved;
    };

    // -------------------------------------------------------------------------
    // State Management
    // -------------------------------------------------------------------------

    // Controlled vs uncontrolled pattern: when `value` is provided the
    // parent owns the state; otherwise we track it internally.
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    // Roving tabindex (APG radio-group): the RADIOS own focus, never the
    // radiogroup root. Exactly one star is tabbable — the checked one, or
    // the first star when the value is 0 — and arrows move focus together
    // with the selection. `focusedStar` only drives the skin's focus ring.
    const [focusedStar, setFocusedStar] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const starRefs = useRef<Array<HTMLSpanElement | null>>([]);
    // Stable group name for the hidden form carrier (native form
    // participation). The old `Math.random()`-in-render name changed identity
    // every render and used the deprecated `substr`; `useId` is stable and
    // SSR-safe.
    const radioGroupId = useId();
    const radioGroupName = `rottay-rate-${radioGroupId}`;

    // displayValue prioritises hover feedback so the user sees a live
    // preview before committing their selection via click
    const currentValue = isControlled ? value : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;
    const isInteractive = !disabled && !readOnly;

    // Roving tab stop: the star the committed value falls on (value 2.5 →
    // star 3), or the first star when nothing is committed.
    const rovingIndex = Math.min(count, Math.max(1, Math.round(currentValue || 0)));

    const focusStar = useCallback((starIndex: number) => {
      starRefs.current[starIndex - 1]?.focus();
    }, []);

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------

    /**
     * Auto focus on mount if requested — lands on the roving tab stop star,
     * matching where Tab would put the user.
     */
    useEffect(() => {
      if (autoFocus && isInteractive) {
        focusStar(rovingIndex);
      }
      // rovingIndex is derived from the committed value; only the mount-time
      // autoFocus intent matters here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFocus]);

    // -------------------------------------------------------------------------
    // Event Handlers
    // -------------------------------------------------------------------------

    /**
     * Handle click on a star. Focus follows the pointer, like a native radio.
     */
    const handleClick = useCallback((starValue: number) => {
      if (!isInteractive) return;

      focusStar(Math.min(count, Math.max(1, Math.ceil(starValue))));

      let newValue = starValue;

      // Allow clearing if clicking on current value
      if (allowClear && starValue === currentValue) {
        newValue = 0;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [isInteractive, allowClear, currentValue, isControlled, onChange, count, focusStar]);

    /**
     * Handle hover state changes.
     */
    const handleHover = useCallback((starValue: number | null) => {
      if (!isInteractive) return;
      setHoverValue(starValue);
      if (starValue !== null) {
        onHoverChange?.(starValue);
      } else {
        onHoverChange?.(0);
      }
    }, [isInteractive, onHoverChange]);

    /**
     * Handle keyboard navigation on a star (APG radio-group: arrows move
     * BOTH the selection and the focus to the star the new value falls on).
     */
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!keyboard || !isInteractive) return;

      let newValue = currentValue || 0;
      const step = allowHalf ? 0.5 : 1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(count, newValue + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(0, newValue - step);
          break;
        case 'Home':
          e.preventDefault();
          newValue = 0;
          break;
        case 'End':
          e.preventDefault();
          newValue = count;
          break;
        default:
          return;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      // Roving: focus lands on the star owning the new value (2.5 → star 3;
      // 0 → first star, since no radio is checked).
      focusStar(Math.min(count, Math.max(1, Math.round(newValue))));
    }, [keyboard, isInteractive, currentValue, count, allowHalf, isControlled, onChange, focusStar]);

    // -------------------------------------------------------------------------
    // Render Helpers
    // -------------------------------------------------------------------------

    /**
     * Render custom or default character.
     */
    const renderCharacter = (index: number) => {
      if (typeof character === 'function') {
        return character({ index, value: displayValue || 0 } as RateCharacterProps);
      }
      if (character) {
        return character;
      }
      // Default star SVG
      return (
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    };

    // -------------------------------------------------------------------------
    // Render Stars
    // -------------------------------------------------------------------------

    // APG radio semantics: at most ONE radio in a group may be checked. The
    // checked star is the one the COMMITTED value rounds to (with allowHalf,
    // 2.5 checks star 3 -- the star the value falls on); the old model marked
    // every filled star checked (N checked radios, invalid) and drove it from
    // the hover preview, churning state for assistive tech.
    const checkedIndex = Math.min(count, Math.max(0, Math.round(currentValue || 0)));

    const stars = Array.from({ length: count }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = (displayValue || 0) >= starIndex;
      const isHalfFilled = allowHalf && (displayValue || 0) >= starIndex - 0.5 && (displayValue || 0) < starIndex;
      const isFocused = focusedStar === starIndex;
      const isChecked = starIndex === checkedIndex;
      // Half-point semantics: when the committed value is fractional the
      // checked radio announces the VALUE (2.5 stars — the half identity is
      // preserved), never the ordinal position of the star it falls on.
      const valueLabel = isChecked && typeof currentValue === 'number' && currentValue % 1 !== 0
        ? tOr('rate.stars', `${currentValue} stars`, { count: currentValue })
        : tOr(
            starIndex === 1 ? 'rate.star' : 'rate.stars',
            `${starIndex} star${starIndex > 1 ? 's' : ''}`,
            { count: starIndex },
          );

      return (
        <span
          key={index}
          ref={(node) => {
            starRefs.current[index] = node;
          }}
          data-part="star"
          data-state={isFilled && !isHalfFilled ? 'full' : isHalfFilled ? 'half' : 'empty'}
          data-focused={isFocused ? 'true' : undefined}
          style={{
            // Runtime per-star fill (active when filled/half, else inactive)
            // rides the hatch consumed by the skin's star color rule.
            '--ds-rate-star-fill': isFilled || isHalfFilled
              ? activeColor || 'var(--ds-rate-active-color)'
              : inactiveColor || 'var(--ds-rate-inactive-color)',
          } as React.CSSProperties}
          title={tooltips?.[index]}
          onClick={() => handleClick(starIndex)}
          onMouseEnter={() => handleHover(starIndex)}
          onMouseLeave={() => handleHover(null)}
          role="radio"
          aria-checked={isChecked}
          aria-label={tooltips?.[index] || valueLabel}
          tabIndex={isInteractive && starIndex === rovingIndex ? 0 : -1}
          onFocus={() => setFocusedStar(starIndex)}
          onBlur={() => setFocusedStar(null)}
          onKeyDown={handleKeyDown}
        >
          {/* Invisible overlay covering the leading half of the star.
              stopPropagation prevents the full-star handler from firing
              when the user interacts with the half-star zone. */}
          {allowHalf && (
            <span
              className="absolute start-0 top-0 w-1/2 h-full z-10"
              onMouseEnter={(e) => {
                e.stopPropagation();
                handleHover(starIndex - 0.5);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(starIndex - 0.5);
              }}
            />
          )}
          {/* Half star visual - overlay technique */}
          {isHalfFilled ? (
            <span className="relative inline-flex w-full h-full">
              {/* Background (inactive) star: constant inactive color via the
                  track marker; --ds-rate-star-inactive is stamped on the root. */}
              <span className="absolute inset-0 rottay-rate-star-track">
                {renderCharacter(index)}
              </span>
              {/* Foreground (active) half star inherits the star's active fill. */}
              <span data-part="star-half">
                {renderCharacter(index)}
              </span>
            </span>
          ) : (
            renderCharacter(index)
          )}
        </span>
      );
    });

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    // `ds-rate ds-rate--modern` is the skin scope; the legacy `rottay-rate`
    // pair stays as a compatibility alias for consumers/tests that hook the
    // historical BEM naming (no paint keys on it anymore).
    const rootClassName = [
      'ds-rate',
      'ds-rate--modern',
      'rottay-rate',
      'rottay-rate--modern',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        // Merge the forwarded ref with our internal containerRef so both
        // the consumer and the autoFocus effect can access the DOM node
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        data-part="root"
        className={rootClassName}
        style={{
          direction,
          ...style,
          ...({ '--ds-rate-star-inactive': inactiveColor || 'var(--ds-rate-inactive-color)' } as React.CSSProperties),
        }}
        role="radiogroup"
        aria-label={tOr('rate.label', 'Rating')}
        aria-disabled={disabled}
        aria-readonly={readOnly}
        /* APG radio-group: the radiogroup is NEVER a tab stop — the radios
           own focus through the roving tabindex stamped per star. */
        data-size={size}
        data-disabled={disabled ? 'true' : 'false'}
        data-readonly={readOnly ? 'true' : 'false'}
        data-testid="rate"
        /* APG: a radiogroup carries NO aria-valuenow/min/max (axe
           aria-allowed-attr, critical) -- the legacy triad was dropped in the
           K2-V pass and the value is mirrored on data-* for tests/specs.
           Rustic still stamps the triad (documented cross-engine divergence,
           lane ficha). */
        data-value={currentValue ?? undefined}
        data-count={count}
        {...restProps}
      >
        {stars}
        {/* Native form participation without breaking the composite model:
            a single type="hidden" input mirrors the COMMITTED value (clicks,
            keyboard and controlled updates alike -- the old per-star native
            radios only tracked mouse clicks). type="hidden" has no implicit
            ARIA role and is never exposed to assistive tech, so the APG
            radio-group stays the single semantic model. Submission gating
            matches the legacy behavior: disabled/readOnly ratings do not
            submit. */}
        <input
          type="hidden"
          name={radioGroupName}
          value={currentValue ?? 0}
          disabled={!isInteractive}
          readOnly
        />
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Rate.displayName = 'Rate.Modern';

export default Rate;
