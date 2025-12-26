'use client';

import { forwardRef } from 'react';
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
    _ref
  ) => {
    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    // Map custom placements to Ant Design placements
    const placementMap: Record<string, string> = {
      'top': 'top',
      'top-start': 'topLeft',
      'top-end': 'topRight',
      'bottom': 'bottom',
      'bottom-start': 'bottomLeft',
      'bottom-end': 'bottomRight',
      'left': 'left',
      'left-start': 'leftTop',
      'left-end': 'leftBottom',
      'right': 'right',
      'right-start': 'rightTop',
      'right-end': 'rightBottom',
    };

    const antPlacement = placementMap[placement] || 'top';

    return (
      <AntTooltip
        title={content}
        placement={antPlacement as any}
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
