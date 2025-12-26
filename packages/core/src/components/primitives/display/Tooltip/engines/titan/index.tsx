/**
 * Tooltip - Titan Engine Implementation
 * Uses Ant Design's Tooltip component for full-featured tooltip functionality.
 *
 * @module Tooltip/engines/titan
 * @description Titan engine implementation using Ant Design as the underlying library.
 * Provides advanced positioning, animations, and accessibility features.
 */

'use client';

import { forwardRef } from 'react';
import { Tooltip as AntTooltip } from 'antd';
import type { TooltipProps } from '../../types';
import { TOOLTIP_DEFAULTS } from '../../types';

/**
 * Placement mapping from our standard to Ant Design's placement names.
 * Ant Design uses different naming conventions for placement positions.
 */
const PLACEMENT_MAP: Record<string, string> = {
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

/**
 * Titan (Ant Design) implementation of the Tooltip component.
 *
 * Features:
 * - Advanced positioning with collision detection
 * - Smooth animations and transitions
 * - Portal rendering for proper z-index handling
 * - Full accessibility support (ARIA attributes)
 * - Configurable show/hide delays
 *
 * @example
 * ```tsx
 * <TitanTooltip content="Helpful tip" placement="top">
 *   <Button>Hover me</Button>
 * </TitanTooltip>
 * ```
 */
const TitanTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (props, _ref) => {
    const {
      content,
      children,
      placement = TOOLTIP_DEFAULTS.placement,
      trigger = TOOLTIP_DEFAULTS.trigger,
      arrow = TOOLTIP_DEFAULTS.arrow,
      showDelay = TOOLTIP_DEFAULTS.showDelay,
      hideDelay = TOOLTIP_DEFAULTS.hideDelay,
      visible,
      defaultVisible,
      onVisibleChange,
      disabled,
      color,
      zIndex,
      className,
      style,
      ...restProps
    } = props;

    // Normalize trigger to array format and filter out 'manual' which Ant Design doesn't support
    const rawTriggers = Array.isArray(trigger) ? trigger : [trigger];
    const triggers = rawTriggers.filter((t): t is 'hover' | 'click' | 'focus' => t !== 'manual');

    // Map placement to Ant Design format
    const antPlacement = PLACEMENT_MAP[placement] || 'top';

    // Convert delays from milliseconds to seconds (Ant Design uses seconds)
    const mouseEnterDelay = showDelay ? showDelay / 1000 : 0.1;
    const mouseLeaveDelay = hideDelay ? hideDelay / 1000 : 0.1;

    // Map color variants to Ant Design colors
    const colorMap: Record<string, string | undefined> = {
      default: undefined,
      primary: '#1677ff',
      secondary: '#722ed1',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
    };

    return (
      <AntTooltip
        title={disabled ? undefined : content}
        placement={antPlacement as any}
        trigger={triggers}
        arrow={arrow}
        mouseEnterDelay={mouseEnterDelay}
        mouseLeaveDelay={mouseLeaveDelay}
        open={visible}
        defaultOpen={defaultVisible}
        onOpenChange={onVisibleChange}
        color={color ? colorMap[color] : undefined}
        zIndex={zIndex}
        overlayStyle={style}
        overlayClassName={className}
        {...restProps}
      >
        {children}
      </AntTooltip>
    );
  }
);

TitanTooltip.displayName = 'TitanTooltip';

export default TitanTooltip;
