'use client';

/**
 * @fileoverview Sheet Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Sheet component.
 * Uses Ant Design Drawer variant.
 *
 * @module Sheet/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */

import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import type { SheetProps } from '../Sheet.types';
import { SHEET_DEFAULTS } from '../Sheet.types';

const SIDE_TO_PLACEMENT: Record<string, 'bottom' | 'left' | 'right'> = {
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

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
      height={isBottom ? '50vh' : undefined}
      width={!isBottom ? 380 : undefined}
      className={`rottay-sheet-classic ${panelClassName || ''} ${className || ''}`}
      style={panelStyle}
      getContainer={typeof document !== 'undefined' ? document.body : undefined}
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
