'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the HoverCard overlay component.
 * Wraps Ant Design's Popover with `trigger="hover"` to display rich content
 * panels on mouse-enter, with configurable open/close delays and placement.
 *
 * @example
 * ```tsx
 * <ClassicHoverCard
 *   content={<UserProfileCard userId={id} />}
 *   trigger={<span>@username</span>}
 *   side="bottom"
 *   openDelay={200}
 * />
 * ```
 */

import React from 'react';
import { Popover as AntPopover } from 'antd';
import type { HoverCardProps } from '../../contracts';
import { HOVERCARD_DEFAULTS } from '../../contracts';

/** Maps engine-agnostic `side` prop to Ant Design's placement base value. */
const SIDE_TO_PLACEMENT: Record<string, string> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

/** Appends alignment suffix to produce Ant placement strings like "bottomLeft". */
const ALIGN_SUFFIX: Record<string, string> = {
  start: 'Left',
  center: '',
  end: 'Right',
};

/**
 * HoverCard implementation backed by Ant Design's Popover primitive.
 *
 * The side + align props are combined into an Ant placement string (e.g.
 * side="bottom" + align="start" becomes "bottomLeft"). Delays are converted
 * from milliseconds to seconds to match Ant Design's API. When `disabled` is
 * true, the popover is forced closed and the onOpenChange callback is suppressed.
 *
 * @param props - {@link HoverCardProps} shared across all engines.
 * @returns A wrapper div containing the hover-triggered popover.
 */
export default function ClassicHoverCard(props: HoverCardProps): React.ReactElement {
  const {
    content,
    trigger,
    openDelay = HOVERCARD_DEFAULTS.openDelay,
    closeDelay = HOVERCARD_DEFAULTS.closeDelay,
    side = HOVERCARD_DEFAULTS.side,
    align = HOVERCARD_DEFAULTS.align,
    disabled = HOVERCARD_DEFAULTS.disabled,
    open,
    onOpenChange,
    className,
    overlayClassName,
    overlayStyle,
  } = props;

  // Combine side + align into a single Ant placement value.
  // Align suffix only applies on top/bottom; left/right sides ignore it.
  const baseSide = SIDE_TO_PLACEMENT[side] || 'bottom';
  const alignSuffix = (side === 'top' || side === 'bottom')
    ? ALIGN_SUFFIX[align] || ''
    : '';
  const placement = `${baseSide}${alignSuffix}` as any;

  return (
    <div className={className}>
      <AntPopover
        content={content}
        trigger="hover"
        placement={placement}
        open={disabled ? false : open}
        onOpenChange={disabled ? undefined : onOpenChange}
        /* Ant expects seconds; engine props use milliseconds */
        mouseEnterDelay={openDelay / 1000}
        mouseLeaveDelay={closeDelay / 1000}
        overlayClassName={overlayClassName}
        overlayStyle={overlayStyle}
        getPopupContainer={() => document.body}
      >
        <span style={{ display: 'inline-block' }}>{trigger}</span>
      </AntPopover>
    </div>
  );
}

ClassicHoverCard.displayName = 'HoverCard.Classic';
