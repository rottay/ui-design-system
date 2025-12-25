/**
 * Apollo Drawer Engine
 *
 * Native HTML + Tailwind CSS drawer implementation.
 * Uses React Portal for proper drawer rendering.
 * Implements unified DrawerProps interface.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { DrawerProps } from '../../../../types/components/drawer';
import { cn } from '../../../../utils/cn';

/**
 * Get drawer size based on placement and dimensions
 */
function getDrawerSize(
  placement: DrawerProps['placement'],
  width?: string | number,
  height?: string | number
): { sizeStyle: React.CSSProperties; defaultSize: string } {
  const isHorizontal = placement === 'left' || placement === 'right';

  if (isHorizontal && width) {
    return {
      sizeStyle: { width: typeof width === 'number' ? `${width}px` : width },
      defaultSize: 'w-96',
    };
  }

  if (!isHorizontal && height) {
    return {
      sizeStyle: { height: typeof height === 'number' ? `${height}px` : height },
      defaultSize: 'h-96',
    };
  }

  return {
    sizeStyle: {},
    defaultSize: isHorizontal ? 'w-96' : 'h-96',
  };
}

/**
 * Get animation classes based on placement
 */
function getAnimationClasses(placement: DrawerProps['placement'] = 'right', isOpen: boolean): string {
  const transitions = 'transition-transform duration-300 ease-in-out';

  if (!isOpen) {
    switch (placement) {
      case 'left':
        return `${transitions} -translate-x-full`;
      case 'right':
        return `${transitions} translate-x-full`;
      case 'top':
        return `${transitions} -translate-y-full`;
      case 'bottom':
        return `${transitions} translate-y-full`;
      default:
        return `${transitions} translate-x-full`;
    }
  }

  return `${transitions} translate-x-0 translate-y-0`;
}

/**
 * Get position classes based on placement
 */
function getPositionClasses(placement: DrawerProps['placement'] = 'right'): string {
  switch (placement) {
    case 'left':
      return 'left-0 top-0 bottom-0';
    case 'right':
      return 'right-0 top-0 bottom-0';
    case 'top':
      return 'top-0 left-0 right-0';
    case 'bottom':
      return 'bottom-0 left-0 right-0';
    default:
      return 'right-0 top-0 bottom-0';
  }
}

/**
 * Apollo Drawer - Native HTML + Tailwind implementation with unified DrawerProps
 */
function ApolloDrawer({
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
  mask = true,
  maskStyle,
  keyboard = true,
  destroyOnClose = false,
  extra,
  footer,
  bodyStyle,
  headerStyle,
  footerStyle,
  zIndex = 1000,
  afterOpenChange,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading = false,
  showFooter = false,
}: DrawerProps) {
  // Handle close
  const handleClose = useCallback(() => {
    onClose?.();
    afterOpenChange?.(false);
  }, [onClose, afterOpenChange]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onCancel?.();
    handleClose();
  }, [onCancel, handleClose]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && keyboard) {
        handleClose();
      }
    },
    [open, keyboard, handleClose]
  );

  useEffect(() => {
    if (keyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [keyboard, handleKeyDown]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      afterOpenChange?.(true);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, afterOpenChange]);

  // Destroy on close logic
  if (!open && destroyOnClose) return null;

  const { sizeStyle, defaultSize } = getDrawerSize(placement, width, height);
  const positionClasses = getPositionClasses(placement);
  const animationClasses = getAnimationClasses(placement, open);

  // Default footer with OK/Cancel buttons
  const defaultFooter = (showFooter || onOk) && (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={handleCancel}
        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onOk}
        disabled={confirmLoading}
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {confirmLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {okText}
      </button>
    </div>
  );

  const drawer = (
    <div
      className="fixed inset-0"
      style={{ zIndex }}
      onClick={maskClosable ? handleClose : undefined}
    >
      {/* Backdrop/Mask */}
      {mask && (
        <div
          className={cn(
            'fixed inset-0 bg-black transition-opacity duration-300',
            open ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
          )}
          style={maskStyle}
        />
      )}

      {/* Drawer panel */}
      <div
        id={id}
        className={cn(
          'fixed bg-white shadow-xl flex flex-col',
          positionClasses,
          defaultSize,
          animationClasses,
          className
        )}
        style={{ ...sizeStyle, ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || extra || closable) && (
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0"
            style={headerStyle}
          >
            <div className="flex items-center gap-4 flex-1">
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {extra && <div className="ml-auto">{extra}</div>}
            </div>
            {closable && (
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                aria-label="Close drawer"
              >
                {closeIcon ?? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
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
            className="px-6 py-4 border-t border-gray-200 flex-shrink-0"
            style={footerStyle}
          >
            {footer ?? defaultFooter}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  if (typeof document !== 'undefined') {
    return createPortal(drawer, document.body);
  }

  return null;
}

ApolloDrawer.displayName = 'ApolloDrawer';

export default ApolloDrawer;
