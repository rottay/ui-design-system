'use client';

/**
 * @fileoverview Sheet Classic Engine - Rottay Design System.
 * Wraps Ant Design's Drawer component to provide a slide-in panel overlay
 * that supports bottom, left, and right placements with the Classic engine.
 *
 * @example
 * ```tsx
 * <Sheet engine="classic" open={open} onOpenChange={setOpen} side="right" title="Details">
 *   <Text>Panel content</Text>
 * </Sheet>
 * ```
 *
 * @module Sheet/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */

import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import type { SheetProps } from '../Sheet.types';
import { SHEET_DEFAULTS } from '../Sheet.types';

/** Maps Sheet side values to Ant Design Drawer placement values (top is excluded by design). */
const SIDE_TO_PLACEMENT: Record<string, 'bottom' | 'left' | 'right'> = {
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

/**
 * Classic engine implementation of Sheet using Ant Design Drawer.
 *
 * Maps Sheet props to Ant Design Drawer equivalents including mask, keyboard,
 * and placement. Bottom sheets render at 50vh height with an optional drag
 * handle; side sheets use a fixed 380px width.
 *
 * @param props - Sheet configuration props
 * @returns Slide-in panel rendered via Ant Design Drawer
 */
export default function ClassicSheet(props: SheetProps): React.ReactElement {
  const {
    open,
    onOpenChange,
    side = SHEET_DEFAULTS.side,
    children,
    title,
    showHandle = SHEET_DEFAULTS.showHandle,
    showOverlay = SHEET_DEFAULTS.showOverlay,
    closeOnEscape = SHEET_DEFAULTS.closeOnEscape,
    closeOnOverlayClick = SHEET_DEFAULTS.closeOnOverlayClick,
    className,
    panelClassName,
    panelStyle,
  } = props;

  // Fall back to bottom placement if side value is unrecognized
  const placement = SIDE_TO_PLACEMENT[side] || 'bottom';
  const isBottom = side === 'bottom';

  return (
    <AntDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      placement={placement}
      title={title}
      closable
      mask={showOverlay}
      maskClosable={closeOnOverlayClick}
      keyboard={closeOnEscape}
      /* Bottom sheets occupy half the viewport; side sheets use a fixed width */
      height={isBottom ? '50vh' : undefined}
      width={!isBottom ? 380 : undefined}
      className={`rottay-sheet-classic ${panelClassName || ''} ${className || ''}`}
      style={panelStyle}
      getContainer={typeof document !== 'undefined' ? document.body : undefined}
      /* Render a rounded grab-handle bar in the extra slot for bottom sheets only */
      extra={
        isBottom && showHandle ? (
          <div style={{
            width: 40,
            height: 4,
            backgroundColor: 'var(--ds-color-neutral-300, #d1d5db)',
            borderRadius: 2,
            margin: '0 auto 8px',
          }} />
        ) : undefined
      }
    >
      {children}
    </AntDrawer>
  );
}

ClassicSheet.displayName = 'Sheet.Classic';
