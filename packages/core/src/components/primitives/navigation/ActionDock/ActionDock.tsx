'use client';

/**
 * @fileoverview ActionDock - floating action bar for mobile.
 *
 * @description
 * A fixed or sticky container for bottom (or top) action buttons on mobile
 * screens. Renders children in a horizontal Flex row with tokenized padding,
 * shadow, stacking, and safe area insets for notched devices.
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
import { useResponsive } from '../../../../runtime/responsive';

import type { ActionDockProps } from './ActionDock.types';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Action bar for fixed or sticky mobile bottom (or top) actions.
 *
 * Renders children (typically Button components) in a horizontal Flex row
 * with tenant-tokenizable spacing, shadow, stacking, and safe area padding.
 */
export function ActionDock({
  children,
  position = 'bottom',
  mode = 'fixed',
  id,
  className,
  'data-testid': dataTestId = 'action-dock',
  'aria-label': ariaLabel,
  style,
}: ActionDockProps) {
  const rootClassName = ['rottay-action-dock', className].filter(Boolean).join(' ');
  const { virtualKeyboardInset, isVirtualKeyboardOpen } = useResponsive();
  const responsiveStyle = {
    ...style,
    '--ds-virtual-keyboard-inset': `${Math.max(0, virtualKeyboardInset)}px`,
  } as CSSProperties;

  return (
    <Box
      id={id}
      className={rootClassName}
      style={responsiveStyle}
      data-testid={dataTestId}
      role="toolbar"
      aria-label={ariaLabel ?? `${position === 'top' ? 'Top' : 'Bottom'} actions`}
      data-part="root"
      data-placement={position}
      data-mode={mode}
      data-keyboard-open={isVirtualKeyboardOpen ? 'true' : 'false'}
    >
      <Flex className="rottay-action-dock__actions" align="center">
        {children}
      </Flex>
    </Box>
  );
}

ActionDock.displayName = 'ActionDock';

export default ActionDock;
