/**
 * @fileoverview Avatar.Group compound component.
 * Renders multiple avatars in an overlapping horizontal stack with an
 * optional "+N" surplus indicator when the count exceeds `max`.
 * Accessed via `Avatar.Group` dot-notation in consumer code.
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

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
 * while the negative margin creates the overlap effect.
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
  // tokens/css/components/skin/avatar-compounds.css.
  const childStyle: CSSProperties = {
    marginLeft: '-8px',
  };

  // The surplus badge inherits the overlap styling; its neutral fill and secondary
  // ink for the "+N" count live in the skin alongside the frame. The count uses
  // tabular figures so multi-digit overflows stay digit-aligned, and centers
  // its label; consumers size the badge to match their avatars via `maxStyle`.
  const surplusStyle: CSSProperties = {
    ...childStyle,
    display: 'inline-grid',
    placeItems: 'center',
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
          title={`+${surplus} more`}
        >
          +{surplus}
        </div>
      )}
      {displayChildren.map((child, index) => (
        <div key={index} data-part="item" style={childStyle}>
          {child}
        </div>
      ))}
    </div>
  );
}

AvatarGroup.displayName = 'Avatar.Group';
