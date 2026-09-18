'use client';

/**
 * @fileoverview MobileHeader - compact mobile navigation header.
 *
 * @description
 * A 56px-tall header bar with three slots: left action (back button or custom),
 * center title (a real `h1`, truncated), and right actions. The side slots
 * share the leftover width equally, so the title sits on the bar's true
 * centerline. Supports sticky positioning with safe area insets for notched
 * devices (top + inline) and a governed stuck shadow that appears once
 * content scrolls under the bar (`data-stuck`, via a sentinel probe).
 *
 * Engine-agnostic: composes DS primitives (Box, Flex) which resolve
 * through the engine system themselves.
 *
 * @example
 * ```tsx
 * <MobileHeader
 *   title="Order Details"
 *   onBack={() => router.back()}
 *   rightActions={<Button size="sm" variant="ghost">Edit</Button>}
 *   sticky
 * />
 * ```
 *
 * @module Structures/Headers/MobileHeader
 * @category Structure
 * @package @rottay/design-system
 */

import { useEffect, useRef, useState } from 'react';

import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { Box } from '@/components/primitives/layout/box';
import { Flex } from '@/components/primitives/layout/flex';
import { NavigationBackIcon } from '@/graphics/icons/semantic/generated/roles/navigation-back';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type { MobileHeaderProps } from '../../contracts';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Compact header bar for mobile screens.
 *
 * Renders a 56px-height bar with left action, centered title, and right action
 * slots. When `onBack` is provided and no custom `leftAction`, a back arrow
 * button is rendered automatically.
 */
export function MobileHeader({
  title,
  leftAction,
  rightActions,
  onBack,
  sticky = false,
  style,
  children,
}: MobileHeaderProps) {
  // Accessible back-button label via the DS i18n channel with an English floor.
  const i18n = useOptionalTranslation('common');
  const backAriaLabel = i18n?.tOr('go_back', 'Go back') ?? 'Go back';
  // Hover, press and the focus ring on the family's own back button are decided
  // once, by the shared kernel, and read off `data-state`. A consumer's own
  // `leftAction` replaces this button entirely, which is why the skin keeps the
  // platform pseudo-classes beside each token arm.
  const backInteraction = useInteractionState();

  // Stuck evidence for the sticky posture: a 1px sentinel sits immediately
  // before the bar; the bar sticks exactly when the sentinel leaves the
  // viewport, so `data-stuck` tracks "scrolled under the bar" without a
  // scroll listener. The skin keeps the sentinel OUT OF FLOW (absolute +
  // visibility:hidden + pointer-events:none, 1px box), so it never becomes a
  // spurious item in the consumer's grid/flex while staying measurable for
  // the observer (display:none/contents would dissolve the box and kill IO).
  //
  // The observer stays rooted at the VIEWPORT on purpose: MobileHeaderProps
  // exposes no scroll root/container, so the component must not fake
  // knowledge of arbitrary scroll ancestors. Inside a nested scroller the
  // sticky posture still sticks, but the probe fails closed — `data-stuck`
  // stays false and the governed shadow simply never appears; the behavior
  // is deterministic instead of accidentally right.
  // BLOCKED(owner: independent code audit/contracts): no scrollRoot on MobileHeaderProps.
  // jsdom ships no IntersectionObserver — the guard fails closed (no shadow)
  // and the contract tests stay green.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (!sticky) return undefined;
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(entry ? !entry.isIntersecting : false),
      { threshold: [0] },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sticky]);

  // Determine the left slot content
  const leftSlot = leftAction ?? (
    onBack ? (
      <Box
        as="button"
        type="button"
        onClick={onBack}
        {...backInteraction.handlers}
        className="rottay-mobile-header__back"
        aria-label={backAriaLabel}
        data-testid="mobile-header-back"
        {...partAttributes('trigger', backInteraction.state)}
      >
        {/* Governed glyph: navigation.back ships autoMirror, so the chevron
            flips itself under RTL (the skin's manual scaleX(-1) is retired). */}
        <NavigationBackIcon size={24} decorative />
      </Box>
    ) : null
  );

  return (
    <>
      {sticky ? (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="rottay-mobile-header__sticky-sentinel"
          data-part="sticky-sentinel"
        />
      ) : null}
    <Box
      as="header"
      className="rottay-mobile-header"
      /* The runtime stamps no geometry of its own: `position: sticky` is the
         skin's, keyed on the `data-sticky` stamp below. What travels inline is
         the consumer's own `style`, which keeps its last word over the skin. */
      style={style}
      data-testid="mobile-header"
      role="banner"
      data-part="root"
      data-sticky={sticky}
      data-stuck={sticky && stuck}
    >
      <Flex
        align="center"
        justify="between"
        className="rottay-mobile-header__bar"
        data-part="bar"
      >
        {/* Slot geometry (equal side shares, true-centerline title, touch
            floors, safe-area padding) lives in the skin. */}
        <Box
          className="rottay-mobile-header__left"
          data-testid="mobile-header-left"
          data-part="left"
        >
          {leftSlot}
        </Box>

        {/* Center title */}
        <Box className="rottay-mobile-header__center" data-part="center">
          {title && (
            <Box
              as="h1"
              className="rottay-mobile-header__title"
              title={title}
              data-testid="mobile-header-title"
              data-part="label"
            >
              {title}
            </Box>
          )}
        </Box>

        {/* Right slot */}
        <Box
          className="rottay-mobile-header__right"
          data-testid="mobile-header-right"
          data-part="right"
        >
          {rightActions}
        </Box>
      </Flex>

      {/* Optional children below the header bar (subtitle, search, etc.); the skin
          gives the slot the bar's own inline gutter so it lines up with the back
          action above it. */}
      {children ? <Box data-part="body">{children}</Box> : null}
    </Box>
    </>
  );
}

MobileHeader.displayName = 'MobileHeader';

export default MobileHeader;
