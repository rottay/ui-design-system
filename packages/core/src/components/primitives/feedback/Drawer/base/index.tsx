'use client';
import { forwardRef } from 'react';
import type { DrawerProps } from '../types';

export const BaseDrawer = forwardRef<HTMLDivElement, DrawerProps>((props, ref) => {
  const {
    className = '',
    style = {},
    children,
    // Destructure custom props to avoid spreading them onto HTML element
    open: _open,
    defaultOpen: _defaultOpen,
    placement: _placement,
    size: _size,
    title: _title,
    onClose: _onClose,
    onOpenChange: _onOpenChange,
    closable: _closable,
    closeOnOverlayClick: _closeOnOverlayClick,
    closeOnEscape: _closeOnEscape,
    footer: _footer,
    hideFooter: _hideFooter,
    zIndex: _zIndex,
    width: _width,
    height: _height,
    mask: _mask,
    maskOpacity: _maskOpacity,
    engine: _engine,
    id,
    'data-testid': dataTestId,
  } = props;

  return (
    <div
      ref={ref}
      className={`rottay-drawer ${className}`}
      style={style}
      id={id}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
});
BaseDrawer.displayName = 'BaseDrawer';
