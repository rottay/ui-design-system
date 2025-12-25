'use client';

import React, { forwardRef } from 'react';
import { Tooltip as AntTooltip } from 'antd';
import type { TooltipProps } from '../../types';

/**
 * Titan (Ant Design) implementation of Tooltip component.
 *
 * Uses Ant Design's Tooltip with advanced positioning.
 */
export const TitanTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = 'top',
      trigger = 'hover',
      arrow = true,
      openDelay,
      closeDelay,
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      maxWidth,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    return (
      <AntTooltip
        title={content}
        placement={placement}
        trigger={triggers}
        arrow={arrow}
        mouseEnterDelay={openDelay ? openDelay / 1000 : 0.1}
        mouseLeaveDelay={closeDelay ? closeDelay / 1000 : 0.1}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        overlayStyle={{ maxWidth, ...style }}
        overlayClassName={className}
        {...props}
      >
        {children}
      </AntTooltip>
    );
  }
);

TitanTooltip.displayName = 'TitanTooltip';
