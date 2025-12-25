/**
 * Drawer - Hermes Engine (DaisyUI)
 */

import React, { useEffect } from 'react';
import type { DrawerProps } from '../types';
import { DRAWER_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: '256px',
  md: '378px',
  lg: '520px',
  xl: '736px',
  full: '100%',
};

export default function HermesDrawer(props: DrawerProps): React.ReactElement {
  const {
    open,
    placement = DRAWER_DEFAULTS.placement,
    size = DRAWER_DEFAULTS.size,
    title,
    onClose,
    onOpenChange,
    closable = DRAWER_DEFAULTS.closable,
    closeOnOverlayClick = DRAWER_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = DRAWER_DEFAULTS.closeOnEscape,
    footer,
    hideFooter,
    children,
    width,
    height,
    mask = DRAWER_DEFAULTS.mask,
    className = '',
    style,
  } = props;

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape]);

  // Lock body scroll when open
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

  if (!open) return <></>;

  const isHorizontal = placement === 'left' || placement === 'right';
  const drawerWidth = width || (isHorizontal ? SIZE_MAP[size!] : '100%');
  const drawerHeight = height || (!isHorizontal ? SIZE_MAP[size!] : '100%');

  const getDrawerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      backgroundColor: 'var(--fallback-b1, oklch(var(--b1)/1))',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      transition: 'transform 0.3s ease-in-out',
      overflowY: 'auto',
      ...style,
    };

    switch (placement) {
      case 'left':
        return {
          ...baseStyle,
          top: 0,
          left: 0,
          width: drawerWidth,
          height: '100vh',
        };
      case 'right':
        return {
          ...baseStyle,
          top: 0,
          right: 0,
          width: drawerWidth,
          height: '100vh',
        };
      case 'top':
        return {
          ...baseStyle,
          top: 0,
          left: 0,
          width: '100vw',
          height: drawerHeight,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 0,
          left: 0,
          width: '100vw',
          height: drawerHeight,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {mask && (
        <div
          className="drawer-overlay fixed inset-0 bg-black bg-opacity-50"
          style={{ zIndex: DRAWER_DEFAULTS.zIndex }}
          onClick={closeOnOverlayClick ? handleClose : undefined}
        />
      )}
      <div
        className={`drawer ${className}`}
        style={{
          ...getDrawerStyle(),
          zIndex: (DRAWER_DEFAULTS.zIndex || 1000) + 1,
        }}
      >
        <div className="p-6">
          {(title || closable) && (
            <div className="flex items-center justify-between mb-4">
              {title && <h3 className="text-lg font-bold">{title}</h3>}
              {closable && (
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <div className="drawer-content">{children}</div>
          {!hideFooter && footer && (
            <div className="drawer-footer mt-6 pt-4 border-t border-base-300">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
