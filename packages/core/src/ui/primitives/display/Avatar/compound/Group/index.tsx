/**
 * @fileoverview Avatar.Group compound component.
 * Renders multiple avatars in an overlapping horizontal stack with an
 * optional "+N" surplus indicator when the count exceeds `max`.
 * Accessed via `Avatar.Group` dot-notation in consumer code.
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

export interface AvatarGroupProps {
  /** Avatar elements to stack. */
  children: ReactNode;
  /** Maximum number of avatars to display before showing the "+N" surplus indicator. */
  max?: number;
  /** Custom styles applied to the "+N" surplus badge. */
  maxStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}

/**
 * Avatar.Group -- displays a collection of Avatar components in a
 * horizontally overlapping stack, commonly used for participant lists,
 * team displays, or assignee chips.
 *
 * When `max` is specified and the child count exceeds it, only the first
 * `max` avatars are rendered and a "+N" surplus badge is appended.
 *
 * **Layout note:** The flex container uses `row-reverse` so that the
 * first avatar in the markup visually appears on top (highest z-order)
 * while the negative margin creates the overlap effect. `row-reverse`
 * mirrors the stack automatically in RTL, so the overlap margin stays
 * physical by design.
 *
 * @param props - {@link AvatarGroupProps}
 * @returns A flex container with overlapping avatar children and an
 *          optional surplus indicator.
 *
 * @example
 * ```tsx
 * <Avatar.Group max={3}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar src="/user3.jpg" />
 *   <Avatar src="/user4.jpg" />
 * </Avatar.Group>
 * {/* Renders 3 avatars + a "+1" badge *\/}
 * ```
 */
export function AvatarGroup({
  children,
  max,
  maxStyle,
  className = '',
  style,
}: AvatarGroupProps): React.ReactElement {
  const i18n = useOptionalTranslation('components');
  const childArray = React.Children.toArray(children);
  const displayChildren = max ? childArray.slice(0, max) : childArray;
  // Calculate how many avatars are hidden behind the surplus badge.
  const surplus = max && childArray.length > max ? childArray.length - max : 0;

  // row-reverse causes the first child in the DOM to sit on top visually,
  // producing the standard "stacked left-to-right" avatar overlap.
  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row-reverse',
    ...style,
  };

  // Negative left margin creates the horizontal overlap between avatars. The 2px
  // "cut-out" frame that separates each circle is painted by
  // foundation/tokens/css/presentation/components/skin/avatar-compounds.css.
  // The margin stays physical (never logical): row-reverse already mirrors the
  // visual order in RTL, so the overlap direction is correct in both writing
  // directions. Tenants tune the overlap through the spacing channel.
  const overlap = 'var(--ds-avatar-group-overlap, var(--ds-avatar-group-compact-spacing, -0.5rem))';
  const childStyle: CSSProperties = {
    marginLeft: overlap,
  };
  // The last DOM child renders as the visually FIRST (top-most) avatar. Giving
  // it the negative margin would drag the whole stack past the container's
  // start edge, so it alone stays at zero.
  const leadingChildStyle: CSSProperties = {};

  // The surplus badge inherits the overlap styling; its neutral fill and secondary
  // ink for the "+N" count live in the skin alongside the frame, and its corner
  // radius is painted by the modern skin's `[data-part='surplus']` rule. The
  // count uses tabular figures so multi-digit overflows stay digit-aligned, and
  // centers its label; consumers size the badge to match their avatars via
  // `maxStyle`. The default tile matches the md avatar.
  const surplusStyle: CSSProperties = {
    ...childStyle,
    display: 'inline-grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    inlineSize: 'var(--ds-avatar-group-surplus-size, var(--ds-avatar-md-size))',
    blockSize: 'var(--ds-avatar-group-surplus-size, var(--ds-avatar-md-size))',
    fontSize: 'var(--ds-avatar-group-surplus-font-size, var(--ds-avatar-sm-font-size))',
    fontWeight: 'var(--ds-avatar-group-overflow-font-weight, var(--ds-font-weight-medium))' as CSSProperties['fontWeight'],
    fontVariantNumeric: 'tabular-nums',
    ...maxStyle,
  };

  return (
    <div className={`rottay-avatar-group ${className}`} data-part="root" style={groupStyle}>
      {/* Surplus badge is rendered first due to row-reverse -- it appears at the end visually */}
      {surplus > 0 && (
        <div
          className="rottay-avatar-surplus"
          data-part="surplus"
          style={surplusStyle}
          title={i18n ? i18n.t('avatar.group.surplus', { count: surplus }) : `+${surplus} more`}
        >
          +{surplus}
        </div>
      )}
      {displayChildren.map((child, index) => (
        <div
          key={index}
          data-part="item"
          data-stack-lead={index === displayChildren.length - 1 ? 'true' : undefined}
          style={index === displayChildren.length - 1 ? leadingChildStyle : childStyle}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

AvatarGroup.displayName = 'Avatar.Group';
