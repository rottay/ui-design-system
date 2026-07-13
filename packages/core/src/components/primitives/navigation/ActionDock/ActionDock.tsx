'use client';

/**
 * @fileoverview ActionDock - floating action bar for mobile.
 *
 * @description
 * A fixed-position container for sticky bottom (or top) action buttons on
 * mobile screens. Renders children in a horizontal Flex row with consistent
 * padding, shadow, and safe area insets for notched devices.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex) which resolve
 * through the engine system themselves.
 *
 * @example
 * ```tsx
 * <ActionDock>
 *   <Button variant="secondary" style={{ flex: 1 }}>Cancel</Button>
 *   <Button variant="primary" style={{ flex: 1 }}>Save</Button>
 * </ActionDock>
 * ```
 *
 * @module ActionDock
 * @category Navigation
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';

import { Box } from '../../layout/Box';
import { Flex } from '../../layout/Flex';

import type { ActionDockProps } from './ActionDock.types';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Floating action bar for mobile sticky bottom (or top) actions.
 *
 * Renders children (typically Button components) in a horizontal Flex row
 * with 16px horizontal padding, shadow, and safe area padding.
 */
export function ActionDock({
  children,
  position = 'bottom',
  style,
}: ActionDockProps) {
  const isBottom = position === 'bottom';

  const containerStyle: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    width: '100%',
    background: 'var(--ds-color-bg-primary)',
    paddingLeft: 16,
    paddingRight: 16,
    zIndex: 39,
    ...(isBottom
      ? {
          bottom: 0,
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
          paddingTop: 12,
          paddingBottom: `max(12px, env(safe-area-inset-bottom, 12px))`,
        }
      : {
          top: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          paddingTop: `max(12px, env(safe-area-inset-top, 12px))`,
          paddingBottom: 12,
        }),
    ...style,
  };

  return (
    <Box
      style={containerStyle}
      data-testid="action-dock"
      role="toolbar"
      aria-label={`${position === 'top' ? 'Top' : 'Bottom'} actions`}
      data-part="root"
      data-placement={position}
    >
      <Flex
        gap={12}
        align="center"
        style={{ width: '100%' }}
      >
        {children}
      </Flex>
    </Box>
  );
}

ActionDock.displayName = 'ActionDock';

export default ActionDock;
