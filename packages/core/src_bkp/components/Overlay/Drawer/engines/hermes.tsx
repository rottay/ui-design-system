/**
 * Hermes Drawer Engine
 *
 * DaisyUI implementation using drawer component.
 * Implements unified DrawerProps interface.
 */

'use client';

import { useEffect } from 'react';
import type { DrawerProps } from '../../../../types/components/drawer';
import { cn } from '../../../../utils/cn';

/**
 * Get drawer side class based on placement
 */
function getDrawerSideClass(placement: DrawerProps['placement'] = 'right'): string {
  switch (placement) {
    case 'left':
      return 'drawer-start';
    case 'right':
      return 'drawer-end';
    default:
      // DaisyUI drawer primarily supports left/right, fallback to right for top/bottom
      return 'drawer-end';
  }
}

/**
 * Get drawer size styles based on placement and dimensions
 */
function getDrawerSizeStyle(
  placement: DrawerProps['placement'],
  width?: string | number,
  height?: string | number
): React.CSSProperties {
  const isHorizontal = placement === 'left' || placement === 'right';

  if (isHorizontal && width) {
    return { width: typeof width === 'number' ? `${width}px` : width };
  }

  if (!isHorizontal && height) {
    return { height: typeof height === 'number' ? `${height}px` : height };
  }

  // Default sizes
  return isHorizontal ? { width: '384px' } : { height: '384px' };
}

/**
 * Hermes Drawer - DaisyUI implementation with unified DrawerProps
 */
function HermesDrawer({
  open = false,
  onClose,
  title,
  children,
  className,
  style,
  id,
  placement = 'right',
  width,
  height,
  closable = true,
  closeIcon,
  maskClosable = true,
  keyboard = true,
  destroyOnClose = false,
  extra,
  footer,
  bodyStyle,
  headerStyle,
  footerStyle,
  afterOpenChange,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading = false,
  showFooter = false,
}: DrawerProps) {
  // Handle close
  const handleClose = () => {
    onClose?.();
    afterOpenChange?.(false);
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && keyboard) {
        handleClose();
      }
    };

    if (keyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, keyboard]);

  // Call afterOpenChange when open state changes
  useEffect(() => {
    if (open) {
      afterOpenChange?.(true);
    }
  }, [open, afterOpenChange]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Destroy on close logic
  if (!open && destroyOnClose) return null;

  const drawerSideClass = getDrawerSideClass(placement);
  const sizeStyle = getDrawerSizeStyle(placement, width, height);

  // Default footer with OK/Cancel buttons
  const defaultFooter = (showFooter || onOk) && (
    <div className="flex justify-end gap-2 mt-4">
      <button className="btn" onClick={handleCancel}>
        {cancelText}
      </button>
      <button
        className="btn btn-primary"
        onClick={onOk}
        disabled={confirmLoading}
      >
        {confirmLoading && <span className="loading loading-spinner loading-sm" />}
        {okText}
      </button>
    </div>
  );

  return (
    <div className={cn('drawer', drawerSideClass, open && 'drawer-open')}>
      <input
        id={id ?? 'drawer-toggle'}
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={handleClose}
        aria-label="Toggle drawer"
      />

      {/* Drawer content (backdrop) */}
      <div className="drawer-content">
        {/* Backdrop overlay */}
        {open && (
          <label
            htmlFor={id ?? 'drawer-toggle'}
            className="drawer-overlay"
            onClick={maskClosable ? handleClose : undefined}
            aria-label="Close drawer"
          />
        )}
      </div>

      {/* Drawer side (panel) */}
      <div className="drawer-side" style={{ zIndex: 1000 }}>
        {maskClosable && (
          <label
            htmlFor={id ?? 'drawer-toggle'}
            className="drawer-overlay"
            aria-label="Close drawer"
          />
        )}

        <div
          className={cn('bg-base-100 flex flex-col h-full', className)}
          style={{ ...sizeStyle, ...style }}
        >
          {/* Header */}
          {(title || extra || closable) && (
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-base-300 flex-shrink-0"
              style={headerStyle}
            >
              <div className="flex items-center gap-4 flex-1">
                {title && (
                  <h3 className="text-lg font-bold">{title}</h3>
                )}
                {extra && <div className="ml-auto">{extra}</div>}
              </div>
              {closable && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-sm btn-circle btn-ghost ml-4"
                  aria-label="Close drawer"
                >
                  {closeIcon ?? '✕'}
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={bodyStyle}>
            {children}
          </div>

          {/* Footer */}
          {(footer !== undefined || showFooter || onOk) && (
            <div
              className="px-6 py-4 border-t border-base-300 flex-shrink-0"
              style={footerStyle}
            >
              {footer ?? defaultFooter}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

HermesDrawer.displayName = 'HermesDrawer';

export default HermesDrawer;
