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
import { syncDialogAttributes } from '../../shared/dialog-attributes';

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
    footer,
    showHandle = SHEET_DEFAULTS.showHandle,
    showOverlay = SHEET_DEFAULTS.showOverlay,
    closeOnEscape = SHEET_DEFAULTS.closeOnEscape,
    closeOnOverlayClick = SHEET_DEFAULTS.closeOnOverlayClick,
    className,
    style,
    rootClassName,
    rootStyle,
    panelClassName,
    panelStyle,
    surfaceClassName,
    surfaceStyle,
    bodyClassName,
    bodyStyle,
    footerClassName,
    footerStyle,
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    autoFocus = SHEET_DEFAULTS.autoFocus,
    restoreFocus = SHEET_DEFAULTS.restoreFocus,
    initialFocus,
    finalFocus,
  } = props;
  const panelRef = React.useRef<HTMLDivElement>(null);

  const setPanelRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      syncDialogAttributes(node, {
        id,
        dataTestId,
        ariaLabel,
        ariaDescribedBy,
      });
    },
    [ariaDescribedBy, ariaLabel, dataTestId, id]
  );

  // Fall back to bottom placement if side value is unrecognized
  const placement = SIDE_TO_PLACEMENT[side] || 'bottom';
  const isBottom = side === 'bottom';

  React.useEffect(() => {
    if (!open) return;
    syncDialogAttributes(panelRef.current, {
      id,
      dataTestId,
      ariaLabel,
      ariaDescribedBy,
    });
  }, [ariaDescribedBy, ariaLabel, dataTestId, id, open]);

  const resolveFocusTarget = (
    target: string | HTMLElement | null | undefined,
    scope?: HTMLElement | null
  ): HTMLElement | null => {
    if (!target) return null;
    if (typeof target === 'string') {
      return (scope || document).querySelector<HTMLElement>(target);
    }
    return target;
  };

  const handleAfterOpenChange = (nextOpen: boolean) => {
    if (nextOpen && autoFocus && initialFocus) {
      setTimeout(() => resolveFocusTarget(initialFocus, panelRef.current)?.focus(), 0);
    }
    if (!nextOpen && restoreFocus && finalFocus) {
      setTimeout(() => resolveFocusTarget(finalFocus)?.focus(), 0);
    }
  };

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
      height={
        isBottom
          ? 'var(--ds-sheet-max-height, var(--ds-sheet-viewport-max-height, 85vh))'
          : undefined
      }
      width={!isBottom ? 380 : undefined}
      rootClassName={`rottay-sheet-classic ${className || ''} ${rootClassName || ''}`}
      rootStyle={{ ...style, ...rootStyle }}
      className={`rottay-sheet-classic ${surfaceClassName || panelClassName || ''} ${className || ''}`.trim()}
      style={{ ...panelStyle, ...surfaceStyle }}
      classNames={{
        body: bodyClassName,
        footer: footerClassName,
      }}
      styles={{
        content: isBottom
          ? {
              paddingBottom:
                'var(--ds-sheet-safe-area-bottom, env(safe-area-inset-bottom, 0px))',
            }
          : undefined,
        body: {
          minHeight: 0,
          overflowY: 'auto',
          ...bodyStyle,
        },
        footer: footerStyle,
      }}
      footer={footer}
      autoFocus={autoFocus}
      afterOpenChange={handleAfterOpenChange}
      panelRef={setPanelRef}
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
