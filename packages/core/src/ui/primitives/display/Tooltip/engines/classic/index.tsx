/**
 * @fileoverview Tooltip Classic Engine - Rottay Design System
 * @description Ant Design-based tooltip with collision detection.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Tooltip component to provide advanced
 * positioning, animations, and accessibility features.
 *
 * **Implementation Details:**
 * - Uses `antd/Tooltip` for core rendering
 * - Maps placement to Ant Design naming conventions
 * - Converts delays from milliseconds to seconds
 * - Maps color variants to Ant Design colors
 * - Portal rendering for proper z-index handling
 *
 * **Placement Mapping:**
 * - `top-start` → `topLeft`
 * - `top-end` → `topRight`
 * - `bottom-start` → `bottomLeft`
 * - `bottom-end` → `bottomRight`
 * - etc.
 *
 * **Advantages:**
 * - Collision detection and auto-flip
 * - Portal rendering
 * - Smooth animations
 * - Comprehensive ARIA support
 *
 * @example Basic Usage
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip engine="classic" content="Smart tooltip" placement="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @see {@link BaseTooltip} for CSS variable implementation
 * @see {@link https://ant.design/components/tooltip} Ant Design Tooltip
 * @module Tooltip/engines/classic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef, type CSSProperties } from 'react';
import { Tooltip as AntTooltip } from 'antd';
import type { TooltipProps } from '../../contracts';
import { TOOLTIP_DEFAULTS } from '../../contracts';
import { formatShortcutKey } from '../../../../../../infrastructure/runtime/application/interaction/shortcuts';

/**
 * Layout + chip styles for the optional `shortcut` prop. Built on
 * `currentColor` so the chips adapt to whichever text color Ant Design's
 * tooltip body ends up using, without a second color map to keep in sync.
 */
const SHORTCUT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const SHORTCUT_CHIPS_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  flexShrink: 0,
};
const SHORTCUT_KBD_STYLE: CSSProperties = {
  padding: '1px 5px',
  borderRadius: 'var(--ds-radius-sm)',
  border: '1px solid color-mix(in srgb, currentColor 30%, transparent)',
  background: 'color-mix(in srgb, currentColor 12%, transparent)',
  fontSize: '0.85em',
  fontFamily: 'var(--ds-font-family-mono, monospace)',
  lineHeight: 1.4,
};

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

function resolveMaxWidth(maxWidth: TooltipProps['maxWidth']): string | number {
  return maxWidth ?? 'var(--ds-tooltip-max-width, 300px)';
}

/**
 * Classic (Ant Design) implementation of the Tooltip component.
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
 * <ClassicTooltip content="Helpful tip" placement="top">
 *   <Button>Hover me</Button>
 * </ClassicTooltip>
 * ```
 */
const ClassicTooltip = forwardRef<HTMLDivElement, TooltipProps>(
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
      maxWidth = TOOLTIP_DEFAULTS.maxWidth,
      className,
      style,
      shortcut,
      ...restProps
    } = props;

    // Normalise trigger to an array and strip 'manual' -- Ant Design has no
    // manual trigger mode; controlled visibility is achieved via the open prop.
    const rawTriggers = Array.isArray(trigger) ? trigger : [trigger];
    const triggers = rawTriggers.filter((t): t is 'hover' | 'click' | 'focus' => t !== 'manual');

    // Translate DS placement names (e.g. 'top-start') to Ant Design equivalents
    const antPlacement = PLACEMENT_MAP[placement] || 'top';

    // Ant Design expects delays in seconds; our API uses milliseconds for
    // consistency with setTimeout and the modern/rustic engines.
    const mouseEnterDelay = showDelay ? showDelay / 1000 : 0.1;
    const mouseLeaveDelay = hideDelay ? hideDelay / 1000 : 0.1;

    // Map semantic color variants to CSS variable references so the design
    // token layer can override tooltip colours per-theme.
    const colorMap: Record<string, string | undefined> = {
      default: undefined, // Use Ant Design's default
      primary: 'var(--ds-tooltip-primary-bg, #1677ff)',
      secondary: 'var(--ds-tooltip-secondary-bg, #722ed1)',
      success: 'var(--ds-tooltip-success-bg, #52c41a)',
      warning: 'var(--ds-tooltip-warning-bg, #faad14)',
      error: 'var(--ds-tooltip-error-bg, #ff4d4f)',
    };

    const bodyStyle: CSSProperties = {
      maxWidth: resolveMaxWidth(maxWidth),
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      wordBreak: 'normal',
      textAlign: 'left',
      lineHeight: 1.35,
    };

    const titleContent = shortcut ? (
      <span style={SHORTCUT_ROW_STYLE}>
        <span>{content}</span>
        <span style={SHORTCUT_CHIPS_STYLE}>
          {formatShortcutKey(shortcut).map((segment, i) => (
            <kbd key={i} style={SHORTCUT_KBD_STYLE}>
              {segment}
            </kbd>
          ))}
        </span>
      </span>
    ) : (
      content
    );

    // When disabled, pass undefined as title to suppress the tooltip entirely
    // rather than rendering an empty popup.
    return (
      <AntTooltip
        title={disabled ? undefined : titleContent}
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
        styles={{
          ...(style ? { root: style } : {}),
          body: bodyStyle,
        }}
        classNames={className ? { root: className } : undefined}
        {...restProps}
      >
        {children}
      </AntTooltip>
    );
  }
);

ClassicTooltip.displayName = 'ClassicTooltip';

export default ClassicTooltip;
