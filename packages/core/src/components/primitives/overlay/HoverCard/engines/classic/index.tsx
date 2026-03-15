'use client';

/**
 * @fileoverview HoverCard Classic Engine - Rottay Design System
 * @description Ant Design implementation of the HoverCard component.
 * Uses Ant Design Popover with hover trigger.
 *
 * @module HoverCard/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */

import React from 'react';
import { Popover as AntPopover } from 'antd';
import type { HoverCardProps } from '../../types';
import { HOVERCARD_DEFAULTS } from '../../types';

const SIDE_TO_PLACEMENT: Record<string, string> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

const ALIGN_SUFFIX: Record<string, string> = {
  start: 'Left',
  center: '',
  end: 'Right',
};

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

  // Map side+align to Ant placement
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
