/**
 * Drawer - Apollo Engine (Vanilla HTML/CSS)
 */

import React, { useEffect } from 'react';
import type { DrawerProps, DrawerSize } from '../../types';
import { DRAWER_DEFAULTS } from '../../types';

const SIZE_MAP: Record<DrawerSize, string> = {
  sm: '256px',
  md: '378px',
  lg: '520px',
  xl: '736px',
  full: '100%',
};

export default function ApolloDrawer(props: DrawerProps): React.ReactElement {
  const {
    open,
    placement = DRAWER_DEFAULTS.placement,
    size = DRAWER_DEFAULTS.size as DrawerSize,
    title,
    onClose,
    onOpenChange,
    closable = DRAWER_DEFAULTS.closable,
    closeOnOverlayClick = DRAWER_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = DRAWER_DEFAULTS.closeOnEscape,
    footer,
    hideFooter,
    children,
    zIndex = DRAWER_DEFAULTS.zIndex,
    width,
    height,
    mask = DRAWER_DEFAULTS.mask,
    maskOpacity = DRAWER_DEFAULTS.maskOpacity,
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

  const drawerSize = size as DrawerSize;
  const isHorizontal = placement === 'left' || placement === 'right';
  const drawerWidth = width || (isHorizontal ? SIZE_MAP[drawerSize] : '100vw');
  const drawerHeight = height || (!isHorizontal ? SIZE_MAP[drawerSize] : '100vh');

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${maskOpacity})`,
    zIndex,
  };

  const getDrawerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      backgroundColor: 'var(--rottay-color-background, #fff)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      transition: 'transform 0.3s ease-in-out',
      overflowY: 'auto',
      zIndex: zIndex! + 1,
      display: 'flex',
      flexDirection: 'column',
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

  const headerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderBottom: '1px solid var(--rottay-color-border, #f0f0f0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  const bodyStyle: React.CSSProperties = {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
  };

  const footerStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderTop: '1px solid var(--rottay-color-border, #f0f0f0)',
    flexShrink: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--rottay-color-text-secondary, #666)',
  };

  return (
    <>
      {mask && (
        <div
          className="rottay-drawer-overlay"
          style={overlayStyle}
          onClick={closeOnOverlayClick ? handleClose : undefined}
        />
      )}
      <div
        className={`rottay-drawer rottay-drawer-${placement} ${className}`}
        style={getDrawerStyle()}
        role="dialog"
        aria-modal="true"
      >
        {(title || closable) && (
          <div style={headerStyle}>
            {title && <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>{title}</h3>}
            {closable && (
              <button style={closeButtonStyle} onClick={handleClose} aria-label="Close">
                ✕
              </button>
            )}
          </div>
        )}
        <div style={bodyStyle}>{children}</div>
        {!hideFooter && footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </>
  );
}
